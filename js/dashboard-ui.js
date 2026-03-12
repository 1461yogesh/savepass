// Dashboard UI Controller
// Handles modals, forms, and user interactions

class DashboardUI {
  constructor(dashboardController) {
    this.dashboard = dashboardController;
    this.currentEditingId = null;
  }

  async initialize() {
    // Check if user has master passphrase set up
    const hasPassphrase = await auth.hasMasterPassphrase();
    
    if (!hasPassphrase) {
      this.showSetupModal();
    } else if (!encryption.isVaultUnlocked()) {
      this.showUnlockModal();
    }

    this.setupModalEventListeners();
  }

  // ============================================
  // UNLOCK MODAL
  // ============================================

  showUnlockModal() {
    const modal = document.getElementById('unlock-modal');
    const passphraseInput = document.getElementById('unlock-passphrase');
    const unlockBtn = document.getElementById('unlock-btn');
    const errorDiv = document.getElementById('unlock-error');

    // Show hint if available
    const profile = auth.getCurrentProfile();
    const hintEl = document.getElementById('unlock-hint');
    if (profile?.master_passphrase_hint) {
      hintEl.textContent = `Hint: ${profile.master_passphrase_hint}`;
    } else {
      hintEl.textContent = '';
    }

    modal.classList.remove('hidden');
    setTimeout(() => passphraseInput.focus(), 100);

    // Handle unlock
    const handleUnlock = async () => {
      const passphrase = passphraseInput.value.trim();
      
      if (!passphrase) {
        errorDiv.textContent = 'Please enter your passphrase';
        errorDiv.classList.remove('hidden');
        return;
      }

      unlockBtn.disabled = true;
      unlockBtn.textContent = 'Unlocking...';

      try {
        const verified = await auth.verifyMasterPassphrase(passphrase);
        
        if (verified) {
          modal.classList.add('hidden');
          passphraseInput.value = '';
          errorDiv.classList.add('hidden');
          
          // Update UI
          this.updateVaultStatus(true);
          
          // Load dashboard data
          await this.dashboard.loadCredentials();
        } else {
          errorDiv.textContent = 'Incorrect passphrase. Please try again.';
          errorDiv.classList.remove('hidden');
          passphraseInput.value = '';
          passphraseInput.focus();
        }
      } catch (error) {
        console.error('Unlock error:', error);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.remove('hidden');
      } finally {
        unlockBtn.disabled = false;
        unlockBtn.textContent = 'Unlock Vault';
      }
    };

    // Click handler
    unlockBtn.onclick = handleUnlock;

    // Enter key handler
    passphraseInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUnlock();
      }
    };
  }

  // ============================================
  // SETUP MODAL
  // ============================================

  showSetupModal() {
    const modal = document.getElementById('setup-modal');
    const passphraseInput = document.getElementById('setup-passphrase');
    const confirmInput = document.getElementById('setup-passphrase-confirm');
    const hintInput = document.getElementById('setup-hint');
    const setupBtn = document.getElementById('setup-btn');
    const strengthFill = document.getElementById('strength-fill');
    const strengthLabel = document.getElementById('strength-label');

    modal.classList.remove('hidden');
    setTimeout(() => passphraseInput.focus(), 100);

    // Password strength checker
    passphraseInput.oninput = () => {
      const passphrase = passphraseInput.value;
      const result = encryption.calculatePasswordStrength(passphrase);

      strengthFill.className = `strength-fill ${result.strength}`;
      strengthLabel.textContent = result.strength.charAt(0).toUpperCase() + result.strength.slice(1) + 
        (result.feedback.length > 0 ? ': ' + result.feedback[0] : '');
    };

    // Handle setup
    setupBtn.onclick = async () => {
      const passphrase = passphraseInput.value.trim();
      const confirm = confirmInput.value.trim();
      const hint = hintInput.value.trim();

      // Validation
      if (!passphrase) {
        alert('Please enter a master passphrase');
        return;
      }

      if (passphrase.length < 8) {
        alert('Passphrase must be at least 8 characters long');
        return;
      }

      if (passphrase !== confirm) {
        alert('Passphrases do not match');
        confirmInput.focus();
        return;
      }

      setupBtn.disabled = true;
      setupBtn.textContent = 'Creating Vault...';

      try {
        await auth.setupMasterPassphrase(passphrase, hint);
        
        modal.classList.add('hidden');
        passphraseInput.value = '';
        confirmInput.value = '';
        hintInput.value = '';

        this.updateVaultStatus(true);
        
        this.dashboard.showSuccess('Vault created successfully! Your credentials are now encrypted.');
        
        // Load dashboard
        await this.dashboard.loadCredentials();
      } catch (error) {
        console.error('Setup error:', error);
        alert('Failed to create vault. Please try again.');
      } finally {
        setupBtn.disabled = false;
        setupBtn.textContent = 'Create Vault';
      }
    };
  }

  // ============================================
  // CREDENTIAL MODAL
  // ============================================

  showCredentialModal(credential = null) {
    const modal = document.getElementById('credential-modal');
    const title = document.getElementById('credential-modal-title');
    const form = document.getElementById('credential-form');
    
    this.currentEditingId = credential ? credential.id : null;

    // Set title
    title.textContent = credential ? '✏️ Edit Credential' : '➕ Add Credential';

    // Reset form
    form.reset();
    document.getElementById('credential-id').value = '';

    // Fill form if editing
    if (credential) {
      document.getElementById('credential-id').value = credential.id;
      document.getElementById('credential-title').value = credential.title;
      document.getElementById('credential-category').value = credential.category;
      document.getElementById('credential-username').value = credential.username || '';
      document.getElementById('credential-url').value = credential.url || '';
      document.getElementById('credential-notes').value = credential.notes || '';
      document.getElementById('credential-favorite').checked = credential.favorite || false;
      
      // For editing, password field is optional
      document.getElementById('credential-password').required = false;
      document.getElementById('credential-password').placeholder = 'Leave blank to keep existing password';
    } else {
      document.getElementById('credential-password').required = true;
      document.getElementById('credential-password').placeholder = 'Enter password';
    }

    modal.classList.remove('hidden');
  }

  hideCredentialModal() {
    const modal = document.getElementById('credential-modal');
    modal.classList.add('hidden');
    this.currentEditingId = null;
  }

  async handleCredentialFormSubmit(e) {
    e.preventDefault();

    const credentialData = {
      title: document.getElementById('credential-title').value.trim(),
      category: document.getElementById('credential-category').value,
      username: document.getElementById('credential-username').value.trim(),
      password: document.getElementById('credential-password').value,
      url: document.getElementById('credential-url').value.trim(),
      notes: document.getElementById('credential-notes').value.trim(),
      favorite: document.getElementById('credential-favorite').checked
    };

    // Validation
    if (!credentialData.title) {
      alert('Please enter a title');
      return;
    }

    try {
      if (this.currentEditingId) {
        // Update existing
        const updates = {
          title: credentialData.title,
          category: credentialData.category,
          username: credentialData.username,
          url: credentialData.url,
          notes: credentialData.notes,
          favorite: credentialData.favorite
        };

        // Only update password if provided
        if (credentialData.password) {
          updates.password = credentialData.password;
        }

        await this.dashboard.updateCredential(this.currentEditingId, updates);
      } else {
        // Create new
        if (!credentialData.password) {
          alert('Please enter a password');
          return;
        }
        await this.dashboard.createCredential(credentialData);
      }

      this.hideCredentialModal();
    } catch (error) {
      console.error('Failed to save credential:', error);
      alert('Failed to save credential. Please try again.');
    }
  }

  // ============================================
  // MODAL EVENT LISTENERS
  // ============================================

  setupModalEventListeners() {
    // Add credential button
    const addBtn = document.getElementById('add-credential-btn');
    if (addBtn) {
      addBtn.onclick = () => this.showCredentialModal();
    }

    // Cancel credential modal
    const cancelBtn = document.getElementById('cancel-credential-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => this.hideCredentialModal();
    }

    // Credential form submit
    const form = document.getElementById('credential-form');
    if (form) {
      form.onsubmit = (e) => this.handleCredentialFormSubmit(e);
    }

    // Generate password button
    const generateBtn = document.getElementById('generate-password-btn');
    if (generateBtn) {
      generateBtn.onclick = () => {
        const password = encryption.generatePassword(16, {
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: true
        });
        document.getElementById('credential-password').value = password;
        document.getElementById('credential-password').type = 'text';
      };
    }

    // Toggle password visibility in credential modal
    const toggleBtn = document.getElementById('toggle-credential-password-btn');
    const passwordInput = document.getElementById('credential-password');
    if (toggleBtn && passwordInput) {
      toggleBtn.onclick = () => {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
      };
    }

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      };
    });
  }

  // ============================================
  // UI UPDATES
  // ============================================

  updateVaultStatus(unlocked) {
    const statusEl = document.getElementById('vault-status');
    if (!statusEl) return;

    if (unlocked) {
      statusEl.className = 'vault-status unlocked';
      statusEl.innerHTML = `
        <div class="status-indicator"></div>
        <span>Vault Unlocked</span>
      `;
    } else {
      statusEl.className = 'vault-status locked';
      statusEl.innerHTML = `
        <div class="status-indicator"></div>
        <span>Vault Locked</span>
      `;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for dashboard controller to be initialized
  setTimeout(async () => {
    if (window.dashboard) {
      const ui = new DashboardUI(window.dashboard);
      await ui.initialize();
      
      // Make available globally for dashboard controller to use
      window.dashboardUI = ui;
      
      // Override the showCredentialModal in dashboard controller
      window.dashboard.showCredentialModal = (credential) => ui.showCredentialModal(credential);
    }
  }, 100);
});
