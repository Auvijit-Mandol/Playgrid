// Runs on GitHub during deploy. Reads data/config.json + data/games.json and prepares the published copy in _site.
// Creates sitemap.xml, robots.txt, ads.txt and adds your AdSense code to the <head> of every page. You never edit this file.
const fs=require('fs'),path=require('path');
const out='_site',cfg=JSON.parse(fs.readFileSync('data/config.json','utf8')),games=JSON.parse(fs.readFileSync('data/games.json','utf8'));
const base=cfg.siteUrl.replace(/\/$/,''),pubId=(cfg.ads&&cfg.ads.publisher)||'',real=/^ca-pub-\d{10,}$/.test(pubId)&&!/^ca-pub-0+$/.test(pubId);
const pages=['index','games','categories','popular','new','about','contact','privacy','terms','disclaimer'].map(p=>p+'.html');
const urls=[...pages,...cfg.categories.map(c=>'category.html?c='+c.toLowerCase()),...games.filter(g=>g.published!==false).map(g=>'game.html?g='+g.slug)];
fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${base}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
if(real){
  fs.writeFileSync(path.join(out,'ads.txt'),`google.com, ${pubId.replace('ca-','')}, DIRECT, f08c47fec0942fa0\n`);
  const tag=`<meta name="google-adsense-account" content="${pubId}">\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}" crossorigin="anonymous"></script>`;
  for(const f of fs.readdirSync(out).filter(f=>f.endsWith('.html'))){const p=path.join(out,f);const h=fs.readFileSync(p,'utf8');if(!h.includes('google-adsense-account'))fs.writeFileSync(p,h.replace('</head>',tag+'\n</head>'))}
  console.log('AdSense code added for',pubId);
}else console.log('No real AdSense publisher ID yet: skipping ads code.');
