/* ============================================
   CONTACT FORM
   Formspree submission with terminal-style
   status messages
   ============================================ */

(function() {
  var form = document.getElementById('contact-form');
  var submitBtn = document.getElementById('submit-btn');
  var statusEl = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var originalText = submitBtn.textContent;
    submitBtn.textContent = '[ SENDING... ]';
    submitBtn.disabled = true;
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    var formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(function(response) {
      if (response.ok) {
        statusEl.textContent = '> Message sent successfully. You will be contacted.';
        statusEl.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    }).catch(function() {
      statusEl.textContent = '> ERROR: Message failed to send. Try emailing directly.';
      statusEl.className = 'form-status error';
    }).finally(function() {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });
})();
