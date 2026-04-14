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
const insightsColumn = document.getElementById('insightsColumn');
const probabilitiesChart = document.getElementById('probabilitiesChart');
const probabilitiesPlaceholder = 'Classify a ticket to see the probability distribution.';
const defaultResultState = {
    category: 'Not classified yet',
    ticketId: '',
    subject: '',
    description: '',
    details: 'Classify a ticket to see the assigned result.'
};

function localizeCategory(category) {
    const normalized = (category || '').trim();
    if (!normalized) {
        return normalized;
    }

    const map = {
        'Soporte Técnico': 'Technical Support',
        'Soporte Tecnico': 'Technical Support',
        'Facturación': 'Billing',
        'Facturacion': 'Billing',
        'Envío': 'Shipping',
        'Envio': 'Shipping',
        'Cancelación': 'Cancellation',
        'Cancelacion': 'Cancellation',
        'Consulta General': 'General Inquiry',
        'Consulta general': 'General Inquiry'
    };

    return map[normalized] || normalized;
}

function generateTicketId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    return `T-${timestamp}-${random}`;
}

function lockTicketGeneration() {
    refreshIdBtn.disabled = true;
    refreshIdBtn.title = 'Submit the current ticket before generating a new ID.';
}

function unlockTicketGeneration() {
    refreshIdBtn.disabled = false;
    refreshIdBtn.title = 'Generate a new ID to start another ticket.';
}

function resetResultCard() {
    resultCategory.textContent = defaultResultState.category;
    resultTicketId.textContent = defaultResultState.ticketId;
    resultSubject.textContent = defaultResultState.subject;
    resultDescription.textContent = defaultResultState.description;
    resultDetails.textContent = defaultResultState.details;
}

function assignNewTicketId() {
    ticketIdInput.value = generateTicketId();
    lockTicketGeneration();
    resetResultCard();
    resetProbabilities();
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

function ensureInsightsVisible() {
    if (insightsColumn && insightsColumn.classList.contains('hidden')) {
        insightsColumn.classList.remove('hidden');
    }
}

function showProbabilitiesPlaceholder() {
    if (!probabilitiesChart) {
        return;
    }
    probabilitiesChart.innerHTML = `<p class="empty-state">${probabilitiesPlaceholder}</p>`;
}

function resetProbabilities() {
    showProbabilitiesPlaceholder();
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
            name.textContent = localizeCategory(label);

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
        const errorMessage = data.error || 'Could not classify the ticket. Please try again.';
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
        showAlert('Click "New ID" to generate a ticket before submitting.', 'error');
        return;
    }

    if (!subject && !description) {
        showAlert('Please enter at least a subject or a description.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Classifying...';

    try {
        const result = await classifyTicket({
            ticket_id: ticketId,
            subject,
            description
        });

        const displayCategory = localizeCategory(result.category);
        resultCategory.textContent = displayCategory;
        resultTicketId.textContent = result.ticket_id || ticketId;
        resultSubject.textContent = subject || 'No subject provided.';
        resultDescription.textContent = description || 'No description provided.';
        resultDetails.textContent = `The ticket was assigned to category ${displayCategory}.`;

        ensureInsightsVisible();
        resultSection.classList.remove('hidden');
        renderProbabilities(result.probabilities);
        showAlert('Ticket classified successfully. Generate a new ID to start another one.', 'success');

        clearFormFields();
        ticketIdInput.value = '';
        unlockTicketGeneration();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Classify ticket';
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
