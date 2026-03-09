/**
 * Configuración de Supabase
 * Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY con tus credenciales de Supabase
 */

// URL y Key de tu proyecto Supabase (encontrados en Project Settings > API)
const SUPABASE_URL = 'https://ooojaglrmctehxxubnue.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vb2phZ2xybWN0ZWh4eHVibnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMTA1NzQsImV4cCI6MjA4ODU4NjU3NH0.uQMR8d9LATr_HImsXr2K-dg7xFnHWzrzzSAwHI1cs0A';

// El objeto 'supabase' es cargado globalmente por el CDN en el HTML.
// Usamos el objeto global para crear el cliente.
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Cliente de Supabase inicializado correctamente.');
    } else {
        console.error('La librería de Supabase no se cargó correctamente.');
    }
} catch (error) {
    console.error('Error al inicializar Supabase:', error);
}
