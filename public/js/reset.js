document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initPasswordToggles();

  // ── Token validation ───────────────────────────────────────────────────────
  const params      = new URLSearchParams(window.location.search);
  const token       = params.get('token');
  const TOKEN_RE    = /^[a-f0-9]{64}$/i;

  const invalidView = document.getElementById('invalidView');
  const formView    = document.getElementById('formView');
  const successView = document.getElementById('successView');

  if (!token || !TOKEN_RE.test(token)) {
    invalidView.hidden = false;
    return;
  }

  formView.hidden = false;

  // ── Form logic ─────────────────────────────────────────────────────────────
  const form            = document.getElementById('resetForm');
  const submitBtn       = document.getElementById('submitBtn');
  const formAlert       = document.getElementById('formAlert');
  const passwordInput   = document.getElementById('password');
  const confirmInput    = document.getElementById('confirmPassword');
  const passwordError   = document.getElementById('passwordError');
  const confirmError    = document.getElementById('confirmPasswordError');

  function showAlert(msg) {
    formAlert.textContent = msg;
    formAlert.hidden = false;
  }

  function hideAlert() {
    formAlert.textContent = '';
    formAlert.hidden = true;
  }

  function setFieldError(input, errorEl, msg) {
    input.classList.toggle('is-invalid', Boolean(msg));
    errorEl.textContent = msg || '';
  }

  function setSubmitting(active) {
    submitBtn.disabled = active;
    submitBtn.querySelector('.btn-spinner').hidden = !active;
    submitBtn.querySelector('.btn-label').style.opacity = active ? '0.6' : '1';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    setFieldError(passwordInput, passwordError, '');
    setFieldError(confirmInput, confirmError, '');

    const password        = passwordInput.value;
    const confirmPassword = confirmInput.value;
    let hasError          = false;

    if (!password) {
      setFieldError(passwordInput, passwordError, 'Password is required.');
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      hasError = true;
    }

    if (!confirmPassword) {
      setFieldError(confirmInput, confirmError, 'Please confirm your password.');
      hasError = true;
    } else if (password && confirmPassword !== password) {
      setFieldError(confirmInput, confirmError, 'Passwords do not match.');
      hasError = true;
    }

    if (hasError) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, newPassword: password }),
      });

      let data = null;
      try { data = await res.json(); } catch { }

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(
            (data && data.message) ||
            'This link is invalid or has expired. Please request a new one.'
          );
        }
        throw new Error(
          (data && data.message) || 'Something went wrong. Please try again.'
        );
      }

      formView.hidden = true;
      successView.hidden = false;
      setTimeout(() => window.location.replace('/login'), 2500);

    } catch (err) {
      showAlert(err.message);
      setSubmitting(false);
    }
  });
});

// ── Shared utility ───────────────────────────────────────────────────────────
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });
}