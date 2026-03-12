// Supabase Client Setup
// Handles all database operations with proper error handling

class SupabaseClient {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  // Initialize Supabase client
  init() {
    if (this.initialized) return;
    
    try {
      this.client = supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      this.initialized = true;
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      throw new Error('Failed to connect to database');
    }
  }

  // Get current session
  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  // Get current user
  async getUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'dashboard.html'
      }
    });
    if (error) throw error;
    return data;
  }

  // Sign out
  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  // Profile Operations
  async getProfile(userId) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createProfile(profile) {
    const { data, error } = await this.client
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProfile(userId, updates) {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Credential Operations
  async getCredentials(userId) {
    const { data, error } = await this.client
      .from('credentials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createCredential(credential) {
    const { data, error } = await this.client
      .from('credentials')
      .insert([credential])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCredential(credentialId, updates) {
    const { data, error } = await this.client
      .from('credentials')
      .update(updates)
      .eq('id', credentialId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteCredential(credentialId) {
    const { error } = await this.client
      .from('credentials')
      .delete()
      .eq('id', credentialId);
    
    if (error) throw error;
  }

  // Activity Log Operations
  async logActivity(userId, action, credentialId = null) {
    try {
      await this.client
        .from('activity_logs')
        .insert([{
          user_id: userId,
          action: action,
          credential_id: credentialId,
          user_agent: navigator.userAgent
        }]);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw - logging failures shouldn't break app
    }
  }

  // Subscribe to auth changes
  onAuthStateChange(callback) {
    return this.client.auth.onAuthStateChange(callback);
  }
}

// Global instance
const db = new SupabaseClient();
db.init();
