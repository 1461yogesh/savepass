// Authentication Module
// Handles Google OAuth and session management

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
    this.authStateListeners = [];
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async initialize() {
    try {
      // Check for existing session
      const session = await db.getSession();
      
      if (session) {
        const user = await db.getUser();
        await this.handleUserLogin(user);
      }

      // Listen for auth state changes
      db.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await this.handleUserLogin(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.handleUserLogout();
        }
      });

      return session;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return null;
    }
  }

  // ============================================
  // LOGIN/LOGOUT
  // ============================================

  async signInWithGoogle() {
    try {
      const { data, error } = await db.signInWithGoogle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  async signOut() {
    try {
      // Lock vault before signing out
      encryption.lockVault();
      
      // Sign out from Supabase
      await db.signOut();
      
      // Clear local data
      this.currentUser = null;
      this.currentProfile = null;
      
      // Redirect to login
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Sign out failed:', error);
      throw new Error('Failed to sign out');
    }
  }

  // ============================================
  // USER PROFILE MANAGEMENT
  // ============================================

  async handleUserLogin(user) {
    this.currentUser = user;

    try {
      // Try to get existing profile
      let profile = await db.getProfile(user.id);

      // Create profile if doesn't exist
      if (!profile) {
        profile = await this.createUserProfile(user);
      }

      this.currentProfile = profile;

      // Notify listeners
      this.notifyAuthStateChange('logged_in', user, profile);

      // Log activity
      await db.logActivity(user.id, 'login');

      return profile;
    } catch (error) {
      console.error('Failed to handle user login:', error);
      throw error;
    }
  }

  async createUserProfile(user) {
    const profile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      vault_locked: true
    };

    return await db.createProfile(profile);
  }

  handleUserLogout() {
    this.currentUser = null;
    this.currentProfile = null;
    encryption.lockVault();
    this.notifyAuthStateChange('logged_out', null, null);
  }

  // ============================================
  // MASTER PASSPHRASE SETUP
  // ============================================

  async setupMasterPassphrase(passphrase, hint = '') {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Create a test encrypted value to verify passphrase later
      const testValue = 'vault_test_' + Date.now();
      await encryption.unlockVault(passphrase, this.currentUser.email);
      const encryptedTest = await encryption.encrypt(testValue);

      // Store hint (optional) and test value in profile
      await db.updateProfile(this.currentUser.id, {
        master_passphrase_hint: hint,
        vault_locked: false
      });

      // Store encrypted test value (for passphrase verification)
      // We'll use the first credential or a special system entry
      await db.createCredential({
        user_id: this.currentUser.id,
        title: '__vault_verification__',
        username: 'system',
        encrypted_password: encryptedTest,
        category: 'other',
        notes: 'System entry for vault verification'
      });

      console.log('✅ Master passphrase configured');
      return true;
    } catch (error) {
      encryption.lockVault();
      console.error('Failed to setup master passphrase:', error);
      throw new Error('Failed to setup master passphrase');
    }
  }

  async hasMasterPassphrase() {
    if (!this.currentUser) return false;

    try {
      const credentials = await db.getCredentials(this.currentUser.id);
      return credentials.some(c => c.title === '__vault_verification__');
    } catch {
      return false;
    }
  }

  async verifyMasterPassphrase(passphrase) {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Get verification credential
      const credentials = await db.getCredentials(this.currentUser.id);
      const verificationCred = credentials.find(c => c.title === '__vault_verification__');

      if (!verificationCred) {
        throw new Error('No master passphrase configured');
      }

      // Try to unlock vault
      const unlocked = await encryption.unlockVault(passphrase, this.currentUser.email);
      
      if (unlocked) {
        // Try to decrypt verification data
        try {
          await encryption.decrypt(verificationCred.encrypted_password);
          
          // Update profile
          await db.updateProfile(this.currentUser.id, {
            vault_locked: false,
            last_activity: new Date().toISOString()
          });

          return true;
        } catch {
          encryption.lockVault();
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Passphrase verification failed:', error);
      return false;
    }
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  setupInactivityTimer() {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.handleInactivity();
      }, SESSION_CONFIG.inactivityTimeout);
    };

    // Reset timer on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();
  }

  async handleInactivity() {
    console.log('⏰ Inactivity timeout - locking vault');
    encryption.lockVault();
    
    if (this.currentUser) {
      await db.updateProfile(this.currentUser.id, {
        vault_locked: true
      });
    }

    // Redirect to unlock page or show unlock modal
    window.location.href = '/dashboard.html?locked=true';
  }

  // ============================================
  // GETTERS
  // ============================================

  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentProfile() {
    return this.currentProfile;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  }

  notifyAuthStateChange(event, user, profile) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(event, user, profile);
      } catch (error) {
        console.error('Auth state listener error:', error);
      }
    });
  }
}

// Global instance
const auth = new AuthManager();
