from flask import Flask, render_template, send_from_directory
import os
import time
from config import Config
from extensions import bcrypt
from routes import usuarios, auth, animais, relatorios, main, admin, fazendas


app = Flask(__name__, static_folder='static')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

app.config.from_object(Config)
bcrypt.init_app(app)

# Adicionar cache_buster ao contexto de todos os templates
@app.context_processor
def inject_cache_buster():
    return dict(cache_buster=int(time.time()))

# Registrar blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(main.bp)
app.register_blueprint(animais.bp)
app.register_blueprint(relatorios.bp)
app.register_blueprint(usuarios.bp)
app.register_blueprint(fazendas.bp)
app.register_blueprint(admin.bp, url_prefix='/admin')

### Debug/Desenv ###
#if __name__ == '__main__':
#    app.run(debug=True)
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

### Produção ###
#if __name__ == '__main__':
#    app.run()