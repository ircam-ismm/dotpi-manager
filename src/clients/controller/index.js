import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { html } from 'lit';
import createLayout from './views/layout.js';
import '@ircam/simple-components/sc-toggle.js';
import '../components/dotpi-controls.js'

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = window.SOUNDWORKS_CONFIG;

async function main($container) {
  try {
    const client = new Client(config);

    // client.pluginManager.register(pluginName, pluginFactory, {options}, [dependencies])

    launcher.register(client, {
      initScreensContainer: $container,
      reloadOnVisibilityChange: false,
    });

    await client.start();

    /* eslint-disable-next-line no-unused-vars */
    const $layout = createLayout(client, $container);

    const dotpiSeen = new Map();
    const dotpiConnected = new Map();
    
    client.stateManager.observe(async (schemaName, stateId, nodeId) => {
      switch (schemaName) {
        case 'dotpi':
          const dotpiState = await client.stateManager.attach(schemaName, stateId);
          const dotpiInfo = dotpiState.getValues();
          const dotpiKey = `${dotpiInfo.laddress}:${dotpiInfo.lport}`;
          console.log(`new dotpi: ${dotpiInfo.laddress}:${dotpiInfo.lport} | ${dotpiInfo.hostname}`);

          dotpiState.onDetach(() => {
            dotpiConnected.delete(dotpiKey);
            $layout.requestUpdate();
          });
          
          if (!dotpiSeen.has(dotpiKey)) {
            dotpiSeen.set(dotpiKey, dotpiState);
          }
          dotpiConnected.set(dotpiKey, dotpiState);
        
          $layout.requestUpdate();
          break;
      }
    });

    // render($layout, dotpiConnected);

    const widthDotpiDiv = 300;
    const heightDotpiDiv = 60;

    //faire un component pour chaque pi display (cf dossier components)

    const dotpiControls = {
      render() {
        return html`
          ${Array.from(dotpiConnected, ([key, state], idx) => {
            return html`
              <dotpi-controls
                .state="${state}"
                connected
              ></dotpi-controls>
            `
          })}
        `;
      }
    }
    $layout.addComponent(dotpiControls);

  } catch(err) {
    console.error(err);
  }
}

launcher.execute(main);

// function render(layout, dotpiConnected) {
//   console.log(layout);
//   console.log(dotpiConnected)
//   layout.addComponent(html`
//     <div>
//       <h1>Connected dotpi</h1>
//       ${Array.from(dotpiConnected, ([key, state]) => {
//         console.log(state);
//         const dotpiInfo = state.getValues();
//         return html`
//           <div style="border: 5px yellow">
//             <h2>${dotpiInfo.hostname}</h2>
//             <h3>${dotpiInfo.laddress}:${dotpiInfo.lport}</h3>
//           </div>
//         `
//       })}
//     </div>
//   `)
// }