function initUsername(user) {
  if (!user) return;

  // ── Populate account info card ──────────────────────────────────────────
  const accountUsername = document.getElementById('accountUsername');
  const accountEmail    = document.getElementById('accountEmail');
  const accountSince    = document.getElementById('accountSince');

  if (accountUsername) accountUsername.textContent = user.username;
  if (accountEmail)    accountEmail.textContent    = user.email;
  if (accountSince)    accountSince.textContent    = formatMemberSince(user.created_at);

  // ── Greeting ────────────────────────────────────────────────────────────
  const usernameDisplay = document.getElementById('usernameDisplay');
  const greetingSub     = document.getElementById('greetingSub');

  let currentUsername = user.username || 'there';
  if (usernameDisplay) usernameDisplay.textContent = currentUsername;

  if (greetingSub) {
    const h = new Date().getHours();
    const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    greetingSub.textContent = `${tod}. Here's what's happening in your factory.`;
  }

  // ── Username inline edit ────────────────────────────────────────────────
  const usernameBtn    = document.getElementById('usernameBtn');
  const editWrap       = document.getElementById('usernameEditWrap');
  const input          = document.getElementById('usernameInput');
  const saveBtn        = document.getElementById('usernameSaveBtn');
  const cancelBtn      = document.getElementById('usernameCancelBtn');
  const errorEl        = document.getElementById('usernameEditError');

  if (usernameBtn && editWrap && input) {
    usernameBtn.addEventListener('click', () => {
      input.value = currentUsername;
      saveBtn.disabled = true;
      if (errorEl) errorEl.hidden = true;
      editWrap.hidden = false;
      requestAnimationFrame(() => { input.focus(); input.select(); });
    });

    input.addEventListener('input', () => {
      const val = input.value.trim();
      saveBtn.disabled = val === currentUsername || val.length === 0;
      if (errorEl && !errorEl.hidden) errorEl.hidden = true;
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeEdit();
      if (e.key === 'Enter') saveBtn?.click();
    });

    cancelBtn?.addEventListener('click', closeEdit);

    saveBtn?.addEventListener('click', async () => {
      const newUsername = input.value.trim();

      if (!newUsername) {
        showEditError('Name cannot be empty.');
        return;
      }
      if (newUsername.length < 2) {
        showEditError('Name must be at least 2 characters.');
        return;
      }
      // Postgres VARCHAR(50) limit
      if (newUsername.length > 50) {
        showEditError('Name must be 50 characters or fewer.');
        return;
      }

      saveBtn.disabled = true;
      const originalLabel = saveBtn.textContent;
      saveBtn.textContent = 'Saving…';

      try {
        await apiFetch('/auth/me', {
          method: 'PATCH',
          body: JSON.stringify({ username: newUsername }),
        });

        // Update all username displays in one place
        currentUsername = newUsername;
        if (usernameDisplay) usernameDisplay.textContent = newUsername;
        if (accountUsername) accountUsername.textContent = newUsername;
        closeEdit();

      } catch (err) {
        showEditError(err.message || 'Failed to update. Please try again.');
        saveBtn.disabled = false;
        saveBtn.textContent = originalLabel;
      }
    });
  }

  function closeEdit() {
    if (editWrap) editWrap.hidden = true;
    if (input)    input.value = '';
    if (errorEl)  errorEl.hidden = true;
  }

  function showEditError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  // ── Delete account flow ─────────────────────────────────────────────────
  const deleteAccountBtn    = document.getElementById('deleteAccountBtn');
  const deleteConfirm       = document.getElementById('deleteConfirm');
  const deleteConfirmInput  = document.getElementById('deleteConfirmInput');
  const deleteConfirmOk     = document.getElementById('deleteConfirmOk');
  const deleteConfirmCancel = document.getElementById('deleteConfirmCancel');

  if (deleteAccountBtn && deleteConfirm) {
    deleteAccountBtn.addEventListener('click', () => {
      deleteConfirm.hidden = false;
      deleteConfirmInput.value = '';
      deleteConfirmOk.disabled = true;
      requestAnimationFrame(() => deleteConfirmInput.focus());
    });

    deleteConfirmCancel?.addEventListener('click', () => {
      deleteConfirm.hidden = true;
      deleteConfirmInput.value = '';
      deleteConfirmOk.disabled = true;
    });

    deleteConfirmInput?.addEventListener('input', () => {
      deleteConfirmOk.disabled =
        deleteConfirmInput.value.trim().toLowerCase() !== accountEmail.textContent;
    });

    deleteConfirmOk?.addEventListener('click', async () => {
      if (deleteConfirmInput.value.trim().toLowerCase() !== accountEmail.textContent) return;

      const label   = deleteConfirmOk.querySelector('.btn-label');
      const spinner = deleteConfirmOk.querySelector('.btn-spinner');
      deleteConfirmOk.disabled = true;
      if (spinner) spinner.hidden = false;
      if (label)   label.style.opacity = '0.6';

      try {
        await apiFetch('/auth/me', { method: 'DELETE' });
        
        loadDashboard();

      } catch (err) {
        
        deleteConfirmOk.disabled = false;
        if (spinner) spinner.hidden = true;
        if (label)   label.style.opacity = '1';

        // Show error inside the confirm box
        const msg = document.createElement('p');
        msg.style.cssText = 'color:var(--danger);font-size:0.82rem;margin-top:0.4rem';
        msg.textContent = err.message || 'Delete failed. Please try again.';
        deleteConfirm.appendChild(msg);
        setTimeout(() => msg.remove(), 4000);
      }
    });
  }
}

// ── Utility ───────────────────────────────────────────────────────────────
function formatMemberSince(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}