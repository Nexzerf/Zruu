const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ขั้นตอนติดตั้ง (install) - แคชไฟล์ที่กำหนดไว้
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('เปิดแคชและเพิ่มไฟล์ที่ต้องการ');
      return cache.addAll(urlsToCache);
    })
  );
});

// ขั้นตอน activate - เคลียร์แคชเก่า (ถ้ามี)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('ลบแคชเก่า:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// ขั้นตอน fetch - ดักจับคำขอ (request) แล้วตอบกลับจากแคช (ถ้ามี) หรือโหลดจากเน็ต
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        // เจอในแคช ให้ตอบกลับเลย
        return response;
      }
      // ถ้าไม่มีในแคช โหลดจากเน็ต แล้วแคชเพิ่มด้วย
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // ถ้าทั้งแคชและเน็ตไม่ตอบสนอง อาจแสดง fallback page หรือรูปภาพแทนได้ (ใส่เองตามต้องการ)
      return new Response('ออฟไลน์และไม่พบข้อมูลในแคช');
    })
  );
});
