import { LitElement, html, css, nothing } from 'lit';
import '@ircam/simple-components/sc-toggle.js';

class DotpiControls extends LitElement {
  static properties = {
    connected: {
      type: Boolean,
    }
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: 1px;
      height: 40px;
      background-color: var(--sw-light-background-color);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .hostname {
      margin-right: 20px;
      white-space: nowrap; 
      overflow: hidden;
      padding-left: 20px;
      height: 40px;
      line-height: 40px;
    }

    .hostname .sep {
      display: inline-block;
      width: 12px;
    }

    .controls {
      display: flex;
      width: 240px;
      background-color: rgb(18, 18, 18);
      border-left: 1px solid #454545;
    }

    .fixed-width-element {
      width: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .dot {
      width: 15px;
      height: 15px;
      border-radius: 15px;
      outline: 1px solid #454545;
    }
  `;

  constructor() {
    super();

    this.state = null;
    this.connected = false;
  }
  
  render() {
    if (this.state === null) {
      return nothing;
    }

    const hostname = this.state.get('hostname');
    const address = this.state.get('laddress');
    const port = this.state.get('lport');
    const hasInternet = this.state.get('hasInternet');

    return html`
      <div class="hostname">
        <b>${hostname}</b>
        <span class="sep"></span>-<span class="sep"></span>

        ${address}:${port}
      </div>

      <div class="controls">
        <div class="fixed-width-element">
          <div
            class="dot"
            style="background: ${this.connected ? 'green' : 'red'}"
          ></div>
        </div>

        <div class="fixed-width-element">
          <div
            class="dot"
            style="background: ${hasInternet ? 'green' : 'red'}"
          ></div>
        </div>

        <div class="fixed-width-element">
          <sc-toggle
            width="20"
          ></sc-toggle>
        </div>

        <div class="fixed-width-element">
          <sc-toggle
            width="20"
          ></sc-toggle>
        </div>
      </div>
    `
  }
}


customElements.define('dotpi-controls', DotpiControls);
