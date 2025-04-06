# Specification Directory

This directory contains structured documentation and specifications for the project.

## Structure
- `features/` - Feature specifications and requirements
- `api/` - API documentation and endpoints

## How to Use
1. When implementing a new feature, start by creating or updating specs
2. Link code to specs via consistent naming or references
3. Use the specs as validation criteria for implementation
4. Run validation to check alignment (`node scripts/spec_check_score.js`)
5. Update specs or code to maintain alignment above 70%

## Specification Format
Specs are written in Markdown with YAML frontmatter for metadata:

```markdown
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
```

## Validation Process
Each code change is validated against the relevant specifications, receiving a score based on alignment. The goal is to maintain scores above 70% for all changes.

## Reverse Indexing
The `relevant_files` metadata allows for reverse indexing, making it easier to find which specifications relate to changed files. When validating changes, the system will automatically identify specs that reference the modified files.
