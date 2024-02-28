import os from 'node:os';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import fs from 'fs';

import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js';
import getPort from 'get-port';
import JSON5 from 'json5';

import { loadConfig } from '../../utils/load-config.js';
// controllers
import { probeInternet } from './controllers/probe-internet.js';
// import { executeCommands } from './controllers/exec-command.js';
import { executeCommands } from './controllers/execute-commands.js';
import { testAudio } from './controllers/test-audio.js';
import { rebootAndShutdown } from './controllers/reboot-and-shutdown.js';
// testing
import { testPushLogs } from './testing/test-push-logs.js';

import { DiscoveryClient, BROADCAST_PORT } from '@ircam/node-discovery';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const managerVersion = JSON5.parse(fs.readFileSync('package.json')).version;
const soundworksVersion = JSON5.parse(fs.readFileSync('node_modules/@soundworks/core/package.json')).version;
// const soundworksVersion = 'notTheSameVersion';

async function bootstrap() {
  try {
    // ---------------------------------------------------------
    // Start discovery process to find a server
    // ---------------------------------------------------------

    const debug = (process.env.DEBUG === '1') || false;
    let port;
    let hostname = os.hostname();
    let isDebugClient = false;

    if (hostname.startsWith('dotpi-')) {
      port = BROADCAST_PORT;
    } else {
      console.log('> DEBUG mode');
      port = await getPort();
      isDebugClient = true;
    }

    const home = os.homedir();
    // @todo - maybe use os.userInfo()
    const user = execSync(`whoami`).toString().replace(/\s$/g, '');
    const uid = parseInt(execSync('id -u $(whoami)').toString());

    console.log('>', hostname, BROADCAST_PORT, home, user, uid);

    // look for the server on the network
    const [rinfo, linfo] = await new Promise((resolve, reject) => {
      const discoveryClient = new DiscoveryClient({ 
        port: port,
        payload: { hostname },
      });

      discoveryClient.on('connection', async (rinfo, linfo) => {
        if (rinfo.payload.managerVersion !== managerVersion
          || rinfo.payload.soundworksVersion !== soundworksVersion
        ) {
          console.warn(`
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

WARNING

Version discepancies between manager server and client:
+ manager    - server: ${rinfo.payload.managerVersion} | local: ${managerVersion}
+ soundworks - server: ${rinfo.payload.soundworksVersion} | local: ${soundworksVersion}

You should consider running:
+ \`rm -Rf node_modules && npm install\` on your server machine
+ \`sudo dotpi manager_update\` on your remote devices

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
        }

        resolve([rinfo, linfo]);
      });

      discoveryClient.on('close', () => {});
      discoveryClient.start();
    });

    // ---------------------------------------------------------
    // Launch soundworks client
    // ---------------------------------------------------------

    const config = loadConfig(process.env.ENV, import.meta.url);
    // use port and address acquired from discovery
    config.env.port = rinfo.payload.serverPort;
    config.env.serverAddress = rinfo.address;

    const client = new Client(config);
    launcher.register(client);

    client.pluginManager.register('checkin', pluginCheckin);

    await client.start();

    if (isDebugClient) {
      const checkin = await client.pluginManager.get('checkin');
      hostname = `dotpi-debug-client-${checkin.getIndex().toString().padStart(3, '0')}`;
    }

    const global = await client.stateManager.attach('global');

    const dotpi = await client.stateManager.create('dotpi', {
      address: linfo.address,
      port,
      hostname,
      home,
      user,
      uid,
      isDebugClient,
    });

    const controlPanelCollection = await client.stateManager.getCollection('control-panel');

    probeInternet(dotpi, 10);
    testAudio(dotpi);

    executeCommands(controlPanelCollection, dotpi);

    rebootAndShutdown(global);
    // testing
    // testPushLogs(dotpi);
  } catch(err) {
    console.error(err);
  }
}

// The launcher allows to fork multiple clients in the same terminal window
// by defining the `EMULATE` env process variable
// e.g. `EMULATE=10 npm run watch-process thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
