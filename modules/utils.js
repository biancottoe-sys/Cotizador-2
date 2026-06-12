// utils.js – Funciones globales compartidas
'use strict';

function fmtPesos(n) {
  return '$ ' + Number(n || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function toast(msg, type) {
  type = type || 'success';
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : type === 'warning' ? ' warning' : '');
  el.innerHTML = '<span class="toast-icon">' + (icons[type] || '✓') + '</span><span>' + msg + '</span>';
  container.appendChild(el);
  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transform = 'translateX(30px)';
    el.style.transition = '.3s';
    setTimeout(function() { el.remove(); }, 300);
  }, 2800);
}
