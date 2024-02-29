import { LitElement, html, css, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import '@ircam/sc-components/sc-code-example.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-button.js';
import '@ircam/sc-components/sc-icon.js';
import '@ircam/sc-components/sc-status.js';

class LogStack {
  constructor(component) {
    this._size = 200;
    this._inner = [];
    this._numErr = 0;
    this._component = component;
  }

  get values() {
    return this._inner;
  }

  get numErr() {
    return this._numErr;
  }

  insert(log) {
    // more recent log at the beginning of the stack
    this._inner.unshift(log);
    if (log.type === 'stderr') {
      this._numErr += 1;
    }

    if (this._inner.length >= this._size) {
      const removed = this._inner.pop();
      // make sure this is what we want...
      if (removed.type === 'stderr') {
        this._numErr -= 1;
      }
    }

    this._component.requestUpdate();
  }

  clear() {
    this._inner.length = 0;
    this._numErr = 0;

    this._component.requestUpdate();
  }

  deleteLogsFrom(hostname) {
    this._inner.filter(log => log.hostname !== hostname);
    this._component.requestUpdate();
  }

  map(func) {
    return this._inner.map(func);
  }
}

class DotPiLog extends LitElement {
  static properties = {
    app: {
      state: true,
      hasChanged: () => true,
    },
    _showOnly: {
      state: true,
    },
    _hasNewErrors: {
      state: true,
    },
    _logFilterRegExp: {
      state: true,
    }
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: calc(100% - var(--sw-header-height));
      /* @fixme: issue with icons from client list, they appear on top of logs */
    }

    header {
      background-color: #000000;
      padding: 2px;
      display: flex;
      justify-content: space-between;
      box-sizing: border-box;
      height: 34px;
    }

    header h3 {
      padding-left: 12px;
    }

    header > div {
      display: flex;
    }

    header sc-button {
      --sc-button-background-color-selected: var(--sc-color-secondary-1);
      width: 120px;
    }

    header sc-text {
      width: 120px;
    }

    .logs {
      background-color: var(--sc-color-primary-3);
      overflow-y: auto;
      height: calc(100% - 34px);
      display: flex;
      flex-direction: column-reverse;
    }

    .log {
      width: 100%;
      border-top: 1px solid var(--sc-color-primary-4);
      background-color: var(--sw-background-color);
      display: flex;
      flex-direction: column;
    }

    .log header {
      display: flex;
      padding: 0;
    }

    .log header {
      height: 26px;
      cursor: pointer;
    }

    .log header sc-text {
      height: 100%;
      font-size: 10px;
      padding: 3px 6px;
    }

    .log header sc-text:first-child {
      width: 60%;
      user-select: none;
    }

    .log header sc-text:last-child {
      width: 40%;
      padding-right: 12px;
    }

    .log.stderr sc-text {
      background-color: var(--sc-color-secondary-3);
    }

    .log sc-code-example {
      width: 100%;
/*      background-color: var(--sw-light-background-color);*/
    }

    .log pre {
      margin: 0;
    }
  `;

  constructor() {
    super();

    this._showOnly = null;
    this._hasNewErrors = false;
    this._logFilterRegExp = '';

    this.stack = new LogStack(this);
  }

  render() {
    let filtered = this.stack.values
      .filter(log => {
        if (this._showOnly !== null) {
          return log.type === this._showOnly;
        }

        return true;
      })
      .filter(log => !log.hostname || this.app.logSelected.has(log.hostname));

    if (this._logFilterRegExp !== '') {
      const re = new RegExp(this._logFilterRegExp);
      filtered = filtered.filter(log => {
        return re.test(JSON.stringify(log));
      });
    }

    return html`
      <header>
        <H3>Logs</H3>
        <div>
          <sc-text
            editable
            @change=${e => this._logFilterRegExp = e.detail.value.trim()}
          ></sc-text>
          <sc-button
            title="filter errors"
            .selected=${this._showOnly === 'stderr'}
            @input=${e => this._toggleShowOnly('stderr')}
          >stderr (${this.stack.numErr})</sc-button>
          <sc-icon
            type="close"
            title="clear all logs"
            @input=${e => this.stack.clear()}
          >clear</sc-icon>
        </div>
      </header>
      <section class="logs">
        ${repeat(filtered, log => log, log => {
          return html`
            <div class="log ${log.type}">
              <header
                @dblclick=${() => this._selectLogsFromHostname(log.hostname)}
              >
                <sc-text>[${log.date.toLocaleString()}][${log.source}] ${log.hostname}</sc-text>
                ${log.cmd && log.pwd
                  ? html`<sc-text style="text-align: right;">cmd: ${log.cmd} | pwd: ${log.pwd}</sc-text>`
                  : html`<sc-text style="text-align: right;"></sc-text>`
                }
              </header>
              <sc-code-example language="text">${log.msg}</sc-code-example>
            </div>
          `
        })}
      </section>
    `;
  }

  firstUpdated() {
    super.firstUpdated();

    this.app.dotpiCollection.onAttach(dotpi => {
      const serverManagerVersion = this.app.global.get('managerVersion');
      const serverSoundworksVersion = this.app.global.get('soundworksVersion');
      const dotpiManagerVersion = dotpi.get('managerVersion');
      const dotpiSoundworksVersion = dotpi.get('soundworksVersion');

      if (serverManagerVersion !== dotpiManagerVersion
        || serverSoundworksVersion !== dotpiSoundworksVersion
      ) {
        const log = {
          msg: `Version discrepancies between manager server and client runtime:

+ manager    - server: ${serverManagerVersion} | client: ${dotpiManagerVersion}
+ soundworks - server: ${serverSoundworksVersion} | client: ${dotpiSoundworksVersion}
          `,
          source: 'global',
          date: new Date(),
          hostname: dotpi.get('hostname'),
          type: 'stderr',
        };

        this.stack.insert(log);
      }
    }, true);

    this.app.dotpiCollection.onUpdate((dotpi, updates) => {
      const hostname = dotpi.get('hostname');

      ['stdout', 'stderr'].forEach(type => {
        if (type in updates) {
          const log = updates[type]; // { cmd, pwd, msg }
          log.date = new Date();
          log.hostname = hostname;
          log.type = type;

          this.stack.insert(log);
        }
      });

      if ('stderr' in updates) {
        this._hasNewErrors = true;
      }
    });

    this.app.global.onUpdate(updates => {
      if ('stderr' in updates) {
        const log = updates['stderr'];
        log.date = new Date();
        log.type = 'stderr';

        this.stack.insert(log);
        this._hasNewErrors = true;
      }
    });
  }

  _toggleShowOnly(msgType) {
    if (this._showOnly === msgType) {
      this._showOnly = null;
    } else {
      this._showOnly = msgType;
    }
  }

  _selectLogsFromHostname(hostname) {
    this.app.logSelected.clear();
    this.app.logSelected.add(hostname);
    // rpi list needs to be renderer as well
    this.app.render();
  }
}

customElements.define('dotpi-log', DotPiLog);
