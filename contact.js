const EMAILJS_CONFIG = Object.freeze({
  serviceId: 'service_hd9dyyc',
  templateId: 'template_5y7lpun',
  publicKey: 'zwaZOOV1u579ntzMr'
});

const COMPANY_CONTACT_EMAIL = 'hiwoteabebe9@gmail.com';

function getContactValue(form, name) {
  const namedField = form.elements.namedItem(name);
  if (namedField) return namedField.value.trim();
  const fallbackField = form.querySelector(`[id$="-${name}"]`);
  return fallbackField ? fallbackField.value.trim() : '';
}

function getFormMessage(form) {
  let message = form.querySelector('.form-success-message');
  if (!message) {
    message = document.createElement('div');
    message.className = 'form-success-message';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    form.appendChild(message);
  }
  return message;
}

function getEmailSubject(form) {
  const requestType = form.classList.contains('modal-contact-form')
    ? 'Quote Request'
    : 'Information Request';

  return `Hiwot Spice Website Form — ${requestType}`;
}

document.querySelectorAll('.contact-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalButtonText = button.textContent;
    const status = getFormMessage(form);
    const name = getContactValue(form, 'name');
    const email = getContactValue(form, 'email') || COMPANY_CONTACT_EMAIL;
    const phone = getContactValue(form, 'phone');
    const message = getContactValue(form, 'message');
    const subject = getEmailSubject(form);

    button.disabled = true;
    button.textContent = 'Sending...';
    status.classList.remove('show', 'error');

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_CONFIG.serviceId,
          template_id: EMAILJS_CONFIG.templateId,
          user_id: EMAILJS_CONFIG.publicKey,
          template_params: {
            subject,
            name,
            from_name: name,
            email,
            from_email: COMPANY_CONTACT_EMAIL,
            reply_to: COMPANY_CONTACT_EMAIL,
            phone,
            message
          }
        })
      });

      if (!response.ok) throw new Error(await response.text());

      status.innerHTML = '<strong>Thank you!</strong><span>Your enquiry has been sent successfully. We will contact you soon.</span>';
      status.classList.add('show');
      form.reset();
    } catch (error) {
      console.error('EmailJS submission failed:', error);
      status.innerHTML = '<strong>Message not sent</strong><span>Please try again shortly.</span>';
      status.classList.add('show', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalButtonText;
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});
