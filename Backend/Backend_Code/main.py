from flask import Flask
from .Authentication import auth

app=Flask('TravelPlaner')
app.secret_key='ase4wt!@#1234asdfj12342@#$'

app.register_blueprint(auth,prefix='/auth')

