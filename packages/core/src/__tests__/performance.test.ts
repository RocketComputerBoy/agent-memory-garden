import { SkillStore } from '../skill-store';

describe('SkillStore Performance', () => {
  let store: SkillStore;
  
  beforeAll(async () => {
    store = await SkillStore.create(':memory:');
  });
  
  afterAll(() => {
    store.close();
  });
  
  it('should handle 1000 create operations efficiently', async () => {
    const iterations = 1000;
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      store.createSkill({
        name: `skill-${i}`,
        description: 'Test skill',
        content: 'Test content',
        path: '/test',
        version: '1.0.0',
        tags: ['test'],
        dependencies: [],
      });
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`createSkill: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(1); // Should be under 1ms per operation
  });
  
  it('should handle 1000 getSkill operations efficiently', async () => {
    const allSkills = store.listSkills();
    const skillIds = allSkills.map(s => s.id);
    const iterations = 1000;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const randomId = skillIds[Math.floor(Math.random() * skillIds.length)];
      store.getSkill(randomId);
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`getSkill: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(0.1); // Should be under 0.1ms per operation
  });
  
  it('should handle 1000 findByName operations efficiently', async () => {
    const allSkills = store.listSkills();
    const skillNames = allSkills.map(s => s.name);
    const iterations = 1000;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const randomName = skillNames[Math.floor(Math.random() * skillNames.length)];
      store.findByName(randomName);
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`findByName: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(0.1); // Should be under 0.1ms per operation
  });
  
  it('should handle 100 listSkills operations efficiently', async () => {
    const iterations = 100;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      store.listSkills();
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`listSkills: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(50); // Loads content from DB on cache miss
  });
  
  it('should handle 100 searchSkills operations efficiently', async () => {
    const iterations = 100;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      store.searchSkills('skill-1');
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`searchSkills: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(1); // Should be under 1ms per operation
  });
  
  it('should handle 1000 getSkillsByDependency operations efficiently', async () => {
    // Add skills with dependencies
    for (let i = 0; i < 100; i++) {
      store.createSkill({
        name: `dep-skill-${i}`,
        description: 'Dependency skill',
        content: '',
        path: '',
        version: '1.0.0',
        tags: [],
        dependencies: [],
      });
    }
    
    // Add dependencies to some skills
    const allSkills = store.listSkills();
    for (let i = 0; i < 50; i++) {
      store.updateSkill(allSkills[i].id, {
        dependencies: ['dep-skill-0', 'dep-skill-1'],
      });
    }
    
    const iterations = 1000;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      store.getSkillsByDependency('dep-skill-0');
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`getSkillsByDependency: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(0.1); // Should be under 0.1ms per operation
  });
  
  it('should handle 1000 updateSkill operations efficiently', async () => {
    const allSkills = store.listSkills();
    const skillIds = allSkills.map(s => s.id);
    const iterations = 1000;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const randomId = skillIds[Math.floor(Math.random() * skillIds.length)];
      store.updateSkill(randomId, {
        description: `Updated at ${Date.now()}`,
      });
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`updateSkill: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(1); // Should be under 1ms per operation
  });
  
  it('should handle 1000 deleteSkill operations efficiently', async () => {
    const deleteStore = await SkillStore.create(':memory:');
    const deleteIds: string[] = [];
    
    for (let i = 0; i < 1000; i++) {
      const skill = deleteStore.createSkill({
        name: `delete-me-${i}`,
        description: '',
        content: '',
        path: '',
        version: '1.0.0',
        tags: [],
        dependencies: [],
      });
      deleteIds.push(skill.id);
    }
    
    const iterations = 1000;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const id = deleteIds.pop()!;
      deleteStore.deleteSkill(id);
    }
    
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    console.log(`deleteSkill: ${avgTime.toFixed(3)}ms/op (${Math.round(iterations / (totalTime / 1000))} ops/sec)`);
    expect(avgTime).toBeLessThan(1); // Should be under 1ms per operation
    
    deleteStore.close();
  });
  
  it('should respect memory limits', async () => {
    const contentStore = await SkillStore.create(':memory:');
    
    // Create 150 skills (over LRU limit of 100)
    for (let i = 0; i < 150; i++) {
      contentStore.createSkill({
        name: `content-skill-${i}`,
        description: '',
        content: `Content ${i}`.repeat(100), // ~1KB content
        path: '',
        version: '1.0.0',
        tags: [],
        dependencies: [],
      });
    }
    
    const stats = contentStore.getCacheStats();
    console.log(`Content cache size: ${stats.contentCacheSize} (max: 100)`);
    console.log(`Memory estimate: ${stats.memoryEstimateKB} KB`);
    
    expect(stats.contentCacheSize).toBeLessThanOrEqual(100);
    expect(stats.cacheSize).toBe(150);
    
    contentStore.close();
  });
  
  it('should provide accurate cache statistics', () => {
    const stats = store.getCacheStats();
    
    console.log('Cache Statistics:');
    console.log(`  Cache size: ${stats.cacheSize}`);
    console.log(`  Name index: ${stats.nameIndexSize}`);
    console.log(`  Dependency index: ${stats.dependencyIndexSize}`);
    console.log(`  Content cache: ${stats.contentCacheSize}`);
    console.log(`  Memory estimate: ${stats.memoryEstimateKB} KB`);
    
    expect(stats.cacheSize).toBeGreaterThan(0);
    expect(stats.nameIndexSize).toBe(stats.cacheSize);
    expect(stats.memoryEstimateKB).toBeGreaterThan(0);
  });
});
