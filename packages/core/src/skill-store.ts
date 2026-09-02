import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Skill, GardenConfig } from './types';

export class SkillStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.init();
  }

  private init(): void {
    this.db.exec(`
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
      );

      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  createSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Skill {
    const id = uuidv4();
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO skills (id, name, description, content, path, version, tags, dependencies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      skill.name,
      skill.description,
      skill.content,
      skill.path,
      skill.version,
      JSON.stringify(skill.tags),
      JSON.stringify(skill.dependencies)
    );

    return {
      ...skill,
      id,
      createdAt: now,
      updatedAt: now,
    };
  }

  getSkill(id: string): Skill | null {
    const stmt = this.db.prepare('SELECT * FROM skills WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      content: row.content,
      path: row.path,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: JSON.parse(row.tags),
      dependencies: JSON.parse(row.dependencies),
    };
  }

  listSkills(): Skill[] {
    const stmt = this.db.prepare('SELECT * FROM skills');
    const rows = stmt.all() as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      content: row.content,
      path: row.path,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: JSON.parse(row.tags),
      dependencies: JSON.parse(row.dependencies),
    }));
  }

  updateSkill(id: string, updates: Partial<Skill>): Skill | null {
    const existing = this.getSkill(id);
    if (!existing) return null;

    const stmt = this.db.prepare(`
      UPDATE skills 
      SET name = ?, description = ?, content = ?, path = ?, version = ?, 
          tags = ?, dependencies = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      updates.name ?? existing.name,
      updates.description ?? existing.description,
      updates.content ?? existing.content,
      updates.path ?? existing.path,
      updates.version ?? existing.version,
      JSON.stringify(updates.tags ?? existing.tags),
      JSON.stringify(updates.dependencies ?? existing.dependencies),
      id
    );

    return this.getSkill(id);
  }

  deleteSkill(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM skills WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  searchSkills(query: string): Skill[] {
    const stmt = this.db.prepare(`
      SELECT * FROM skills 
      WHERE name LIKE ? OR description LIKE ? OR content LIKE ?
    `);
    const pattern = `%${query}%`;
    const rows = stmt.all(pattern, pattern, pattern) as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      content: row.content,
      path: row.path,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: JSON.parse(row.tags),
      dependencies: JSON.parse(row.dependencies),
    }));
  }

  close(): void {
    this.db.close();
  }
}
