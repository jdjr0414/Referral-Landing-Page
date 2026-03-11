document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Starter form only. Connect this to your CRM or form handler in Cursor.');
    });
  });

  // Sticky CTA bar: show when user scrolls past hero
  const referralPath = window.location.pathname.includes('/blog/') ? '../referral-agreement.html' : 'referral-agreement.html';
  const stickyHtml = `
    <div class="sticky-cta-bar" id="sticky-cta" aria-hidden="true">
      <div class="container">
        <a href="${referralPath}#review" class="btn btn-primary">Send a Deal</a>
        <p>Ready to submit? Review the agreement and email us.</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', stickyHtml);

  const stickyBar = document.getElementById('sticky-cta');
  let lastScroll = 0;

  function toggleStickyBar() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 400) {
      stickyBar.classList.add('visible');
      stickyBar.setAttribute('aria-hidden', 'false');
    } else {
      stickyBar.classList.remove('visible');
      stickyBar.setAttribute('aria-hidden', 'true');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', () => { requestAnimationFrame(toggleStickyBar); }, { passive: true });
  toggleStickyBar();
});
