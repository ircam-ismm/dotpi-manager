import { LitElement, html, css, nothing } from 'lit';

import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-bang.js';

class DotPiControls extends LitElement {
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

    .exec, .fork, .sync {
      margin-bottom: 4px;
    }

    .exec > div, .fork > div, .sync > div {
      margin-bottom: 2px;
    }

    sc-text[editable] {
      width: 450px;
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="exec">
        <h3>Execute command</h3>
        <div>
          <sc-text readonly>Working directory</sc-text>
          <sc-text
            editable
            @change=${e => this.app.global.set({ execCwd: e.detail.value })}
          >${this.app.global.get('execCwd')}</sc-text>
        </div>
        <div>
          <sc-text readonly>Command</sc-text>
          <sc-text
            editable
            @change=${e => this.app.global.set({ execCmd: e.detail.value })}
          >${this.app.global.get('execCmd')}</sc-text>
        </div>
        <sc-text>Execute</sc-text>
        <sc-bang
          @input=${e => this.app.global.set({ execTrigger: true })}
        ></sc-bang>
        <sc-text>Kill</sc-text>
        <sc-bang
          @input=${e => this.app.global.set({ execKill: true })}
        ></sc-bang>
      </div>
      <div class="exec">
        <h3>Fork process</h3>
        <div>
          <sc-text readonly>Working directory</sc-text>
          <sc-text editable></sc-text>
        </div>
        <div>
          <sc-text readonly>Command</sc-text>
          <sc-text editable></sc-text>
        </div>
        <sc-text>Fork</sc-text>
        <sc-toggle></sc-toggle>
      </div>
      <div class="sync">
        <h3>Sync directory</h3>
        <div>
          <sc-text readonly>Local directory</sc-text>
          <sc-text editable></sc-text>
        </div>
        <div>
          <sc-text readonly>Remote directory</sc-text>
          <sc-text editable></sc-text>
        </div>
        <sc-text>Sync</sc-text>
        <sc-bang></sc-bang>
        <sc-text>Watch</sc-text>
        <sc-toggle></sc-toggle>
      </div>
    `;
  }
}

customElements.define('dotpi-controls', DotPiControls);
