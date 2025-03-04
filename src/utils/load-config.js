import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import JSON5 from 'json5';

const DEFAULT_ENV_CONFIG = {
  type: 'development',
  port: 8000,
  useHttps: false,
  serverAddress: '127.0.0.1',
};

/**
 * Load JS config object from json5 config files located in `/config`.
 *
 * @param {String} [ENV='default'] - name of the environment. Should correspond
 *  to a file located in the `/config/env/` directory. If the file is not found
 *  the DEFAULT_CONFIG object will be used
 * @param {String} [callerURL=null] - for node clients, if `callerURL` is given,
 *  retrieves the `role` from caller directory name.
 *
 * @returns {Object} config
 * @returns {Object} config.app - JS object of the informations contained in
 *  `/config/application.json`.
 * @returns {Object} config.env - JS object of the informations contained in
 *  `/config/env/${ENV}.json` with ENV being the first argument.
 * @returns {Object} config.role - node client only: type/role of the client
 *  as defined when the client has been created (see `/config/application.json`
 *  and directory name).
 */
export function loadConfig(ENV = 'default', callerURL = null) {
  let env = null;
  let app = null;

  const localFileName = fileURLToPath(import.meta.url);
  const localPath = path.dirname(localFileName);

  // parse env config
  const envConfigFilepath = path.resolve(localPath, '..', '..', 'config', `env-${ENV}.json`);

  try {
    env = JSON5.parse(fs.readFileSync(envConfigFilepath, 'utf-8'));

    if (process.env.PORT) {
      env.port = process.env.PORT;
    }
  } catch(err) {
    console.info('');
    console.info('--------------------------------------------------------');
    console.info(`- Environment config file not found: "${envConfigFilepath}"`);
    console.info(`- Using default config:`);
    console.info(DEFAULT_ENV_CONFIG);
    console.info('- hint: run `npx soundworks --create-config` to create a dedicated config file');
    console.info('--------------------------------------------------------');
    env = DEFAULT_ENV_CONFIG;
  }

  // parse app config
  const appConfigFilepath = path.resolve(localPath, '..', '..', 'config', 'application.json');

  try {
    app = JSON5.parse(fs.readFileSync(appConfigFilepath, 'utf-8'));
  } catch(err) {
    console.error(`Invalid app config file: ${appConfigFilepath}`);
    process.exit(1);
  }

  if (callerURL !== null) {
    // we can grab the role from the caller url dirname
    const dirname = path.dirname(callerURL);
    const parent = path.resolve(dirname, '..');
    const role = path.relative(parent, dirname);

    if (role !== 'server') {
      return { role, env, app };
    } else {
      return { env, app };
    }
  } else {
    return { env, app };
  }
}
