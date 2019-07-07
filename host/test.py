import json
import urllib.request

try:
    remote = urllib.request.urlopen('https://raw.githubusercontent.com/Shirkit/orquidariobahia-chrome-extension/master/host/manifest.json')
    if remote is not None:
        remote = json.loads(remote.read().decode('utf-8'))
        fl = open("manifest.json", "r")
        local = json.loads(fl.read())
        fl.close()

except Exception as e:
    print(e)
