# 🧠 Spec Driven AI Development Framework

## 📌 Project Overview

Spec Driven AI Development is a flexible, AI-assisted development workflow in which feature planning, implementation, and validation are all grounded in up-to-date, structured **documentation and specifications**.

It combines:
- **LLM Agents (e.g., Cursor, Claude)** to interpret and generate specs, plans, and code.
- **Documentation-aware automation** that helps enforce best practices.
- **Rules and workflows** that ensure that specifications evolve alongside the codebase.

The framework uses **Cursor AI as the first integration target** due to its contextual awareness, rules engine, and file system integration.

## 🎯 Goals
- Improve long-term maintainability and clarity by making documentation an enforced and active part of development.
- Give AI agents a consistent foundation for generating accurate code.
- Automatically score the relationship between a code change and its supporting documentation.
- Enable the agent to evolve the framework and write its own rules.

---

# 🌱 Ideas to Explore

## 1. Documentation as Agent Context
- Split documentation into human- and agent-readable sections.
- Use `.spec/` folder with structured documents (Markdown, YAML, OpenAPI).
- Link code → spec via file names, relations.json, or embedded comments.

## 2. Spec–Code Alignment Scoring
- Create CLI tool (`spec_check_score`) to compare `git diff` with matching spec files.
- Score compliance using rules or LLM-based semantic comparison.

## 3. Cursor Rule-Based Enforcement
- Use `.cursor/rules/*.mdc` to enforce:
  - No code changes without updated spec.
  - New routes must be documented.
  - Prompt developer if documentation is missing.

## 4. Memory Bank Inspired Planning
- Use `.cursor/memory/` to hold planning files, last thoughts, scratchpads.
- Track decisions, specs, and next steps in an AI-readable format.

## 5. Self-Evolving Agent Rules
- Ask the agent to write new Cursor rules after successful PRs.
- Let rules be stored and versioned.
- Meta rules could govern which rules should be updated.

---

# 🚀 Bootstrap Tool: `spec_bootstrap`

The `spec_bootstrap` command initializes a new project to use this framework.

### ✅ What it Does:
- Creates a `.spec/` folder with a README and optional feature specs.
- Creates a `.cursor/` folder with initial Cursor rules.
- Optionally sets up `.git/hooks/` for pre-commit validation.
- Creates a `spec.config.json` for customizable behavior.

### 📁 Output Folder Structure
```
.
├── .spec/
│   ├── README.md
│   ├── features/
│   └── api/
├── .cursor/
│   ├── rules/
│   └── memory/
├── .git/hooks/
├── README.md
└── spec.config.json
```

### 🔧 Sample Command
```bash
npx @my_repo/spec_bootstrap . \
  --with-hooks \
  --features auth,tasks \
  --lang typescript \
  --agent cursor
```

### 🧠 Customization Ideas
- Allow different spec formats (Markdown vs OpenAPI)
- Enable/disable Git hooks
- Register custom prompt templates for the agent

---

# 🔄 Development Plan

## Phase 0: Bootstrap Project
- Use Cursor to generate the CLI script from these documents

## Phase 1: Apply to New Project
- Run `spec_bootstrap` on a new project
- Let the agent evolve its own rules, prompts, or scripts
- Begin documenting planning and implementation in `.spec/`

## Phase 2 (Optional): CLI + LangChain Backend
- Replace Cursor-internal scoring with LLM API-based CLI
- Use LangChain or similar framework for spec scoring, RAG, and planning workflows

