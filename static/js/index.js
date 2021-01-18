import Dashboard from "./views/Dashboard.js";
import Task from "./views/Task.js";
import Inventory from "./views/Inventory.js";


const navigateTo = url => {
    history.pushState(null, null, url)
    router()
}

const router = async () => {
    const routes = [
        { path: "/", view: Dashboard},
        { path: "/task", view: Task},
        { path: "/inventory", view: Inventory}
    ];

    let match = routes.find(route => route.path === location.pathname)

    if (!match) {
        match = routes[0]
    }

    let view = new match.view()
    let pathname = location.pathname;

    document.querySelector("#app").innerHTML = await view.getHtml();
    if (pathname === "/inventory") {
        fixEditors()
    }

    //change highlighted nav link, a better way?
    document.querySelectorAll('.nav-link').forEach( (el) => {
        el.classList.remove('active')
        if (pathname === "/" && el.innerHTML === 'Dashboard') {
            el.classList.add('active')
        }
        if (pathname === "/task" && el.innerHTML === 'Task') {
            el.classList.add('active')
        }
        if (pathname === "/inventory" && el.innerHTML === 'Inventory') {
            el.classList.add('active')
        }
    });
    
}

window.addEventListener("popstate", router);

//delegated event listeners
document.addEventListener("DOMContentLoaded", () => {

    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    document.body.addEventListener("keyup", e => {
        if (e.target.matches("textarea.ace_text-input")) {
            nr.inventory.hosts = ace.edit('hosts').getSession().getValue();
            nr.inventory.groups = ace.edit('groups').getSession().getValue();
            nr.inventory.defaults = ace.edit('defaults').getSession().getValue();
        }
    });

    /* Document has loaded -  run the router! */
    router();
});


