document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form        = document.getElementById('forgotForm');
  const submitBtn   = document.getElementById('submitBtn');
  const formAlert   = document.getElementById('formAlert');
  const emailInput  = document.getElementById('email');
  const emailError  = document.getElementById('emailError');
  const formView    = document.getElementById('formView');
  const successView = document.getElementById('successView');
  const sentTo      = document.getElementById('sentTo');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showAlert(msg) {
    formAlert.textContent = msg;
    formAlert.hidden = false;
  }

  function hideAlert() {
    formAlert.textContent = '';
    formAlert.hidden = true;
  }

  function setSubmitting(active) {
    submitBtn.disabled = active;
    submitBtn.querySelector('.btn-spinner').hidden = !active;
    submitBtn.querySelector('.btn-label').style.opacity = active ? '0.6' : '1';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    emailInput.classList.remove('is-invalid');
    emailError.textContent = '';

    const email = emailInput.value.trim();

    if (!email) {
      emailInput.classList.add('is-invalid');
      emailError.textContent = 'Email is required.';
      emailInput.focus();
      return;
    }
    if (!EMAIL_RE.test(email)) {
      emailInput.classList.add('is-invalid');
      emailError.textContent = 'Enter a valid email address.';
      emailInput.focus();
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(
          (data && data.message) || 'Something went wrong. Please try again.'
        );
      }

      if (sentTo) sentTo.textContent = email;
      formView.hidden = true;
      successView.hidden = false;

    } catch (err) {
      showAlert(err.message);
      setSubmitting(false);
    }
  });
});