const words = ['Web Developer', 'Game Developer', 'Photographer', 'UI/UX Designer'];
const prefersReducedMotion = typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let wordIndex = 0;

function typeNextWord() {
  const typewriter = document.getElementById('typewriter');
  const letters = words[wordIndex].split('');

  function typeLetter() {
    if (letters.length) {
      typewriter.textContent += letters.shift();
      setTimeout(typeLetter, 120);
      return;
    }
    setTimeout(deleteLetter, 2000);
  }

  function deleteLetter() {
    if (letters.length < words[wordIndex].length) {
      letters.push(typewriter.textContent.slice(-1));
      typewriter.textContent = typewriter.textContent.slice(0, -1);
      setTimeout(deleteLetter, 60);
      return;
    }
    wordIndex = (wordIndex + 1) % words.length;
    typeNextWord();
  }

  typeLetter();
}

if (prefersReducedMotion) {
  const typewriter = document.getElementById('typewriter');
  if (typewriter) typewriter.textContent = words[0];
} else {
  typeNextWord();
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      if (!entry.target.classList.contains('visible')
          && entry.target.matches('.skill-card, .hobby-card, .project-card, .contact-card, .gallery-item')) {
        const finishReveal = event => {
          if (event.target !== entry.target || event.propertyName !== 'opacity') return;
          entry.target.classList.add('reveal-complete');
          entry.target.removeEventListener('transitionend', finishReveal);
        };
        entry.target.addEventListener('transitionend', finishReveal);
      }
      entry.target.classList.add('visible');

      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const target = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = target; }, 100);
      });
    });
  }, { threshold: 0.12 });
  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => {
    element.classList.add('visible');
    element.classList.add('reveal-complete');
  });
}

const navLinks = document.querySelectorAll('.nav-links a');
const navbar = document.querySelector('.navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');

function setMobileMenu(open) {
  if (!navbar || !navToggle) return;
  navbar.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  if (navMenu) {
    navMenu.setAttribute('aria-hidden', String(window.innerWidth <= 768 && !open));
  }
}

if (navToggle && navMenu) {
  setMobileMenu(false);

  navToggle.addEventListener('click', () => {
    setMobileMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      setMobileMenu(false);
      navigationLockUntil = Date.now() + 1400;
      setActiveLink(link.hash.slice(1));
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (navToggle.getAttribute('aria-expanded') === 'true') {
        setMobileMenu(false);
        navToggle.focus();
      }
    }
  });

  document.addEventListener('click', event => {
    if (navbar && !navbar.contains(event.target)) setMobileMenu(false);
  });

  window.addEventListener('resize', () => {
    setMobileMenu(false);
  });
}

const sections = Array.from(navLinks)
  .map(link => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);

let activeLinkFrame = null;
let navigationLockUntil = 0;

function setActiveLink(sectionId) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.hash === `#${sectionId}`);
  });
}

function updateActiveLink() {
  if (!sections.length) return;
  if (Date.now() < navigationLockUntil) return;

  const marker = window.innerHeight * 0.32;
  let activeSection = sections[0];

  sections.forEach(section => {
    if (section.getBoundingClientRect().top <= marker) {
      activeSection = section;
    }
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    activeSection = sections[sections.length - 1];
  }

  setActiveLink(activeSection.id);
}

function requestActiveLinkUpdate() {
  if (activeLinkFrame !== null) return;
  activeLinkFrame = window.requestAnimationFrame(() => {
    activeLinkFrame = null;
    updateActiveLink();
  });
}

window.addEventListener('scroll', requestActiveLinkUpdate, { passive: true });
window.addEventListener('resize', requestActiveLinkUpdate);
updateActiveLink();

function animateCounter(element, target, duration) {
  if (prefersReducedMotion) {
    element.textContent = `${target}+`;
    return;
  }

  let value = 0;
  const increment = target / (duration / 16);
  const tick = () => {
    value += increment;
    if (value >= target) {
      element.textContent = `${target}+`;
      return;
    }
    element.textContent = Math.floor(value);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats && 'IntersectionObserver' in window) {
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.hero-stat-num').forEach(element => {
        animateCounter(element, parseInt(element.dataset.target, 10), 800);
      });
      statsObserver.disconnect();
    });
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
} else if (heroStats) {
  document.querySelectorAll('.hero-stat-num').forEach(element => {
    animateCounter(element, parseInt(element.dataset.target, 10), 800);
  });
}

const avatarCard = document.getElementById('avatarCard');
if (avatarCard) {
  let isBack = false;
  let isSpinning = false;

  avatarCard.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    avatarCard.classList.remove('flip-to-back', 'flip-to-front');
    void avatarCard.offsetWidth;
    avatarCard.classList.add(isBack ? 'flip-to-front' : 'flip-to-back');

    setTimeout(() => {
      isBack = !isBack;
      isSpinning = false;
    }, prefersReducedMotion ? 0 : 1000);
  });
}
