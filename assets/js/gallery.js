const galleryItems = document.querySelectorAll('.gallery-page .gallery-item');

if ('IntersectionObserver' in window) {
  const galleryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  galleryItems.forEach(item => {
    const finishReveal = event => {
      if (event.target !== item || event.propertyName !== 'opacity') return;
      item.classList.add('reveal-complete');
      item.removeEventListener('transitionend', finishReveal);
    };
    item.addEventListener('transitionend', finishReveal);
    galleryObserver.observe(item);
  });
} else {
  galleryItems.forEach(item => {
    item.classList.add('visible');
    item.classList.add('reveal-complete');
  });
}

const galleryImages = document.querySelectorAll('.gallery-grid .photo-box');

if (galleryImages.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'photo-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');

  const frame = document.createElement('div');
  frame.className = 'photo-lightbox__frame';

  const closeButton = document.createElement('button');
  closeButton.className = 'photo-lightbox__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close enlarged photo');
  closeButton.textContent = '×';

  const enlargedImage = document.createElement('img');
  enlargedImage.className = 'photo-lightbox__image';

  frame.append(closeButton, enlargedImage);
  lightbox.append(frame);
  document.body.append(lightbox);

  let activeImage = null;
  let previousOverflow = '';
  let closeTimeout;

  const finishClose = () => {
    if (lightbox.classList.contains('is-open')) return;
    lightbox.hidden = true;
    enlargedImage.removeAttribute('src');
  };

  const closeLightbox = () => {
    if (lightbox.hidden || !activeImage) return;

    lightbox.classList.remove('is-open');
    document.body.style.overflow = previousOverflow;
    activeImage.setAttribute('aria-expanded', 'false');
    activeImage.focus();
    activeImage = null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
    } else {
      closeTimeout = window.setTimeout(finishClose, 250);
    }
  };

  const openLightbox = image => {
    window.clearTimeout(closeTimeout);
    activeImage = image;
    previousOverflow = document.body.style.overflow;
    const imageBounds = image.getBoundingClientRect();
    const sourceAspectRatio = image.naturalWidth / image.naturalHeight;
    const frameAspectRatio = sourceAspectRatio < 1
      ? sourceAspectRatio
      : imageBounds.width / imageBounds.height;
    frame.style.setProperty('--photo-aspect-ratio', frameAspectRatio);
    enlargedImage.src = image.currentSrc || image.src;
    enlargedImage.alt = image.alt;
    lightbox.setAttribute('aria-label', image.alt ? `Photo preview: ${image.alt}` : 'Photo preview');
    image.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    lightbox.hidden = false;

    window.requestAnimationFrame(() => {
      lightbox.classList.add('is-open');
      closeButton.focus();
    });
  };

  galleryImages.forEach(image => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-haspopup', 'dialog');
    image.setAttribute('aria-label', image.alt ? `View larger photo: ${image.alt}` : 'View larger photo');
    image.setAttribute('aria-expanded', 'false');
    image.addEventListener('click', () => openLightbox(image));
    image.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });
}
