import urllib.request
import zipfile
import shutil
import os
import json
from distutils.version import StrictVersion

def forceMergeFlatDir(srcDir, dstDir):
    if not os.path.exists(dstDir):
        os.makedirs(dstDir)
    for item in os.listdir(srcDir):
        srcFile = os.path.join(srcDir, item)
        dstFile = os.path.join(dstDir, item)
        forceCopyFile(srcFile, dstFile)

def forceCopyFile (sfile, dfile):
    if os.path.isfile(sfile):
        shutil.copy2(sfile, dfile)

def isAFlatDir(sDir):
    for item in os.listdir(sDir):
        sItem = os.path.join(sDir, item)
        if os.path.isdir(sItem):
            return False
    return True


def copyTree(src, dst):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isfile(s):
            if not os.path.exists(dst):
                os.makedirs(dst)
            forceCopyFile(s,d)
        if os.path.isdir(s):
            isRecursive = not isAFlatDir(s)
            if isRecursive:
                copyTree(s, d)
            else:
                forceMergeFlatDir(s, d)

def update():
    try:
        urllib.request.urlcleanup()
        remote = urllib.request.urlopen('https://raw.githubusercontent.com/Shirkit/orquidariobahia-chrome-extension/master/host/manifest.json')
        if remote is not None:
            remote = json.loads(remote.read().decode('utf-8'))
            fl = open("manifest.json", "r")
            local = json.loads(fl.read())
            fl.close()

            if StrictVersion(local['version']) < StrictVersion(remote['version']):
                urllib.request.urlretrieve('https://github.com/Shirkit/orquidariobahia-chrome-extension/archive/master.zip', 'master.zip')
                with zipfile.ZipFile("master.zip","r") as zip_ref:
                    zip_ref.extractall("master")

                    source = './master/orquidariobahia-chrome-extension-master/host'
                    dest = '.'
                    copyTree(source, dest)
                    shutil.rmtree('/master/')
                    os.remove('./master.zip')

    except Exception as e:
        print(e)
