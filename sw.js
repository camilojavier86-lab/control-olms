const C='control-olms-v6-8-build-2026-09-23-16';
const UPDATE_INFO={
  version:'6.8',
  build:'2026.09.23-16',
  kind:'maintenance',
  title:'Resolución automática de enlaces de Maps',
  notes:[
    'Los enlaces cortos de Google Maps pueden resolverse automáticamente con el Resolver gratuito.',
    'Provincia, distrito y tarifa se actualizan al obtener las coordenadas exactas.',
    'Se corrige la confusión entre Panamá y Panamá Oeste.',
    'Cambiar de lugar descarta los datos de ubicación del lugar anterior.'
  ]
}
const ASSETS=[
  './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./mambito-logo.png',
  './google-calendar.jpeg','./google-maps.jpeg','./google.jpeg','./whatsapp.jpeg','./uber-logo.jpeg','./indrive-logo.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

async function sendUpdateInfo(target){
  const msg={type:'OLMS_UPDATE_INFO',...UPDATE_INFO};
  if(target&&typeof target.postMessage==='function'){target.postMessage(msg);return}
  const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  list.forEach(c=>c.postMessage(msg));
}

self.addEventListener('message',e=>{
  const type=e.data&&e.data.type;
  if(type==='GET_UPDATE_INFO')e.waitUntil(sendUpdateInfo(e.source));
  if(type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith((async()=>{
      const cached=await caches.match('./index.html');
      if(cached)return cached;
      try{return await fetch(e.request,{cache:'no-store'})}catch(err){return Response.error()}
    })());
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
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
