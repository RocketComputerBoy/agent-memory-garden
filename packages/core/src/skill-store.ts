import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Skill, GardenConfig } from './types';

interface SkillCacheEntry {
  id: string;
  name: string;
  description: string;
  path: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  dependencies: string[];
}

export class SkillStore {
  private db: SqlJsDatabase;
  private dbPath: string;
  
  // 内存缓存
  private cache: Map<string, SkillCacheEntry> = new Map();
  
  // 索引
  private nameIndex: Map<string, string> = new Map(); // name → id
  private dependencyIndex: Map<string, Set<string>> = new Map(); // dep → {skillIds}
  
  // Content LRU 缓存
  private contentCache: Map<string, string> = new Map();
  private contentCacheOrder: string[] = [];
  
  // 内存限制
  private readonly MAX_CACHE_SIZE = 10000;
  private readonly MAX_CONTENT_CACHE = 100;
  
  // 写入队列
  private pendingWrites: Set<string> = new Set();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor(db: SqlJsDatabase, dbPath: string) {
    this.db = db;
    this.dbPath = dbPath;
  }

  static async create(dbPath: string = ':memory:'): Promise<SkillStore> {
    const SQL = await initSqlJs();
    let db: SqlJsDatabase;

    if (dbPath === ':memory:') {
      db = new SQL.Database();
    } else {
      const fileBuffer = fs.existsSync(dbPath)
        ? fs.readFileSync(dbPath)
        : undefined;
      db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();
    }

    const store = new SkillStore(db, dbPath);
    store.init();
    store.loadCache();
    return store;
  }

  private init(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        content TEXT,
        path TEXT,
        version TEXT DEFAULT '0.1.0',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT DEFAULT '[]',
        dependencies TEXT DEFAULT '[]'
      )
    `);
    
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name)`);
    
    this.db.run(`
      CREATE TABLE IF NOT EXISTS archived_skills (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        content TEXT,
        path TEXT,
        version TEXT,
        created_at DATETIME,
        updated_at DATETIME,
        archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        archive_reason TEXT,
        tags TEXT DEFAULT '[]',
        dependencies TEXT DEFAULT '[]'
      )
    `);
    
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_archived_name ON archived_skills(name)`);
  }

  private loadCache(): void {
    const result = this.db.exec('SELECT id, name, description, path, version, created_at, updated_at, tags, dependencies FROM skills');
    if (result.length === 0) return;
    
    const columns = result[0].columns;
    for (const row of result[0].values) {
      const obj: any = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      
      const entry: SkillCacheEntry = {
        id: obj.id,
        name: obj.name,
        description: obj.description || '',
        path: obj.path || '',
        version: obj.version,
        createdAt: new Date(obj.created_at),
        updatedAt: new Date(obj.updated_at),
        tags: JSON.parse(obj.tags || '[]'),
        dependencies: JSON.parse(obj.dependencies || '[]'),
      };
      
      this.addToCache(entry);
    }
  }

  private addToCache(entry: SkillCacheEntry): void {
    this.cache.set(entry.id, entry);
    this.nameIndex.set(entry.name, entry.id);
    
    for (const dep of entry.dependencies) {
      if (!this.dependencyIndex.has(dep)) {
        this.dependencyIndex.set(dep, new Set());
      }
      this.dependencyIndex.get(dep)!.add(entry.id);
    }
  }

  private removeFromCache(id: string): void {
    const entry = this.cache.get(id);
    if (!entry) return;
    
    this.cache.delete(id);
    this.nameIndex.delete(entry.name);
    
    for (const dep of entry.dependencies) {
      const depSet = this.dependencyIndex.get(dep);
      if (depSet) {
        depSet.delete(id);
        if (depSet.size === 0) {
          this.dependencyIndex.delete(dep);
        }
      }
    }
    
    this.contentCache.delete(id);
    this.contentCacheOrder = this.contentCacheOrder.filter(key => key !== id);
  }

  private updateCacheEntry(id: string, updates: Partial<SkillCacheEntry>): void {
    const existing = this.cache.get(id);
    if (!existing) return;
    
    const filtered: Partial<SkillCacheEntry> = {};
    if (updates.name !== undefined) filtered.name = updates.name;
    if (updates.description !== undefined) filtered.description = updates.description;
    if (updates.path !== undefined) filtered.path = updates.path;
    if (updates.version !== undefined) filtered.version = updates.version;
    if (updates.tags !== undefined) filtered.tags = updates.tags;
    if (updates.dependencies !== undefined) filtered.dependencies = updates.dependencies;
    if (updates.updatedAt !== undefined) filtered.updatedAt = updates.updatedAt;
    
    // 更新 name 索引
    if (filtered.name && filtered.name !== existing.name) {
      this.nameIndex.delete(existing.name);
      this.nameIndex.set(filtered.name, id);
    }
    
    // 更新依赖索引
    if (filtered.dependencies) {
      for (const dep of existing.dependencies) {
        const depSet = this.dependencyIndex.get(dep);
        if (depSet) {
          depSet.delete(id);
          if (depSet.size === 0) {
            this.dependencyIndex.delete(dep);
          }
        }
      }
      
      for (const dep of filtered.dependencies) {
        if (!this.dependencyIndex.has(dep)) {
          this.dependencyIndex.set(dep, new Set());
        }
        this.dependencyIndex.get(dep)!.add(id);
      }
    }
    
    this.cache.set(id, { ...existing, ...filtered });
  }

  private getCachedContent(id: string): string | null {
    const content = this.contentCache.get(id);
    if (content !== undefined) {
      // 更新 LRU 顺序
      this.contentCacheOrder = this.contentCacheOrder.filter(key => key !== id);
      this.contentCacheOrder.push(id);
      return content;
    }
    return null;
  }

  private peekContent(id: string): string | null {
    const content = this.contentCache.get(id);
    return content !== undefined ? content : null;
  }

  private loadContentFromDB(id: string): string {
    const result = this.db.exec('SELECT content FROM skills WHERE id = ?', [id]);
    if (result.length > 0 && result[0].values.length > 0) {
      const dbContent = result[0].values[0][0] as string;
      this.setCachedContent(id, dbContent);
      return dbContent;
    }
    return '';
  }

  private loadContentFromDBNoCache(id: string): string {
    const result = this.db.exec('SELECT content FROM skills WHERE id = ?', [id]);
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] as string;
    }
    return '';
  }

  private setCachedContent(id: string, content: string): void {
    if (this.contentCache.size >= this.MAX_CONTENT_CACHE) {
      const oldest = this.contentCacheOrder.shift();
      if (oldest) {
        this.contentCache.delete(oldest);
      }
    }
    this.contentCache.set(id, content);
    this.contentCacheOrder.push(id);
  }

  private markDirty(id: string): void {
    this.pendingWrites.add(id);
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 1000);
    }
  }

  private flush(): void {
    if (this.pendingWrites.size > 0) {
      this.save();
      this.pendingWrites.clear();
    }
    this.flushTimer = null;
  }

  createSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Skill {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      throw new Error('Memory limit exceeded: maximum cache size reached');
    }
    
    const id = uuidv4();
    const now = new Date();

    this.db.run(
      `INSERT INTO skills (id, name, description, content, path, version, tags, dependencies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        skill.name,
        skill.description,
        skill.content,
        skill.path,
        skill.version,
        JSON.stringify(skill.tags),
        JSON.stringify(skill.dependencies),
      ]
    );

    const entry: SkillCacheEntry = {
      id,
      name: skill.name,
      description: skill.description || '',
      path: skill.path || '',
      version: skill.version,
      createdAt: now,
      updatedAt: now,
      tags: skill.tags,
      dependencies: skill.dependencies,
    };
    
    this.addToCache(entry);
    
    if (skill.content) {
      this.setCachedContent(id, skill.content);
    }

    this.markDirty(id);

    return { ...skill, id, createdAt: now, updatedAt: now };
  }

  getSkill(id: string): Skill | null {
    const entry = this.cache.get(id);
    if (!entry) return null;
    
    const content = this.getCachedContent(id);
    if (content !== null) {
      return { ...entry, content };
    }
    
    const dbContent = this.loadContentFromDB(id);
    return { ...entry, content: dbContent };
  }

  listSkills(): Skill[] {
    const skills: Skill[] = [];
    for (const entry of this.cache.values()) {
      const content = this.getCachedContent(entry.id);
      if (content !== null) {
        skills.push({ ...entry, content });
      } else {
        const dbContent = this.loadContentFromDBNoCache(entry.id);
        skills.push({ ...entry, content: dbContent });
      }
    }
    return skills;
  }

  updateSkill(id: string, updates: Partial<Skill>): Skill | null {
    const existing = this.cache.get(id);
    if (!existing) return null;

    const newContent = updates.content;
    const newDependencies = updates.dependencies ?? existing.dependencies;
    
    if (newContent !== undefined) {
      this.db.run(
        `UPDATE skills 
         SET name = ?, description = ?, content = ?, path = ?, version = ?, 
             tags = ?, dependencies = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [
          updates.name ?? existing.name,
          updates.description ?? existing.description,
          newContent,
          updates.path ?? existing.path,
          updates.version ?? existing.version,
          JSON.stringify(updates.tags ?? existing.tags),
          JSON.stringify(newDependencies),
          id,
        ]
      );
    } else {
      this.db.run(
        `UPDATE skills 
         SET name = ?, description = ?, path = ?, version = ?, 
             tags = ?, dependencies = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [
          updates.name ?? existing.name,
          updates.description ?? existing.description,
          updates.path ?? existing.path,
          updates.version ?? existing.version,
          JSON.stringify(updates.tags ?? existing.tags),
          JSON.stringify(newDependencies),
          id,
        ]
      );
    }

    this.updateCacheEntry(id, {
      name: updates.name,
      description: updates.description,
      path: updates.path,
      version: updates.version,
      tags: updates.tags,
      dependencies: newDependencies,
      updatedAt: new Date(),
    });
    
    if (newContent !== undefined) {
      this.setCachedContent(id, newContent);
    }

    this.markDirty(id);

    const entry = this.cache.get(id);
    if (!entry) return null;

    const content = newContent !== undefined
      ? newContent
      : (this.getCachedContent(id) ?? this.loadContentFromDB(id));

    return { ...entry, content };
  }

  deleteSkill(id: string): boolean {
    const entry = this.cache.get(id);
    if (!entry) return false;
    
    this.db.run('DELETE FROM skills WHERE id = ?', [id]);
    this.removeFromCache(id);
    this.markDirty(id);
    return true;
  }

  archiveSkill(id: string, reason: string): boolean {
    const entry = this.cache.get(id);
    if (!entry) return false;
    
    const content = this.getCachedContent(id) ?? this.loadContentFromDB(id);
    
    this.db.run(
      `INSERT INTO archived_skills (id, name, description, content, path, version, created_at, updated_at, archive_reason, tags, dependencies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.name,
        entry.description,
        content,
        entry.path,
        entry.version,
        entry.createdAt.toISOString(),
        entry.updatedAt.toISOString(),
        reason,
        JSON.stringify(entry.tags),
        JSON.stringify(entry.dependencies),
      ]
    );
    
    this.db.run('DELETE FROM skills WHERE id = ?', [id]);
    this.removeFromCache(id);
    this.markDirty(id);
    return true;
  }

  getArchivedSkills(): any[] {
    const result = this.db.exec('SELECT * FROM archived_skills');
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        version: obj.version,
        archivedAt: new Date(obj.archived_at),
        archiveReason: obj.archive_reason,
        tags: JSON.parse(obj.tags || '[]'),
        dependencies: JSON.parse(obj.dependencies || '[]'),
      };
    });
  }

  findByName(name: string): Skill | null {
    const id = this.nameIndex.get(name);
    if (!id) return null;
    return this.getSkill(id);
  }

  getSkillsByDependency(dependencyName: string): Skill[] {
    const ids = this.dependencyIndex.get(dependencyName);
    if (!ids || ids.size === 0) return [];
    
    const skills: Skill[] = [];
    for (const id of ids) {
      const skill = this.getSkill(id);
      if (skill) {
        skills.push(skill);
      }
    }
    return skills;
  }

  searchSkills(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();
    const skills: Skill[] = [];
    
    for (const entry of this.cache.values()) {
      if (
        entry.name.toLowerCase().includes(lowerQuery) ||
        entry.description.toLowerCase().includes(lowerQuery)
      ) {
        const content = this.peekContent(entry.id);
        skills.push({ ...entry, content: content || '' });
      }
    }
    
    return skills;
  }

  getCacheStats(): {
    cacheSize: number;
    nameIndexSize: number;
    dependencyIndexSize: number;
    contentCacheSize: number;
    memoryEstimateKB: number;
  } {
    const avgEntrySize = 200; // bytes per SkillCacheEntry (without content)
    const avgDepsPerSkill = 2;
    const avgDepNameSize = 20;
    
    const cacheMemory = this.cache.size * avgEntrySize;
    const nameIndexMemory = this.nameIndex.size * 70; // avg name + id
    const depIndexMemory = this.dependencyIndex.size * (avgDepNameSize + 40); // avg dep name + Set overhead
    const contentCacheMemory = this.contentCache.size * 2000; // avg content size
    
    const totalMemoryBytes = cacheMemory + nameIndexMemory + depIndexMemory + contentCacheMemory;
    
    return {
      cacheSize: this.cache.size,
      nameIndexSize: this.nameIndex.size,
      dependencyIndexSize: this.dependencyIndex.size,
      contentCacheSize: this.contentCache.size,
      memoryEstimateKB: Math.round(totalMemoryBytes / 1024),
    };
  }

  exportToMarkdown(skill: Skill): string {
    const lines = [
      `# ${skill.name}`,
      '',
      `> ${skill.description}`,
      '',
      `**Version:** ${skill.version}`,
      `**Tags:** ${skill.tags.join(', ') || 'None'}`,
      `**Dependencies:** ${skill.dependencies.join(', ') || 'None'}`,
      `**Created:** ${skill.createdAt.toISOString()}`,
      `**Updated:** ${skill.updatedAt.toISOString()}`,
      '',
      '---',
      '',
      skill.content || 'No content available.',
    ];

    return lines.join('\n');
  }

  exportAllToMarkdown(): { skill: Skill; markdown: string }[] {
    const skills = this.listSkills();
    return skills.map((skill) => ({
      skill,
      markdown: this.exportToMarkdown(skill),
    }));
  }

  importFromMarkdown(filePath: string): Skill {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content || content.trim().length === 0) {
      throw new Error(`File is empty: ${filePath}`);
    }

    const lines = content.split('\n');

    let name = '';
    let description = '';
    let version = '0.1.0';
    let tags: string[] = [];
    let dependencies: string[] = [];
    let skillContent = '';
    let inContent = false;

    for (const line of lines) {
      if (line.startsWith('# ')) {
        name = line.substring(2).trim();
      } else if (line.startsWith('> ')) {
        description = line.substring(2).trim();
      } else if (line.startsWith('**Version:**')) {
        version = line.replace('**Version:**', '').trim();
      } else if (line.startsWith('**Tags:**')) {
        const tagsStr = line.replace('**Tags:**', '').trim();
        tags = tagsStr === 'None' ? [] : tagsStr.split(',').map((t) => t.trim());
      } else if (line.startsWith('**Dependencies:**')) {
        const depsStr = line.replace('**Dependencies:**', '').trim();
        dependencies = depsStr === 'None' ? [] : depsStr.split(',').map((d) => d.trim());
      } else if (line === '---') {
        inContent = true;
      } else if (inContent) {
        skillContent += line + '\n';
      }
    }

    return this.createSkill({
      name,
      description,
      content: skillContent.trim(),
      path: filePath,
      version,
      tags,
      dependencies,
    });
  }

  importFromDirectory(dirPath: string): Skill[] {
    const skills: Skill[] = [];
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(dirPath, file);
        const skill = this.importFromMarkdown(filePath);
        skills.push(skill);
      }
    }

    return skills;
  }

  save(): void {
    if (this.dbPath !== ':memory:') {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    }
  }

  close(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.save();
    this.db.close();
  }
}
