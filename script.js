document.addEventListener('DOMContentLoaded', () => {
  // Home page: mobile hamburger menu
  const navRoot = document.querySelector('.site-header .nav');
  const toggleBtn = document.querySelector('.nav-toggle');
  const backdrop = document.getElementById('nav-backdrop');
  const menu = document.getElementById('primary-nav');

  function closeHomeNav() {
    if (!navRoot || !toggleBtn) return;
    navRoot.classList.remove('nav-open');
    document.body.classList.remove('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Open menu');
    if (backdrop) backdrop.hidden = true;
  }

  function openHomeNav() {
    if (!navRoot || !toggleBtn) return;
    navRoot.classList.add('nav-open');
    document.body.classList.add('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Close menu');
    if (backdrop) backdrop.hidden = false;
  }

  if (toggleBtn && navRoot && menu) {
    toggleBtn.addEventListener('click', () => {
      if (navRoot.classList.contains('nav-open')) closeHomeNav();
      else openHomeNav();
    });
    if (backdrop) {
      backdrop.addEventListener('click', closeHomeNav);
    }
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeHomeNav);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeHomeNav();
    });
  }

  const forms = document.querySelectorAll('form');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const action = (form.getAttribute('action') || '').toLowerCase();
      if (action.includes('formspree.io')) return;
      event.preventDefault();
      alert('Starter form only. Connect this to your CRM or form handler in Cursor.');
    });
  });

  // Sticky CTA bar: show when user scrolls past hero
  const referralPath = window.location.pathname.includes('/blog/') ? '../referral-form.html' : 'referral-form.html';
  const stickyHtml = `
    <div class="sticky-cta-bar" id="sticky-cta" aria-hidden="true">
      <div class="container">
        <a href="${referralPath}" class="btn btn-primary">Send a Deal</a>
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
