import math
import pickle
from collections import defaultdict, Counter

class NaiveBayesMultinomial:
    def __init__(self):
        self.class_priors = {}
        self.word_probs = {}
        self.vocab = set()
        self.class_word_counts = {}
        self.class_total_words = {}
        self.classes = []

    def train(self, docs, labels):
        """
        docs: lista de documentos ya tokenizados (listas de palabras)
        labels: lista de etiquetas correspondientes
        """
        data_by_class = defaultdict(list)
        for doc, label in zip(docs, labels):
            data_by_class[label].append(doc)

        self.classes = list(data_by_class.keys())
        total_docs = len(docs)

        for c in self.classes:
            # Prior de la clase
            self.class_priors[c] = len(data_by_class[c]) / total_docs

            # Conteo de palabras
            word_counts = Counter()
            for doc in data_by_class[c]:
                word_counts.update(doc)

            self.class_word_counts[c] = word_counts
            self.class_total_words[c] = sum(word_counts.values())
            self.vocab.update(word_counts.keys())

        # Probabilidades con Laplace Smoothing
        vocab_size = len(self.vocab)
        self.word_probs = {c: {} for c in self.classes}
        for c in self.classes:
            for word in self.vocab:
                self.word_probs[c][word] = (
                                                   self.class_word_counts[c][word] + 1
                                           ) / (self.class_total_words[c] + vocab_size)

    def _compute_log_scores(self, doc):
        """Devuelve los puntajes logarítmicos para cada clase."""
        scores = {}
        for c in self.classes:
            score = math.log(self.class_priors[c])
            for word in doc:
                if word in self.vocab:
                    score += math.log(self.word_probs[c][word])
            scores[c] = score
        return scores

    def predict(self, doc):
        """
        doc: documento ya tokenizado (lista de palabras)
        """
        scores = self._compute_log_scores(doc)
        return max(scores, key=scores.get)

    def predict_proba(self, doc):
        """Devuelve la probabilidad normalizada por clase para el documento dado."""
        scores = self._compute_log_scores(doc)
        if not scores:
            return {}

        max_log = max(scores.values())
        exp_scores = {c: math.exp(score - max_log) for c, score in scores.items()}
        total = sum(exp_scores.values()) or 1.0
        return {c: exp_score / total for c, exp_score in exp_scores.items()}

    def save(self, filename="naive_bayes.pkl"):
        with open(filename, "wb") as f:
            pickle.dump(self, f)

    @staticmethod
    def load(filename="naive_bayes.pkl"):
        with open(filename, "rb") as f:
            return pickle.load(f)
