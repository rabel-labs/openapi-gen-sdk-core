#!/usr/bin/env node
import { Command } from 'commander';
import { ciCheck, ciGenerate, ciUpdate, syncPatch, syncVersion } from '@/index';

const program = new Command();

program.name('openapi-gen').description('OpenAPI SDK generator CLI').version('1.0.0');

// --- Sync Commands ---

program
  .command('sync-patch')
  .description('Sync patch file from OpenAPI spec')
  .action(async () => {
    try {
      await syncPatch();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('sync-version')
  .description('Sync package.json version from OpenAPI spec')
  .action(async () => {
    try {
      await syncVersion();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

// --- CI Commands ---

program
  .command('ci-check')
  .description('Check if the OpenAPI spec has changed')
  .action(async () => {
    try {
      const changed = await ciCheck();

      // Modern GitHub Actions output
      if (process.env.GITHUB_OUTPUT) {
        const fs = await import('fs');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('ci-update')
  .description('Update OpenAPI patch and version')
  .action(async () => {
    try {
      const version = await ciUpdate();

      // Modern GitHub Actions output
      if (process.env.GITHUB_OUTPUT) {
        const fs = await import('fs');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `openapi_version=${version}\n`);
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('ci-generate')
  .description('Generate SDK from OpenAPI spec')
  .action(async () => {
    try {
      await ciGenerate();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program.parse(process.argv);
