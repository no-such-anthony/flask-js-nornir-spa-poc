import AbstractView from "./AbstractView.js";


export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Inventory");
    }

    async getHtml() {
        return `
            <h1>Inventory</h1>
            <button onclick="loadInv()">Load Default Inventory</button>
            <div class="container">
            <div class="row">
              <div class="col-sm">
                hosts
                <div id="hosts" class="editor" data-editor="yaml">${ nr.inventory.hosts }</div>
              </div>
              <div class="col-sm">
                groups
                <div id="groups" class="editor" data-editor="yaml">${ nr.inventory.groups }</div>
              </div>
              <div class="col-sm">
                defaults
                <div id="defaults" class="editor" data-editor="yaml">${ nr.inventory.defaults }</div>
              </div>
            </div>
          </div>
        `;
    }

}


