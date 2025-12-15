#!/usr/bin/env node

import installFetch from '@/bin/installers/fetch';
import installLookup from '@/bin/installers/lookup';
import installPull from '@/bin/installers/pull';
import { NpmPackage } from '@/npm';

import { Command } from 'commander';

const program = new Command();
program.name('specnova').description('SpecNova CLI').version(NpmPackage.getPackage().version);

// Installers
installFetch(program);
installPull(program);
installLookup(program);

program.parse(process.argv);
