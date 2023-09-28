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
    app: {
      state: true,
      hasChanged: () => true,
    },
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: 1px;
      height: 30px;
      background-color: var(--sw-light-background-color);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .infos {
      display: flex;
      align-items: center;
      margin-right: 20px;
      white-space: nowrap; 
      overflow: hidden;
      padding-left: 20px;
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
      width: 240px;
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
    const hasInternet = this._state ? this._state.get('hasInternet') : false;
    const connected = this._state ? true : false;
    const showLogs = this.app.logSelected.has(this._hostname);

    return html`
      <div class="infos">
        ${connected ? nothing :
          html`<sc-icon type="close" @input=${this._clearItem}></sc-icon>`
        }
        <sc-text>${this._hostname}</sc-text>
        <sc-text>${this._address}:${this._port}</sc-text>
      </div>

      <div class="controls">
        <sc-status ?active=${connected}></sc-status>
        <sc-status ?active=${hasInternet}></sc-status>
        <sc-toggle
          ?active=${showLogs}
          @change=${e => {
            e.detail.value
              ? this.app.logSelected.add(this._hostname)
              : this.app.logSelected.delete(this._hostname);

            this.app.render();
          }}
        ></sc-toggle>
        <sc-toggle ?disabled=${!connected}></sc-toggle>
      </div>
    `
  }

  connectedCallback() {
    super.connectedCallback();

    this._hostname = this._state.get('hostname');
    this._address = this._state.get('address');
    this._port = this._state.get('port');
  }

  _clearItem(e) {
    e.stopPropagation();

    const event = new CustomEvent('clear', {
      bubbles: true,
      composed: true,
      detail: {
        value: this._hostname,
      },
    });

    this.dispatchEvent(event);
  }
}


customElements.define('dotpi-client', DotPiClient);
