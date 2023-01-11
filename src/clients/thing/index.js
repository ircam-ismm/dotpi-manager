import os from 'os';
import getPort from 'get-port';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { loadConfig } from '../../utils/load-config.js';

// import { DiscoveryClient, discoveryConfig } from '@ircam/node-discovery';
import { DiscoveryClient, BROADCAST_PORT } from '@ircam/node-discovery';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function bootstrap() {
  try {
    /**
     * Start discovery process to find a server
     */

    const debug = true;
    let hostname, port;

    if (!debug) {
      hostname = os.hostname(); // may be overriden if `debug=true`
      port = BROADCAST_PORT;
    } else {
      hostname = `dotpi-client-${parseInt(Math.random() * 100000)}`;
      port = await getPort();
    }

    console.log("hostname: ", hostname);

    // let discoveryClient, clientState;
    const [rinfo, linfo] = await new Promise((resolve, reject) => {
      const discoveryClient = new DiscoveryClient({ 
        port: port,
        payload: { hostname },
      });

      discoveryClient.on('connection', async (rinfo, linfo) => {
        console.log('rinfo: ', rinfo);
        console.log('linfo: ', linfo);
        resolve([rinfo, linfo]);
      });

      discoveryClient.on('close', () => {
      });

      discoveryClient.start();
    });

    /**
     * create the soundworks client
     */

    const config = loadConfig(process.env.ENV, import.meta.url);
    config.env.serverAddress = rinfo.address;
    const client = new Client(config);

    launcher.register(client);

    await client.start();

    const clientState = await client.stateManager.create('dotpi', { 
      laddress: linfo.address,
      lport: port,
      raddress: rinfo.address,
      rport: rinfo.port,
      hostname: hostname,
     });

    // 


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
