"""Verify real native startup; collect bounded diagnostics on failure."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

OUT = Path('ios-build')
OUT.mkdir(exist_ok=True)
APP = Path('ios-build/DerivedData/Build/Products/Debug-iphonesimulator/App.app')
BUNDLE = 'com.wizpiko.app'


def command(phase, args, timeout=45, accept_failure=False):
    print(json.dumps({'phase': phase, 'timeout_seconds': timeout}), flush=True)
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired as error:
        text = (error.stdout or b'')
        if isinstance(text, bytes):
            text = text.decode(errors='replace')
        (OUT / (phase + '.log')).write_text(text)
        raise RuntimeError(phase + ' timed out') from error
    (OUT / (phase + '.log')).write_text(result.stdout + result.stderr)
    if result.returncode and not accept_failure:
        raise RuntimeError(phase + ': ' + (result.stdout + result.stderr)[-2500:])
    return result


def diagnostics(device):
    # Read markers directly even when CoreSimulator cannot answer another RPC.
    data = Path.home() / 'Library/Developer/CoreSimulator/Devices' / device / 'data/Containers/Data/Application'
    for marker in data.glob('*/Library/Application Support/Wizpiko/startup.json'):
        shutil.copy2(marker, OUT / 'startup.json')
        print(json.dumps({'startup': json.loads(marker.read_text())}), flush=True)
        try:
            command('app-screenshot', ['xcrun', 'simctl', 'io', device, 'screenshot', str(OUT / 'Wizpiko-iPhone-preview.png')], timeout=45)
        except Exception as error:
            print(str(error), flush=True)
        break
    try:
        args = ['xcrun', 'simctl', 'spawn', device, 'log', 'show', '--last', '2m', '--style', 'compact', '--predicate', 'process == "App" OR eventMessage CONTAINS "com.wizpiko.app"']
        command('simulator-system', args, timeout=20, accept_failure=True)
    except Exception as error:
        print(str(error), flush=True)


listing = json.loads(command('device-list', ['xcrun', 'simctl', 'list', 'devices', 'available', '-j']).stdout)
requested_runtime = os.environ.get('WIZPIKO_SIMULATOR_RUNTIME', 'iOS-18-6')
candidates = [(runtime, device) for runtime, devices in listing['devices'].items() if runtime.endswith('.' + requested_runtime) for device in devices if 'iPhone' in device['name']]
if not candidates:
    raise RuntimeError('The requested iPhone simulator runtime is unavailable: ' + requested_runtime)
runtime, selected = candidates[0]
device = selected['udid']
print(json.dumps({'runtime': runtime, 'device': selected['name'], 'architecture': os.uname().machine}), flush=True)
try:
    command('device-boot', ['xcrun', 'simctl', 'boot', device], timeout=150, accept_failure=True)
    command('device-ready', ['xcrun', 'simctl', 'bootstatus', device, '-b'], timeout=240)
    command('app-install', ['xcrun', 'simctl', 'install', device, str(APP)], timeout=120)
    command('app-launch', ['xcrun', 'simctl', 'launch', device, BUNDLE], timeout=120)
    container = Path(command('app-container', ['xcrun', 'simctl', 'get_app_container', device, BUNDLE, 'data']).stdout.strip())
    marker = container / 'Library/Application Support/Wizpiko/startup.json'
    status = None
    for _ in range(30):
        if marker.exists():
            status = json.loads(marker.read_text())
            if status.get('state') in ['ready', 'failed']:
                break
        time.sleep(2)
    if marker.exists():
        shutil.copy2(marker, OUT / 'startup.json')
    command('app-screenshot', ['xcrun', 'simctl', 'io', device, 'screenshot', str(OUT / 'Wizpiko-iPhone-preview.png')], timeout=20)
    print(json.dumps({'startup': status}), flush=True)
    if not status or status.get('state') != 'ready':
        raise RuntimeError('The native app did not reach its learning interface: ' + json.dumps(status))
    print('PASS native app reached its learning interface', flush=True)
except Exception:
    diagnostics(device)
    raise
finally:
    try:
        command('device-shutdown', ['xcrun', 'simctl', 'shutdown', device], timeout=25, accept_failure=True)
    except Exception as error:
        print(str(error), flush=True)
