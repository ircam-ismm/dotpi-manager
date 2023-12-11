import { LitElement, html, css, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import './dotpi-client.js';
import '@ircam/sc-components/sc-icon.js';

class DotPiClientList extends LitElement {
  static properties = {
    app: {
      state: true,
      hasChanged: () => true,
    },
    _hostnameFilter: {
      state: true,
    },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: 12px;

      --dotpi-icons-width: 240px;
      --dotpi-client-list-header-height: 26px;
    }

    header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      height: var(--dotpi-client-list-header-height);
    }

    header h3 {
      margin: 0;
      height: var(--dotpi-client-list-header-height);
      line-height: var(--dotpi-client-list-header-height);
    }

    .list-header {
      width: 100%;
      height: 30px;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 3px;
      min-width: 700px;
      overflow: auto;
    }

    .list-header sc-icon {
      height: 25px;
      width: 25px;
      border: none;
      background-color: transparent;
    }

    .list-header .col-right {
      display: flex;
      width: 100%;
      justify-content: flex-start;
      width: calc(100% - var(--dotpi-icons-width));
    }

    .list-header .col-right .filter {
      width: 70px;
      background-color: transparent;
    }

    .list-header .col-right sc-text {
      height: 24px;
      line-height: 22px;
      padding: 0px 4px;
    }

    .list-header .icons {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      width: var(--dotpi-icons-width);
    }

    .list {
      width: 100%;
      height: calc(100% - 30px);
      background-color: var(--sc-color-primary-1);
      overflow: auto;
    }

    .list dotpi-client {
      border-bottom: 1px solid #000000;
      min-width: 700px;
      overflow: auto;
    }
  `;

  constructor() {
    super();

    this._hostnameFilter = '';
    this._allLogSelected = true;
    this._allExecSelected = true;
  }

  render() {
    const re = new RegExp(this._hostnameFilter);
    const dotpiList = this.app.global.get('dotpiSeen')
      .sort() // sort by alphabetic order
      .sort(infos => { // move disconnected clients on top
        const found = this.app.dotpiCollection.find(rpi => rpi.get('hostname') === infos.hostname);
        return found ? 0 : -1;
      })
      .filter(infos => re.test(infos.hostname)); // apply filter

    return html`
      <header>
        <h3>clients</h3>
      </header>
      <div class="list-header">
        <div class="col-right">
          <sc-text class="filter">filter:</sc-text>
          <sc-text
            editable
            @change=${e => this._hostnameFilter = e.detail.value}
          ></sc-text>
        </div>
        <div class="icons">
          <sc-icon disabled type="network" title="connected"></sc-icon>
          <sc-icon disabled type="internet" title="internet"></sc-icon>
          <sc-icon disabled type="sync" title="syncing directory"></sc-icon>
          <sc-icon disabled type="gear" title="executing process"></sc-icon>
          <sc-icon
            type="prompt"
            title="filter actions"
            @click=${e => {
              this._allExecSelected = !this._allExecSelected;
              // manipulate the dotpiCollection directly (not perfect but it works)
              this.app.dotpiCollection.set({ cmdProcess: this._allExecSelected });
              this.requestUpdate();
            }}
          ></sc-icon>
          <sc-icon
            type="burger"
            title="filter logs"
            @click=${e => {
              this._allLogSelected = !this._allLogSelected;

              if (this._allLogSelected) {
                const dotpiSeen = this.app.global.get('dotpiSeen');
                dotpiSeen.forEach(infos => this.app.logSelected.add(infos.hostname));
              } else {
                this.app.logSelected.clear();
              }

              this.app.render();
            }}
          ></sc-icon>
          <sc-icon
            type="speaker"
            title="execute"
            @click=${e => {
              // manipulate the dotpiCollection directly (not perfect but it works)
              this.app.dotpiCollection.set({ testAudio: true });
              this.requestUpdate();
            }}
          ></sc-icon>
        </div>
      </div>
      <div class="list">
        ${repeat(dotpiList, infos => infos.hostname, infos => {
          const dotpi = this.app.dotpiCollection.find(dotpi => dotpi.get('hostname') === infos.hostname);

          return html`
            <dotpi-client
              .state=${dotpi}
              .infos=${infos}
              .app=${this.app}
              @clear=${e => this.app.global.set({ dotpiSeenDeleteRequest: e.detail.value })}
            ></dotpi-client>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('dotpi-client-list', DotPiClientList);
