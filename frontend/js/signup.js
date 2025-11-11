// Signup functionality
document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');

  // Check if user is already logged in
  if (HealthSyncUtils.isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return;
  }

  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    // Validation
    if (!name || !email || !password || !confirm) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    if (!HealthSyncUtils.validateEmail(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirm) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    // Show loading state
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    try {
      const result = await AuthService.signup(name, email, password);
      
      if (result.success) {
        showMessage('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('An error occurred during signup', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.signup-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message element
    const messageEl = document.createElement('div');
    messageEl.className = `signup-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      background: ${type === 'error' ? '#ffe6e6' : '#e6ffed'};
      color: ${type === 'error' ? '#d63031' : '#00b894'};
      border: 2px solid ${type === 'error' ? '#ff7675' : '#55efc4'};
    `;

    signupForm.insertBefore(messageEl, signupForm.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }

  // Add page transition
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });
});