#!/usr/bin/env node

import os from 'node:os';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import module from 'node:module';

import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js';
import getPort from 'get-port';
import JSON5 from 'json5';

import { loadConfig } from '../../utils/load-config.js';
// controllers
import { probeInternet } from './controllers/probe-internet.js';
import { executeCommands } from './controllers/execute-commands.js';
import { testAudio } from './controllers/test-audio.js';
import { rebootAndShutdown } from './controllers/reboot-and-shutdown.js';
import { debug } from './controllers/debug.js';
// testing
import { testPushLogs } from './testing/test-push-logs.js';

import { DiscoveryClient, BROADCAST_PORT } from '@ircam/node-discovery';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

// in ESM module, no built-in require
const require = module.createRequire(import.meta.url);

const localFileName = fileURLToPath(import.meta.url);
const localPath = path.dirname(localFileName);

const selfPackageFile = path.resolve(localPath, '..', '..', '..', 'package.json');
const managerVersion = JSON5.parse(fs.readFileSync(selfPackageFile)).version;

// waiting for version
const soundworksPackageFile = path.resolve(require.resolve('@soundworks/core/server.js'), '..', '..', '..', 'package.json');
const soundworksVersion = JSON5.parse(fs.readFileSync(soundworksPackageFile)).version;

async function bootstrap() {
  try {
    // ---------------------------------------------------------
    // Start discovery process to find a server
    // ---------------------------------------------------------
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

Version discrepancies between manager server and client runtime:
+ manager    - server: ${rinfo.payload.managerVersion} | local: ${managerVersion}
+ soundworks - server: ${rinfo.payload.soundworksVersion} | local: ${soundworksVersion}

You should consider running:
+ \`rm -Rf node_modules && npm install\` on your server machine
+ \`sudo dotpi manager_update\` on your dotpi devices

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
    launcher.register(client, {
      // keep default behavior for dev clients, but exit all processes in production
      exitParentProcess: !isDebugClient,
    });

    client.pluginManager.register('checkin', pluginCheckin);

    await client.start();

    if (isDebugClient) {
      const checkin = await client.pluginManager.get('checkin');
      hostname = `dotpi-debug-client-${checkin.getIndex().toString().padStart(3, '0')}`;
    }

    const global = await client.stateManager.attach('global');

    const dotpi = await client.stateManager.create('dotpi', {
      hostname,
      isDebugClient,
      home,
      user,
      uid,
      address: linfo.address,
      port,
      managerVersion,
      soundworksVersion,
    });

    const controlPanelCollection = await client.stateManager.getCollection('control-panel');

    probeInternet(dotpi, 10);
    testAudio(global, dotpi);

    executeCommands(controlPanelCollection, dotpi);
    debug(controlPanelCollection, dotpi);

    rebootAndShutdown(global, dotpi);
    // testing
    // testPushLogs(dotpi);

    const msg = `dotpi-manager started (version: ${managerVersion}, soundworks: ${soundworksVersion})`;
    console.log(msg);
    dotpi.set({ stdout: { msg, source: 'runtime' } });
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

