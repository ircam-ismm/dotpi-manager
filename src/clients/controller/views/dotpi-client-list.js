import { LitElement, html, css, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import './dotpi-client.js';
import '@ircam/sc-components/sc-icon.js';
import '@ircam/sc-components/sc-radio.js';
import '@ircam/sc-components/sc-text.js';

class DotPiClientList extends LitElement {
  static properties = {
    app: {
      state: true,
      hasChanged: () => true,
    },
    _hostnameFilterRegExp: {
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
      background-color: var(--sc-color-primary-1);

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
      font-size: 12px;
    }

    header sc-text {
      width: 120px;
    }

    .list-header {
      width: 100%;
      height: 30px;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 3px;
      padding-right: 10px;
      box-sizing: border-box;
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
      padding-right: 10px;
      box-sizing: border-box;
    }

    .list dotpi-client {
      border-bottom: 1px solid #000000;
      min-width: 700px;
      overflow: auto;
    }

    .list dotpi-client:nth-child(even) {
/*      background-color: var(--sw-light-background-color);*/
      background-color: var(--sc-color-primary-2);
    }

    .list dotpi-client:nth-child(odd) {
      background-color: var(--sc-color-primary-3);
    }

    sc-icon.active {
      --sc-icon-color: var(--sc-color-secondary-2);
      opacity: 1;
    }
  `;

  constructor() {
    super();

    this._hostnameFilterRegExp = '';
    this._logAllClients = true;
    this._filterAllClients = false;
  }

  render() {
    const re = new RegExp(this._hostnameFilterRegExp);
    const dotpiList = this.app.global.get('dotpiSeen')
      .sort((a, b) => a.hostname < b.hostname ? -1 : 1) // sort by alphabetical order
      .sort(infos => { // move disconnected clients on top
        const found = this.app.dotpiCollection.find(rpi => rpi.get('hostname') === infos.hostname);
        return found ? 0 : -1;
      })
      .filter(infos => re.test(infos.hostname)); // apply filter

    const syncing = this.app.controlPanel
      ? this.app.controlPanel.get('syncingList').length > 0
      : false;
    const executingCommand = this.app.controlPanel
      ? this.app.controlPanel.get('executingCommandList').length > 0
      : false;

    return html`
      <header>
        <h3>dotpi clients</h3>
        <div>
          <sc-text
            editable
            @change=${e => this._hostnameFilterRegExp = e.detail.value}
          ></sc-text>
          <sc-radio
            options=${JSON.stringify(['noise', 'sweep'])}
            orientation="horizontal"
            value=${this.app.global.get('testAudioSource')}
            @change=${e => this.app.global.set({ testAudioSource: e.detail.value })}
          ></sc-radio>
        </div>
      </header>
      <div class="list-header">
        <div class="col-right"></div>
        <div class="icons">
          <sc-icon disabled type="network" title="connected"></sc-icon>
          <sc-icon disabled type="internet" title="internet"></sc-icon>
          <sc-icon disabled type="sync" title="syncing directory" class="${syncing ? 'active' : ''}"></sc-icon>
          <sc-icon disabled type="gear" title="executing process" class="${executingCommand ? 'active' : ''}"></sc-icon>
          <sc-icon
            type="prompt"
            title="filter actions"
            @click=${async e => {
              this._filterAllClients = !this._filterAllClients;
              const hostnames = this.app.dotpiCollection.get('hostname');
              const command = this._filterAllClients ? 'filteredListAdd' : 'filteredListDelete';

              if (this.app.controlPanel) {
                this.app.controlPanel.set({ [command]: hostnames });
              }
            }}
          ></sc-icon>
          <sc-icon
            type="burger"
            title="filter logs"
            @click=${e => {
              this._logAllClients = !this._logAllClients;

              if (this._logAllClients) {
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
            @click=${e => this.app.dotpiCollection.set({ testAudio: true })}
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
