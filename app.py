from flask import Flask, jsonify, render_template, request
from motor_inferencia import ClasificadorTickets

app = Flask(__name__)
clasificador = ClasificadorTickets()

@app.route('/')
def index():
    return render_template('index.html')

@app.post('/api/predict')
def api_predict():
    data = request.get_json(silent=True) or {}
    subject = (data.get('subject') or '').strip()
    description = (data.get('description') or '').strip()
    ticket_id = (data.get('ticket_id') or '').strip()

    if not subject and not description:
        return jsonify({'error': 'Ingresa al menos un asunto o descripción para clasificar el ticket.'}), 400

    categoria, probabilidades = clasificador.predecir(subject, description)
    response = {
        'ticket_id': ticket_id or None,
        'subject': subject,
        'description': description,
        'category': categoria,
        'probabilities': probabilidades
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
