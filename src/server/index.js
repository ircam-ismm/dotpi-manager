import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { DiscoveryServer } from '@ircam/node-discovery';

import { loadConfig } from '../utils/load-config.js';
import '../utils/catch-unhandled-errors.js';
// schemas
import clientSchema from './schemas/rpi.js';
import globalSchema from './schemas/global.js';
// controllers
import { syncDirectory } from './controllers/sync-directory.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

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
server.stateManager.registerSchema('rpi', clientSchema);

await server.start();

const global = await server.stateManager.create('global');
const rpiCollection = await server.stateManager.getCollection('rpi');

// register controllers
syncDirectory(global, rpiCollection);

// run the discovery server
const discoveryServer = new DiscoveryServer({
  verbose: false,
  payload: { serverPort: server.config.env.port }
});

discoveryServer.start();
