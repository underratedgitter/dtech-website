document.addEventListener('DOMContentLoaded', () => {
  // Shared drawer behavior, including keyboard focus and restoration.
  let returnFocus;
  const menu = document.getElementById('mobile-menu');
  const trigger = document.querySelector('.menu-button');
  window.toggleMobileMenu = () => {
    const opening = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !opening);
    trigger?.setAttribute('aria-expanded', String(opening));
    document.body.style.overflow = opening ? 'hidden' : '';
    if (opening) {
      returnFocus = document.activeElement;
      menu.querySelector('button[aria-label="Close menu drawer"]')?.focus();
    } else returnFocus?.focus();
  };
  document.addEventListener('keydown', event => {
    if (!menu || menu.classList.contains('hidden')) return;
    if (event.key === 'Escape') window.toggleMobileMenu();
    if (event.key === 'Tab') {
      const items = [...menu.querySelectorAll('a[href],button,summary')].filter(el => el.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
      if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
    }
  });
  const current = location.pathname.split('/').pop() || 'index.html';
  if (current === 'solutions.html') {
    document.querySelectorAll('.nav-dropdown summary').forEach(summary => {
      if (summary.textContent.trim().startsWith('Solutions')) summary.setAttribute('aria-current', 'page');
    });
  }
  menu?.querySelectorAll('a').forEach(link => {
    link.classList.remove('bg-blue-50','text-blue-700');
    if (link.getAttribute('href') === current) link.setAttribute('aria-current','page');
  });
  document.querySelectorAll('img').forEach(img => {
    if (!img.closest('.home-hero,.site-header')) img.loading = 'lazy';
  });

  const desktopDropdowns = [...document.querySelectorAll('.restored-nav .nav-dropdown')];
  desktopDropdowns.forEach(dropdown => {
    dropdown.addEventListener('toggle', () => {
      if (!dropdown.open) return;
      desktopDropdowns.forEach(other => {
        if (other !== dropdown) other.open = false;
      });
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.restored-nav .nav-dropdown')) {
      desktopDropdowns.forEach(dropdown => { dropdown.open = false; });
    }
  });
});
