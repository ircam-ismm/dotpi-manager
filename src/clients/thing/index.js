import os from 'node:os';
import readline from 'node:readline';
import { execSync } from 'node:child_process';

import getPort from 'get-port';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { loadConfig } from '../../utils/load-config.js';
// controllers
import { probeInternet } from './controllers/probe-internet.js';
import { execCommand } from './controllers/exec-command.js';
import { forkProcess } from './controllers/fork-process.js';
import { shutdown } from './controllers/shutdown.js';
import { testAudio } from './controllers/test-audio.js';
// testing
import { testPushLogs } from './testing/test-push-logs.js';

import { DiscoveryClient, BROADCAST_PORT } from '@ircam/node-discovery';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function bootstrap() {
  try {
    // ---------------------------------------------------------
    // Start discovery process to find a server
    // ---------------------------------------------------------

    const debug = (process.env.DEBUG === '1') || false;
    let hostname = os.hostname();
    let port;
    let isDebugClient = false;

    if (hostname.startsWith('dotpi-')) {
      port = BROADCAST_PORT;
    } else {
      console.log('> DEBUG mode');
      hostname = `dotpi-debug-client-${parseInt(Math.random() * 1e5)}`;
      // hostname = 'dotpi-debug-client-coucou';
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

    await client.start();

    const dotpi = await client.stateManager.create('dotpi', {
      address: linfo.address,
      port,
      hostname,
      home,
      user,
      uid,
      isDebugClient,
    });

    probeInternet(dotpi, 10);
    execCommand(dotpi);
    forkProcess(dotpi);
    shutdown(dotpi);
    testAudio(dotpi);

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
