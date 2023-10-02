import path from 'node:path';
import fs from 'node:fs';

import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { DiscoveryServer } from '@ircam/node-discovery';

import { loadConfig } from '../utils/load-config.js';
import '../utils/catch-unhandled-errors.js';
// schemas
import dotpiSchema from './schemas/dotpi.js';
import globalSchema from './schemas/global.js';
// controllers
import { syncDirectory } from './controllers/sync-directory.js';

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

server.stateManager.registerSchema('global', globalSchema);
server.stateManager.registerSchema('dotpi', dotpiSchema);

await server.start();

const global = await server.stateManager.create('global', globalDefault);
const dotpiCollection = await server.stateManager.getCollection('dotpi');

global.onUpdate(updates => {
  for (let [key, value] of Object.entries(updates)) {
    switch (key) {
      case 'execTrigger': {
        // filter collection according to `cmdFilter`
        const dotpiStates = dotpiCollection.filter(state => {
          return true;
        });

        const execCwd = global.get('execCwd');
        const execCmd = global.get('execCmd');

        dotpiStates.forEach(state => {
          state.set({ execCwd, execCmd, execTrigger: true });
        });
        break;
      }
    }
  }

  // store current state for reload on restart
  const toStore = [
    'execCwd',
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
});

// register controllers
syncDirectory(global, dotpiCollection);

// run the discovery server
const discoveryServer = new DiscoveryServer({
  verbose: false,
  payload: { serverPort: server.config.env.port }
});

discoveryServer.start();
