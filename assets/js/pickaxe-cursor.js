if (typeof window.matchMedia === 'function'
    && window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches) {
  const cursorStorageKey = 'cursorStyle';
  const cursorToggle = document.getElementById('cursorToggle');
  const cursor = document.createElement('div');
  const cursorImage = document.createElement('img');
  const handImage = document.createElement('img');
  const particleLayer = document.createElement('div');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particleColors = ['#77a943', '#8a623c', '#a0784e', '#5f452d'];
  const interactiveSelector = [
    'a[href]',
    'button:not(:disabled)',
    'input[type="button"]:not(:disabled)',
    'input[type="submit"]:not(:disabled)',
    'input[type="reset"]:not(:disabled)',
    'select:not(:disabled)',
    'summary',
    '[role="button"]',
    '[role="link"]',
    '#avatarCard'
  ].join(', ');
  let cursorStyle = 'pickaxe';
  let lastPointerTarget = null;

  try {
    if (window.localStorage.getItem(cursorStorageKey) === 'pointer') {
      cursorStyle = 'pointer';
    }
  } catch (error) {
    console.warn('Could not read the saved cursor preference.', error);
  }

  cursor.className = 'pixel-custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursorImage.className = 'cursor-image';
  cursorImage.alt = '';
  handImage.className = 'cursor-hand';
  handImage.src = 'assets/images/optimized/hover_cursor.png';
  handImage.alt = '';
  cursor.appendChild(cursorImage);
  cursor.appendChild(handImage);
  document.body.appendChild(cursor);
  particleLayer.className = 'pickaxe-particle-layer';
  particleLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(particleLayer);
  document.body.classList.add('has-pixel-custom-cursor');

  const isInteractiveTarget = target => {
    let element = target && target.nodeType === 1 ? target : target && target.parentElement;
    while (element && element !== document.body) {
      if (element.matches && element.matches(interactiveSelector)) return true;
      element = element.parentElement;
    }
    return false;
  };
  const updatePointerShape = target => {
    const showHand = isInteractiveTarget(target);
    cursor.classList.toggle('is-hand', showHand);
    cursor.classList.toggle('is-arrow', !showHand);
  };

  const applyCursorStyle = style => {
    cursorStyle = style;
    cursor.classList.toggle('is-pickaxe', style === 'pickaxe');
    cursor.classList.toggle('is-pointer', style === 'pointer');
    cursorImage.src = style === 'pickaxe'
      ? 'assets/images/optimized/pickaxe.png'
      : 'assets/images/optimized/default_cursor.png';

    if (style === 'pointer') {
      cursor.classList.remove('is-swinging');
      updatePointerShape(lastPointerTarget);
    } else {
      cursor.classList.remove('is-swinging', 'is-arrow', 'is-hand');
    }
    if (cursorToggle) {
      const nextStyle = style === 'pickaxe' ? 'pixel pointer' : 'pickaxe';
      cursorToggle.classList.toggle('is-pointer', style === 'pointer');
      cursorToggle.title = `Switch to ${nextStyle} cursor`;
      cursorToggle.setAttribute('aria-label', `Switch to ${nextStyle} cursor`);
      cursorToggle.setAttribute('aria-pressed', String(style === 'pointer'));
    }
  };

  applyCursorStyle(cursorStyle);

  if (cursorToggle) {
    cursorToggle.addEventListener('click', () => {
      const nextStyle = cursorStyle === 'pickaxe' ? 'pointer' : 'pickaxe';
      applyCursorStyle(nextStyle);
      try {
        window.localStorage.setItem(cursorStorageKey, nextStyle);
      } catch (error) {
        console.warn('Could not save the cursor preference.', error);
      }
    });
  }

  const moveCursor = event => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add('is-visible');
    lastPointerTarget = event.target;
    if (cursorStyle === 'pointer') updatePointerShape(lastPointerTarget);
  };
  const createBlockBreakParticles = (x, y) => {
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index / 8) + (Math.random() - 0.5) * 0.45;
      const distance = 14 + Math.random() * 18;
      const fragment = document.createElement('span');
      const middleX = Math.cos(angle) * distance * 0.55;
      const middleY = Math.sin(angle) * distance * 0.55 - 8;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance + 8;

      fragment.style.left = `${x}px`;
      fragment.style.top = `${y}px`;
      fragment.style.setProperty('--particle-mid-x', `${middleX.toFixed(1)}px`);
      fragment.style.setProperty('--particle-mid-y', `${middleY.toFixed(1)}px`);
      fragment.style.setProperty('--particle-x', `${endX.toFixed(1)}px`);
      fragment.style.setProperty('--particle-y', `${endY.toFixed(1)}px`);
      fragment.style.setProperty('--particle-rotation', `${Math.round(Math.random() * 90 - 45)}deg`);
      fragment.style.setProperty('--particle-color', particleColors[Math.floor(Math.random() * particleColors.length)]);
      fragment.style.setProperty('--particle-size', `${4 + Math.floor(Math.random() * 3)}px`);
      fragment.addEventListener('animationend', () => fragment.remove(), { once: true });
      particleLayer.appendChild(fragment);
    }
  };
  const swingPickaxe = event => {
    if (cursorStyle !== 'pickaxe' || event.button !== 0
        || (event.pointerType && event.pointerType !== 'mouse')
        || reducedMotionQuery.matches) return;
    cursor.classList.remove('is-swinging');
    void cursor.offsetWidth;
    cursor.classList.add('is-swinging');
    createBlockBreakParticles(event.clientX, event.clientY);
  };
  const hideCursor = event => {
    if (!event.relatedTarget) cursor.classList.remove('is-visible');
  };

  if ('PointerEvent' in window) {
    document.addEventListener('pointermove', moveCursor);
    document.addEventListener('pointerdown', swingPickaxe);
    document.addEventListener('pointerout', hideCursor);
  } else {
    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mousedown', swingPickaxe);
    document.addEventListener('mouseout', hideCursor);
  }

  cursorImage.addEventListener('animationend', event => {
    if (event.animationName === 'pixel-pickaxe-swing') {
      cursor.classList.remove('is-swinging');
    }
  });

  window.addEventListener('blur', () => {
    cursor.classList.remove('is-visible');
  });
}
