import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Task");
    }

    async getHtml() {
        let btn = (nr.task.submit) ? '' : 'disabled';
        return `
            <h1>Task</h1>
            <p>
            <button id="submit" onclick="submitRun()" ${ btn }>submit</button>
            <p>Results</p>
            <div id="progress">${ nr.task.progress }</div>
            <ul id="updates">${ nr.task.updates }</ul>
            <div id="results">${ nr.task.results }</div>
          </div>
        `;
    }
}