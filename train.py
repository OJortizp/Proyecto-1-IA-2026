from Procesamiento.naive_bayes import NaiveBayesMultinomial

# Ejemplo de dataset ya preprocesado (tokens + etiquetas)
docs = [
    ["help", "bill"],
    ["internet", "not", "working"],
    ["cancel", "subscription"],
    ["question", "pricing"],
    ["unhappy", "service"]
]
labels = ["Facturación", "Soporte Técnico", "Cancelación", "Consulta General", "Queja"]

nb = NaiveBayesMultinomial()
nb.train(docs, labels)
nb.save("modelo.pkl")

print("Modelo entrenado y guardado en modelo.pkl")