import { LitElement, html, css, nothing } from 'lit';
import { live } from 'lit/directives/live.js';

import '@ircam/sc-components/sc-bang.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-status.js';
import '@ircam/sc-components/sc-icon.js';
import '@ircam/sc-components/sc-text.js';

class DotPiClient extends LitElement {
  static properties = {
    state: {
      type: Object,
    },
    infos: {
      type: Object,
    },
    app: {
      state: true,
      hasChanged: () => true,
    },
  };

  static styles = css`
    :host {
      display: block;
      height: 30px;
      background-color: var(--sw-light-background-color);
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      --dotpi-controls-width: 240px;
    }

    .infos {
      display: flex;
      align-items: center;
      white-space: nowrap; 
      overflow: hidden;
      padding-left: 20px;
      width: calc(100% - var(--dotpi-controls-width));
      box-sizing: border-box;
    }

    .infos sc-text {
      background-color: transparent;
    }

    .infos sc-icon {
      margin-right: 20px;
      height: 20px;
      width: 20px;
    }

    .controls {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      width: var(--dotpi-controls-width);
      background-color: rgb(18, 18, 18);
      border-left: 1px solid #454545;
    }

    .controls sc-toggle, .controls sc-status, .controls sc-bang {
      height: 25px;
      width: 25px;
    }

    .controls sc-status.syncing, .controls sc-status.executing {
      --sc-status-color-inactive: var(--sc-color-primary-2);
      --sc-status-color-active: var(--sc-color-primary-5);
    }
  `;

  set state(state) {
    if (state) {
      state.onUpdate(updates => this.requestUpdate());
    }

    const oldValue = this._state;
    this._state = state;

    this.requestUpdate('state', oldValue);
  }

  get state() {
    return this._state;
  }

  constructor() {
    super();

    this._state = null;
  }
  
  render() {
    const { hostname, address } = this.infos;
    const showLogs = this.app.logSelected.has(hostname);
    const connected = this._state ? true : false;
    const hasInternet = this._state ? this._state.get('hasInternet') : false;
    const testAudio = this._state ? this._state.get('testAudio') : false;

    const syncing = this.app.controlPanel.get('syncingList').indexOf(hostname) !== -1;
    const executingCommand = this.app.controlPanel.get('executingCommandList').indexOf(hostname) !== -1;
    const filtered = this.app.controlPanel.get('filteredList').indexOf(hostname) !== -1;

    return html`
      <div class="infos">
        ${connected ? nothing : html`
          <sc-icon
            type="close"
            @input=${e => {
              const event = new CustomEvent('clear', {
                bubbles: true,
                composed: true,
                detail: {
                  value: hostname,
                },
              });

              this.dispatchEvent(event);
            }}
          ></sc-icon>`
        }
        <sc-text>${hostname}</sc-text>
        <sc-text>[ ${address} ]</sc-text>
      </div>

      <div class="controls">
        <sc-status ?disabled=${!connected} ?active=${connected}></sc-status>
        <sc-status ?disabled=${!connected} ?active=${hasInternet}></sc-status>
        <sc-status class="syncing" ?disabled=${!connected} ?active=${syncing}></sc-status>
        <sc-status class="executing" ?disabled=${!connected} ?active=${executingCommand}></sc-status>
        <sc-toggle
          ?disabled=${!connected}
          ?active=${!filtered}
          @change=${e => {
            const command = e.detail.value ? 'filteredListDelete' : 'filteredListAdd';
            this.app.controlPanel.set({ [command]: hostname })
          }}
        ></sc-toggle>
        <sc-toggle
          ?active=${showLogs}
          @change=${e => {
            e.detail.value
              ? this.app.logSelected.add(hostname)
              : this.app.logSelected.delete(hostname);

            this.app.render();
          }}
        ></sc-toggle>
        <sc-bang
          ?disabled=${!connected}
          ?active=${live(testAudio)}
          @input=${e => this._state.set({ testAudio: true })}
        ></sc-bang>
      </div>
    `
  }
}


customElements.define('dotpi-client', DotPiClient);
