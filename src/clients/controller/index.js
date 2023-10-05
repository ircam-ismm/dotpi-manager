import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { html, render } from 'lit';

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

  // client.pluginManager.register(pluginName, pluginFactory, {options}, [dependencies])

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

    init() {
      this.dotpiCollection.onAttach(async pi => {
        const hostname = pi.get('hostname');
        this.logSelected.add(hostname);

        this.render();
      }, true);

      this.dotpiCollection.onDetach(() => this.render());

      this.global.onUpdate(() => this.render());

      this.render();
    },

    _resize(e, direction) {
      const { width, height } = e.currentTarget.parentElement.getBoundingClientRect();
      const $prev = e.currentTarget.previousElementSibling;
      const $next = e.currentTarget.nextElementSibling;

      document.body.style.userSelect = 'none';
      document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'ex-resize';

      const resize = e => {
        if (direction === 'horizontal') {
          // clientX should be relative to parentElement
          const ratio = Math.max(0.02, Math.min(0.98, e.clientX / width));
          $prev.style.width = `${ratio * 100}%`;
          $next.style.width = `${(1 - ratio) * 100}%`;
        } else if (direction === 'vertical') {
           //clientY should be relative to parentElement
          const ratio = Math.max(0.02, Math.min(0.98, e.clientY / height));
          $prev.style.height = `${ratio * 100}%`;
          $next.style.height = `${(1 - ratio) * 100}%`;
        }
      }

      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', () => {
        document.body.style.userSelect = 'auto';
        document.body.style.cursor = 'auto';
        window.removeEventListener('mousemove', resize);
      });
    },

    render() {
      render(html`
        <header id="header">
          <h1>${client.config.app.name} | ${client.role}</h1>
          <sw-audit .client="${client}"></sw-audit>
        </header>
        <div id="main">
          <div class="col-left">
            <dotpi-commands .app=${this}></dotpi-commands>
            <div
              class="horizontal-handle"
              @mousedown=${e => this._resize(e, 'vertical')}
            ></div>
            <dotpi-client-list .app=${this}></dotpi-client-list>
          </div>

          <div
            class="vertical-handle"
            @mousedown=${e => this._resize(e, 'horizontal')}
          ></div>

          <dotpi-log class="col-right" .app=${this}></dotpi-log>
        </div>
      `, $container);
    },
  }

  app.init();
}

launcher.execute(main);
