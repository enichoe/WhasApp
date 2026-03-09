/**
 * Lógica del Dashboard para WhatsApp Bulk SaaS
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Protección de ruta y chequeo de sesión
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '../login.html';
        return;
    }

    const user = session.user;
    
    // 2. Cargar perfil del usuario
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        document.getElementById('welcomeMessage').innerText = `Bienvenido de nuevo, ${profile.administrator_name} (${profile.business_name})`;
    }

    // 3. Inicializar UI
    initDashboardUI();
    
    // 4. Cargar estadísticas
    loadStats(user.id);
});

function initDashboardUI() {
    // Sidebar Toggle (Móvil)
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Cargar preferencia guardada
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }

        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
}

async function loadStats(userId) {
    // Contar Contactos
    const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    document.getElementById('statContacts').innerText = contactsCount || 0;

    // Contar Campañas
    const { count: campaignsCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    document.getElementById('statCampaigns').innerText = campaignsCount || 0;

    // Contar Mensajes Enviados
    const { count: sentCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'Enviado');
    
    document.getElementById('statSent').innerText = sentCount || 0;

    // Contar Mensajes Pendientes
    const { count: pendingCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'Pendiente');
    
    document.getElementById('statPending').innerText = pendingCount || 0;

    // Cargar Historial Reciente (Últimos 10 mensajes)
    const { data: recentMessages, error } = await supabase
        .from('messages')
        .select(`
            id,
            status,
            created_at,
            contacts (name),
            campaigns (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (recentMessages && recentMessages.length > 0) {
        const tableBody = document.getElementById('recentMessagesTable');
        tableBody.innerHTML = '';
        recentMessages.forEach(msg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${msg.campaigns?.name || 'Manual'}</td>
                <td>${msg.contacts?.name || 'N/A'}</td>
                <td><span class="badge bg-${msg.status === 'Enviado' ? 'success' : (msg.status === 'Error' ? 'danger' : 'warning')}">${msg.status}</span></td>
                <td>${new Date(msg.created_at).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}
