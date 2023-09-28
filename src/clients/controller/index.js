import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { html, render } from 'lit';

import '@ircam/sc-components/sc-button.js';
import '../components/sw-audit.js';
import '../components/dotpi-controls.js';
import '../components/dotpi-client-list.js';
import '../components/dotpi-log.js';


// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = window.SOUNDWORKS_CONFIG;

async function main($container) {
  const client = new Client(config);

  // client.pluginManager.register(pluginName, pluginFactory, {options}, [dependencies])

  launcher.register(client, {
    initScreensContainer: $container,
    reloadOnVisibilityChange: false,
  });

  await client.start();

  const app = {
    client, // soundworks client
    rpiCollection: await client.stateManager.getCollection('rpi'),
    rpiSeen: new Set(),
    // list of client hostnames that are shown in the logs
    logSelected: new Set(),
    //

    init() {
      this.rpiCollection.onAttach(pi => {
        const hostname = pi.get('hostname');
        // add to pi seen list, so we can track disconnections
        this.rpiSeen.add(hostname);
        this.logSelected.add(hostname);

        // if no special selection has been made on the logs, add the new client to the list
        // this cannot work has, as we keep the disconnected client into the list
        //
        if (this.logSelected.size === 0 || this.logSelected.size === this.rpiSeen.length - 1) {
          console.log(`add ${hostname} to the logSelected list`);
          this.logSelected.add(hostname);
        }

        this.render();
      }, true);

      this.rpiCollection.onDetach(() => this.render());

      this.render();
    },

    render() {
      render(html`
        <header id="header">
          <h1>${client.config.app.name} | ${client.role}</h1>
          <sw-audit .client="${client}"></sw-audit>
        </header>
        <div id="main">
          <div class="col-left">
            <dotpi-controls .app=${this}></dotpi-controls>
            <dotpi-client-list .app=${this}></dotpi-client-list>
          </div>

          <dotpi-log .app=${this}></dotpi-log>
        </div>
      `, $container);
    },
  }

  app.init();
}

launcher.execute(main);
