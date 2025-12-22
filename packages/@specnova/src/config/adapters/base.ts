// Adapter interface for external tool configs

import { UserConfig } from '@/config/base';
import { Env } from '@/config/env';
import { createLoader } from '@/config/loader';
import { ResolvedSpecnovaConfig } from '@/config/type';

import { UserInputConfig } from 'c12';

export abstract class BaseAdapter {
  public abstract readonly name: string;
  protected env: Promise<Env> = UserConfig.getEnv();
  abstract transform(externalConfig: ResolvedSpecnovaConfig): Promise<ResolvedSpecnovaConfig>;
  abstract generate(): Promise<void>;
  constructor() {}
}

export abstract class FileAdapter<L extends UserInputConfig = UserInputConfig> extends BaseAdapter {
  //# File config loader
  private loader = createLoader<L>();

  //# Constructor
  constructor() {
    super();
  }

  /**
   *  Load the config file.
   * @returns - L
   */
  protected async load(): Promise<L> {
    const { SPECNOVA_CONFIG_PATH, SPECNOVA_CONFIG_FILE } = await this.env;
    const loaderResult = await this.loader({
      cwd: SPECNOVA_CONFIG_PATH,
      configFile: SPECNOVA_CONFIG_FILE,
      packageJson: true,
    });
    return loaderResult.config;
  }
}
