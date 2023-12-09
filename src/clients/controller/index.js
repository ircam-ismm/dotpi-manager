import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { html, render } from 'lit';
import '@ircam/sc-components/sc-separator.js';

import '../components/sw-audit.js';
import './views/dotpi-commands.js';
import './views/dotpi-client-list.js';
import './views/dotpi-log.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = window.SOUNDWORKS_CONFIG;

async function main($container) {
  const client = new Client(config);

  launcher.register(client, {
    initScreensContainer: $container,
    reloadOnVisibilityChange: false,
  });

  await client.start();

  const app = {
    client, // soundworks client
    global: await client.stateManager.attach('global'),
    dotpiCollection: await client.stateManager.getCollection('dotpi'),

    // local list of client hostnames shown in the logs
    logSelected: new Set(),
    notifications: new Set(),

    async init() {
      // Require secure context: This feature is available only in secure contexts (HTTPS),
      // in some or all supporting browsers. => ok in localhost
      // Notifications must be accepted system wide for the browser.
      // cf. System Settings > Notifications
      const hasRequestPermission = await Notification.requestPermission();
      if (hasRequestPermission === 'granted') {
        document.addEventListener("visibilitychange", () => {
          // tab has become visible so clear the now-stale notifications
          if (document.visibilityState === "visible") {
            this.notifications.forEach(n => n.close());
            this.notifications.clear();
          }
        });
      }

      this.dotpiCollection.onAttach(async dotpi => {
        const hostname = dotpi.get('hostname');
        this.logSelected.add(hostname);

        this.render();
      }, true);

      this.dotpiCollection.onDetach(dotpi => {
        this._sendNotification(`dotpi client disconnected:\n"${dotpi.get('hostname')}"`);
        this.render();
      });

      this.global.onUpdate(() => this.render());

      this.render();
    },

    _sendNotification(msg) {
      if (document.hidden) {
        const notification = new Notification('dotpi - manager', { body: msg, icon: './images/dots.png' });
        this.notifications.add(notification);
      }
    },

    render() {
      render(html`
        <header id="header">
          <h1>${client.config.app.name} | ${client.role}</h1>

          <div class="col-left">
            <sw-audit .client="${client}"></sw-audit>
            <sc-icon
              type="redo"
              @click=${e => {
                const result = confirm('Are you sure you want to reboot the selected dotpi clients?');
                if (result) {
                  this.global.set({ reboot: true });
                }
              }}
            ></sc-icon>
            <sc-icon
              type="shutdown"
              @click=${e => {
                const result = confirm('Are you sure you want to shutdown the selected dotpi clients?');
                if (result) {
                  this.global.set({ shutdown: true });
                }
              }}
            ></sc-icon>
          </div>
        </header>
        <div id="main">
          <div class="col-left">
            <dotpi-commands .app=${this}></dotpi-commands>
            <sc-separator direction="column"></sc-separator>
            <dotpi-client-list .app=${this}></dotpi-client-list>
          </div>
          <sc-separator direction="row"></sc-separator>
          <dotpi-log class="col-right" .app=${this}></dotpi-log>
        </div>
      `, $container);
    },
  }

  app.init();
}

launcher.execute(main);
