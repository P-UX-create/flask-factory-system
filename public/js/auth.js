document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initForgotForm();
  initResetForm();
});

function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Hide' : 'Show';
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
}

function showAlert(message) {
  const alertEl = document.getElementById('formAlert');
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.hidden = false;
}

function hideAlert() {
  const alertEl = document.getElementById('formAlert');
  if (!alertEl) return;
  alertEl.hidden = true;
  alertEl.textContent = '';
}

function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.toggle('is-invalid', Boolean(message));
  if (errorEl) errorEl.textContent = message || '';
}

function clearAllFieldErrors(fieldIds) {
  fieldIds.forEach(id => setFieldError(id, ''));
}

function setSubmitting(submitBtn, isSubmitting) {
  const label = submitBtn.querySelector('.btn-label');
  const spinner = submitBtn.querySelector('.btn-spinner');
  submitBtn.disabled = isSubmitting;
  if (spinner) spinner.hidden = !isSubmitting;
  if (label) label.style.opacity = isSubmitting ? '0.6' : '1';
}

async function submitJSON(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
  }

  if (!response.ok) {
    const message = (data && data.message) || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return data;
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const fieldIds = ['email', 'password'];

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();
    clearAllFieldErrors(fieldIds);

    const email = form.email.value.trim();
    const password = form.password.value;

    let hasError = false;
    if (!email) { setFieldError('email', 'Email is required.'); hasError = true; }
    if (!password) { setFieldError('password', 'Password is required.'); hasError = true; }
    if (hasError) return;

    setSubmitting(submitBtn, true);
    try {
      await submitJSON('/auth/login', { email, password });
      window.location.replace('/dashboard');
    } catch (err) {
      showAlert(err.message || 'Login failed. Check your username and password.');
      setSubmitting(submitBtn, false);
    }
  });
}

function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const fieldIds = ['email', 'username', 'password', 'confirmPassword'];

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();
    clearAllFieldErrors(fieldIds);

    const email = form.email.value.trim();
    const username = form.username.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    let hasError = false;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setFieldError('email', 'Email is required.'); hasError = true;
    } else if (!emailPattern.test(email)) {
      setFieldError('email', 'Enter a valid email address.'); hasError = true;
    }

    if (!username) {
      setFieldError('username', 'Username is required.'); hasError = true;
    } else if (username.length < 3) {
      setFieldError('username', 'Username must be at least 3 characters.'); hasError = true;
    }

    if (!password) {
      setFieldError('password', 'Password is required.'); hasError = true;
    } else if (password.length < 6) {
      setFieldError('password', 'Password must be at least 6 characters.'); hasError = true;
    }

    if (!confirmPassword) {
      setFieldError('confirmPassword', 'Please confirm your password.'); hasError = true;
    } else if (password && confirmPassword !== password) {
      setFieldError('confirmPassword', 'Passwords do not match.'); hasError = true;
    }

    if (hasError) return;

    setSubmitting(submitBtn, true);
    try {
      await submitJSON('/auth/signup', { email, username, password });
      window.location.replace('/dashboard');
    } catch (err) {
      showAlert(err.message || 'Sign up failed. Please try again.');
      setSubmitting(submitBtn, false);
    }
  });
}

function initForgotForm() {
  const form = document.getElementById('forgotForm');
  if (!form) return;

  const submitBtn  = document.getElementById('submitBtn');
  const sentToSpan = document.getElementById('sentToEmail');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();
    clearAllFieldErrors(['email']);

    const email = form.email.value.trim();

    if (!email) {
      setFieldError('email', 'Email is required.'); return;
    }
    if (!emailPattern.test(email)) {
      setFieldError('email', 'Enter a valid email address.'); return;
    }

    setSubmitting(submitBtn, true);
    try {
      await submitJSON('/auth/forgot-password', { email });
      if (sentToSpan) sentToSpan.textContent = email;
      showView('viewSuccess');
    } catch (err) {
      if (sentToSpan) sentToSpan.textContent = email;
      showView('viewSuccess');
    }
  });
}

function initResetForm() {
  const form = document.getElementById('resetForm');
  if (!form) return;

  const token = extractResetToken();

  if (!token) {
    showView('viewInvalidToken');
    return;
  }

  showView('viewForm');

  const submitBtn    = document.getElementById('submitBtn');
  const goToLoginBtn = document.getElementById('goToLoginBtn');

  if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', () => {
      window.location.replace('/login');
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();
    clearAllFieldErrors(['password', 'confirmPassword']);

    const password        = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    let hasError = false;
    if (!password) {
      setFieldError('password', 'Password is required.'); hasError = true;
    } else if (password.length < 6) {
      setFieldError('password', 'Password must be at least 6 characters.'); hasError = true;
    }
    if (!confirmPassword) {
      setFieldError('confirmPassword', 'Please confirm your new password.'); hasError = true;
    } else if (confirmPassword !== password) {
      setFieldError('confirmPassword', 'Passwords do not match.'); hasError = true;
    }
    if (hasError) return;

    setSubmitting(submitBtn, true);
    try {
      await submitJSON(`/auth/reset-password/${token}`, { password });
      showView('viewSuccess');
    } catch (err) {
      showAlert(err.message || 'Reset failed. This link may have expired.');
      setSubmitting(submitBtn, false);
    }
  });
}

function extractResetToken() {
  const pathMatch = window.location.pathname.match(/\/reset-password\/([^/?#]+)/);
  if (pathMatch && pathMatch[1]) return pathMatch[1];

  const queryToken = new URLSearchParams(window.location.search).get('token');
  if (queryToken) return queryToken;

  return null;
}

function showView(viewId) {
  ['viewForm', 'viewSuccess', 'viewInvalidToken'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = el.id !== viewId;
  });
}