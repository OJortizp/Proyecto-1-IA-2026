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

function generateTicketId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    return `T-${timestamp}-${random}`;
}

function setTicketId() {
    ticketIdInput.value = generateTicketId();
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

async function classifyTicket(payload) {
    const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMessage = data.error || 'No se pudo clasificar el ticket. Intenta de nuevo.';
        throw new Error(errorMessage);
    }

    return data;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();
    resultSection.classList.add('hidden');

    const subject = subjectInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!subject && !description) {
        showAlert('Por favor ingresa al menos un asunto o una descripción.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Clasificando...';

    try {
        const result = await classifyTicket({
            ticket_id: ticketIdInput.value,
            subject,
            description
        });

        resultCategory.textContent = result.category;
        resultDetails.textContent = result.ticket_id
            ? `Ticket ${result.ticket_id} asignado a la categoría ${result.category}.`
            : 'Clasificación completada correctamente.';

        resultSection.classList.remove('hidden');
        showAlert('Clasificación exitosa.', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Clasificar ticket';
    }
});

refreshIdBtn.addEventListener('click', () => {
    setTicketId();
    hideAlert();
    resultSection.classList.add('hidden');
});

setTicketId();
