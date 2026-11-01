/* Playgrid – shared script. Reads data/config.json + data/games.json. You normally never edit this file. */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J=async u=>{const r=await fetch(u+'?v='+Date.now());if(!r.ok)throw Error(u);return r.json()};
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const toast=t=>{const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),1800)};
const qp=new URLSearchParams(location.search);
(async()=>{
const P=document.body.dataset.page,app=$('#app');let C,G;
try{[C,G]=await Promise.all([J('data/config.json'),J('data/games.json')])}catch(e){app.innerHTML='<p>Could not load site data. Open the site through GitHub Pages or a local web server, not by double-clicking the file.</p>';return}
const pub=G.filter(g=>g.published!==false),cur=location.pathname.split('/').pop()||'index.html';
const catUrl=c=>'category.html?c='+encodeURIComponent(c.toLowerCase());
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0)*7,0)%360;
const th=(g,c='')=>g.thumb?`<div class="th ${c}" style="background-image:url('${esc(g.thumb)}')" role="img" aria-label="${esc(g.title)}"></div>`:`<div class="th ${c}" style="background:linear-gradient(135deg,hsl(${hue(g.slug)} 70% 45%),hsl(${(hue(g.slug)+50)%360} 70% 28%))">${esc(g.title[0])}</div>`;
const card=g=>`<a class="card" href="game.html?g=${esc(g.slug)}">${th(g)}<div class="i"><h3>${esc(g.title)}</h3><small>${esc(g.category)} Games</small></div></a>`;
const newest=l=>[...l].sort((a,b)=>(b.added||'').localeCompare(a.added||''));
const az=l=>[...l].sort((a,b)=>a.title.localeCompare(b.title));
// ads
const A=C.ads||{},adsOn=A.enabled&&/^ca-pub-\d{10,}$/.test(A.publisher||'')&&!/^ca-pub-0+$/.test(A.publisher);
const ad=k=>adsOn&&A.slots?.[k]?`<div class="ad" aria-label="Advertisement"><div>Advertisement</div><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(A.publisher)}" data-ad-slot="${esc(A.slots[k])}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`:'';
// layout
$('#hdr').outerHTML=`<header><a class="logo" href="index.html">${esc(C.name.slice(0,4))}<b>${esc(C.name.slice(4))}</b></a><button id="mb" class="btn g sm" aria-label="Menu">Menu</button><nav id="nav">${C.nav.map(n=>`<a href="${esc(n.u)}"${n.u==cur?' class="on"':''}>${esc(n.t)}</a>`).join('')}</nav><span class="sp"></span><form action="games.html"><input class="s" name="q" type="search" placeholder="Search games or categories" aria-label="Search"></form><button class="btn g sm" id="th">Theme</button></header>`;
$('#ftr').outerHTML=`<footer>${C.footer.map(n=>`<a href="${esc(n.u)}">${esc(n.t)}</a>`).join('')}<p>© ${new Date().getFullYear()} ${esc(C.name)}. ${esc(C.tagline)}</p></footer>`;
$('#mb').onclick=()=>$('#nav').classList.toggle('open');
$('#th').onclick=()=>{const r=document.documentElement;r.dataset.theme=getComputedStyle(r).colorScheme=='dark'?'light':'dark';SV('pg_theme',r.dataset.theme)};
if(LS('pg_theme'))document.documentElement.dataset.theme=LS('pg_theme');
document.querySelectorAll('[data-email]').forEach(e=>{e.href='mailto:'+C.email;e.textContent=C.email});
document.querySelectorAll('[data-site]').forEach(e=>e.textContent=C.name);
const meta=(t,d,img)=>{document.title=t;const s=(sel,a,v)=>{let e=$(sel);if(!e){e=document.createElement(sel.startsWith('link')?'link':'meta');const m=sel.match(/\[(\w+)="([^"]+)"\]/);e.setAttribute(m[1],m[2]);document.head.append(e)}e.setAttribute(a,v)};
 s('meta[name="description"]','content',d);s('meta[property="og:title"]','content',t);s('meta[property="og:description"]','content',d);s('link[rel="canonical"]','href',C.siteUrl.replace(/\/$/,'')+'/'+cur+location.search);if(img)s('meta[property="og:image"]','content',new URL(img,location.href).href)};
const favs=()=>LS('pg_favs',[]),rec=()=>LS('pg_rec',[]);
const sec=(t,u,l,k)=>l.length?`<div class="sh"><h2>${t}</h2><a href="${u}">View All</a></div><div class="grid">${l.slice(0,6).map(card).join('')}</div>${ad(k||'betweenSections')}`:'';
// list pages
const list=(title,items,withCats)=>{app.innerHTML=`<h1>${title}</h1>${withCats||''}<div class="bar"><input id="lf" placeholder="Search this page" value="${esc(qp.get('q')||'')}"><select id="so"><option value="def">Default</option><option value="pop">Most popular</option><option value="new">Newest</option><option value="az">A to Z</option></select></div><div class="grid" id="lg"></div>`;
 const f=()=>{const q=$('#lf').value.toLowerCase(),k=$('#so').value;let r=items.filter(g=>(g.title+' '+g.category+' '+g.description).toLowerCase().includes(q));if(k=='new')r=newest(r);if(k=='az')r=az(r);if(k=='pop')r=[...r].sort((a,b)=>!!b.popular-!!a.popular);$('#lg').innerHTML=r.map(card).join('')||'<p>No games found. Try another word.</p>'};$('#lf').oninput=$('#so').onchange=f;f()};
if(P=='home'){const f=pub.find(g=>g.featured)||pub[0];meta(`${C.name} – ${C.tagline}`,C.tagline);
 app.innerHTML=ad('homeBanner')+(f?`<section class="hero"><div><span class="tag">Featured</span><h1>${esc(f.title)}</h1><p>${esc(f.description)}</p><a class="btn" href="game.html?g=${esc(f.slug)}">Play Now</a></div>${th(f)}</section>`:'')+
 sec('Trending Games','popular.html',pub.filter(g=>g.popular))+sec('Recently Added','new.html',newest(pub))+sec('Popular Multiplayer Games','category.html?c=multiplayer',pub.filter(g=>g.category=='Multiplayer'))+
 sec('Recommended for You','games.html',(()=>{const fc=pub.filter(g=>favs().includes(g.slug)).map(g=>g.category);return az(pub).sort((a,b)=>fc.includes(b.category)-fc.includes(a.category))})())+
 sec('Recently Played','favorites.html',rec().map(s=>pub.find(g=>g.slug==s)).filter(Boolean))}
else if(P=='list'){const m=document.body.dataset.mode,t=document.title.split(' – ')[0];meta(document.title,$('meta[name=description]')?.content||t);list(t,m=='popular'?pub.filter(g=>g.popular):m=='new'?newest(pub):m=='favorites'?pub.filter(g=>favs().includes(g.slug)):pub)}
else if(P=='categories'){app.innerHTML=`<h1>Game Categories</h1><div class="cats">${C.categories.map(c=>`<a href="${catUrl(c)}">${esc(c)} Games <small>(${pub.filter(g=>g.category==c).length})</small></a>`).join('')}</div>`}
else if(P=='category'){const c=C.categories.find(c=>c.toLowerCase()==(qp.get('c')||'').toLowerCase())||'All';meta(`${c} Games – Play Free Online | ${C.name}`,`Play free ${c.toLowerCase()} games online. No download needed.`);list(`${c} Games`,pub.filter(g=>c=='All'||g.category==c))}
else if(P=='game'){const g=pub.find(g=>g.slug==qp.get('g'));if(!g){app.innerHTML='<h1>Game not found</h1><p><a class="btn" href="games.html">Browse all games</a></p>';return}
 meta(`${g.title} – Play Free Online | ${C.name}`,g.description,g.thumb);
 SV('pg_rec',[g.slug,...rec().filter(s=>s!=g.slug)].slice(0,12));
 const ld=document.createElement('script');ld.type='application/ld+json';ld.textContent=JSON.stringify({'@context':'https://schema.org','@type':'VideoGame',name:g.title,description:g.description,genre:g.category,playMode:'SinglePlayer',applicationCategory:'Game',operatingSystem:'Web browser'});document.head.append(ld);
 const rel=pub.filter(x=>x.slug!=g.slug&&x.category==g.category),more=pub.filter(x=>x.slug!=g.slug&&x.category!=g.category);
 app.innerHTML=`<div class="play"><div><p><a href="games.html">← Back to all games</a></p><h1>${esc(g.title)}</h1><div class="tools"><button class="btn" id="fs">Play Fullscreen</button><button class="btn g" id="rs">Restart</button><button class="btn g" id="fv"></button><button class="btn g" id="sh">Share</button></div>
 <div class="stage" id="stage"><iframe id="fr" src="${esc(g.url)}" title="${esc(g.title)}" allow="fullscreen; autoplay; gamepad" allowfullscreen loading="lazy"></iframe><div class="fbar"><button class="btn sm" id="ex">✕ Exit fullscreen</button><button class="btn g sm" id="qt">Quit to games</button></div></div>${ad('belowPlayer')}
 <div class="box"><h3>About ${esc(g.title)}</h3><p>${esc(g.description)}</p></div><div class="box"><h3>How to play</h3><p>${esc(g.howToPlay)}</p></div><div class="box"><h3>Controls</h3><p>${esc(g.controls)}</p></div></div>
 <aside>${ad('gameSidebar')}<div class="box"><h3>Related games</h3><div class="grid" style="grid-template-columns:1fr 1fr">${rel.slice(0,4).map(card).join('')||'<p>More games are coming soon.</p>'}</div></div></aside></div>${ad('betweenRelated')}
 <div class="sh"><h2>Recommended games</h2><a href="games.html">View All</a></div><div class="grid">${more.slice(0,6).map(card).join('')}</div>`;
 const fv=()=>$('#fv').textContent=favs().includes(g.slug)?'Remove favorite':'Add to favorites';fv();
 const st=$('#stage');let hist=false;
 const enter=()=>{st.classList.add('full');document.body.style.overflow='hidden';if(!hist){history.pushState({fs:1},'');hist=true}st.requestFullscreen?.().catch(()=>{});try{screen.orientation?.lock?.('landscape').catch(()=>{})}catch(e){}};
 const leave=()=>{st.classList.remove('full');document.body.style.overflow='';if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});try{screen.orientation?.unlock?.()}catch(e){}if(hist){hist=false;history.back()}};
 $('#fs').onclick=enter;$('#ex').onclick=leave;$('#qt').onclick=()=>{hist=false;st.classList.remove('full');document.body.style.overflow='';if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});location.href='games.html'};
 addEventListener('popstate',()=>{if(st.classList.contains('full')){hist=false;st.classList.remove('full');document.body.style.overflow='';if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{})}});
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&st.classList.contains('full'))leave()});
 addEventListener('keydown',e=>{if(e.key=='Escape'&&st.classList.contains('full'))leave()});
 $('#rs').onclick=()=>{const f=$('#fr');f.src=f.src};
 $('#fv').onclick=()=>{SV('pg_favs',favs().includes(g.slug)?favs().filter(s=>s!=g.slug):[...favs(),g.slug]);fv();toast('Favorites updated')};
 $('#sh').onclick=async()=>{try{navigator.share?await navigator.share({title:g.title,url:location.href}):(await navigator.clipboard.writeText(location.href),toast('Link copied'))}catch(e){}}}
if(adsOn&&document.querySelector('.adsbygoogle')){if(!document.querySelector('script[src*="adsbygoogle.js"]')){const s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+A.publisher;document.head.append(s)}
 document.querySelectorAll('ins.adsbygoogle').forEach(i=>{try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}})}
})();
