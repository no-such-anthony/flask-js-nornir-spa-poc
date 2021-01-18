from nornir import InitNornir
from nornir_netmiko import netmiko_send_command
import traceback
from collections import OrderedDict
from pprint import pformat
import json


def nornir_run(hosts, groups, defaults, updater):
    try:
        with InitNornir(runner = { 'plugin': "a_runner",
                                    'options': {
                                        "num_workers": 10,
                                        "updater": updater
                                    },
                        },
                        inventory={ "plugin": "dictInventory",
                                    "options": {
                                        "hosts" : hosts,
                                        "groups": groups,
                                        "defaults": defaults
                        }}) as nr:
            results = nr.run(task=custom_task, name="Custom Task")
            norn = results2html(results)

    except Exception as e:
        norn = f'<pre>{traceback.format_exc()}</pre>'

    return norn


def custom_task(task):
    cmds = ['show version',
           ]

    for cmd in cmds:
        task.run(task=netmiko_send_command, name=cmd, command_string=cmd, enable=True)

    task.host.close_connections()


def results2html(results):
    norn = ''
    for device_name, multi_result in sorted(results.items()):
        norn += f'<h2>{device_name}</h2>\n'
        for result in multi_result:
            norn += f'<h3>{result.name}</h3>\n'
            x = result.result
            if not isinstance(x, type(None)):
                norn += '<pre>'
                if not isinstance(x, str):
                    if isinstance(x, OrderedDict):
                        norn += f'{json.dumps(x, indent=2)}\n'
                    else:
                        norn += f'{pformat(x, indent=2)}\n'
                else:
                    norn += x
                norn += '</pre>'
                
    return norn
