const C='control-olms-v6-8-final';
const ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './mambito-logo.png',
  './google-calendar.jpeg',
  './google-maps.jpeg',
  './google.jpeg',
  './whatsapp.jpeg',
  './uber-logo.jpeg',
  './indrive-logo.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(r=>{
          const copy=r.clone();
          caches.open(C).then(c=>c.put('./index.html',copy));
          return r;
        })
        .catch(()=>caches.match('./index.html'))
    );
  }else{
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const c of list){if('focus' in c)return c.focus()}
      if(clients.openWindow)return clients.openWindow('./');
    })
  );
});
