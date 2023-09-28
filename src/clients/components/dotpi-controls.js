import { LitElement, html, css, nothing } from 'lit';

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
/*      background-color: green;*/
      padding: 12px;
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`
      <h3>control</h3>
    `;
  }
}

customElements.define('dotpi-controls', DotPiControls);
