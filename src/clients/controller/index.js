import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { html, render, nothing } from 'lit';
import '@ircam/sc-components/sc-separator.js';
import '@ircam/sc-components/sc-icon.js';
import '@ircam/sc-components/sc-fullscreen.js';

import '../components/sw-audit.js';
import './views/dotpi-control-panels.js';
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
    controlPanelCollection: await client.stateManager.getCollection('control-panel'),

    // local list of client hostnames shown in the logs
    logSelected: new Set(),
    notifications: new Set(),

    storagePanelKey: 'dotpi-manager:panel',

    async init() {
      // first control panel as default
      this.controlPanelCollection.sort(p => p.get('id'));

      let panelLabel = localStorage.getItem(this.storagePanelKey);

      if (panelLabel === null) {
        const firstPanel = this.controlPanelCollection.find((p, i) => i === 0);
        panelLabel = firstPanel.get('label');
      }

      this.setControlPanel(panelLabel);
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

      // this.controlPanelCollection.onUpdate((panel, updates) => {
      //   if (this.controlPanel === panel) {
      //     if ('syncingList' in updates) {
      //       console.log(updates.syncingList);
      //     }
      //   }
      // });

      this.controlPanelCollection.onAttach(panel => {
        this.controlPanelCollection.sort(p => p.get('id'));
        this.setControlPanel(panel.get('label'));
        this.render();
      });

      this.controlPanelCollection.onDetach(panel => {
        if (this.controlPanel === panel) {
          this.controlPanelCollection.sort(p => p.get('id'));
          // default to first panel
          let fallbackPanel = this.controlPanelCollection.find((p, i) => i === 0);
          // find closest previous id if any
          const deletedId = panel.get('id');
          let targetId = -1;

          for (let controlPanel of this.controlPanelCollection) {
            const controlPanelId = controlPanel.get('id');
            if (controlPanelId > targetId && controlPanelId < deletedId) {
              fallbackPanel = controlPanel;
            }
          }

          this.setControlPanel(fallbackPanel.get('label'));
        }

        this.render();
      });

      this.controlPanelCollection.onUpdate(() => this.render());

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

    setControlPanel(label) {
      let panel = this.controlPanelCollection.find(p => p.get('label') === label);

      if (!panel) {
        panel = this.controlPanelCollection.find((p, i) => i === 0);
      }

      this.controlPanel = panel;
      localStorage.setItem(this.storagePanelKey, label);

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
            <sc-fullscreen></sc-fullscreen>
            <sc-icon
              type="burger"
              @click=${e => {
                this.showDebugPanel = !this.showDebugPanel;
                this.render();
              }}
            ></sc-icon>
            <sc-icon
              type="redo"
              @click=${e => {
                const result = confirm('Are you sure you want to reboot all dotpi clients?');
                if (result) {
                  this.global.set({ reboot: true });
                }
              }}
            ></sc-icon>
            <sc-icon
              type="shutdown"
              @click=${e => {
                const result = confirm('Are you sure you want to shutdown all dotpi clients?');
                if (result) {
                  this.global.set({ shutdown: true });
                }
              }}
            ></sc-icon>
          </div>
        </header>
        <div id="main">
          <div class="col-left">
            <dotpi-control-panels .app=${this} style="height: 50%;"></dotpi-control-panels>
            <sc-separator direction="column" id="sep-2"></sc-separator>
            <dotpi-client-list .app=${this} style="height: 50%;"></dotpi-client-list>
          </div>
          <sc-separator direction="row" id="sep-1"></sc-separator>
          <dotpi-log class="col-right" .app=${this}></dotpi-log>
        </div>
        ${this.showDebugPanel
          ? html`
            <div id="debug-panel">
              <sc-button
                @input=${e => this.controlPanel.set({ debugTriggerError: true })}
              >Trigger Error in runtime</sc-button>
            </div>`
          : nothing
        }

      `, $container);
    },
  }

  app.init();
}

launcher.execute(main);
