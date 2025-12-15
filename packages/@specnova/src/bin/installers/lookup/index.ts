import { defineCliInstaller } from '@/bin/installers/base';
import { parseSource } from '@/core';
import { NpmPackage } from '@/npm';

export default defineCliInstaller({
  name: 'lookup',
  description: 'Lookup the spec origin.',
  async action() {
    const { version, source } = NpmPackage.getPackage().specnova;
    const { info } = await parseSource(source);
    if (version === info.version) {
      console.log('✅ Local patch is up to date.');
      return false;
    }
    console.log(`🚨 Update available: ${version} → ${info.version}`);
    return true;
  },
});
