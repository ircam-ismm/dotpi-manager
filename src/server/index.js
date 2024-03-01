import path from 'node:path';
import fs from 'node:fs';

import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import pluginLogger from '@soundworks/plugin-logger/server.js';
import pluginCheckin from '@soundworks/plugin-checkin/server.js';
import { DiscoveryServer } from '@ircam/node-discovery';
import getPort from 'get-port';
import JSON5 from 'json5';

import { loadConfig } from '../utils/load-config.js';
import '../utils/catch-unhandled-errors.js';
// schemas
import dotpiSchema from './schemas/dotpi.js';
import globalSchema from './schemas/global.js';
import controlPanelSchema from './schemas/control-panel.js';
// controllers
import { rsync } from './controllers/rsync.js';
import { logger } from './controllers/logger.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);
// pick a random port outside the port generally used by soundworks application
const port = await getPort({ port: 9000, from: 9000 });
config.env.port = port;

const managerVersion = JSON5.parse(fs.readFileSync('package.json')).version;
const soundworksVersion = JSON5.parse(fs.readFileSync('node_modules/@soundworks/core/package.json')).version;

const dbPathname = path.join(process.cwd(), 'db.json');

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]

- dotpi-manager version: ${managerVersion}
- soundworks version:    ${soundworksVersion}
--------------------------------------------------------
`);


const server = new Server(config);
// configure the server for usage within this application template
server.useDefaultApplicationTemplate();

server.pluginManager.register('logger', pluginLogger, { dirname: 'logs' });
server.pluginManager.register('checkin', pluginCheckin);

server.stateManager.registerSchema('global', globalSchema);
server.stateManager.registerSchema('dotpi', dotpiSchema);
server.stateManager.registerSchema('control-panel', controlPanelSchema);

await server.start();

const global = await server.stateManager.create('global', {
  managerVersion,
  soundworksVersion,
});
const dotpiCollection = await server.stateManager.getCollection('dotpi');
// control panel collection for usage in sync directory controller
const controlPanelCollection = await server.stateManager.getCollection('control-panel');

let controlPanelId = -1;
const controlPanels = new Map();

server.stateManager.registerUpdateHook('control-panel', (updates, currentValues) => {
  for (let [name, value] of Object.entries(updates)) {
    switch (name) {
      case 'filteredListAdd': {
        const { filteredList } = currentValues;
        value.forEach(hostname => {
          if (filteredList.indexOf(hostname) === -1) {
            filteredList.push(hostname);
          }
        });
        return { filteredList };
        break;
      }
      case 'filteredListDelete': {
        const { filteredList } = currentValues;
        value.forEach(hostname => {
          const index = filteredList.indexOf(hostname);
          if (index !== -1) {
            filteredList.splice(index, 1);
          }
        });
        return { filteredList };
        break;
      }
      case 'syncingListAdd': {
        const { syncingList } = currentValues;
        syncingList.push(value);
        return { syncingList };
        break;
      }
      case 'syncingListDelete': {
        const { syncingList } = currentValues;
        const index = syncingList.indexOf(value);
        if (index !== -1) {
          syncingList.splice(index, 1);
        }
        return { syncingList };
        break;
      }
      case 'executingCommandListAdd': {
        const { executingCommandList } = currentValues;
        executingCommandList.push(value);
        return { executingCommandList };
        break;
      }
      case 'executingCommandListDelete': {
        const { executingCommandList } = currentValues;
        const index = executingCommandList.indexOf(value);
        if (index !== -1) {
          executingCommandList.splice(index, 1);
        }
        return { executingCommandList };
        break;
      }
    }
  }
});

async function createControlPanel(values = null) {
  let controlPanel;

  if (values === null) {
    controlPanelId += 1;
    controlPanel = await server.stateManager.create('control-panel', {
      id: controlPanelId,
      label: `panel-${controlPanelId}`,
    });
  } else {
    controlPanelId = Math.max(controlPanelId, values.id);
    controlPanel = await server.stateManager.create('control-panel', values);
  }

  controlPanel.onUpdate(updates => persistControlPanels());
  controlPanels.set(controlPanelId, controlPanel);

  persistControlPanels();
}

async function deleteControlPanel(id) {
  const controlPanel = controlPanels.get(id);
  await controlPanel.delete();
  controlPanels.delete(id);

  persistControlPanels();
}

async function persistControlPanels() {
  const values = Array.from(controlPanels.values()).map(panel => {
    return {
      id: panel.get('id'),
      label: panel.get('label'),
      localPath: panel.get('localPath'),
      remotePath: panel.get('remotePath'),
      command: panel.get('command'),
    }
  });

  fs.writeFileSync(dbPathname, JSON5.stringify(values, null, 2));
}

global.onUpdate(async updates => {
  for (let [key, value] of Object.entries(updates)) {
    switch (key) {
      case 'dotpiSeenDeleteRequest': {
        const hostname = updates.dotpiSeenDeleteRequest;
        const dotpiSeen = global.get('dotpiSeen');
        const index = dotpiSeen.findIndex(entry => entry.hostname === hostname);

        if (index !== -1) {
          dotpiSeen.splice(index, 1);
          global.set({ dotpiSeen });
        };
        break;
      }
      case 'createControlPanel': {
        await createControlPanel();
        break;
      }
      case 'deleteControlPanel': {
        await deleteControlPanel(value)
        break;
      }
    }
  }
});

// init control panels from persited values
if (fs.existsSync(dbPathname)) {
  const db = JSON5.parse(fs.readFileSync(dbPathname));
  for (let entry of db) {
    await createControlPanel(entry);
  }
}
// if empty, init with one panel
if (controlPanels.size === 0) {
  await createControlPanel();
}

// work around Set missing type
dotpiCollection.onAttach(dotpi => {
  const hostname = dotpi.get('hostname');
  const address = dotpi.get('address');
  const dotpiSeen = global.get('dotpiSeen');
  const index = dotpiSeen.findIndex(entry => entry.hostname === hostname);

  if (index === -1) {
    dotpiSeen.push({ hostname, address });
    global.set({ dotpiSeen: dotpiSeen });
  }
});

// register controllers
rsync(global, controlPanelCollection, dotpiCollection);
logger(server, dotpiCollection);

// run the discovery server
const discoveryServer = new DiscoveryServer({
  verbose: false,
  payload: {
    serverPort: server.config.env.port,
    managerVersion,
    soundworksVersion,
  }
});

discoveryServer.start();
