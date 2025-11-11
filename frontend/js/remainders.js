// Medication reminders functionality
class MedicationReminders {
  constructor() {
    this.medications = [];
    this.init();
  }

  init() {
    if (!HealthSyncUtils.requireAuth()) return;
    
    this.loadMedications();
    this.setupEventListeners();
    this.renderMedications();
  }

  loadMedications() {
    this.medications = HealthSyncUtils.getItem('medications') || [
      {
        id: 1,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice',
        time: '08:00',
        instructions: 'Take with breakfast'
      },
      {
        id: 2,
        name: 'Atenolol',
        dosage: '25mg',
        frequency: 'daily',
        time: '20:00',
        instructions: 'Take at bedtime'
      }
    ];
  }

  setupEventListeners() {
    const form = document.getElementById('medicationForm');
    form.addEventListener('submit', (e) => this.handleAddMedication(e));

    // Notification settings
    const pushCheckbox = document.getElementById('pushNotifications');
    const emailCheckbox = document.getElementById('emailReminders');
    const advanceInput = document.getElementById('reminderAdvance');

    [pushCheckbox, emailCheckbox, advanceInput].forEach(element => {
      element.addEventListener('change', () => this.saveSettings());
    });

    // Load settings
    this.loadSettings();
  }

  handleAddMedication(e) {
    e.preventDefault();
    
    const formData = {
      id: Date.now(),
      name: document.getElementById('medName').value,
      dosage: document.getElementById('dosage').value,
      frequency: document.getElementById('frequency').value,
      time: document.getElementById('medTime').value,
      instructions: document.getElementById('instructions').value
    };

    this.medications.push(formData);
    HealthSyncUtils.setItem('medications', this.medications);
    
    this.renderMedications();
    document.getElementById('medicationForm').reset();
    
    this.showMessage('Medication added successfully!', 'success');
  }

  renderMedications() {
    const container = document.getElementById('medicationsContainer');
    
    if (this.medications.length === 0) {
      container.innerHTML = '<p class="no-medications">No medications added yet.</p>';
      return;
    }

    container.innerHTML = this.medications.map(med => `
      <div class="medication-card" data-id="${med.id}">
        <div class="medication-header">
          <span class="medication-name">${med.name}</span>
          <button class="btn-delete" onclick="reminders.deleteMedication(${med.id})">×</button>
        </div>
        <div class="medication-dosage">${med.dosage}</div>
        <div class="medication-schedule">
          <span class="frequency">${this.getFrequencyText(med.frequency)}</span>
          <span class="time">at ${med.time}</span>
        </div>
        ${med.instructions ? `<div class="medication-instructions">${med.instructions}</div>` : ''}
        <div class="medication-actions">
          <button class="btn-small" onclick="reminders.toggleMedication(${med.id})">Mark Taken</button>
        </div>
      </div>
    `).join('');
  }

  getFrequencyText(frequency) {
    const frequencyMap = {
      daily: 'Daily',
      twice: 'Twice daily',
      weekly: 'Weekly',
      as_needed: 'As needed'
    };
    return frequencyMap[frequency] || frequency;
  }

  deleteMedication(id) {
    if (confirm('Are you sure you want to delete this medication?')) {
      this.medications = this.medications.filter(med => med.id !== id);
      HealthSyncUtils.setItem('medications', this.medications);
      this.renderMedications();
      this.showMessage('Medication deleted successfully!', 'success');
    }
  }

  toggleMedication(id) {
    // In a real app, this would track medication adherence
    this.showMessage('Medication marked as taken!', 'success');
    
    // Record activity
    const medication = this.medications.find(med => med.id === id);
    const activities = HealthSyncUtils.getItem('activities') || [];
    activities.push({
      time: new Date().toISOString(),
      text: `Took medication: ${medication.name}`
    });
    HealthSyncUtils.setItem('activities', activities);
  }

  loadSettings() {
    const settings = HealthSyncUtils.getItem('reminderSettings') || {
      pushNotifications: true,
      emailReminders: false,
      reminderAdvance: 15
    };

    document.getElementById('pushNotifications').checked = settings.pushNotifications;
    document.getElementById('emailReminders').checked = settings.emailReminders;
    document.getElementById('reminderAdvance').value = settings.reminderAdvance;
  }

  saveSettings() {
    const settings = {
      pushNotifications: document.getElementById('pushNotifications').checked,
      emailReminders: document.getElementById('emailReminders').checked,
      reminderAdvance: parseInt(document.getElementById('reminderAdvance').value)
    };

    HealthSyncUtils.setItem('reminderSettings', settings);
    this.showMessage('Settings saved successfully!', 'success');
  }

  showMessage(message, type) {
    // Simple message display - you could enhance this with a proper notification system
    const existingMessage = document.querySelector('.reminder-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `reminder-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      border-radius: 8px;
      font-weight: 600;
      background: ${type === 'error' ? '#ffe6e6' : '#e6ffed'};
      color: ${type === 'error' ? '#d63031' : '#00b894'};
      border: 2px solid ${type === 'error' ? '#ff7675' : '#55efc4'};
      z-index: 1000;
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }
}

// Initialize reminders
let reminders;
document.addEventListener('DOMContentLoaded', () => {
  reminders = new MedicationReminders();
});