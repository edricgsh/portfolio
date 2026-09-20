(() => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.toggleAttribute('data-open', !open);
    });
  }

  const copyButton = document.querySelector('[data-copy-email]');
  if (copyButton && navigator.clipboard) {
    copyButton.addEventListener('click', async () => {
      await navigator.clipboard.writeText('edricgan.44@gmail.com');
      const original = copyButton.textContent;
      copyButton.textContent = 'Email copied';
      window.setTimeout(() => { copyButton.textContent = original; }, 1800);
    });
  }
})();
