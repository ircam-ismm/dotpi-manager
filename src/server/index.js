import path from 'node:path';
import fs from 'node:fs';

import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import pluginLogger from '@soundworks/plugin-logger/server.js';
import { DiscoveryServer } from '@ircam/node-discovery';

import { loadConfig } from '../utils/load-config.js';
import '../utils/catch-unhandled-errors.js';
// schemas
import dotpiSchema from './schemas/dotpi.js';
import globalSchema from './schemas/global.js';
// controllers
import { syncDirectory } from './controllers/sync-directory.js';
import { forwardExecAndFork } from './controllers/forward-exec-and-fork.js';
import { logger } from './controllers/logger.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

let globalDefault = {};
// try read stored values
const storeFile = path.join(process.cwd(), 'db.json');
if (fs.existsSync(storeFile)) {
  globalDefault = JSON.parse(fs.readFileSync(storeFile));
}

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);


const server = new Server(config);
// configure the server for usage within this application template
server.useDefaultApplicationTemplate();

server.pluginManager.register('logger', pluginLogger, { dirname: 'logs' });

server.stateManager.registerSchema('global', globalSchema);
server.stateManager.registerSchema('dotpi', dotpiSchema);

await server.start();

const global = await server.stateManager.create('global', globalDefault);
const dotpiCollection = await server.stateManager.getCollection('dotpi');

// register controllers
forwardExecAndFork(global, dotpiCollection);
syncDirectory(global, dotpiCollection);
logger(server, global, dotpiCollection);

// store current command infos into file (could be an interesting preset pattern...)
global.onUpdate(updates => {
  const toStore = [
    'execPwd',
    'execCmd',
    'forkPwd',
    'forkCmd',
    'syncLocalPathname',
    'syncRemotePathname',
  ];

  const keys = Object.keys(updates);
  const intersection = toStore.filter(key => keys.includes(key));

  if (intersection.length) {
    const values = {};
    toStore.forEach(key => values[key] = global.get(key));
    fs.writeFileSync(storeFile, JSON.stringify(values));
  }

  if ('dotpiSeenDeleteRequest' in updates) {
    const hostname = updates.dotpiSeenDeleteRequest;
    const dotpiSeen = global.get('dotpiSeen');
    const index = dotpiSeen.findIndex(entry => entry.hostname === hostname);
    if (index !== -1) {
      dotpiSeen.splice(index, 1);
      global.set({ dotpiSeen });
    };
  }
});

dotpiCollection.onAttach(dotpi => {
  const hostname = dotpi.get('hostname');
  const address = dotpi.get('address');

  const dotpiSeen = new Set(global.get('dotpiSeen'));
  dotpiSeen.add({ hostname, address });
  global.set({ dotpiSeen: Array.from(dotpiSeen) });
});

// run the discovery server
const discoveryServer = new DiscoveryServer({
  verbose: false,
  payload: { serverPort: server.config.env.port }
});

discoveryServer.start();
