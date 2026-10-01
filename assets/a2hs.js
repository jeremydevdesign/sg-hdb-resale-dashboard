/* SG HDB Resale - "add to home screen" nudge, phones only.
   Shown to returning visitors (a second day of visits, or anyone with a
   watchlist), never on a first visit and never once installed:
   - Android/Chrome: uses the browser's install prompt (beforeinstallprompt).
   - iPhone/iPad Safari: no prompt API exists, so it shows the Share -> Add to
     Home Screen steps instead. In-app browsers (Instagram, Facebook...) are
     skipped because they can't add to the home screen.
   Dismissing hides it for 90 days; otherwise it appears at most once a day.
   State lives in localStorage "a2hs" only. Anonymous GoatCounter events
   (a2hs-shown / -install / -dismiss / -installed) measure whether it helps. */
(function(){
var KEY='a2hs',DAY=864e5,SNOOZE=90*DAY;
function standalone(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;}
var ua=navigator.userAgent||'';
var ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
var inApp=/FBAN|FBAV|Instagram|Line\/|MicroMessenger|Twitter|LinkedInApp|GSA\//.test(ua);
var phone=window.matchMedia&&matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<820;
var st;try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
function gc(path,tries){tries=tries||0;try{if(window.goatcounter&&window.goatcounter.count){window.goatcounter.count({path:path,title:ios?'iOS':'Android',event:true});return;}}catch(e){return;}
  if(tries<10)setTimeout(function(){gc(path,tries+1);},1000);}

window.addEventListener('appinstalled',function(){st.inst=1;save();hide();gc('a2hs-installed');});
if(standalone()){if(!st.inst){st.inst=1;save();}return;}

// count distinct days with a visit
var today=new Date().toISOString().slice(0,10);
if(st.last!==today){st.days=(st.days||0)+1;st.last=today;save();}
if(!phone||st.inst||inApp)return;

var deferred=null,box=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;maybe();});

function eligible(){
  var now=Date.now(),watching=false;
  try{var w=JSON.parse(localStorage.getItem('hdbw')||'null');watching=!!(w&&w.items&&w.items.length);}catch(e){}
  if(!(st.days>=2||watching))return false;
  if(st.dis&&now-st.dis<SNOOZE)return false;
  if(st.shown&&now-st.shown<DAY)return false;
  return ios||!!deferred;
}

var css='.a2hs{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:80;display:flex;gap:12px;align-items:flex-start;'+
'background:var(--color-background-primary);color:var(--color-text-primary);border:1px solid var(--color-border-primary);border-radius:14px;'+
'box-shadow:0 10px 32px rgba(0,0,0,.22);padding:14px 12px 14px 14px;font-family:var(--font-sans,-apple-system,sans-serif);max-width:520px;margin:0 auto;animation:a2in .25s ease-out}'+
'@keyframes a2in{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}'+
'@media(prefers-reduced-motion:reduce){.a2hs{animation:none}}'+
'.a2hs img{width:44px;height:44px;border-radius:10px;flex:none}'+
'.a2hs-t{font-size:14.5px;font-weight:650;line-height:1.3}'+
'.a2hs-d{font-size:13px;line-height:1.45;color:var(--color-text-secondary);margin-top:3px}'+
'.a2hs-d svg{width:15px;height:15px;vertical-align:-2px;color:var(--color-text-info)}'+
'.a2hs-go{margin-top:9px;font:inherit;font-size:13.5px;font-weight:650;padding:8px 16px;border-radius:9px;border:none;background:var(--color-text-primary);color:var(--color-background-primary);cursor:pointer}'+
'.a2hs-x{flex:none;margin-left:auto;font:inherit;font-size:20px;line-height:1;width:32px;height:32px;border:none;background:transparent;color:var(--color-text-tertiary);border-radius:8px;cursor:pointer}';
var SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

function show(){
  if(box||!eligible())return;
  var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  box=document.createElement('div');box.className='a2hs';box.setAttribute('role','dialog');box.setAttribute('aria-label','Add to home screen');
  box.innerHTML='<img src="/icons/apple-touch-icon.png" alt=""><div><div class="a2hs-t">Keep SG HDB Resale on your home screen</div>'+
    (ios?'<div class="a2hs-d">One tap to the latest prices and your watchlist. Tap '+SHARE+' <b>Share</b>, then <b>Add to Home Screen</b>.</div>'
        :'<div class="a2hs-d">One tap to the latest prices and your watchlist, full screen like an app.</div><button type="button" class="a2hs-go">Add to home screen</button>')+
    '</div><button type="button" class="a2hs-x" aria-label="Not now">&times;</button>';
  document.body.appendChild(box);
  st.shown=Date.now();save();gc('a2hs-shown');
  box.querySelector('.a2hs-x').addEventListener('click',function(){st.dis=Date.now();save();hide();gc('a2hs-dismiss');});
  var go=box.querySelector('.a2hs-go');
  if(go)go.addEventListener('click',function(){if(!deferred)return;deferred.prompt();gc('a2hs-install');
    deferred.userChoice.then(function(c){if(c&&c.outcome==='accepted'){st.inst=1;}else{st.dis=Date.now();}save();hide();});deferred=null;});
}
function hide(){if(box){box.remove();box=null;}}
// wait until the visitor has settled in: a few seconds, or a first scroll
var timer=null;
function maybe(){if(timer||box)return;timer=setTimeout(show,6000);}
window.addEventListener('scroll',function once(){window.removeEventListener('scroll',once);setTimeout(show,1500);},{passive:true});
if(ios)maybe();
window.HDBA2HS={show:function(){st.shown=0;st.dis=0;show();}};
})();
