import { LitElement, html, css, nothing } from 'lit';

import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-bang.js';

class DotPiCommands extends LitElement {
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

    h3 {
      padding-bottom: 5px;
      border-bottom: 1px solid var(--sc-color-primary-3);
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

    .align-right {
      text-align: right;
/*      width: 79px;*/
    }
  `;

  constructor() {
    super();
  }

  render() {
    const lockFork = this.app.global.get('forkToggle');
    const lockSync = this.app.global.get('syncWatch');

    return html`
      <div class="exec">
        <h3>Execute command</h3>
        <div>
          <sc-text readonly>Working directory</sc-text>
          <sc-text
            editable
            @change=${e => this.app.global.set({ execPwd: e.detail.value })}
          >${this.app.global.get('execPwd')}</sc-text>
        </div>
        <div>
          <sc-text readonly>Command</sc-text>
          <sc-text
            editable
            @change=${e => this.app.global.set({ execCmd: e.detail.value })}
          >${this.app.global.get('execCmd')}</sc-text>
        </div>
        <sc-text class="align-right">Execute</sc-text>
        <sc-bang
          @input=${e => this.app.global.set({ execTrigger: true })}
        ></sc-bang>
        <sc-text class="align-right">Kill</sc-text>
        <sc-bang
          @input=${e => this.app.global.set({ execKill: true })}
        ></sc-bang>
      </div>
      <div class="exec">
        <h3>Fork process</h3>
        <div>
          <sc-text readonly>Working directory</sc-text>
          <sc-text
            editable
            ?disabled=${lockFork}
            @change=${e => this.app.global.set({ forkCwd: e.detail.value })}
          >${this.app.global.get('forkPwd')}</sc-text>
        </div>
        <div>
          <sc-text readonly>Command</sc-text>
          <sc-text
            editable
            ?disabled=${lockFork}
            @change=${e => this.app.global.set({ forkCmd: e.detail.value })}
          >${this.app.global.get('forkCmd')}</sc-text>
        </div>
        <sc-text class="align-right">Fork</sc-text>
        <sc-toggle
          @change=${e => this.app.global.set({ forkToggle: e.detail.value })}
        ></sc-toggle>
      </div>
      <div class="sync">
        <h3>Sync directory</h3>
        <div>
          <sc-text readonly>Local directory</sc-text>
          <sc-text
            editable
            ?disabled=${lockSync}
            @change=${e => this.app.global.set({ syncLocalPathname: e.detail.value })}
          >${this.app.global.get('syncLocalPathname')}</sc-text>
        </div>
        <div>
          <sc-text readonly>Remote directory</sc-text>
          <sc-text
            editable
            ?disabled=${lockSync}
            @change=${e => this.app.global.set({ syncRemotePathname: e.detail.value })}
          >${this.app.global.get('syncRemotePathname')}</sc-text>
        </div>
        <sc-text class="align-right">Sync</sc-text>
        <sc-bang
          @input=${e => this.app.global.set({ syncTrigger: true })}
        ></sc-bang>
        <sc-text class="align-right">Watch</sc-text>
        <sc-toggle
          @change=${e => this.app.global.set({ syncWatch: e.detail.value })}
        ></sc-toggle>
      </div>
    `;
  }
}

customElements.define('dotpi-commands', DotPiCommands);
