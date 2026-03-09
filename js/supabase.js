/**
 * Configuración de Supabase
 * Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY con tus credenciales de Supabase
 */

// URL y Key de tu proyecto Supabase (encontrados en Project Settings > API)
const SUPABASE_URL = 'https://ooojaglrmctehxxubnue.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vb2phZ2xybWN0ZWh4eHVibnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMTA1NzQsImV4cCI6MjA4ODU4NjU3NH0.uQMR8d9LATr_HImsXr2K-dg7xFnHWzrzzSAwHI1cs0A';

// Cargamos el cliente de Supabase desde el CDN en el HTML
// Esta variable será global una vez se cargue el script de Supabase
let supabase;

try {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Cliente de Supabase inicializado correctamente.');
} catch (error) {
    console.error('Error al inicializar Supabase:', error);
}

// Exportamos o disponibilizamos globalmente si es necesario
window.supabase = supabase;
