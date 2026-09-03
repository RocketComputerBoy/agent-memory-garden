import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Skill, GardenConfig } from './types';

export class SkillStore {
  private db: SqlJsDatabase;
  private dbPath: string;

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
  }

  createSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Skill {
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

    return {
      ...skill,
      id,
      createdAt: now,
      updatedAt: now,
    };
  }

  getSkill(id: string): Skill | null {
    const result = this.db.exec('SELECT * FROM skills WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    const columns = result[0].columns;
    const obj: any = {};
    columns.forEach((col, i) => (obj[col] = row[i]));

    return {
      id: obj.id,
      name: obj.name,
      description: obj.description,
      content: obj.content,
      path: obj.path,
      version: obj.version,
      createdAt: new Date(obj.created_at),
      updatedAt: new Date(obj.updated_at),
      tags: JSON.parse(obj.tags || '[]'),
      dependencies: JSON.parse(obj.dependencies || '[]'),
    };
  }

  listSkills(): Skill[] {
    const result = this.db.exec('SELECT * FROM skills');
    if (result.length === 0) return [];

    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        content: obj.content,
        path: obj.path,
        version: obj.version,
        createdAt: new Date(obj.created_at),
        updatedAt: new Date(obj.updated_at),
        tags: JSON.parse(obj.tags || '[]'),
        dependencies: JSON.parse(obj.dependencies || '[]'),
      };
    });
  }

  updateSkill(id: string, updates: Partial<Skill>): Skill | null {
    const existing = this.getSkill(id);
    if (!existing) return null;

    this.db.run(
      `UPDATE skills 
       SET name = ?, description = ?, content = ?, path = ?, version = ?, 
           tags = ?, dependencies = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        updates.name ?? existing.name,
        updates.description ?? existing.description,
        updates.content ?? existing.content,
        updates.path ?? existing.path,
        updates.version ?? existing.version,
        JSON.stringify(updates.tags ?? existing.tags),
        JSON.stringify(updates.dependencies ?? existing.dependencies),
        id,
      ]
    );

    return this.getSkill(id);
  }

  deleteSkill(id: string): boolean {
    this.db.run('DELETE FROM skills WHERE id = ?', [id]);
    const result = this.db.exec('SELECT COUNT(*) as count FROM skills WHERE id = ?', [id]);
    // If skill no longer exists, delete was successful
    return result.length > 0 && result[0].values[0][0] === 0;
  }

  searchSkills(query: string): Skill[] {
    const pattern = `%${query}%`;
    const result = this.db.exec(
      `SELECT * FROM skills WHERE name LIKE ? OR description LIKE ? OR content LIKE ?`,
      [pattern, pattern, pattern]
    );

    if (result.length === 0) return [];

    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        content: obj.content,
        path: obj.path,
        version: obj.version,
        createdAt: new Date(obj.created_at),
        updatedAt: new Date(obj.updated_at),
        tags: JSON.parse(obj.tags || '[]'),
        dependencies: JSON.parse(obj.dependencies || '[]'),
      };
    });
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
    this.save();
    this.db.close();
  }
}
