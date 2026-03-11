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
  const footer = document.querySelector('.site-footer');

  function toggleStickyBar() {
    const scrollY = window.scrollY || window.pageYOffset;
    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
    const footerInView = footerTop < window.innerHeight;
    const pastHero = scrollY > 400;
    if (pastHero && !footerInView) {
      stickyBar.classList.add('visible');
      stickyBar.setAttribute('aria-hidden', 'false');
    } else {
      stickyBar.classList.remove('visible');
      stickyBar.setAttribute('aria-hidden', 'true');
    }
  }

  window.addEventListener('scroll', () => { requestAnimationFrame(toggleStickyBar); }, { passive: true });
  if (footer) {
    const obs = new IntersectionObserver(() => requestAnimationFrame(toggleStickyBar), { threshold: 0, rootMargin: '0px' });
    obs.observe(footer);
  }
  toggleStickyBar();
});
