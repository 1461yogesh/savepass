// SavePass Configuration
// ⚠️ IMPORTANT: Replace these with your actual Supabase credentials

const SUPABASE_CONFIG = {
  url: 'https://qasbpddsaaikwzlbwlrq.supabase.co', // e.g., https://xxxxx.supabase.co
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2JwZGRzYWFpa3d6bGJ3bHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTY2NTAsImV4cCI6MjA4ODg5MjY1MH0.AuCNN-avRYE0zNyO35NU9tZExOrF7cbb0ZzHV9iekFQ'
};

// Security Constants
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  iterations: 100000, // PBKDF2 iterations
  saltLength: 16,
  ivLength: 12
};

// Session Constants
const SESSION_CONFIG = {
  inactivityTimeout: 15 * 60 * 1000, // 15 minutes
  clipboardClearTimeout: 30 * 1000, // 30 seconds
  lockOnClose: true
};

// App Version
const APP_VERSION = '1.0.1';

// Validate configuration
function validateConfig() {
  const errors = [];
  
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
    errors.push('Supabase URL is not configured');
  }
  
  if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
    errors.push('Supabase Anon Key is not configured');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration Error(s):');
    errors.forEach(err => console.error('  - ' + err));
    console.log('\n📝 Setup Instructions:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings → API');
    console.log('4. Copy URL and anon key');
    console.log('5. Edit js/config.js');
    return false;
  }
  
  return true;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, ENCRYPTION_CONFIG, SESSION_CONFIG, APP_VERSION, validateConfig };
}
