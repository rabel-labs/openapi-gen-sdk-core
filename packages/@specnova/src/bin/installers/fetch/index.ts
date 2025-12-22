import { defineCliInstaller } from '@/bin/installers/base';
import { Snapshot } from '@/core';
import { NpmPackage } from '@/npm';

export default defineCliInstaller({
  name: 'fetch',
  description: 'Download the latest version of the Spec origin.',
  async action() {
    const { source } = NpmPackage.getPackage().specnova;
    const snapshot = await new Snapshot().load(source);
    snapshot.prepareAllAndCommit();
    return (await snapshot.getSpecnovaSource()).info.version;
  },
});
