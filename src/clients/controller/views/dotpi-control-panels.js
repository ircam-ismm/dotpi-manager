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
      /*padding-bottom: 10px;
      border-bottom: 1px solid var(--sc-color-primary-4);*/
      margin-bottom: 10px;
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

    sc-icon[type=close] {
      float: right;
      border: none;
      background-color: transparent;
      opacity: 0.8;
    }

    sc-text[editable] {
      width: 450px;
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
              this.app.controlPanel = this.app.controlPanelCollection.find(p => p.get('label') === e.detail.value);
              this.app.render();
            }
          }}
        ></sc-tab>
      </header>
      <div>
        ${this.app.controlPanel ? html`
          <sc-text
            value=${this.app.controlPanel.get('label')}
            editable
            @change=${e => this.app.controlPanel.set({ label: e.detail.value.replace(/(\r\n|\n|\r)/gm, '') })}
          ></sc-text>
          <sc-text class="info">(id: ${this.app.controlPanel.get('id')})</sc-text>
          <sc-icon
            type="close"
            @input=${e => this.app.global.set({ deleteControlPanel: this.app.controlPanel.get('id') })}
          ></sc-icon>
          <div>
            <h3>Directories</h3>
            <div>
              <sc-text>Remote directory</sc-text>
              <sc-text
                value=${this.app.controlPanel.get('remoteDirectory')}
                editable
                @change=${e => this.app.controlPanel.set({ remoteDirectory: e.detail.value.replace(/(\r\n|\n|\r)/gm, '') })}
              ></sc-text>
            </div>
            <div>
              <sc-text>Local directory</sc-text>
              <sc-text
                value=${this.app.controlPanel.get('localDirectory')}
                editable
                @change=${e => this.app.controlPanel.set({ localDirectory: e.detail.value.replace(/(\r\n|\n|\r)/gm, '') })}
              ></sc-text>
            </div>
          </div>
          <div>
            <h3>Command</h3>
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
              <sc-text class="align-right">Sync</sc-text>
              <sc-bang
                @input=${e => this.app.controlPanel.set({ syncTrigger: true })}
              ></sc-bang>
            </div>
            <div>
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
