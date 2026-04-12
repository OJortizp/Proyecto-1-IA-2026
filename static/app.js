const form = document.getElementById('ticketForm');
const ticketIdInput = document.getElementById('ticketId');
const refreshIdBtn = document.getElementById('refreshId');
const subjectInput = document.getElementById('subject');
const descriptionInput = document.getElementById('description');
const alertBox = document.getElementById('alertBox');
const submitBtn = document.getElementById('submitBtn');
const resultSection = document.getElementById('resultSection');
const resultCategory = document.getElementById('resultCategory');
const resultDetails = document.getElementById('resultDetails');
const resultTicketId = document.getElementById('resultTicketId');
const resultSubject = document.getElementById('resultSubject');
const resultDescription = document.getElementById('resultDescription');
const probabilitiesSection = document.getElementById('probabilitiesSection');
const probabilitiesChart = document.getElementById('probabilitiesChart');

function generateTicketId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    return `T-${timestamp}-${random}`;
}

function lockTicketGeneration() {
    refreshIdBtn.disabled = true;
    refreshIdBtn.title = 'Envía el ticket actual antes de generar un nuevo ID.';
}

function unlockTicketGeneration() {
    refreshIdBtn.disabled = false;
    refreshIdBtn.title = 'Genera un nuevo ID para cargar otro ticket.';
}

function assignNewTicketId() {
    ticketIdInput.value = generateTicketId();
    lockTicketGeneration();
}

function clearFormFields() {
    subjectInput.value = '';
    descriptionInput.value = '';
}

function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.classList.remove('hidden', 'error', 'success');
    alertBox.classList.add('alert', type);
}

function hideAlert() {
    alertBox.classList.add('hidden');
    alertBox.textContent = '';
}

function resetProbabilities() {
    if (probabilitiesChart) {
        probabilitiesChart.innerHTML = '';
    }
    if (probabilitiesSection) {
        probabilitiesSection.classList.add('hidden');
    }
}

function formatPercentage(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '0.0%';
    }
    return `${(value * 100).toFixed(1)}%`;
}

function renderProbabilities(probabilities) {
    if (!probabilitiesSection || !probabilitiesChart) {
        return;
    }

    const entries = Object.entries(probabilities || {});
    if (!entries.length) {
        resetProbabilities();
        return;
    }

    probabilitiesChart.innerHTML = '';
    entries
        .sort((a, b) => b[1] - a[1])
        .forEach(([label, probability]) => {
            const row = document.createElement('div');
            row.className = 'probability-row';

            const name = document.createElement('span');
            name.className = 'probability-label';
            name.textContent = label;

            const bar = document.createElement('div');
            bar.className = 'probability-bar';

            const fill = document.createElement('div');
            fill.className = 'probability-bar-fill';
            const percentageWidth = Math.max(probability * 100, 1);
            fill.style.width = `${percentageWidth.toFixed(1)}%`;

            bar.appendChild(fill);

            const value = document.createElement('span');
            value.className = 'probability-value';
            value.textContent = formatPercentage(probability);

            row.append(name, bar, value);
            probabilitiesChart.appendChild(row);
        });

    probabilitiesSection.classList.remove('hidden');
}

async function classifyTicket(payload) {
    const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    let data;
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        const errorMessage = data.error || 'No se pudo clasificar el ticket. Intenta de nuevo.';
        throw new Error(errorMessage);
    }

    return data;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();
    resetProbabilities();

    const ticketId = ticketIdInput.value.trim();
    const subject = subjectInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!ticketId) {
        showAlert('Haz clic en "Nuevo ID" para generar un ticket antes de enviarlo.', 'error');
        return;
    }

    if (!subject && !description) {
        showAlert('Por favor ingresa al menos un asunto o una descripción.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Clasificando...';

    try {
        const result = await classifyTicket({
            ticket_id: ticketId,
            subject,
            description
        });

        resultCategory.textContent = result.category;
        resultTicketId.textContent = result.ticket_id || ticketId;
        resultSubject.textContent = subject || 'Sin asunto proporcionado.';
        resultDescription.textContent = description || 'Sin descripción proporcionada.';
        resultDetails.textContent = `El ticket fue asignado a la categoría ${result.category}.`;

        resultSection.classList.remove('hidden');
        renderProbabilities(result.probabilities);
        showAlert('Ticket clasificado correctamente. Genera un nuevo ID para cargar otro.', 'success');

        clearFormFields();
        ticketIdInput.value = '';
        unlockTicketGeneration();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Clasificar ticket';
    }
});

refreshIdBtn.addEventListener('click', () => {
    if (refreshIdBtn.disabled) {
        return;
    }
    assignNewTicketId();
    clearFormFields();
    hideAlert();
    subjectInput.focus();
});

assignNewTicketId();
