#!/usr/bin/env node

import { Command } from 'commander';
import { SkillStore, SkillHealth } from '@agent-memory-garden/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

const program = new Command();

program
  .name('agmg')
  .description('Agent Memory Garden - Make Agent skill growth visible, controllable, and shareable')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new skill garden')
  .action(async () => {
    const spinner = ora('Initializing skill garden...').start();

    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Garden name:',
          default: 'my-skill-garden',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          default: 'A collection of skills for my AI agent',
        },
      ]);

      spinner.succeed(chalk.green('Skill garden initialized!'));
      console.log(chalk.cyan(`Garden "${answers.name}" created successfully.`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize skill garden'));
      console.error(error);
    }
  });

program
  .command('list')
  .description('List all skills in the garden')
  .action(async () => {
    const spinner = ora('Loading skills...').start();

    try {
      const store = new SkillStore('./skills.db');
      const skills = store.listSkills();
      store.close();

      spinner.stop();

      if (skills.length === 0) {
        console.log(chalk.yellow('No skills found. Use "agmg add" to add a skill.'));
        return;
      }

      console.log(chalk.cyan(`Found ${skills.length} skills:`));
      skills.forEach((skill) => {
        console.log(chalk.white(`  - ${skill.name} (${skill.version})`));
      });
    } catch (error) {
      spinner.fail(chalk.red('Failed to load skills'));
      console.error(error);
    }
  });

program
  .command('add')
  .description('Add a new skill to the garden')
  .argument('<name>', 'Skill name')
  .option('-p, --path <path>', 'Path to skill file')
  .option('-d, --description <description>', 'Skill description')
  .action(async (name: string, options: { path?: string; description?: string }) => {
    const spinner = ora('Adding skill...').start();

    try {
      const store = new SkillStore('./skills.db');

      const skill = store.createSkill({
        name,
        description: options.description || '',
        content: '',
        path: options.path || `./skills/${name}.md`,
        version: '0.1.0',
        tags: [],
        dependencies: [],
      });

      store.close();

      spinner.succeed(chalk.green(`Skill "${name}" added successfully!`));
      console.log(chalk.cyan(`Skill ID: ${skill.id}`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to add skill'));
      console.error(error);
    }
  });

program
  .command('health')
  .description('Check health of all skills')
  .action(async () => {
    const spinner = ora('Checking skill health...').start();

    try {
      const store = new SkillStore('./skills.db');
      const skills = store.listSkills();
      store.close();

      const healthChecker = new SkillHealth();
      const healthChecks = await healthChecker.checkAllHealth(skills);
      const summary = healthChecker.getHealthSummary(healthChecks);

      spinner.stop();

      console.log(chalk.cyan('Skill Health Summary:'));
      console.log(chalk.white(`  Total: ${summary.total}`));
      console.log(chalk.green(`  Healthy: ${summary.healthy}`));
      console.log(chalk.yellow(`  Warning: ${summary.warning}`));
      console.log(chalk.red(`  Critical: ${summary.critical}`));
      console.log(chalk.white(`  Average Score: ${(summary.averageScore * 100).toFixed(1)}%`));

      if (summary.critical > 0) {
        console.log(chalk.red('\nCritical skills:'));
        healthChecks
          .filter((h) => h.status === 'critical')
          .forEach((h) => {
            const skill = skills.find((s) => s.id === h.skillId);
            console.log(chalk.red(`  - ${skill?.name}: ${h.issues.map((i) => i.message).join(', ')}`));
          });
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to check skill health'));
      console.error(error);
    }
  });

program.parse();
