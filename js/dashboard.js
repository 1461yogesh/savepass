// Dashboard Controller
// Manages credential display, CRUD operations, and UI state

class DashboardController {
  constructor() {
    this.credentials = [];
    this.filteredCredentials = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async initialize() {
    // Check authentication
    const session = await auth.initialize();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    // Check if vault is locked
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('locked') === 'true' || !encryption.isVaultUnlocked()) {
      this.showUnlockModal();
      return;
    }

    // Load and display data
    await this.loadCredentials();
    this.setupEventListeners();
    this.setupInactivityTimer();
    this.renderUserInfo();
  }

  // ============================================
  // CREDENTIAL MANAGEMENT
  // ============================================

  async loadCredentials() {
    try {
      const user = auth.getCurrentUser();
      if (!user) return;

      this.credentials = await db.getCredentials(user.id);
      this.applyFilters();
      this.renderCredentials();
      this.updateStats();
    } catch (error) {
      console.error('Failed to load credentials:', error);
      this.showError('Failed to load credentials');
    }
  }

  async createCredential(credentialData) {
    try {
      const user = auth.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Encrypt password
      const encryptedPassword = await encryption.encrypt(credentialData.password);

      const credential = {
        user_id: user.id,
        title: credentialData.title,
        username: credentialData.username || '',
        encrypted_password: encryptedPassword,
        category: credentialData.category,
        url: credentialData.url || '',
        notes: credentialData.notes || '',
        favorite: credentialData.favorite || false
      };

      const newCredential = await db.createCredential(credential);
      await db.logActivity(user.id, 'credential_created', newCredential.id);

      this.credentials.unshift(newCredential);
      this.applyFilters();
      this.renderCredentials();
      this.updateStats();

      this.showSuccess('Credential saved successfully');
      return newCredential;
    } catch (error) {
      console.error('Failed to create credential:', error);
      this.showError('Failed to save credential');
      throw error;
    }
  }

  async updateCredential(credentialId, updates) {
    try {
      // Encrypt new password if provided
      if (updates.password) {
        updates.encrypted_password = await encryption.encrypt(updates.password);
        delete updates.password;
      }

      const updatedCredential = await db.updateCredential(credentialId, updates);
      
      const user = auth.getCurrentUser();
      await db.logActivity(user.id, 'credential_updated', credentialId);

      // Update local state
      const index = this.credentials.findIndex(c => c.id === credentialId);
      if (index !== -1) {
        this.credentials[index] = updatedCredential;
        this.applyFilters();
        this.renderCredentials();
      }

      this.showSuccess('Credential updated successfully');
      return updatedCredential;
    } catch (error) {
      console.error('Failed to update credential:', error);
      this.showError('Failed to update credential');
      throw error;
    }
  }

  async deleteCredential(credentialId) {
    if (!confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      return;
    }

    try {
      await db.deleteCredential(credentialId);
      
      const user = auth.getCurrentUser();
      await db.logActivity(user.id, 'credential_deleted', credentialId);

      // Update local state
      this.credentials = this.credentials.filter(c => c.id !== credentialId);
      this.applyFilters();
      this.renderCredentials();
      this.updateStats();

      this.showSuccess('Credential deleted successfully');
    } catch (error) {
      console.error('Failed to delete credential:', error);
      this.showError('Failed to delete credential');
    }
  }

  async toggleFavorite(credentialId) {
    const credential = this.credentials.find(c => c.id === credentialId);
    if (!credential) return;

    await this.updateCredential(credentialId, {
      favorite: !credential.favorite
    });
  }

  // ============================================
  // DECRYPTION
  // ============================================

  async decryptPassword(credentialId) {
    try {
      const credential = this.credentials.find(c => c.id === credentialId);
      if (!credential) throw new Error('Credential not found');

      const decrypted = await encryption.decrypt(credential.encrypted_password);
      
      const user = auth.getCurrentUser();
      await db.logActivity(user.id, 'password_viewed', credentialId);

      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      throw new Error('Failed to decrypt password');
    }
  }

  // ============================================
  // FILTERING & SEARCH
  // ============================================

  applyFilters() {
    let filtered = [...this.credentials];

    // Apply category filter
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'favorites') {
        filtered = filtered.filter(c => c.favorite);
      } else {
        filtered = filtered.filter(c => c.category === this.currentFilter);
      }
    }

    // Apply search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        (c.username && c.username.toLowerCase().includes(query)) ||
        (c.url && c.url.toLowerCase().includes(query))
      );
    }

    this.filteredCredentials = filtered;
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.applyFilters();
    this.renderCredentials();
  }

  setSearch(query) {
    this.searchQuery = query;
    this.applyFilters();
    this.renderCredentials();
  }

  // ============================================
  // UI RENDERING
  // ============================================

  renderCredentials() {
    const container = document.getElementById('credentials-list');
    if (!container) return;

    if (this.filteredCredentials.length === 0) {
      container.innerHTML = this.getEmptyStateHTML();
      return;
    }

    container.innerHTML = this.filteredCredentials
      .map(cred => this.getCredentialCardHTML(cred))
      .join('');

    // Attach event listeners to cards
    this.attachCardEventListeners();
  }

  getCredentialCardHTML(credential) {
    const categoryIcons = {
      website: '🌐',
      app: '📱',
      wifi: '📶',
      api: '🔑',
      note: '📝',
      banking: '🏦',
      other: '📦'
    };

    return `
      <div class="credential-card" data-id="${credential.id}">
        <div class="credential-header">
          <div class="credential-icon">${categoryIcons[credential.category] || '📦'}</div>
          <div class="credential-info">
            <h3 class="credential-title">${this.escapeHTML(credential.title)}</h3>
            ${credential.username ? `<p class="credential-username">${this.escapeHTML(credential.username)}</p>` : ''}
          </div>
          <button class="favorite-btn ${credential.favorite ? 'active' : ''}" 
                  data-action="favorite" data-id="${credential.id}"
                  title="${credential.favorite ? 'Remove from favorites' : 'Add to favorites'}">
            ${credential.favorite ? '★' : '☆'}
          </button>
        </div>
        
        <div class="credential-body">
          ${credential.url ? `
            <div class="credential-field">
              <span class="field-label">URL:</span>
              <a href="${this.escapeHTML(credential.url)}" target="_blank" rel="noopener noreferrer">
                ${this.escapeHTML(credential.url)}
              </a>
            </div>
          ` : ''}
          
          <div class="credential-field">
            <span class="field-label">Password:</span>
            <div class="password-field">
              <input type="password" value="••••••••" readonly class="password-display" id="pwd-${credential.id}">
              <button class="btn-icon" data-action="toggle-password" data-id="${credential.id}" title="Show/Hide">
                👁️
              </button>
              <button class="btn-icon" data-action="copy-password" data-id="${credential.id}" title="Copy">
                📋
              </button>
            </div>
          </div>

          ${credential.notes ? `
            <div class="credential-field">
              <span class="field-label">Notes:</span>
              <p class="credential-notes">${this.escapeHTML(credential.notes)}</p>
            </div>
          ` : ''}
        </div>

        <div class="credential-footer">
          <span class="credential-date">Added ${this.formatDate(credential.created_at)}</span>
          <div class="credential-actions">
            <button class="btn-secondary btn-sm" data-action="edit" data-id="${credential.id}">Edit</button>
            <button class="btn-danger btn-sm" data-action="delete" data-id="${credential.id}">Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  getEmptyStateHTML() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔐</div>
        <h3>No credentials yet</h3>
        <p>Click "Add Credential" to store your first password securely</p>
      </div>
    `;
  }

  renderUserInfo() {
    const user = auth.getCurrentUser();
    if (!user) return;

    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');

    if (userNameEl) {
      userNameEl.textContent = user.user_metadata?.full_name || user.email;
    }
    if (userEmailEl) {
      userEmailEl.textContent = user.email;
    }
  }

  updateStats() {
    const totalEl = document.getElementById('stat-total');
    const categoryEls = {
      website: document.getElementById('stat-websites'),
      app: document.getElementById('stat-apps'),
      banking: document.getElementById('stat-banking')
    };

    if (totalEl) {
      totalEl.textContent = this.credentials.length;
    }

    Object.keys(categoryEls).forEach(category => {
      const el = categoryEls[category];
      if (el) {
        const count = this.credentials.filter(c => c.category === category).length;
        el.textContent = count;
      }
    });
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  attachCardEventListeners() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        switch (action) {
          case 'toggle-password':
            await this.handleTogglePassword(id);
            break;
          case 'copy-password':
            await this.handleCopyPassword(id);
            break;
          case 'favorite':
            await this.toggleFavorite(id);
            break;
          case 'edit':
            this.handleEditCredential(id);
            break;
          case 'delete':
            await this.deleteCredential(id);
            break;
        }
      });
    });
  }

  async handleTogglePassword(credentialId) {
    const input = document.getElementById(`pwd-${credentialId}`);
    if (!input) return;

    if (input.type === 'password') {
      try {
        const password = await this.decryptPassword(credentialId);
        input.type = 'text';
        input.value = password;
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
          input.type = 'password';
          input.value = '••••••••';
        }, 30000);
      } catch (error) {
        this.showError('Failed to decrypt password');
      }
    } else {
      input.type = 'password';
      input.value = '••••••••';
    }
  }

  async handleCopyPassword(credentialId) {
    try {
      const password = await this.decryptPassword(credentialId);
      await navigator.clipboard.writeText(password);
      
      this.showSuccess('Password copied to clipboard');

      // Clear clipboard after timeout
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, SESSION_CONFIG.clipboardClearTimeout);
    } catch (error) {
      this.showError('Failed to copy password');
    }
  }

  handleEditCredential(credentialId) {
    const credential = this.credentials.find(c => c.id === credentialId);
    if (!credential) return;

    // Show edit modal with credential data
    this.showCredentialModal(credential);
  }

  // ============================================
  // MODALS
  // ============================================

  showCredentialModal(credential = null) {
    // Implementation depends on your modal system
    // This is a placeholder
    console.log('Show credential modal', credential);
  }

  showUnlockModal() {
    // Implementation depends on your modal system
    console.log('Show unlock modal');
  }

  // ============================================
  // HELPERS
  // ============================================

  setupEventListeners() {
    // Add credential button
    const addBtn = document.getElementById('add-credential-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showCredentialModal());
    }

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setSearch(e.target.value);
      });
    }

    // Category filters
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setFilter(btn.dataset.filter);
        
        // Update active state
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Lock vault button
    const lockBtn = document.getElementById('lock-vault-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        encryption.lockVault();
        window.location.href = 'dashboard.html?locked=true';
      });
    }

    // Sign out button
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => auth.signOut());
    }
  }

  setupInactivityTimer() {
    auth.setupInactivityTimer();
  }

  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new DashboardController();
  window.dashboard.initialize();
});
