#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const bootstrap = require('../commands/bootstrap');
const validate = require('../commands/validate');
const packageJson = require('../package.json');

program
  .name('planloop')
  .description('Spec Driven AI Development Framework CLI')
  .version(packageJson.version);

// Bootstrap command
program
  .command('bootstrap')
  .description('Initialize a project with spec-driven development structure')
  .argument('[directory]', 'Target directory to bootstrap (defaults to current directory)', '.')
  .option('--with-hooks', 'Set up Git hooks for spec validation')
  .option('--features <features>', 'Comma-separated list of features to create specs for', val => val.split(','))
  .option('--lang <language>', 'Primary programming language', 'typescript')
  .option('--agent <agent>', 'AI agent to use for development', 'cursor')
  .action((directory, options) => {
    bootstrap.execute(directory, options);
  });

// Validate command
program
  .command('validate')
  .description('Validate code changes against specifications')
  .option('-f, --files <files>', 'Specific files to validate (comma-separated)')
  .option('-v, --verbose', 'Show detailed output')
  .action((options) => {
    validate.execute(options);
  });

// Help command (explicitly handle help argument)
program
  .command('help')
  .description('Display help information for commands')
  .argument('[command]', 'Specific command to show help for')
  .action((command) => {
    if (command) {
      const subCommand = program.commands.find(cmd => cmd.name() === command);
      if (subCommand) {
        subCommand.help();
      } else {
        console.log(`Unknown command: ${command}`);
        program.help();
      }
    } else {
      program.help();
    }
  });

program.parse(process.argv);

// Display help if no args provided
if (!process.argv.slice(2).length) {
  program.help();
} 