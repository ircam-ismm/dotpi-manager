import { LitElement, html, css, nothing } from 'lit';
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

      --dotpi-controls-width: 200px;
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

    .controls sc-toggle, .controls sc-status {
      height: 25px;
      width: 25px;
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
    const connected = this._state ? true : false;
    const hasInternet = this._state ? this._state.get('hasInternet') : false;
    const syncing = this._state ? this._state.get('syncing') : false;
    const showLogs = this.app.logSelected.has(hostname);
    const cmdProcess = this._state ? this._state.get('cmdProcess') : false;;

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
        <sc-status ?disabled=${!connected} ?active=${syncing}></sc-status>
        <sc-toggle
          ?active=${showLogs}
          @change=${e => {
            e.detail.value
              ? this.app.logSelected.add(hostname)
              : this.app.logSelected.delete(hostname);

            this.app.render();
          }}
        ></sc-toggle>
        <sc-toggle
          ?disabled=${!connected}
          ?active=${cmdProcess}
          @change=${e => this.state.set({ cmdProcess: e.detail.value })}
        ></sc-toggle>
      </div>
    `
  }
}


customElements.define('dotpi-client', DotPiClient);
