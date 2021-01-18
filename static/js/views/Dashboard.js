import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Dashboard");
    }

    async getHtml() {
        return `
            <h1>Welcome!</h1>
            <p>
                A single page application.  I have no idea what I am doing.
            </p>
            <p>
                <a href="/inventory" data-link>1. Build an inventory</a>
            </p>
            <p>
            <a href="/task" data-link>2. Run a task</a>
        </p>
        `;
    }
}