// Service Worker for The Refiner's Edge PWA
const CACHE_NAME = 'refiners-edge-v1.2.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/js/app.js',
    '/manifest.json',
    '/icons/icon-48x48.png',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-256x256.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', function(event) {
    console.log('Service Worker installing');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.error('Cache installation failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                // Clone the request for the fetch operation
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(function(response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    
                    // Cache successful responses
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(function() {
                    // Return offline page for navigation requests
                    if (event.request.destination === 'document') {
                        return caches.match('/');
                    }
                });
            })
    );
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline data
self.addEventListener('sync', function(event) {
    if (event.tag === 'project-sync') {
        event.waitUntil(syncProjectData());
    }
});

// Sync project data when connection is restored
function syncProjectData() {
    return new Promise((resolve) => {
        // Get stored project data
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_REQUEST'
                });
            });
        });
        resolve();
    });
}

// Push notification handling (for future AI feedback notifications)
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'New editorial feedback available',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('The Refiner\'s Edge', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// Message handling for communication with main app
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_PROJECT') {
        // Cache project data for offline access
        const projectData = event.data.payload;
        caches.open(CACHE_NAME + '-projects').then(cache => {
            cache.put('/project-data', new Response(JSON.stringify(projectData)));
        });
    }
});

// Periodic background sync for auto-save
self.addEventListener('periodicsync', function(event) {
    if (event.tag === 'auto-save') {
        event.waitUntil(performAutoSave());
    }
});

function performAutoSave() {
    return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'AUTO_SAVE_REQUEST'
            });
        });
    });
}
