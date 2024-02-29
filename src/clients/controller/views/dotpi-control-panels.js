import { LitElement, html, css, nothing } from 'lit';

import '@ircam/sc-components/sc-tab.js';
import '@ircam/sc-components/sc-icon.js';
import '@ircam/sc-components/sc-text.js';

class DotPiControlPanels extends LitElement {
  static properties = {
    app: {
      state: true,
      hasChanged: () => true,
    },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: 12px;
    }

    header {
      margin-bottom: 8px;
    }

    header sc-tab {
      width: 100%;
    }

    h3 {
      padding-bottom: 5px;
      border-bottom: 1px solid var(--sc-color-primary-3);
      font-size: 12px;
    }

    div {
      margin-bottom: 4px;
    }

    div.panel-infos {
      margin-bottom: 20px;
    }

    sc-icon[type=close] {
      float: right;
      border: none;
      background-color: transparent;
      opacity: 0.8;
    }

    sc-text[editable] {
      width: 450px;
    }

    sc-text.label {
      width: 200px;
      background-color: var(--sc-color-primary-1);
      border-color: var(--sc-color-primary-3);
    }

    .align-right {
      text-align: right;
    }

    .info {
      font-size: 10px;
      font-style: italic;
      color: #9d9a9a;
    }
  `;

  render() {
    return html`
      <header>
        <sc-tab
          .options=${this.app.controlPanelCollection.get('label').concat('+')}
          value=${this.app.controlPanel ? this.app.controlPanel.get('label') : null}
          @change=${e => {
            if (e.detail.value === '+') {
              this.app.global.set({ createControlPanel: true });
            } else {
              // @fixme: should use panel id,
              // cf. https://github.com/ircam-ismm/sc-components/issues/40
              this.app.controlPanel = this.app.controlPanelCollection.find(p => p.get('label') === e.detail.value);
              this.app.render();
            }
          }}
        ></sc-tab>
      </header>
      <div>
        ${this.app.controlPanel ? html`
          <div class="panel-infos">
            <sc-text
              class="label"
              value=${this.app.controlPanel.get('label')}
              editable
              @change=${e => {
                const originalLabel = this.app.controlPanel.get('label');
                const labels = this.app.controlPanelCollection.get('label');
                labels.splice(labels.indexOf(originalLabel), 1);
                let label = e.detail.value.replace(/(\r\n|\n|\r)/gm, '');
                const prefix = label;
                let number = 1;

                while (labels.indexOf(label) !== -1) {
                  label = `${prefix} (${number})`;
                  number += 1;
                }

                this.app.controlPanel.set({ label });
              }}
            ></sc-text>
            <sc-text class="info">(panel id: ${this.app.controlPanel.get('id')})</sc-text>
            <sc-icon
              type="close"
              @input=${e => this.app.global.set({ deleteControlPanel: this.app.controlPanel.get('id') })}
            ></sc-icon>
          </div>
          <div>
            <!-- <h3>dotpi clients</h3> -->
            <div>
              <sc-text>Remote path</sc-text>
              <sc-text
                value=${this.app.controlPanel.get('remotePath')}
                editable
                @change=${e => this.app.controlPanel.set({ remotePath: e.detail.value.replace(/(\r\n|\n|\r)/gm, '') })}
              ></sc-text>
            </div>
            <div>
              <sc-text>/bin/bash</sc-text>
              <sc-text
                value=${this.app.controlPanel.get('command')}
                editable
                @change=${e => this.app.controlPanel.set({ command: e.detail.value.replace(/(\r\n|\n|\r)/gm, '') })}
              ></sc-text>
            </div>
            <div>
              <sc-text class="align-right">Execute</sc-text>
              <sc-toggle
                ?active=${this.app.controlPanel.get('executeCommand')}
                @change=${e => this.app.controlPanel.set({ executeCommand: e.detail.value})}
              ></sc-toggle>
            </div>
            <div>
              <sc-text class="info"># clients executing command: ${this.app.controlPanel.get('executingCommandList').length}</sc-text>
            </div>
          </div>
          <div>
            <h3>Synchronize</h3>
            <div>
              <sc-text>Local path</sc-text>
              <sc-text
                value=${this.app.controlPanel.get('localPath')}
                editable
                @change=${e => this.app.controlPanel.set({ localPath: e.detail.value.replace(/(\r\n|\n|\r)/gm, '') })}
              ></sc-text>
            </div>
            <div>
              <sc-text class="align-right">Sync</sc-text>
              <sc-bang
                @input=${e => this.app.controlPanel.set({ syncTrigger: true })}
              ></sc-bang>
              <sc-text class="align-right">Watch</sc-text>
              <sc-toggle
                ?active=${this.app.controlPanel.get('syncWatch')}
                @change=${e => this.app.controlPanel.set({ syncWatch: e.detail.value})}
              ></sc-toggle>
            </div>
            <div>
              <sc-text class="info"># clients syncing: ${this.app.controlPanel.get('syncingList').length}</sc-text>
            </div>
          </div>
        `: nothing}
      </div>
    `;
  }
}

customElements.define('dotpi-control-panels', DotPiControlPanels);
