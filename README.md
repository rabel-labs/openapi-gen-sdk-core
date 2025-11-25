# Openapi-gen-sdk-core

Creator: Pierre-wesner Rabel
Date: November 25, 2025 1:11 PM

## **Openapi-gen-sdk-core**

`openapi-gen-sdk-core` wants to be a lightweight toolkit designed to generate, update, and maintain internal SDKs from external OpenAPI sources;

The package provides a standardized workflow to fetch, track, patch, and regenerate SDKs. With tooling to use directly from GitHub, giving teams full control over versioning and automation without the overhead of large proprietary systems.

## **Why It Exists**

Many third-party tools we integrated with either:

- Don’t ship an SDK at all,
- Provide one but rarely update it,
- Or require vendor-specific codegen solutions that don’t fit our stack.

`openapi-gen-sdk-core` solves this by letting you **self-generate** and **self-manage** SDKs with a GitHub-driven workflow.

**Own the pipeline, the versioning, and the update cycle.**

---

## **How It Works**

The library wraps around [`@hey-api/openapi-ts`](https://github.com/hey-api/openapi-ts), which acts as the core engine generating types, clients, and all TypeScript artifacts.

### 🔧 **Generation Layer**

All code generation, the actual TypeScript types & client files, comes from [`@hey-api/openapi-ts`](https://github.com/hey-api/openapi-ts) .

### 🧩 **Orchestration Layer (our work)**

Everything before and after generation is where we arrive:

- Fetching OpenAPI definitions from external sources
- Multi-spec & multi-package orchestration
- Type-safe change log generation (/w oasdiff)
- Syncing and validating versions
- Storing & managing patches
- Managing regeneration logic
- Extending or overriding generated files
- Automating GitHub integration (workflows, CI triggers, release steps)
- Stronger governance

This separation keeps the engine simple while giving us complete freedom around automation and version control.

---

### Docs

[(url_)]
