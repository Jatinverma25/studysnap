/* StudySnap Service Worker
 *
 * Strategy:
 *   - Page navigations  : network-first (new deployments win), cached '/' offline.
 *   - Same-origin assets: network-first with cache fallback (so a freshly deployed
 *                         HTML page always pairs with its matching CSS/JS, and the
 *                         app still loads offline). The ?v= cache-busting query is
 *                         normalized away so version bumps reuse one cache entry.
 *   - CDN libraries      : stale-while-revalidate (all pinned versions).
 *   - Everything else    : passed straight to the network. The AI endpoints
 *                         (/summarize, /word-help, /quiz/*) are POST and are NEVER
 *                         cached or intercepted — they must always run live.
 */

const SHELL_CACHE = 'studysnap-shell-v1';
const RUNTIME_CACHE = 'studysnap-runtime-v1';
const CACHE_WHITELIST = [SHELL_CACHE, RUNTIME_CACHE];

// Precached same-origin app shell. Query strings are stripped from cache keys,
// so these entries serve requests for style.css?v=... and script.js?v=... too.
const SHELL_URLS = [
  '/',
  '/static/style.css',
  '/static/script.js',
  '/static/manifest.webmanifest',
  '/static/icons/icon-192.png',
];

// Request paths that must never be served from cache (all live, POST or dynamic).
const LIVE_PATH_PREFIXES = ['/quiz', '/api'];
const LIVE_PATHS = ['/summarize', '/word-help', '/health', '/sw.js'];


function normalizedKey(url) {
  // Drop cache-busting query/hash on same-origin asset URLs.
  const u = new URL(url);
  if (u.origin === self.location.origin) {
    u.search = '';
    u.hash = '';
  }
  return u.toString();
}


self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // Precache each shell URL independently: one network hiccup must not
    // abort the whole install (runtime caching repairs whatever is missed).
    await Promise.allSettled(
      SHELL_URLS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response && response.ok) {
            await cache.put(normalizedKey(url), response.clone());
          }
        } catch (err) {
          console.warn('[StudySnap SW] precache miss for', url, err);
        }
      })
    );
    await self.skipWaiting();
  })());
});


self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => !CACHE_WHITELIST.includes(key))
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});


self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only GETs are cacheable; POSTs (all AI + quiz save/reset) go to the network.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (LIVE_PATHS.includes(url.pathname) ||
      LIVE_PATH_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return;
  }

  // --- Page navigations: network-first, fall back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put('/', fresh.clone()).catch(() => {});
        return fresh;
      } catch (err) {
        const cache = await caches.open(SHELL_CACHE);
        const cached = (await cache.match('/')) || (await cache.match(request));
        if (cached) return cached;
        return new Response(
          'You are offline. StudySnap needs a connection to start; cached pages work once you have loaded them before.',
          { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  // --- Same-origin assets: network-first so HTML and its assets stay in sync.
  if (url.origin === self.location.origin) {
    const key = normalizedKey(url);
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          cache.put(key, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (err) {
        const cached = await cache.match(key);
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }

  // --- Cross-origin CDN libraries and fonts: stale-while-revalidate.
  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request)
      .then((response) => {
        // Opaque (no-cors) responses are cacheable but report status 0.
        if (response && (response.ok || response.type === 'opaque')) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => null);

    const cachedOrNetwork = cached || (await network);
    if (cachedOrNetwork) return cachedOrNetwork;
    return new Response('Network request failed and no cached copy is available.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  })());
});
