// 1. Sempre que atualizar o site, mude o número da versão aqui (ex: v1 -> v2)
const CACHE_NAME = 'teamstudy-v2';

// 2. Lista completa de arquivos que o app precisa para funcionar offline/mobile
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
  './assets/css/base.css',
  './assets/css/app.css',
  './assets/css/index.css',
  './assets/css/perfil.css',
  './assets/js/storage.js',
  './assets/js/auth.js',
  './assets/js/perfil.js'
];

// --- INSTALAÇÃO ---
self.addEventListener('install', event => {
  // Força o Service Worker novo a ativar sem esperar o usuário fechar a aba
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Guardando arquivos no cache...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// --- ATIVAÇÃO (LIMPEZA DE CACHE ANTIGO) ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Se a versão do cache for diferente da atual, apaga!
          if (cache !== CACHE_NAME) {
            console.log('[SW] Apagando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle das páginas na hora
  );
});

// --- REQUISIÇÕES (BUSCA NO CACHE OU NA REDE) ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna do cache se existir; senão, busca na rede
      return response || fetch(event.request);
    })
  );
});