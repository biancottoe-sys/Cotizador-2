// image-preview.js - vista rapida de miniaturas de producto
'use strict';

const ImagePreview = (() => {
  let _box = null;
  let _hideTimer = null;

  function _ensureBox() {
    if (_box) return _box;
    _box = document.createElement('div');
    _box.className = 'image-preview-popover';
    _box.innerHTML = '<img alt="Vista previa del producto">';
    _box.addEventListener('click', (event) => event.stopPropagation());
    document.body.appendChild(_box);
    return _box;
  }

  function show(src, event) {
    if (!src) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const box = _ensureBox();
    const img = box.querySelector('img');
    img.src = src;
    box.classList.add('visible');
    _position(box, event);

    clearTimeout(_hideTimer);
    window.removeEventListener('mousemove', hide);
    document.removeEventListener('click', hide);
    window.removeEventListener('scroll', hide, true);

    _hideTimer = setTimeout(() => {
      window.addEventListener('mousemove', hide, { once: true });
      document.addEventListener('click', hide, { once: true });
      window.addEventListener('scroll', hide, { once: true, capture: true });
    }, 120);
  }

  function _position(box, event) {
    const margin = 12;
    const width = 180;
    const height = 180;
    let left = (event?.clientX || window.innerWidth / 2) + margin;
    let top = (event?.clientY || window.innerHeight / 2) + margin;

    if (left + width > window.innerWidth - margin) left = window.innerWidth - width - margin;
    if (top + height > window.innerHeight - margin) top = window.innerHeight - height - margin;
    if (left < margin) left = margin;
    if (top < margin) top = margin;

    box.style.left = left + 'px';
    box.style.top = top + 'px';
  }

  function hide() {
    clearTimeout(_hideTimer);
    if (_box) _box.classList.remove('visible');
    window.removeEventListener('mousemove', hide);
    document.removeEventListener('click', hide);
    window.removeEventListener('scroll', hide, true);
  }

  return { show, hide };
})();
