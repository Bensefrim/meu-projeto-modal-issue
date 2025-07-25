const CACHE_NAME = 'pecuaria-v4'; // Incrementado para forçar atualização do cache
// Recursos a serem cacheados
const urlsToCache = [
    '/',
    '/login',
    '/dashboard',
    '/fazendas',
    '/usuarios',
    '/animais',
    '/relatorios',
    '/perfil',
    '/static/css/styles.css',
    '/static/js/auth.js',
    '/static/js/fazendas.js',
    '/static/js/usuarios.js',
    '/static/js/animais.js',
    '/static/js/relatorios.js',
    '/static/manifest.json',
    '/static/icons/icon-192x192.png',
    '/static/icons/icon-512x512.png',
    '/static/screenshots/dashboard.png',
    '/static/screenshots/mobile.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-regular-400.woff2',
    'https://code.jquery.com/jquery-3.7.1.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js'
];

// Recursos que devem ser cacheados imediatamente (críticos)
const CRITICAL_ASSETS = [
    '/login',
    '/static/css/styles.css',
    '/static/js/auth.js',
    '/static/manifest.json',
    '/static/icons/icon-192x192.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// Página offline para mostrar quando não há conexão
const OFFLINE_URL = '/login';
const OFFLINE_FALLBACK_HTML = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Você está offline - Sistema de Controle de Pecuária</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            color: #333;
        }
        .offline-container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c7a4e;
        }
        .btn {
            background-color: #2c7a4e;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <h1>Você está offline</h1>
        <p>Não foi possível conectar ao Sistema de Controle de Pecuária. Verifique sua conexão com a internet e tente novamente.</p>
        <button class="btn" onclick="window.location.reload()">Tentar novamente</button>
    </div>
</body>
</html>
`;

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                // Primeiro cache os recursos críticos
                return cache.addAll(CRITICAL_ASSETS)
                    .then(() => {
                        // Depois cache os recursos não críticos
                        return cache.addAll(urlsToCache.filter(url => !CRITICAL_ASSETS.includes(url)));
                    });
            })
            .then(() => {
                // Força o service worker a se tornar ativo imediatamente
                return self.skipWaiting();
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            // Garante que o service worker controle todas as abas/janelas abertas
            return self.clients.claim();
        })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    // Verificar se a requisição é para uma API
    if (event.request.url.includes('/api/')) {
        // Para APIs, tentar a rede primeiro e não usar cache
        event.respondWith(
            fetch(event.request)
                .catch(error => {
                    console.error('Falha ao buscar API:', error);
                    return new Response(JSON.stringify({
                        error: 'Você está offline. Por favor, verifique sua conexão.'
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
    
    // Estratégia network-first para o arquivo CSS para garantir atualizações
    if (event.request.url.includes('/static/css/styles.css')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone da resposta
                    const responseToCache = response.clone();
                    
                    // Atualizar o cache com a nova versão
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                })
                .catch(error => {
                    console.log('Falha ao buscar CSS da rede, tentando cache:', error);
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Para recursos estáticos e páginas, usar estratégia de cache first, falling back to network
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retorna a resposta do cache
                if (response) {
                    return response;
                }

                // Clone da requisição
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Verifica se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone da resposta
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Falha ao buscar recurso:', error);
                        
                        // Se for uma requisição de navegação (HTML), redirecionar para a página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL)
                                .then(cachedResponse => {
                                    if (cachedResponse) {
                                        return cachedResponse;
                                    }
                                    // Se não tiver a página offline em cache, retornar o HTML de fallback
                                    return new Response(OFFLINE_FALLBACK_HTML, {
                                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
                                    });
                                });
                        }
                        
                        // Para imagens, tentar retornar uma imagem placeholder
                        if (event.request.destination === 'image') {
                            return caches.match('/static/icons/icon-192x192.png');
                        }
                        
                        // Para outros recursos, retornar um erro
                        return new Response('Você está offline. Por favor, verifique sua conexão.', {
                            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                        });
                    });
            })
    );
});

// Evento para lidar com mensagens do cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Suporte para sincronização em segundo plano
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Função para sincronizar dados quando a conexão for restabelecida
async function syncData() {
    try {
        // Verificar se há dados para sincronizar no IndexedDB
        const db = await openDatabase();
        const pendingData = await getPendingData(db);
        
        if (pendingData.length > 0) {
            console.log('Sincronizando dados pendentes:', pendingData.length);
            
            // Processar cada item pendente
            for (const item of pendingData) {
                try {
                    // Tentar enviar para o servidor
                    const response = await fetch(item.url, {
                        method: item.method,
                        headers: item.headers,
                        body: item.body
                    });
                    
                    if (response.ok) {
                        // Se sucesso, remover do IndexedDB
                        await removePendingItem(db, item.id);
                        console.log('Item sincronizado com sucesso:', item.id);
                    }
                } catch (error) {
                    console.error('Erro ao sincronizar item:', item.id, error);
                }
            }
        }
    } catch (error) {
        console.error('Erro na sincronização de dados:', error);
    }
}

// Funções auxiliares para IndexedDB (implementação básica)
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pecuaria-offline-db', 1);
        
        request.onerror = event => reject(event.target.error);
        request.onsuccess = event => resolve(event.target.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingRequests')) {
                db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function getPendingData(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['pendingRequests'], 'readonly');
        const store = transaction.objectStore('pendingRequests');
        const request = store.getAll();
        
        request.onerror = event => reject(event.target.error);
        request.onsuccess = event => resolve(event.target.result);
    });
}

function removePendingItem(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['pendingRequests'], 'readwrite');
        const store = transaction.objectStore('pendingRequests');
        const request = store.delete(id);
        
        request.onerror = event => reject(event.target.error);
        request.onsuccess = event => resolve();
    });
}