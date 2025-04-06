#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command-line arguments
const args = process.argv.slice(2);
const targetDir = args[0] || '.';
const options = {
  withHooks: args.includes('--with-hooks'),
  features: (args.find(arg => arg.startsWith('--features=')) || '').split('=')[1]?.split(',') || [],
  lang: (args.find(arg => arg.startsWith('--lang=')) || '').split('=')[1] || 'typescript',
  agent: (args.find(arg => arg.startsWith('--agent=')) || '').split('=')[1] || 'cursor'
};

console.log('🚀 Bootstrapping Spec-Driven Development project...');
console.log(`📁 Target directory: ${targetDir}`);
console.log(`🔧 Options: ${JSON.stringify(options, null, 2)}`);

// Create directory structure
const dirs = [
  '.spec',
  '.spec/features',
  '.spec/api',
  '.cursor',
  '.cursor/rules',
  '.cursor/memory'
];

dirs.forEach(dir => {
  const fullPath = path.join(targetDir, dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`Creating directory: ${fullPath}`);
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Create initial spec README
const specReadmePath = path.join(targetDir, '.spec', 'README.md');
const specReadmeContent = `# Specification Directory

This directory contains structured documentation and specifications for the project.

## Structure
- \`features/\` - Feature specifications and requirements
- \`api/\` - API documentation and endpoints

## How to Use
1. When implementing a new feature, start by creating or updating specs
2. Link code to specs via consistent naming or references
3. Use the specs as validation criteria for implementation

Specs are written in Markdown with YAML frontmatter for metadata.
`;

fs.writeFileSync(specReadmePath, specReadmeContent);
console.log(`Created: ${specReadmePath}`);

// Create feature specs if requested
if (options.features.length > 0) {
  options.features.forEach(feature => {
    const featureSpecPath = path.join(targetDir, '.spec', 'features', `${feature}.md`);
    const featureSpecContent = `---
name: ${feature}
status: draft
created: ${new Date().toISOString().split('T')[0]}
---

# ${feature.charAt(0).toUpperCase() + feature.slice(1)} Feature

## Overview
Description of the ${feature} feature and its purpose.

## Requirements
- Requirement 1
- Requirement 2

## Implementation Details
Technical specifications and architecture details.

## Validation Criteria
How to validate that this feature has been correctly implemented.
`;
    
    fs.writeFileSync(featureSpecPath, featureSpecContent);
    console.log(`Created feature spec: ${featureSpecPath}`);
  });
}

// Create cursor rules
const cursorRulePath = path.join(targetDir, '.cursor', 'rules', 'spec_validation.mdc');
const cursorRuleContent = `# Spec Validation Rules

These rules help ensure that code changes are aligned with specifications.

## Rule: Check Spec Before Implementation
When implementing a new feature, ensure the relevant specification exists in the .spec/ directory.

## Rule: Update Specs with Code Changes
If code changes alter behavior, ensure the corresponding spec is updated.

## Rule: Document All APIs
New API endpoints must have corresponding documentation in .spec/api/.

## Rule: Link Code to Specs
Use consistent naming or references to link code back to specifications.
`;

fs.writeFileSync(cursorRulePath, cursorRuleContent);
console.log(`Created cursor rule: ${cursorRulePath}`);

// Create config file
const configPath = path.join(targetDir, 'spec.config.json');
const configContent = {
  specDir: '.spec',
  features: options.features,
  language: options.lang,
  agent: options.agent,
  validation: {
    enabled: true,
    minimumScore: 0.7
  }
};

fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
console.log(`Created config: ${configPath}`);

// Set up git hooks if requested
if (options.withHooks) {
  const hooksDir = path.join(targetDir, '.git', 'hooks');
  if (fs.existsSync(path.join(targetDir, '.git'))) {
    const preCommitPath = path.join(hooksDir, 'pre-commit');
    const preCommitContent = `#!/bin/sh
# Spec validation pre-commit hook

echo "🔍 Validating spec alignment..."
# Future implementation will call spec_check_score here
exit 0
`;
    
    fs.writeFileSync(preCommitPath, preCommitContent);
    fs.chmodSync(preCommitPath, '755');
    console.log(`Created git hook: ${preCommitPath}`);
  } else {
    console.warn('Git repository not found, skipping hook installation');
  }
}

console.log('✅ Spec-Driven Development project bootstrapped successfully!');
console.log('Next steps:');
console.log('1. Review the generated structure and customize as needed');
console.log('2. Start creating specifications for your features');
console.log('3. Begin implementing with your agent using the spec-driven workflow'); 