from naive_bayes import NaiveBayesMultinomial

# Cargar modelo entrenado
modelo = NaiveBayesMultinomial.load("modelo.pkl")

# Documento nuevo ya tokenizado
nuevo = ["bill", "incorrect"]
print("Predicción:", modelo.predict(nuevo))