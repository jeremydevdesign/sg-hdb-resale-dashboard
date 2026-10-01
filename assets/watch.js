/* SG HDB Resale - watchlist.
   Visitors star towns and streets; the list lives only in this browser
   (localStorage "hdbw") - no account, nothing is sent anywhere. The homepage
   panel (#watchlist) compares each place's sale count in /assets/watch.json
   (built by build_watch.py) with the count this browser last saw, and shows
   the difference as new sales. The figure stays put until the next data
   refresh, so a reload doesn't wipe it.

   Star buttons: <button class="wbtn" data-watch="t:TOWN" data-watch-label="Tampines" hidden>
   (or data-watch="s:TOWN|STREET"; add class "wbtn-sm" for an icon-only star).
   Clicks are delegated, so buttons rendered later by other scripts work too. */
(function(){
var KEY='hdbw',MAX=20,DATA='/assets/watch.json';
var FTN={1:'1-room',2:'2-room',3:'3-room',4:'4-room',5:'5-room',6:'Executive',7:'Multi-generation'};
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var STAR='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2.5 14.9 8.6 21.5 9.4 16.6 13.9 17.9 20.5 12 17.2 6.1 20.5 7.4 13.9 2.5 9.4 9.1 8.6"/></svg>';

var ok=(function(){try{localStorage.setItem('hdbw-t','1');localStorage.removeItem('hdbw-t');return true;}catch(e){return false;}})();
if(!ok)return;

function read(){try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.items&&s.items.push)return s;}catch(e){}return {items:[]};}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
function find(s,k){for(var i=0;i<s.items.length;i++)if(s.items[i].k===k)return i;return -1;}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function dshort(iso){if(!iso)return '';var p=iso.split('-');return (+p[2])+' '+MON[+p[1]-1];}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function title(s){return s.toLowerCase().replace(/(^|[\s\/\-])\w/g,function(c){return c.toUpperCase();});}
function k$(v){return '$'+Math.round(v/1000).toLocaleString('en-SG')+'k';}
function n$(v){return v.toLocaleString('en-SG');}

var dataP=null;
function data(){if(!dataP)dataP=fetch(DATA).then(function(r){if(!r.ok)throw 0;return r.json();}).catch(function(){dataP=null;return null;});return dataP;}
function entry(D,k){
  if(!D)return null;
  if(k.charAt(0)==='t'){var t=D.t[k.slice(2)];return t?{c:t[2],ft:t[3],med:t[4],n:t[5]}:null;}
  var s=D.s[k.slice(2)];return s?{c:s[0],ft:s[1],med:s[2],n:s[3]}:null;
}

/* ---- styles (injected so every page that loads this script gets them) ---- */
var css=''+
'.wbtn{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:13px;font-weight:600;padding:6px 12px;border-radius:999px;border:1px solid var(--color-border-primary);background:var(--color-background-primary);color:var(--color-text-secondary);cursor:pointer;line-height:1.2;transition:border-color .12s,color .12s,background .12s;white-space:nowrap}'+
'.wbtn[hidden]{display:none}.watchrow{margin:18px 0 0}'+
'.wbtn:hover{border-color:var(--color-text-info);color:var(--color-text-info)}'+
'.wbtn[aria-pressed="true"]{color:#b07a00;border-color:#e3c46b;background:rgba(240,190,60,.12)}'+
'.wbtn[aria-pressed="true"] svg{fill:currentColor}'+
'.wbtn-sm{padding:4px;border:none;background:transparent;border-radius:6px;vertical-align:-3px;margin-right:4px}'+
'.wst{display:inline-flex;align-items:flex-start}.wst .wbtn-sm{margin:-4px 4px -4px -4px;flex:none}'+
'.wbtn-sm:hover{background:var(--color-background-secondary)}'+
'.wbtn-sm[aria-pressed="true"]{background:transparent}'+
':root[data-theme="dark"] .wbtn[aria-pressed="true"]{color:#f0c454;border-color:#6b5a2a}'+
'@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .wbtn[aria-pressed="true"]{color:#f0c454;border-color:#6b5a2a}}'+
'.wtoast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:90;max-width:calc(100% - 32px);background:var(--color-text-primary);color:var(--color-background-primary);font-size:13.5px;line-height:1.45;padding:11px 16px;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.2)}'+
'.wtoast a{color:inherit;font-weight:650;margin-left:6px}'+
'.wl{border:1px solid var(--color-border-primary);border-radius:var(--border-radius-lg,14px);background:var(--color-background-primary);padding:18px 22px 16px;margin:0 0 16px;box-shadow:0 1px 2px rgba(0,0,0,.04)}'+
'.wl-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 16px;margin:0 0 6px}'+
'.wl-title{font-size:19px;font-weight:650;margin:0;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}'+
'.wl-title svg{color:#d9a21b;fill:currentColor}'+
'.wl-sub{font-size:12.5px;color:var(--color-text-tertiary);margin:0}'+
'.wl-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:6px 16px;padding:12px 0;border-top:1px solid var(--color-border-tertiary)}'+
'.wl-row:first-of-type{border-top:none}'+
'.wl-name{font-size:15.5px;font-weight:650;color:var(--color-text-primary);text-decoration:none}'+
'.wl-name:hover{color:var(--color-text-info);text-decoration:underline}'+
'.wl-kind{font-size:12px;color:var(--color-text-tertiary);margin-left:8px}'+
'.wl-meta{font-size:13px;color:var(--color-text-secondary);margin-top:3px;line-height:1.45}'+
'.wl-meta b{color:var(--color-text-primary);font-weight:600;font-variant-numeric:tabular-nums}'+
'.wl-meta .thin{color:var(--color-text-tertiary)}'+
'.wl-new{text-align:right;font-size:12px;color:var(--color-text-tertiary);line-height:1.35}'+
'.wl-new b{display:block;font-size:15px;font-weight:700;color:var(--color-text-secondary);font-variant-numeric:tabular-nums}'+
'.wl-new.has b{color:var(--color-text-success)}'+
'.wl-act{display:flex;align-items:center;gap:4px}'+
'.wl-go{font-size:13px;font-weight:600;color:var(--color-text-info);text-decoration:none;padding:6px 8px;white-space:nowrap}'+
'.wl-go:hover{text-decoration:underline}'+
'.wl-x{font:inherit;font-size:18px;line-height:1;width:30px;height:30px;border:none;background:transparent;color:var(--color-text-tertiary);border-radius:7px;cursor:pointer}'+
'.wl-x:hover{background:var(--color-background-secondary);color:var(--color-text-danger)}'+
'.wl-note{font-size:12px;line-height:1.5;color:var(--color-text-tertiary);margin:8px 0 0;padding-top:10px;border-top:1px solid var(--color-border-tertiary)}'+
'@media(max-width:600px){.wl{padding:16px 16px 14px}.wl-row{grid-template-columns:minmax(0,1fr) auto}.wl-act{grid-column:1/-1;justify-content:space-between;margin-top:-2px}.wl-go{padding-left:0}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---- star buttons ---- */
function paint(){
  var s=read(),bs=document.querySelectorAll('[data-watch]');
  for(var i=0;i<bs.length;i++){
    var b=bs[i],on=find(s,b.getAttribute('data-watch'))>=0,l=b.getAttribute('data-watch-label')||'';
    b.hidden=false;b.setAttribute('type','button');b.setAttribute('aria-pressed',on?'true':'false');
    if(b.classList.contains('wbtn-sm')){var t=(on?'Stop watching ':'Watch ')+l;b.innerHTML=STAR;b.setAttribute('aria-label',t);b.setAttribute('title',t);}
    else b.innerHTML=STAR+'<span>'+(on?'Watching':'Watch '+esc(l))+'</span>';
  }
}
var tt=null;
function toast(h){
  var el=document.querySelector('.wtoast');if(!el){el=document.createElement('div');el.className='wtoast';el.setAttribute('role','status');document.body.appendChild(el);}
  el.innerHTML=h;el.hidden=false;clearTimeout(tt);tt=setTimeout(function(){el.hidden=true;},4200);
}
function changed(){paint();try{document.dispatchEvent(new CustomEvent('hdbwatch'));}catch(e){}}

function add(k,l){
  var s=read();if(find(s,k)>=0)return;
  if(s.items.length>=MAX){toast('Your watchlist is full ('+MAX+' places). Remove one on the <a href="/#watchlist">homepage</a> first.');return;}
  s.items.push({k:k,l:l});write(s);changed();
  var home=!!document.getElementById('watchlist');
  toast('Watching '+esc(l)+'. New sales will show on '+(home?'your watchlist above.':'the homepage. <a href="/#watchlist">View</a>'));
  // record the starting count, so the first refresh after this shows what's new
  data().then(function(D){var e=entry(D,k);if(!e)return;var s2=read(),i=find(s2,k);if(i<0||s2.items[i].b!=null)return;
    s2.items[i].b=e.c;s2.items[i].bv=D.v;s2.items[i].bt=today();write(s2);});
}
function remove(k){var s=read(),i=find(s,k);if(i<0)return;s.items.splice(i,1);write(s);changed();}

document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-watch]');
  if(b){e.preventDefault();var k=b.getAttribute('data-watch');if(find(read(),k)>=0)remove(k);else add(k,b.getAttribute('data-watch-label')||k);return;}
  var x=e.target.closest&&e.target.closest('[data-unwatch]');
  if(x){e.preventDefault();remove(x.getAttribute('data-unwatch'));}
});

/* ---- homepage panel ---- */
var panel=document.getElementById('watchlist');
function render(){
  if(!panel)return;
  var s=read();
  if(!s.items.length){panel.hidden=true;panel.innerHTML='';return;}
  data().then(function(D){
    if(!D){panel.hidden=true;return;}
    var s=read(),dirty=false,rows='';
    for(var i=0;i<s.items.length;i++){
      var it=s.items[i],e=entry(D,it.k);
      if(!e)continue;
      // roll the baseline forward once per data version; "new" is frozen until the next one
      if(it.b==null){it.b=e.c;it.bv=D.v;it.bt=today();it.n=null;dirty=true;}
      else if(it.bv!==D.v){it.n=Math.max(0,e.c-it.b);it.ns=it.bt;it.b=e.c;it.bv=D.v;it.bt=today();dirty=true;}
      var town=it.k.slice(2).split('|')[0],tt=D.t[town],isT=it.k.charAt(0)==='t';
      var name=isT?tt[0]:title(it.k.slice(2).split('|')[1]);
      var href=isT?'/towns/'+tt[1]:'/search?town='+encodeURIComponent(town).replace(/%20/g,'+')+'&street='+encodeURIComponent(it.k.slice(2).split('|')[1]).replace(/%20/g,'+');
      var go=isT?'/search?town='+encodeURIComponent(town).replace(/%20/g,'+'):href;
      var kind=isT?'Town':'Street &middot; '+esc(tt[0]);
      var meta=e.ft?(FTN[e.ft]+' median <b>'+k$(e.med)+'</b> '+(e.n<5?'<span class="thin">('+e.n+' sale'+(e.n>1?'s':'')+' - few to go on)</span>':'('+n$(e.n)+' sales)')+' over the last 12 months')
                   :'No sales in the last 12 months';
      var nw;
      if(it.n==null)nw='<div class="wl-new"><b>&ndash;</b>watching since '+dshort(it.bt)+'</div>';
      else nw='<div class="wl-new'+(it.n>0?' has':'')+'"><b>'+(it.n>0?n$(it.n)+' new':'No new')+'</b>sale'+(it.n===1?'':'s')+' since '+dshort(it.ns)+'</div>';
      rows+='<div class="wl-row"><div><a class="wl-name" href="'+href+'">'+esc(name)+'</a><span class="wl-kind">'+kind+'</span>'+
        '<div class="wl-meta">'+meta+'</div></div>'+nw+
        '<div class="wl-act"><a class="wl-go" href="'+go+'">See sales &rarr;</a><button type="button" class="wl-x" data-unwatch="'+esc(it.k)+'" aria-label="Stop watching '+esc(name)+'" title="Stop watching">&times;</button></div></div>';
    }
    if(dirty)write(s);
    var m=D.m.split('-');
    panel.innerHTML='<div class="wl-head"><h2 class="wl-title">'+STAR+'Your watchlist</h2><p class="wl-sub">Data through '+MON[+m[1]-1]+' '+m[0]+' &middot; refreshed weekly</p></div>'+rows+
      '<p class="wl-note">"New" counts sales added to the official record since you last looked, and updates when the data does (weekly). Sales are dated only by month, so some may be from the month before. Your list is saved in this browser only - no account needed.</p>';
    panel.hidden=false;
  });
}
document.addEventListener('hdbwatch',render);

paint();render();
window.HDBWatch={paint:paint};
})();
