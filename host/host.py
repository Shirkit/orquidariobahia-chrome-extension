import json

manifest = open("manifest.json", "r")

import nativemessaging
import plugpag
import re

result = ''

f= open("temp.txt","w+")
f.write('conexão')

while True:
    try:
        message = nativemessaging.get_message()
        if "amount" in message:
            message["amount"] = re.sub("[^0-9]", "", message["amount"])
            result = plugpag.main(message)
        else:
            result = "Mensagem recebida invalida" + message
    except Exception as e:
        result = str(e)

    nativemessaging.send_message(nativemessaging.encode_message(result))