const CACHE_NAME = 'teamstudy-v4';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './perfil.html',
  './pendencias.html',
  './grupos.html',
  './configuracoes.html',
  './atividades-entregues.html',

  './manifest.json',

  // Ícones
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',

  // CSS
  './assets/css/base.css',
  './assets/css/app.css',
  './assets/css/index.css',
  './assets/css/perfil.css',

  // JavaScript
  './assets/js/storage.js',
  './assets/js/auth.js',
  './assets/js/perfil.js'
];

// INSTALAÇÃO
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Instalando TeamStudy v4...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ATIVAÇÃO
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// REQUISIÇÕES
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});