import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from naive_bayes import NaiveBayesMultinomial

# Asegurar que los recursos de NLTK estén disponibles 
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

class ClasificadorTickets:
    def __init__(self, ruta_modelo="modelo_final.pkl"):
        # Cargar el modelo final entrenado con el dataset real
        self.modelo = NaiveBayesMultinomial.load(ruta_modelo)
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()

    def limpiar_texto(self, texto):
        """Aplica la misma limpieza usada durante el entrenamiento."""
        texto = str(texto).lower()
        texto = re.sub(r'[^a-z\s]', '', texto)
        tokens = word_tokenize(texto)
        tokens_limpios = [self.lemmatizer.lemmatize(word) for word in tokens if word not in self.stop_words]
        return tokens_limpios

    def predecir(self, asunto, descripcion):
        """Recibe texto crudo de la web, lo limpia y devuelve la categoría y sus probabilidades."""
        texto_completo = f"{asunto} {descripcion}"
        tokens = self.limpiar_texto(texto_completo)

        probabilidades = self.modelo.predict_proba(tokens)

        # Evitar fallos si el usuario envía texto vacío o puros símbolos
        if not tokens:
            categoria = "Consulta General"  # Categoría por defecto
        else:
            categoria = max(probabilidades, key=probabilidades.get)

        return categoria, probabilidades

# Bloque de prueba
if __name__ == "__main__":
    clasificador = ClasificadorTickets()
    # Simulando un envío desde la página web
    prueba_asunto = "Need help with my account"
    prueba_descripcion = "I want to cancel my subscription right now! It is too expensive."
    
    categoria = clasificador.predecir(prueba_asunto, prueba_descripcion)
    print(f"La categoría asignada para este ticket es: {categoria}")
