// Reply only to our service worker; no device identifiers or subscription data.
if ('serviceWorker' in navigator) {
 navigator.serviceWorker.addEventListener('message', event => {
  if (event.data?.type !== 'PMSV_WINDOW_CONTEXT' || !event.ports?.[0]) return;
  let androidApp=false;
  try{const ref=new URL(document.referrer);androidApp=ref.protocol==='android-app:'&&ref.hostname==='com.pmsvgroup.foodsafety'}catch{}
  const installed = matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches
   || navigator.standalone === true
   || androidApp;
  event.ports[0].postMessage({type:'PMSV_WINDOW_CONTEXT',installed});
 });
}
