/**
 * Lógica de Campañas para WhatsApp Bulk SaaS
 */

let currentUser;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '../login.html';
        return;
    }
    currentUser = session.user;

    // 2. Cargar campañas existentes
    loadCampaigns();

    // 3. Eventos del Editor
    const messageInput = document.getElementById('campaignMessage');
    const previewText = document.getElementById('previewText');
    const charCounter = document.getElementById('charCounter');

    messageInput.addEventListener('input', () => {
        const text = messageInput.value;
        previewText.innerText = text || 'Tu mensaje aparecerá aquí...';
        charCounter.innerText = `${text.length} caracteres`;
    });

    // 4. Guardar Campaña
    const campaignForm = document.getElementById('campaignForm');
    campaignForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('campaignName').value;
        const message = messageInput.value;

        const { error } = await supabase
            .from('campaigns')
            .insert([{ name, message, user_id: currentUser.id }]);

        if (error) {
            alert('Error al guardar campaña: ' + error.message);
        } else {
            alert('Campaña guardada con éxito.');
            campaignForm.reset();
            previewText.innerText = 'Tu mensaje aparecerá aquí...';
            charCounter.innerText = '0 caracteres';
            loadCampaigns();
        }
    });
});

async function loadCampaigns() {
    const listContainer = document.getElementById('campaignsList');
    
    const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando campañas:', error);
        return;
    }

    listContainer.innerHTML = '';

    if (campaigns.length === 0) {
        listContainer.innerHTML = '<div class="col-12 text-center text-muted py-5">No tienes campañas guardadas todavía.</div>';
        return;
    }

    campaigns.forEach(camp => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="card card-glass p-4 border-0 position-relative">
                <h6 class="fw-bold mb-2">${camp.name}</h6>
                <p class="text-muted small text-truncate-3 mb-3" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${camp.message}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${new Date(camp.created_at).toLocaleDateString()}</small>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCampaign('${camp.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        listContainer.appendChild(col);
    });
}

async function deleteCampaign(id) {
    if (confirm('¿Eliminar esta campaña?')) {
        const { error } = await supabase.from('campaigns').delete().eq('id', id);
        if (error) alert('Error: ' + error.message);
        else loadCampaigns();
    }
}

function addEmoji(emoji) {
    const input = document.getElementById('campaignMessage');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    input.value = text.substring(0, start) + emoji + text.substring(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + emoji.length;
    
    // Disparar evento de input para actualizar preview
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
}

window.deleteCampaign = deleteCampaign;
window.addEmoji = addEmoji;
