const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Execute the bootstrap command
 * @param {string} targetDir - Target directory to bootstrap
 * @param {Object} options - Command options
 */
function execute(targetDir, options) {
  console.log('🚀 Bootstrapping Spec-Driven Development project...');
  console.log(`📁 Target directory: ${targetDir}`);
  console.log(`🔧 Options:`, options);

  // Normalize options
  const normalizedOptions = {
    withHooks: options.withHooks || false,
    features: options.features || [],
    lang: options.lang || 'typescript',
    agent: options.agent || 'cursor'
  };

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
4. Run validation to check alignment (\`npx @chubas/planloop validate\`)
5. Update specs or code to maintain alignment above 70%

## Specification Format
Specs are written in Markdown with YAML frontmatter for metadata:

\`\`\`markdown
---
name: feature-name
status: draft|in-progress|complete
created: YYYY-MM-DD
updated: YYYY-MM-DD
relevant_files:
  - path/to/file.js
  - src/components/feature-component/
  - "**/*.test.js" # Glob pattern for test files
---

# Feature Name

## Overview
Brief description of the feature

## Requirements
- Specific requirements listed here

## Implementation Details
Technical specifications and architecture details

## Validation Criteria
How to validate this feature has been correctly implemented
\`\`\`

## Validation Process
Each code change is validated against the relevant specifications, receiving a score based on alignment. The goal is to maintain scores above 70% for all changes.

## Reverse Indexing
The \`relevant_files\` metadata allows for reverse indexing, making it easier to find which specifications relate to changed files. When validating changes, the system will automatically identify specs that reference the modified files.
`;

  fs.writeFileSync(specReadmePath, specReadmeContent);
  console.log(`Created: ${specReadmePath}`);

  // Create feature specs if requested
  if (normalizedOptions.features.length > 0) {
    normalizedOptions.features.forEach(feature => {
      if (!feature) return; // Skip empty feature names
      
      const featureSpecPath = path.join(targetDir, '.spec', 'features', `${feature}.md`);
      const featureSpecContent = `---
name: ${feature}
status: draft
created: ${new Date().toISOString().split('T')[0]}
relevant_files:
  - src/${feature}/**/*
  - "**/${feature}*.js"
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
  const cursorRulePath = path.join(targetDir, '.cursor', 'rules', 'planloop_framework.mdc');
  const cursorRuleContent = `---
description: Core rule for the Planloop Spec-Driven Development Framework
globs: *.js,*.ts,*.jsx,*.tsx,.spec/**/*.md
alwaysApply: true
---

# Planloop Spec-Driven Development Framework

## Overview
Planloop is a spec-driven AI development framework where all feature planning, implementation, and validation are grounded in structured documentation and specifications. Every change to the codebase should be aligned with existing specifications or accompanied by updated specifications.

## Main Files and Directories
- \`.spec/\`: Contains all project specifications
  - \`.spec/features/\`: Feature-specific specifications
  - \`.spec/api/\`: API documentation
- \`.cursor/\`: Contains AI agent configuration
  - \`.cursor/rules/\`: Cursor rules for enforcing the workflow
  - \`.cursor/memory/\`: Agent memory for planning and context
- \`scripts/\`: Utility scripts

## Spec-Code Mapping

Specifications include a \`relevant_files\` metadata field that maps them to related code files and directories:

\`\`\`yaml
relevant_files:
  - path/to/file.js
  - src/components/feature-component/
  - "**/*.test.js"  # Glob patterns supported
\`\`\`

When working with files:
1. Check if any specs include the file in their \`relevant_files\` list
2. Review these specs before making changes
3. Update \`relevant_files\` when adding new files relevant to a feature
4. Use glob patterns for groups of related files

## Validation Process

Before implementing any feature or making significant changes:

1. Check if a specification exists in \`.spec/\`
2. Read and understand the specification
3. Implement according to the specification
4. Run spec validation to ensure alignment
5. If needed, update the specification alongside the code

## File Change Analysis

When analyzing file changes:

1. Identify changed files using \`@diff\` or git status
2. Find specs that reference these files in their \`relevant_files\` metadata
3. For files not explicitly mapped in any spec:
   a. Look for specs with similar naming patterns
   b. Check for specs with glob patterns that might match
   c. Consider if a new spec should be created

## Validation Prompt

When validating changes, answer the following:

1. What changes are being made to the codebase? (\`@diff\`)
2. Which specifications are relevant to these changes? (Check \`relevant_files\` metadata in specs)
3. Do the changes align with existing specifications?
4. Calculate an alignment score:
   - 0-30%: Major divergence from specifications
   - 31-60%: Partial alignment, may need spec updates
   - 61-80%: Good alignment with room for improvement
   - 81-100%: Excellent alignment with specifications

Provide a structured response:

\`\`\`
## Change Analysis
[Describe the changes being made]

## Relevant Specifications
[List the specifications that reference the changed files]

## Alignment Assessment
[Evaluate how well the changes align with specifications]

## Recommendations
[Suggest improvements to code or specs]

## Overall Score: [X]%
\`\`\`

## Actions Required

If alignment score is below 70%:
- Update specifications to match changes
- Modify changes to better align with specifications
- Document why divergence is necessary
- Update \`relevant_files\` metadata if new files were created

Remember: Specifications and code should evolve together. Neither is fixed - both should be updated as the project progresses.
`;

  fs.writeFileSync(cursorRulePath, cursorRuleContent);
  console.log(`Created cursor rule: ${cursorRulePath}`);

  // Create config file
  const configPath = path.join(targetDir, 'spec.config.json');
  const configContent = {
    specDir: '.spec',
    features: normalizedOptions.features,
    language: normalizedOptions.lang,
    agent: normalizedOptions.agent,
    validation: {
      enabled: true,
      minimumScore: 0.7
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  console.log(`Created config: ${configPath}`);

  // Set up git hooks if requested
  if (normalizedOptions.withHooks) {
    const hooksDir = path.join(targetDir, '.git', 'hooks');
    if (fs.existsSync(path.join(targetDir, '.git'))) {
      const preCommitPath = path.join(hooksDir, 'pre-commit');
      const preCommitContent = `#!/bin/sh
# Spec validation pre-commit hook

echo "🔍 Validating spec alignment..."
npx @chubas/planloop validate
exit $?
`;
      
      fs.writeFileSync(preCommitPath, preCommitContent);
      fs.chmodSync(preCommitPath, '755');
      console.log(`Created git hook: ${preCommitPath}`);
    } else {
      console.warn('Git repository not found, skipping hook installation');
    }
  }

  // Create memory directory README
  const memoryReadmePath = path.join(targetDir, '.cursor', 'memory', 'README.md');
  const memoryReadmeContent = `# Cursor Memory Directory

This directory serves as a persistent memory space for the Cursor AI agent. It contains structured information about ongoing development plans, decisions, and thought processes.

## Purpose

- Maintain context between development sessions
- Track planning and implementation decisions
- Store scratchpad notes and intermediary thoughts
- Provide a place for the agent to reference past decisions

## Files

- \`plan.md\`: Current development plan and status
- \`decisions.md\`: Record of important architectural and implementation decisions
- \`scratchpad.md\`: Temporary notes and thoughts during implementation
- \`spec_references.json\`: Cross-references between code and specifications

## Usage

Files in this directory are meant to be read and updated by the Cursor AI agent during development. They help maintain context and coherence across multiple sessions.
`;

  fs.writeFileSync(memoryReadmePath, memoryReadmeContent);
  console.log(`Created: ${memoryReadmePath}`);

  console.log('✅ Spec-Driven Development project bootstrapped successfully!');
  console.log('Next steps:');
  console.log('1. Review the generated structure and customize as needed');
  console.log('2. Start creating specifications for your features');
  console.log('3. Begin implementing with your agent using the spec-driven workflow');
}

module.exports = {
  execute
}; 