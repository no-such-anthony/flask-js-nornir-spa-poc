from flask import Flask, request, session, jsonify, send_from_directory
from nornir_control import nornir_run
import yaml
import traceback
import ydata
from os import urandom
from uuid import uuid4
from flask_socketio import SocketIO
from flask_socketio import emit


app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = urandom(32)


socketio = SocketIO(app, cors_allowed_origins='*')
#socketio = SocketIO(app, cors_allowed_origins='*',logger=True, engineio_logger=True)


# Import and register custom inventory
from nornir.core.plugins.inventory import InventoryPluginRegister
from nornir_plugins.inventory import DictInventory
InventoryPluginRegister.register("dictInventory", DictInventory)


# Custom runner with queue for client update polling
from nornir.core.plugins.runners import RunnersPluginRegister
from nornir_plugins.runner import UpdateRunner
RunnersPluginRegister.register("a_runner", UpdateRunner)


# We don't want to use Flask session to store app data in the client cookie.
# We could use Flask-Session with maybe SQLAlchemy/sqlite to store data 
# on the server, but lets start with something simple that is non-persistent between
# reloads of the app.
# Flask session will be used to just store the session_id
class SessionTable(object):
    def __init__(self):
        self.sessions = {}

    def add_session(self,fns):
        session_id = uuid4().hex
        self.sessions[session_id] = fns
        return session_id


class FlaskNornirSession(object):
    def __init__(self):
        self.data = {}


st = SessionTable()

# single page application routes

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static/favicon',
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')


#api routes

@app.route('/nornir/inventory')
def inv():
    norn = {}
    norn['hosts'] = ydata.yhosts
    norn['groups'] = ydata.ygroups
    norn['defaults'] = ydata.ydefaults
    return jsonify(norn)


@app.route('/nornir/task', methods=['POST'])
def task():

    if "id" not in session:
        session['id'] = st.add_session(FlaskNornirSession())
        s = st.sessions[session['id']]

    else:
        s = st.sessions[session['id']]

    work = request.get_json()
    inventory = work['inventory']
    hosts = yaml.safe_load(inventory['hosts'])
    groups = yaml.safe_load(inventory['groups'])
    defaults = yaml.safe_load(inventory['defaults'])
    s.data['socket_id'] = work['socket']

    hosts = {} if hosts is None else hosts
    groups = {} if groups is None else groups
    defaults = {} if defaults is None else defaults

    norn = nornir_run(hosts, groups, defaults, emitter)

    return jsonify({ 'results': norn })


@app.route('/nornir/<path:path>')
def nornir_404(path,methods=['GET','POST']):
    return jsonify({'error': 'Not found'}), 404


# socket

def emitter(msg, msg_type):
    if "id" in session:
        s = st.sessions[session['id']]
        socket_id = s.data.get('socket_id', None)
        if socket_id is not None:     
            if msg_type == 'update':
                emit('update',msg,namespace='/',to=socket_id)

            elif msg_type == 'progress':
                emit('progress',msg,namespace='/',to=socket_id)


if __name__ == '__main__':
    app.run()