// Dashboard functionality
class Dashboard {
  constructor() {
    this.init();
  }

  init() {
    if (!HealthSyncUtils.requireAuth()) return;
    
    this.loadUserData();
    this.setupEventListeners();
    this.updateDashboard();
    this.setupPageTransitions();
  }

  loadUserData() {
    const userData = HealthSyncUtils.getItem('user') || { name: 'User' };
    this.updateWelcomeMessage(userData.name);
  }

  updateWelcomeMessage(userName) {
    const greeting = HealthSyncUtils.getGreeting();
    document.getElementById('welcomeUser').textContent = `${greeting}, ${userName}!`;
    document.getElementById('userName').textContent = userName;
  }

  updateDashboard() {
    this.updateDate();
    this.loadVitals();
    this.loadMedications();
    this.loadAppointments();
    this.checkAlerts();
    this.loadRecentActivity();
  }

  updateDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent = 
      HealthSyncUtils.formatDate(now);
  }

  loadVitals() {
    const vitals = HealthSyncUtils.getItem('vitals') || [];
    if (vitals.length > 0) {
      const latest = vitals[vitals.length - 1];
      document.getElementById('bp').textContent = latest.bloodPressure || '120/80';
      document.getElementById('sugar').textContent = latest.bloodSugar || '95';
      document.getElementById('hr').textContent = latest.heartRate || '76';
    }
  }

  loadMedications() {
    const medications = HealthSyncUtils.getItem('medications') || [
      { name: 'Metformin', time: 'Morning' },
      { name: 'Atenolol', time: 'Night' }
    ];
    const medList = document.getElementById('medList');
    medList.innerHTML = medications.map(med => 
      `<li>${med.name} – ${med.time}</li>`
    ).join('');
  }

  loadAppointments() {
    const appointments = HealthSyncUtils.getItem('appointments') || [
      { doctor: 'Dr. Sharma', date: '2025-10-25' },
      { doctor: 'Eye Checkup', date: '2025-10-31' }
    ];
    const apptList = document.getElementById('apptList');
    apptList.innerHTML = appointments.map(appt => 
      `<li>${appt.doctor} – ${HealthSyncUtils.formatDate(appt.date)}</li>`
    ).join('');
  }

  checkAlerts() {
    const vitals = HealthSyncUtils.getItem('vitals') || [];
    if (vitals.length === 0) {
      return;
    }

    const latest = vitals[vitals.length - 1];
    const alerts = [];

    // Check blood pressure
    if (latest.bloodPressure) {
      const [systolic, diastolic] = latest.bloodPressure.split('/').map(Number);
      if (systolic > 140 || diastolic > 90) {
        alerts.push('High blood pressure detected');
      }
    }

    // Check blood sugar
    if (latest.bloodSugar > 140) {
      alerts.push('High blood sugar level');
    }

    // Update alert box
    const alertBox = document.getElementById('alertBox');
    if (alerts.length > 0) {
      alertBox.innerHTML = alerts.map(alert => 
        `<p>⚠️ ${alert}</p>`
      ).join('');
      alertBox.style.borderLeftColor = 'var(--warning-orange)';
    } else {
      alertBox.innerHTML = '<p>No abnormal vitals detected ✅</p>';
      alertBox.style.borderLeftColor = 'var(--primary-green)';
    }
  }

  loadRecentActivity() {
    const activities = HealthSyncUtils.getItem('activities') || [
      { time: new Date(Date.now() - 2 * 60 * 60 * 1000), text: 'Recorded blood pressure: 120/80 mmHg' },
      { time: new Date(Date.now() - 5 * 60 * 60 * 1000), text: 'Took medication: Metformin' }
    ];

    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <span class="activity-time">${this.formatActivityTime(activity.time)}</span>
        <span class="activity-text">${activity.text}</span>
      </div>
    `).join('');
  }

  formatActivityTime(time) {
    const now = new Date();
    const activityTime = new Date(time);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return HealthSyncUtils.formatDate(time);
    }
  }

  setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        AuthService.logout();
      }
    });
  }

  setupPageTransitions() {
    // Smooth page transitions
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.includes('logout')) return;

        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });

    // Page load animation
    window.addEventListener('load', () => {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});