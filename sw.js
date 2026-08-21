const CACHE_NAME = 'teamstudy-v5';

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

  // ==========================================================
  // ÍCONES
  // ==========================================================

  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',

  // ==========================================================
  // CSS
  // ==========================================================

  './assets/css/base.css',
  './assets/css/app.css',
  './assets/css/index.css',
  './assets/css/perfil.css',

  // ==========================================================
  // JAVASCRIPT
  // ==========================================================

  './assets/js/storage.js',
  './assets/js/auth.js',
  './assets/js/perfil.js',
  './assets/js/dashboard.js',
  './assets/js/grupos.js'
];


// ==========================================================
// INSTALAÇÃO
// ==========================================================

self.addEventListener('install', event => {

  console.log('[SW] Instalando TeamStudy v5...');

  self.skipWaiting();

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(
          FILES_TO_CACHE
        );

      })

  );

});


// ==========================================================
// ATIVAÇÃO
// ==========================================================

self.addEventListener('activate', event => {

  event.waitUntil(

    caches
      .keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames.map(cacheName => {

            if (
              cacheName !== CACHE_NAME
            ) {

              console.log(
                '[SW] Removendo cache antigo:',
                cacheName
              );

              return caches.delete(
                cacheName
              );

            }

          })

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


// ==========================================================
// REQUISIÇÕES
// ==========================================================

self.addEventListener(
  'fetch',
  event => {

    // Não interceptar requisições que não sejam GET
    if (
      event.request.method !== 'GET'
    ) {

      return;

    }


    const url =
      new URL(event.request.url);


    // ========================================================
    // SUPABASE / API
    // ========================================================

    // Nunca colocar requisições do Supabase
    // no cache do Service Worker.

    if (
      url.hostname.includes(
        'supabase.co'
      )
    ) {

      return;

    }


    // ========================================================
    // ARQUIVOS DO TEAMS TUDY
    // ========================================================

    event.respondWith(

      fetch(event.request)

        .then(response => {

          // Se a resposta for válida,
          // atualiza o cache.

          if (
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {

            const responseClone =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  responseClone
                );

              });

          }

          return response;

        })

        .catch(() => {

          // Se estiver sem internet,
          // tenta usar o cache.

          return caches.match(
            event.request
          );

        })

    );

  }
);