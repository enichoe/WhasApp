/**
 * Lógica del Motor de Envío para WhatsApp Bulk SaaS
 */

let currentUser;
let allContacts = [];
let isSending = false;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '../login.html';
        return;
    }
    currentUser = session.user;

    // Inicializar select de campañas y lista de contactos
    loadCampaignsSelect();
    loadContactsList();

    // Evento: Seleccionar todos
    document.getElementById('selectAllContacts').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.contact-checkbox');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    });

    // Evento: Iniciar envío
    document.getElementById('btnStartSending').addEventListener('click', startBulkSending);
    
    // Evento: Detener envío
    document.getElementById('btnStopSending').addEventListener('click', () => {
        isSending = false;
        toggleButtons(false);
    });
});

async function loadCampaignsSelect() {
    const select = document.getElementById('campaignSelect');
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('user_id', currentUser.id);

    select.innerHTML = '<option value="">-- Elige una campaña --</option>';
    if (campaigns) {
        campaigns.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = c.name;
            select.appendChild(opt);
        });
    }
}

async function loadContactsList() {
    const container = document.getElementById('sendContactsList');
    const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', currentUser.id);

    allContacts = contacts || [];
    container.innerHTML = '';

    if (allContacts.length === 0) {
        container.innerHTML = '<tr><td colspan="2" class="text-center py-4">No tienes contactos. Ve a la sección de Contactos para agregar algunos.</td></tr>';
        return;
    }

    allContacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td width="30">
                <input type="checkbox" class="contact-checkbox" value="${contact.id}" checked>
            </td>
            <td>
                <div class="fw-bold">${contact.name}</div>
                <div class="text-muted small">${contact.phone}</div>
            </td>
        `;
        container.appendChild(row);
    });
}

async function startBulkSending() {
    const campaignId = document.getElementById('campaignSelect').value;
    if (!campaignId) {
        alert('Por favor selecciona una campaña.');
        return;
    }

    // Obtener contactos seleccionados
    const selectedCheckboxes = document.querySelectorAll('.contact-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

    if (selectedIds.length === 0) {
        alert('Por favor selecciona al menos un contacto.');
        return;
    }

    // Obtener mensaje de la campaña
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('message')
        .eq('id', campaignId)
        .single();

    const delay = parseInt(document.querySelector('input[name="delay"]:checked').value);

    // Preparar UI
    isSending = true;
    toggleButtons(true);
    resetProgress(selectedIds.length);

    // Bucle de envío
    for (let i = 0; i < selectedIds.length; i++) {
        if (!isSending) break;

        const contactId = selectedIds[i];
        const contact = allContacts.find(c => c.id === contactId);
        
        updateCurrentStatus(`Preparando mensaje para ${contact.name}...`);
        
        // 1. Generar enlace de WhatsApp
        const encodedMessage = encodeURIComponent(campaign.message);
        const waUrl = `https://wa.me/${contact.phone}?text=${encodedMessage}`;

        // 2. Registrar en historial (en Supabase)
        await supabase.from('messages').insert([{
            user_id: currentUser.id,
            campaign_id: campaignId,
            contact_id: contactId,
            phone: contact.phone,
            status: 'Enviado'
        }]);

        // 3. Abrir ventana (truco: los navegadores bloquean popups masivos, 
        // pero como es disparado por un click inicial y hay delay, suele funcionar mejor. 
        // En un SaaS real, esto se haría vía API oficial o un bridge móvil)
        window.open(waUrl, '_blank');

        // 4. Actualizar Progreso
        updateProgress(i + 1, selectedIds.length);

        // 5. Delay
        if (i < selectedIds.length - 1) {
            updateCurrentStatus(`Esperando ${delay/1000} seg. para el siguiente...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    isSending = false;
    updateCurrentStatus('¡Envío completado!');
    toggleButtons(false);
}

function toggleButtons(sending) {
    document.getElementById('btnStartSending').classList.toggle('d-none', sending);
    document.getElementById('btnStopSending').classList.toggle('d-none', !sending);
    document.getElementById('progressCard').classList.toggle('d-none', !sending);
}

function resetProgress(total) {
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').innerText = `0 / ${total} enviados`;
    document.getElementById('progressPercent').innerText = '0%';
}

function updateProgress(current, total) {
    const percent = Math.round((current / total) * 100);
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressText').innerText = `${current} / ${total} enviados`;
    document.getElementById('progressPercent').innerText = `${percent}%`;
}

function updateCurrentStatus(msg) {
    document.getElementById('currentStatus').innerText = msg;
}
