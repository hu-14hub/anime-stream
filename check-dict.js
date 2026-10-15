const en=require('./src/i18n/dictionaries/en.json');
const ar=require('./src/i18n/dictionaries/ar.json');
const out=[];
const ek=Object.keys(en).sort(); const ak=Object.keys(ar).sort();
out.push('en sections: '+ek.join(','));
out.push('missing sections in ar: '+JSON.stringify(ek.filter(k=>!(k in ar))));
out.push('extra sections in ar: '+JSON.stringify(ak.filter(k=>!(k in en))));
for (const k of ek){ const a=Object.keys(en[k]).sort(); const b=Object.keys(ar[k]||{}).sort(); const miss=a.filter(x=>!b.includes(x)); if(miss.length) out.push('ar.'+k+' missing: '+JSON.stringify(miss)); }
out.push('JSON OK');
require('fs').writeFileSync('./dict-check.txt', out.join('\n'));
