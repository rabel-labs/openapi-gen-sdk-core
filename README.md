# Openapi-gen-sdk-core

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

- Post/Pre-processing hooks
- Stable & Deterministic operation ID
- Multi-package orchestration & Version history
- Artifact locking
- Type-safe change log generation (/w oasdiff)
- Automating GitHub integration (workflows, CI triggers, release steps)
- Stronger governance

This separation keeps the engine simple while giving us complete freedom around automation and version control.

---

### Docs

[(url_)]

### Event function execution order

Load any OpenAPI → APIDOM parser

Normalize → OAS3.1 DOM

Apply deterministic operationId rules

Optionally split operations → per-file snapshots

Lock the spec / snapshot

Optional changelog generation via oasdiff

Feed into @hey-api generator

Post-processing / validation / governance checks

Minimal dependencies: APIDOM + parser adapters + oasdiff

Everything else is orchestration (Node scripts, folder structure, GitHub Actions)
