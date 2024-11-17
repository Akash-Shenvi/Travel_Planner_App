import json
import os
with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'base_data.json'), encoding='utf-8') as fobj:
    mymail = json.load(fobj)['mailinfo']

MAIL_SERVER =mymail['mailserver']  
MAIL_PORT = mymail['mailport']              
MAIL_USE_TLS=False
MAIL_USE_SSL=True          
MAIL_USERNAME = mymail['mailuser']  
MAIL_PASSWORD = mymail['mailpassword']

 