
// state object
var nr = {
    task: {
        results: '',
        progress: '',
        updates: '',
        submit: true,
        socket: 0
    },
    inventory: {
        hosts: '', 
        groups: '', 
        defaults: ''
    }
}

// updates, progress, and results should all load even if you are not in the task view as they come in via sockets.

document.addEventListener("DOMContentLoaded", () => {

    var socket = io();

    socket.on('connect', function() {
        console.log('client connected');
        nr.task.socket = socket.id;

    });

    socket.on('update', function(msg) {
        if (location.pathname === "/task") {
            document.getElementById("updates").innerHTML += `<li>${ msg }</li>`;
        }
        nr.task.updates += `<li>${ msg }</li>`;

    });

    socket.on('progress', function(msg) {
        if (location.pathname === "/task") {
            document.getElementById('progress').innerHTML = msg;
        }
        nr.task.progress = msg

    });

});

function fixEditors() { 
    document.querySelectorAll("div[data-editor]").forEach(d => {
        var mode = d.dataset.editor;
        editor = ace.edit(d);
        editor.renderer.setShowGutter(false);
        editor.getSession().setMode("ace/mode/" + mode);
        editor.setTheme("ace/theme/twilight");
        editor.getSession().setTabSize(2);
        d.style.visibility = "visible";
    });
}


function loadInv() {
    fetch('/nornir/inventory')
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }

                response.json().then(function(data) {
                    ace.edit('hosts').getSession().setValue(data.hosts);
                    ace.edit('groups').getSession().setValue(data.groups);
                    ace.edit('defaults').getSession().setValue(data.defaults);
                    nr.inventory.hosts = data.hosts;
                    nr.inventory.groups = data.groups;
                    nr.inventory.defaults = data.defaults;
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
}


function submitRun() {
    document.getElementById('results').innerHTML = "<h2>running...</h2>";
    document.getElementById('submit').disabled = true;
    document.getElementById('progress').innerHTML = '';
    document.getElementById('updates').innerHTML = '';
    nr.task.results = "<h2>running...</h2>";
    nr.task.submit = false;
    nr.task.progress = '';
    nr.task.updates = '';

    var options = {
        method: 'POST',
        headers: new Headers({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify( { inventory: nr.inventory,
                            socket: nr.task.socket } )
    }

    fetch('/nornir/task', options)
        .then(
            function(response) {
                if (response.status !== 200) {
                    document.getElementById('results').innerHTML = "Unexpected error.  Try refreshing the page?";
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }

                response.json().then(function(data) {
                    if (location.pathname === "/task") {
                        document.getElementById('results').innerHTML = data.results;
                        document.getElementById('submit').disabled = false;
                    }
                    nr.task.results = data.results;
                    nr.task.submit = true;
                });
            }
        )
        .catch(function(err) {
            document.getElementById('results').innerHTML = "Unexpected error.  Try refreshing the page?";
            console.log('Fetch Error :-S', err);
        });



}
