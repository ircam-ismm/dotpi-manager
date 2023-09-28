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
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
/*      background-color: red;*/
      border-top: 1px solid var(--sc-color-primary-3);
      padding: 12px;
    }

    header {
      width: 100%;
      height: 30px;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1px;
    }

    header .icons {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      width: 240px;
/*      background-color: rgb(18, 18, 18);*/
      height: 100%
    }

    sc-icon {
      height: 25px;
      width: 25px;
      border: none;
      background-color: transparent;
    }

    .list {
      width: 100%;
      overflow-y: auto;
    }
  `;

  constructor() {
    super();
  }

  render() {
  return html`
      <h3>clients</h3>
      <header>
        <div class="icons">
          <sc-icon disabled type="network"></sc-icon>
          <sc-icon disabled type="internet"></sc-icon>
          <sc-icon type="burger"

          ></sc-icon>
          <sc-icon disabled type="prompt"

          ></sc-icon>
        </div>
        <div class="select">
          <!-- @todo - select / unselect all -->
        </div>
      </header>
      <div class="list">
        <!-- @todo - put disconnected client on top, they must be seen by default -->
        ${repeat(this.app.rpiSeen, pi => pi, (hostname, index) => {
          const rpi = this.app.rpiCollection.find(rpi => rpi.get('hostname') === hostname);

          return html`
            <dotpi-client
              .state=${rpi}
              .app=${this.app}
              @clear=${e => {
                this.app.rpiSeen.delete(e.detail.value);
                this.requestUpdate();
              }}
            ></dotpi-client>
          `
        })}
      </div>
    `;
  }
}

customElements.define('dotpi-client-list', DotPiClientList);
