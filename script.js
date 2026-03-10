document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Starter form only. Connect this to your CRM or form handler in Cursor.');
    });
  });
});
