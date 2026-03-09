/**
 * Lógica de Autenticación para WhatsApp Bulk SaaS
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Verificar si el usuario ya está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si estamos en login o register y hay sesión, vamos al dashboard
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
    if (session && isAuthPage) {
        window.location.href = 'dashboard/dashboard.html';
        return;
    }

    // --- REGISTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const businessName = document.getElementById('businessName').value;
            const adminName = document.getElementById('adminName').value;
            const btn = document.getElementById('btnRegister');

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';

            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            business_name: businessName,
                            administrator_name: adminName
                        }
                    }
                });

                if (error) throw error;

                alert('Registro exitoso. Por favor, verifica tu correo (si está habilitado) o inicia sesión.');
                window.location.href = 'login.html';
            } catch (error) {
                alert('Error en el registro: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Registrarse <i class="bi bi-arrow-right ms-2"></i>';
            }
        });
    }

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('btnLogin');

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                // Guardar datos en el perfil si es necesario (el trigger de SQL lo hace automáticamente)
                window.location.href = 'dashboard/dashboard.html';
            } catch (error) {
                alert('Error al iniciar sesión: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Entrar <i class="bi bi-box-arrow-in-right ms-2"></i>';
            }
        });
    }
});

// Función para cerrar sesión (disponible globalmente)
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Error al cerrar sesión: ' + error.message);
    } else {
        window.location.href = '../login.html';
    }
}
window.logout = logout;
