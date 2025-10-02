// History page JavaScript for Personal Recruiter Extension
class HistoryController {
  constructor() {
    this.applications = [];
    this.filteredApplications = [];
    this.currentPage = 1;
    this.pageSize = 10;
    this.sortColumn = 'timestamp';
    this.sortDirection = 'desc';
    this.currentEditId = null;
    
    this.initElements();
    this.setupEventListeners();
    this.loadApplications();
  }

  initElements() {
    // Stats elements
    this.totalCount = document.getElementById('totalCount');
    this.thisMonthCount = document.getElementById('thisMonthCount');
    this.responseRate = document.getElementById('responseRate');
    this.interviewCount = document.getElementById('interviewCount');

    // Filter elements
    this.statusFilter = document.getElementById('statusFilter');
    this.dateFilter = document.getElementById('dateFilter');
    this.searchFilter = document.getElementById('searchFilter');
    this.clearFilters = document.getElementById('clearFilters');

    // Table elements
    this.applicationsTable = document.getElementById('applicationsTable');
    this.applicationsBody = document.getElementById('applicationsBody');
    this.noResults = document.getElementById('noResults');

    // Pagination elements
    this.paginationSection = document.getElementById('paginationSection');
    this.prevPage = document.getElementById('prevPage');
    this.nextPage = document.getElementById('nextPage');
    this.pageInfo = document.getElementById('pageInfo');

    // Action buttons
    this.exportBtn = document.getElementById('exportBtn');
    this.addApplicationBtn = document.getElementById('addApplicationBtn');

    // Modal elements
    this.editModal = document.getElementById('editModal');
    this.editForm = document.getElementById('editForm');
    this.closeEditModal = document.getElementById('closeEditModal');
    this.cancelEdit = document.getElementById('cancelEdit');

    this.addModal = document.getElementById('addModal');
    this.addForm = document.getElementById('addForm');
    this.closeAddModal = document.getElementById('closeAddModal');
    this.cancelAdd = document.getElementById('cancelAdd');

    // Loading overlay
    this.loadingOverlay = document.getElementById('loadingOverlay');
  }

  setupEventListeners() {
    // Filters
    this.statusFilter.addEventListener('change', () => this.applyFilters());
    this.dateFilter.addEventListener('change', () => this.applyFilters());
    this.searchFilter.addEventListener('input', () => this.debounce(() => this.applyFilters(), 300)());
    this.clearFilters.addEventListener('click', () => this.clearAllFilters());

    // Sorting
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', () => this.handleSort(header.dataset.sort));
    });

    // Pagination
    this.prevPage.addEventListener('click', () => this.goToPage(this.currentPage - 1));
    this.nextPage.addEventListener('click', () => this.goToPage(this.currentPage + 1));

    // Actions
    this.exportBtn.addEventListener('click', () => this.exportToCSV());
    this.addApplicationBtn.addEventListener('click', () => this.showAddModal());

    // Edit Modal
    this.closeEditModal.addEventListener('click', () => this.hideEditModal());
    this.cancelEdit.addEventListener('click', () => this.hideEditModal());
    this.editForm.addEventListener('submit', (e) => this.saveEditedApplication(e));

    // Add Modal
    this.closeAddModal.addEventListener('click', () => this.hideAddModal());
    this.cancelAdd.addEventListener('click', () => this.hideAddModal());
    this.addForm.addEventListener('submit', (e) => this.saveNewApplication(e));

    // Close modals when clicking outside
    this.editModal.addEventListener('click', (e) => {
      if (e.target === this.editModal) this.hideEditModal();
    });
    this.addModal.addEventListener('click', (e) => {
      if (e.target === this.addModal) this.hideAddModal();
    });
  }

  async loadApplications() {
    this.showLoading();
    
    try {
      const response = await this.sendMessage({ action: 'getJobApplications' });
      
      if (response.success) {
        this.applications = response.data;
        this.applyFilters();
        this.updateStats();
      } else {
        this.showError('Failed to load applications');
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      this.showError('Failed to load applications');
    } finally {
      this.hideLoading();
    }
  }

  updateStats() {
    const total = this.applications.length;
    
    // This month count
    const now = new Date();
    const thisMonth = this.applications.filter(app => {
      const appDate = new Date(app.timestamp);
      return appDate.getMonth() === now.getMonth() && 
             appDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Response rate (applications with response vs total)
    const responded = this.applications.filter(app => 
      app.status && app.status !== 'Applied'
    ).length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    
    // Interview count
    const interviews = this.applications.filter(app => 
      app.status === 'Interview Scheduled' || app.status === 'Offer Received'
    ).length;
    
    this.totalCount.textContent = total;
    this.thisMonthCount.textContent = thisMonth;
    this.responseRate.textContent = `${responseRate}%`;
    this.interviewCount.textContent = interviews;
  }

  applyFilters() {
    let filtered = [...this.applications];
    
    // Status filter
    if (this.statusFilter.value) {
      filtered = filtered.filter(app => app.status === this.statusFilter.value);
    }
    
    // Date filter
    if (this.dateFilter.value) {
      const now = new Date();
      let cutoffDate;
      
      switch (this.dateFilter.value) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (cutoffDate) {
        filtered = filtered.filter(app => new Date(app.timestamp) >= cutoffDate);
      }
    }
    
    // Search filter
    if (this.searchFilter.value.trim()) {
      const searchTerm = this.searchFilter.value.toLowerCase();
      filtered = filtered.filter(app => 
        (app.jobTitle && app.jobTitle.toLowerCase().includes(searchTerm)) ||
        (app.company && app.company.toLowerCase().includes(searchTerm)) ||
        (app.notes && app.notes.toLowerCase().includes(searchTerm)) ||
        (app.jobId && app.jobId.toLowerCase().includes(searchTerm))
      );
    }
    
    this.filteredApplications = filtered;
    this.sortApplications();
    this.currentPage = 1;
    this.renderTable();
    this.updatePagination();
  }

  sortApplications() {
    this.filteredApplications.sort((a, b) => {
      let aValue = a[this.sortColumn] || '';
      let bValue = b[this.sortColumn] || '';
      
      // Handle date sorting
      if (this.sortColumn === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  handleSort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    // Update sort indicators
    document.querySelectorAll('.sortable').forEach(header => {
      header.classList.remove('sorted');
      const icon = header.querySelector('.sort-icon');
      icon.textContent = '↕️';
    });
    
    const currentHeader = document.querySelector(`[data-sort="${column}"]`);
    currentHeader.classList.add('sorted');
    const icon = currentHeader.querySelector('.sort-icon');
    icon.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
    
    this.sortApplications();
    this.renderTable();
  }

  renderTable() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const pageApplications = this.filteredApplications.slice(startIndex, endIndex);
    
    if (pageApplications.length === 0) {
      this.applicationsTable.style.display = 'none';
      this.noResults.style.display = 'block';
      return;
    }
    
    this.applicationsTable.style.display = 'table';
    this.noResults.style.display = 'none';
    
    this.applicationsBody.innerHTML = pageApplications.map(app => `
      <tr data-id="${app.id}">
        <td>${new Date(app.timestamp).toLocaleDateString()}</td>
        <td>
          <div style="font-weight: 500;">${app.jobTitle || 'Unknown Position'}</div>
          ${app.notes ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${app.notes.substring(0, 50)}${app.notes.length > 50 ? '...' : ''}</div>` : ''}
        </td>
        <td>${app.company || 'Unknown Company'}</td>
        <td>
          <span class="status-badge status-${(app.status || 'applied').toLowerCase().replace(' ', '-')}">
            ${app.status || 'Applied'}
          </span>
        </td>
        <td>${app.jobId || '-'}</td>
        <td>
          <div class="action-buttons">
            ${app.url ? `<button class="action-btn view" onclick="historyController.openJobUrl('${app.url}')">View</button>` : ''}
            <button class="action-btn edit" onclick="historyController.editApplication('${app.id}')">Edit</button>
            <button class="action-btn delete" onclick="historyController.deleteApplication('${app.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredApplications.length / this.pageSize);
    
    if (totalPages <= 1) {
      this.paginationSection.style.display = 'none';
      return;
    }
    
    this.paginationSection.style.display = 'flex';
    this.prevPage.disabled = this.currentPage === 1;
    this.nextPage.disabled = this.currentPage === totalPages;
    this.pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.filteredApplications.length / this.pageSize);
    
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.renderTable();
      this.updatePagination();
    }
  }

  clearAllFilters() {
    this.statusFilter.value = '';
    this.dateFilter.value = '';
    this.searchFilter.value = '';
    this.applyFilters();
  }

  editApplication(id) {
    const application = this.applications.find(app => app.id === id);
    if (!application) return;
    
    this.currentEditId = id;
    
    // Populate form
    document.getElementById('editJobTitle').value = application.jobTitle || '';
    document.getElementById('editCompany').value = application.company || '';
    document.getElementById('editStatus').value = application.status || 'Applied';
    document.getElementById('editJobId').value = application.jobId || '';
    document.getElementById('editUrl').value = application.url || '';
    document.getElementById('editNotes').value = application.notes || '';
    
    this.showEditModal();
  }

  async saveEditedApplication(e) {
    e.preventDefault();
    
    const updatedData = {
      id: this.currentEditId,
      jobTitle: document.getElementById('editJobTitle').value,
      company: document.getElementById('editCompany').value,
      status: document.getElementById('editStatus').value,
      jobId: document.getElementById('editJobId').value,
      url: document.getElementById('editUrl').value,
      notes: document.getElementById('editNotes').value
    };
    
    try {
      // Update in memory first
      const index = this.applications.findIndex(app => app.id === this.currentEditId);
      if (index !== -1) {
        this.applications[index] = { ...this.applications[index], ...updatedData };
      }
      
      // Save to storage
      await chrome.storage.sync.set({ jobApplications: this.applications });
      
      this.hideEditModal();
      this.applyFilters();
      this.updateStats();
    } catch (error) {
      console.error('Failed to save edited application:', error);
      this.showError('Failed to save changes');
    }
  }

  async saveNewApplication(e) {
    e.preventDefault();
    
    const newApplication = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      jobTitle: document.getElementById('addJobTitle').value,
      company: document.getElementById('addCompany').value,
      status: document.getElementById('addStatus').value,
      jobId: document.getElementById('addJobId').value,
      url: document.getElementById('addUrl').value,
      notes: document.getElementById('addNotes').value,
      manual: true
    };
    
    try {
      const response = await this.sendMessage({
        action: 'saveJobApplication',
        data: newApplication
      });
      
      if (response.success) {
        this.hideAddModal();
        await this.loadApplications();
      } else {
        this.showError('Failed to save application');
      }
    } catch (error) {
      console.error('Failed to save new application:', error);
      this.showError('Failed to save application');
    }
  }

  async deleteApplication(id) {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    try {
      const response = await this.sendMessage({ 
        action: 'deleteApplication', 
        id: id 
      });
      
      if (response.success) {
        await this.loadApplications();
      } else {
        this.showError('Failed to delete application');
      }
    } catch (error) {
      console.error('Failed to delete application:', error);
      this.showError('Failed to delete application');
    }
  }

  openJobUrl(url) {
    window.open(url, '_blank');
  }

  async exportToCSV() {
    try {
      const response = await this.sendMessage({ action: 'exportToCSV' });
      
      if (response.success && response.data) {
        this.downloadCSV(response.data);
      } else {
        this.showError('No data to export or export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showError('Failed to export data');
    }
  }

  downloadCSV(csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showEditModal() {
    this.editModal.style.display = 'flex';
  }

  hideEditModal() {
    this.editModal.style.display = 'none';
    this.editForm.reset();
    this.currentEditId = null;
  }

  showAddModal() {
    this.addModal.style.display = 'flex';
  }

  hideAddModal() {
    this.addModal.style.display = 'none';
    this.addForm.reset();
  }

  showLoading() {
    this.loadingOverlay.style.display = 'flex';
  }

  hideLoading() {
    this.loadingOverlay.style.display = 'none';
  }

  showError(message) {
    alert(message);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize history controller when DOM is loaded
let historyController;
document.addEventListener('DOMContentLoaded', () => {
  historyController = new HistoryController();
});
