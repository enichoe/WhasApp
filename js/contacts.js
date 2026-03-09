/**
 * Lógica de Gestión de Contactos para WhatsApp Bulk SaaS
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

    // 2. Cargar contactos iniciales
    loadContacts();

    // 3. Evento: Agregar contacto manual
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value;
        const phone = document.getElementById('contactPhone').value;

        const { error } = await supabase
            .from('contacts')
            .insert([{ name, phone, user_id: currentUser.id }]);

        if (error) {
            alert('Error al guardar contacto: ' + error.message);
        } else {
            contactForm.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addContactModal'));
            modal.hide();
            loadContacts();
        }
    });

    // 4. Evento: Importar Archivo
    document.getElementById('fileImport').addEventListener('change', handleFileUpload);

    // 5. Evento: Limpiar Lista
    document.getElementById('btnClearContacts').addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que quieres eliminar TODOS tus contactos? Esta acción no se puede deshacer.')) {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('user_id', currentUser.id);
            
            if (error) alert('Error al limpiar contactos: ' + error.message);
            else loadContacts();
        }
    });

    // 6. Evento: Exportar Contactos
    document.getElementById('btnExportContacts').addEventListener('click', exportContacts);
});

async function loadContacts() {
    const tableBody = document.getElementById('contactsTable');
    
    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando contactos:', error);
        return;
    }

    tableBody.innerHTML = '';

    if (contacts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">No tienes contactos guardados todavía.</td></tr>';
        return;
    }

    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contact.name}</td>
            <td><span class="badge bg-light text-dark fw-normal"><i class="bi bi-whatsapp text-success"></i> ${contact.phone}</span></td>
            <td>${new Date(contact.created_at).toLocaleDateString()}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="deleteContact('${contact.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function deleteContact(id) {
    if (confirm('¿Eliminar este contacto?')) {
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) alert('Error: ' + error.message);
        else loadContacts();
    }
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        // Procesar filas e insertar
        const contactsToInsert = rows.map(row => ({
            user_id: currentUser.id,
            name: row.Nombre || row.name || 'Sin nombre',
            phone: (row.Telefono || row.phone || row.WhatsApp || '').toString().replace(/\D/g, '')
        })).filter(c => c.phone !== '');

        if (contactsToInsert.length === 0) {
            alert('No se encontraron contactos válidos. Asegúrate de que el archivo tenga columnas con nombres como "Nombre" y "Telefono".');
            return;
        }

        const { error } = await supabase.from('contacts').insert(contactsToInsert);
        
        if (error) {
            alert('Error al importar: ' + error.message);
        } else {
            alert(`¡Importación exitosa! Se agregaron ${contactsToInsert.length} contactos.`);
            loadContacts();
        }
    };
    reader.readAsArrayBuffer(file);
}

async function exportContacts() {
    const { data: contacts } = await supabase
        .from('contacts')
        .select('name, phone')
        .eq('user_id', currentUser.id);

    if (!contacts || contacts.length === 0) {
        alert('No hay contactos para exportar.');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contactos");
    XLSX.writeFile(workbook, "contactos_whatsapp.xlsx");
}

window.deleteContact = deleteContact;
