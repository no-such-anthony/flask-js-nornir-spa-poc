# flask-js-nornir-spa
A proof of concept flask single page app with nornir

Only standard javascript used for single page app router/views.  

Being a javascript newbie I used dcode's SPA example at https://github.com/dcode-youtube/single-page-app-vanilla-js

Just a POC so no security controls at this stage.

Requirements

- pip install flask
- pip install nornir
- pip install nornir-netmiko
- pip install pyaml
- pip install Flask-SocketIO
- pip install eventlet

Run

- gunicorn --worker-class eventlet -w 1 flask_nr:app

Requires "pip install gunicorn".  For some reason when starting with "python flask_nr.py" the socketio messages stop working when socket tries to switch to websockets.

ydata.py contains default inventory data in yaml format with a couple of Cisco always-on instances.


