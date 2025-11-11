// Vitals tracking functionality
class VitalsTracker {
  constructor() {
    this.init();
  }

  init() {
    if (!HealthSyncUtils.requireAuth()) return;
    
    this.setupEventListeners();
    this.loadLastRecorded();
    this.setupBMIcalculation();
  }

  setupEventListeners() {
    const form = document.getElementById('vitalsForm');
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // BMI auto-calculation
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const bmiInput = document.getElementById('bmi');

    [weightInput, heightInput].forEach(input => {
      input.addEventListener('input', () => {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        
        if (weight && height) {
          const bmi = HealthSyncUtils.calculateBMI(weight, height);
          bmiInput.value = bmi;
        } else {
          bmiInput.value = '';
        }
      });
    });

    // CSV import
    const csvFileInput = document.getElementById('csvFile');
    csvFileInput.addEventListener('change', (e) => this.handleCSVImport(e));
  }

  setupBMIcalculation() {
    // Load last recorded weight and height to pre-fill
    const vitals = HealthSyncUtils.getItem('vitals') || [];
    if (vitals.length > 0) {
      const latest = vitals[vitals.length - 1];
      if (latest.weight) document.getElementById('weight').value = latest.weight;
      if (latest.height) document.getElementById('height').value = latest.height;
      
      // Calculate BMI if both are present
      if (latest.weight && latest.height) {
        const bmi = HealthSyncUtils.calculateBMI(latest.weight, latest.height);
        document.getElementById('bmi').value = bmi;
      }
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
      sugarBefore: document.getElementById('sugarBefore').value,
      sugarAfter: document.getElementById('sugarAfter').value,
      bpSys: document.getElementById('bpSys').value,
      bpDia: document.getElementById('bpDia').value,
      heartRate: document.getElementById('heartRate').value,
      temperature: document.getElementById('temperature').value,
      weight: document.getElementById('weight').value,
      height: document.getElementById('height').value,
      bmi: document.getElementById('bmi').value,
      timestamp: new Date().toISOString()
    };

    // Validate at least one field is filled
    const hasData = Object.values(formData).some(value => 
      value && value !== '' && (typeof value !== 'string' || value.trim() !== '')
    );

    if (!hasData) {
      this.showAlert('Please fill in at least one vital sign', 'error');
      return;
    }

    // Format blood pressure
    if (formData.bpSys && formData.bpDia) {
      formData.bloodPressure = `${formData.bpSys}/${formData.bpDia}`;
    }

    // Save to localStorage
    const existingVitals = HealthSyncUtils.getItem('vitals') || [];
    existingVitals.push(formData);
    HealthSyncUtils.setItem('vitals', existingVitals);

    // Update UI
    this.showAlert('Vitals recorded successfully!', 'success');
    this.updateLastRecorded();
    this.generateAISuggestions(formData);
    this.checkThresholds(formData);

    // Reset form
    document.getElementById('vitalsForm').reset();
    document.getElementById('bmi').value = '';
  }

  showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
    alertBox.style.borderLeftColor = type === 'error' ? 'var(--danger-red)' : 'var(--primary-green)';
    
    setTimeout(() => {
      alertBox.textContent = 'No alerts currently.';
      alertBox.className = 'alert-box';
      alertBox.style.borderLeftColor = 'var(--primary-green)';
    }, 5000);
  }

  updateLastRecorded() {
    const now = new Date();
    document.getElementById('timestamp').textContent = 
      `${HealthSyncUtils.formatDate(now)} ${HealthSyncUtils.formatTime(now)}`;
  }

  loadLastRecorded() {
    const vitals = HealthSyncUtils.getItem('vitals') || [];
    if (vitals.length > 0) {
      const latest = vitals[vitals.length - 1];
      this.updateLastRecorded();
    }
  }

  generateAISuggestions(formData) {
    const suggestions = [];
    const aiBox = document.getElementById('aiBox');

    // Blood pressure suggestions
    if (formData.bpSys && formData.bpDia) {
      const systolic = parseInt(formData.bpSys);
      const diastolic = parseInt(formData.bpDia);
      
      if (systolic > 140 || diastolic > 90) {
        suggestions.push('Consider reducing salt intake and increasing physical activity');
      } else if (systolic < 90 || diastolic < 60) {
        suggestions.push('Make sure to stay hydrated and consider increasing salt intake slightly');
      }
    }

    // Blood sugar suggestions
    if (formData.sugarAfter && formData.sugarAfter > 180) {
      suggestions.push('Post-meal sugar is elevated. Consider a short walk after meals.');
    }

    // BMI suggestions
    if (formData.bmi) {
      const bmi = parseFloat(formData.bmi);
      if (bmi > 25) {
        suggestions.push('Your BMI suggests working on weight management through diet and exercise');
      } else if (bmi < 18.5) {
        suggestions.push('Your BMI is low. Focus on nutrient-dense foods and strength training');
      }
    }

    if (suggestions.length > 0) {
      aiBox.innerHTML = '<h4>💡 AI Health Suggestions:</h4>' + 
        suggestions.map(s => `<p>• ${s}</p>`).join('');
    } else {
      aiBox.innerHTML = '💡 Your vitals look good! Keep maintaining your healthy habits.';
    }
  }

  checkThresholds(formData) {
    const bpThreshold = document.getElementById('bpThreshold').value;
    const sugarThreshold = document.getElementById('sugarThreshold').value;
    const alerts = [];

    if (bpThreshold && formData.bpSys) {
      if (parseInt(formData.bpSys) > parseInt(bpThreshold)) {
        alerts.push(`Blood pressure (${formData.bpSys}) exceeds your threshold (${bpThreshold})`);
      }
    }

    if (sugarThreshold && formData.sugarAfter) {
      if (parseInt(formData.sugarAfter) > parseInt(sugarThreshold)) {
        alerts.push(`Blood sugar (${formData.sugarAfter}) exceeds your threshold (${sugarThreshold})`);
      }
    }

    if (alerts.length > 0) {
      this.showAlert(alerts.join('. ') + '.', 'warning');
    }
  }

  handleCSVImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target.result;
        const vitals = this.parseCSV(csvData);
        
        // Save imported data
        const existingVitals = HealthSyncUtils.getItem('vitals') || [];
        const updatedVitals = [...existingVitals, ...vitals];
        HealthSyncUtils.setItem('vitals', updatedVitals);
        
        this.showAlert(`Successfully imported ${vitals.length} records from CSV`, 'success');
        this.updateLastRecorded();
      } catch (error) {
        this.showAlert('Error parsing CSV file', 'error');
      }
    };
    reader.readAsText(file);
  }

  parseCSV(csvText) {
    // Simple CSV parser - in a real app, you'd use a proper CSV parsing library
    const lines = csvText.split('\n');
    const vitals = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const cells = lines[i].split(',');
      if (cells.length >= 3) {
        vitals.push({
          bloodPressure: cells[0],
          bloodSugar: cells[1],
          heartRate: cells[2],
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return vitals;
  }
}

// Initialize vitals tracker
document.addEventListener('DOMContentLoaded', () => {
  new VitalsTracker();
});