document.addEventListener('DOMContentLoaded', () => {
  const search = document.querySelector('#search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('.ad-item').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }
  const refreshBtn = document.querySelector('#refreshCaptcha');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/captcha');
        const data = await res.json();
        document.getElementById('captchaBox').innerText = data.captcha;
      } catch (e) { console.error(e); }
    });
  }
  const toggle = document.querySelector('#navbarToggle');
  const nav = document.querySelector('#mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
});
