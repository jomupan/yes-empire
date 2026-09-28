import { cache } from "react";

const CACHE_NAME="benamora-v1";
const STATIC_ASSETS=[
    "/",
    "index.html",
    "/benamora_house_icon.jpeg",
    "/house_bg.jpeg",
    "/LTI Terrace.png",
    "/LTI semi D.png",
];

self.addEventListener("install", (event)=> {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache)=>{
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event)=>{
    event.waitUntil(
        caches.keys().then((keys)=>{
            return Promise.all(
                keys.filter((key)=>key !== CACHE_NAME)
                    .map((key)=>caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event)=>{
    if(event.request.url.includes("firestore.googleapis.com") ||
        event.request.url.includes("firebase") ||
        event.request.url.includes("googleapis")) {
            return;
        }

        event.respondWith(
            caches.match(event.request).then((cached)=> {
                return cached || fetch(event.request).then((response)=> {
                    if(response.status === 200) {
                        const clone=response.clone();
                        caches.open(CACHE_NAME).then((cache)=> {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                }).catch(()=> {
                    return caches.match("/");
                });
            })
        );

    });