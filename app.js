var tt;
function toast(m){var t=document.getElementById("toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show");},3000);}
function go(s){document.querySelectorAll(".screen").forEach(function(e){e.classList.remove("active");});var sc=document.getElementById(s);if(sc)sc.classList.add("active");document.querySelectorAll(".tab").forEach(function(t){t.classList.toggle("active",t.dataset.s===s);});var ct=document.querySelector(".content");if(ct)ct.scrollTop=0;if(s==="perfil")renderPerfil();if(s==="admin")renderAdmin();if(s==="cancha")renderCalendario();if(s==="mis-reservas")renderMisReservas();if(s==="academia"){renderProgramasAcademia();var _p=getPerfil();if(_p&&_p.nombre)cargarPortafolioAlumno(_p.nombre);}}
function closeModal(){var m=document.getElementById("modal");if(m)m.classList.remove("show");}
function setVista(v){
  var btnIds={rank:"vRank",h2h:"vH2H",cuadro:"vCuadro",partidos:"vPartidos"};
  ["rank","h2h","cuadro","partidos"].forEach(function(k){
    var d=document.getElementById("vista-"+k);if(d)d.style.display=v===k?"block":"none";
    var b=document.getElementById(btnIds[k]);if(b)b.classList.toggle("on",v===k);
  });
  if(v==="h2h")initH2H();
  if(v==="partidos")cargarPartidosPublicos();
}
async function verPerfilPublico(nombre){
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  sc.innerHTML='<p class="hint">Cargando...</p>';mo.classList.add("show");
  var p=rankingData.find(function(r){return r[0]===nombre;});
  if(!p){sc.innerHTML='<p class="hint">Jugador no encontrado</p>';return;}
  var pos=rankingData.slice().sort(function(a,b){return b[1]-a[1];}).findIndex(function(r){return r[0]===nombre;})+1;
  var col=avatarColor(nombre);var ini=initials(nombre);
  var cat=CAT_A.indexOf(nombre)!==-1?'Categoría A':CAT_B.indexOf(nombre)!==-1?'Categoría B':'';
  var socioBadge=p[7]===true?'<span style="background:#15803d;color:#fff;border-radius:8px;padding:2px 8px;font-size:10px;font-weight:800;margin-left:6px">SOCIO ✓</span>':"";
  sc.innerHTML=
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">'+
      '<div class="avatar" style="background:'+col+';width:56px;height:56px;font-size:20px;flex-shrink:0">'+ini+'</div>'+
      '<div>'+
        '<div style="font-weight:900;font-size:18px">'+nombre+socioBadge+'</div>'+
        '<div style="font-size:12px;color:var(--suave);margin-top:3px">'+(cat?cat+' · ':'')+' Puesto #'+pos+'</div>'+
      '</div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">'+
      '<div style="text-align:center;background:var(--verde-claro);border-radius:12px;padding:10px 4px">'+
        '<div style="font-size:22px;font-weight:900;color:var(--verde-mid)">'+p[1]+'</div>'+
        '<div style="font-size:9px;color:var(--suave);font-weight:600">PTS</div></div>'+
      '<div style="text-align:center;background:#f0fdf4;border-radius:12px;padding:10px 4px">'+
        '<div style="font-size:22px;font-weight:900;color:#15803d">'+p[3]+'</div>'+
        '<div style="font-size:9px;color:var(--suave);font-weight:600">WINS</div></div>'+
      '<div style="text-align:center;background:#fef2f2;border-radius:12px;padding:10px 4px">'+
        '<div style="font-size:22px;font-weight:900;color:#dc2626">'+p[4]+'</div>'+
        '<div style="font-size:9px;color:var(--suave);font-weight:600">LOST</div></div>'+
      '<div style="text-align:center;background:#f8fafc;border-radius:12px;padding:10px 4px">'+
        '<div style="font-size:20px;font-weight:900;color:#1e3a5f">'+p[5]+'%</div>'+
        '<div style="font-size:9px;color:var(--suave);font-weight:600">PCT</div></div>'+
    '</div>'+
    '<div class="section-title" style="margin-top:0">Partidos jugados</div>'+
    '<div id="perfil-pub-partidos"><p class="hint">Cargando...</p></div>'+
    '<button class="btn sec" style="margin-top:12px" onclick="closeModal()">Cerrar</button>';
  // Cargar partidos del jugador
  try{
    var snap=await db.collection("partidos_atmas").where("estado","==","aprobado").get();
    var partidos=[];
    snap.forEach(function(doc){var d=doc.data();if(d.jugador1===nombre||d.jugador2===nombre)partidos.push(d);});
    partidos.sort(function(a,b){return(b.fecha||"")>(a.fecha||"")?1:-1;});
    var pp=el("perfil-pub-partidos");if(!pp)return;
    if(!partidos.length){pp.innerHTML='<p class="hint">Sin partidos registrados aún</p>';return;}
    var h="";
    partidos.forEach(function(r){
      var gano=r.ganador===nombre;
      var rival=gano?r.perdedor:r.ganador;
      var fechaFmt=r.fecha?r.fecha.split("-").reverse().join("/"):"-";
      h+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f3f4f6">'+
        '<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;background:'+(gano?"#dcfce7":"#fee2e2")+';color:'+(gano?"#15803d":"#dc2626")+'">'+(gano?"W":"L")+'</div>'+
        '<div style="flex:1">'+
          '<div style="font-size:13px;font-weight:700">'+(gano?"vs ":"vs ")+rival+'</div>'+
          '<div style="font-size:11px;color:var(--suave)">'+(r.sets||"—")+' · '+fechaFmt+'</div>'+
        '</div>'+
        '<div style="font-size:11px;font-weight:700;color:'+(gano?"#15803d":"#dc2626")+'">'+(gano?"Ganó":"Perdió")+'</div>'+
      '</div>';
    });
    pp.innerHTML=h;
  }catch(e){var pp2=el("perfil-pub-partidos");if(pp2)pp2.innerHTML='<p class="hint">Error al cargar partidos</p>';}
}

async function cargarPartidosPublicos(){
  var cont=el("lista-partidos-publica");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var snap=await db.collection("partidos_atmas").where("estado","==","aprobado").limit(100).get();
    if(snap.empty){cont.innerHTML='<p class="hint">Aún no hay partidos registrados</p>';return;}
    var allDocs=[];snap.forEach(function(doc){allDocs.push(doc.data());});
    allDocs.sort(function(a,b){var ta=a.ts&&a.ts.seconds?a.ts.seconds:0;var tb=b.ts&&b.ts.seconds?b.ts.seconds:0;return tb-ta;});
    var h="";var n=0;
    allDocs.forEach(function(r){
      n++;
      var fechaFmt=r.fecha?r.fecha.split("-").reverse().join("/"):"-";
      h+='<div style="background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.07)">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
          '<div style="flex:1">'+
            '<div style="font-size:13px;font-weight:800;color:var(--verde-osc)">'+r.ganador+'</div>'+
            '<div style="font-size:11px;color:var(--suave);margin:2px 0">ganó a <span style="color:var(--texto)">'+r.perdedor+'</span></div>'+
            '<div style="font-size:12px;font-weight:600;margin-top:4px">'+( r.sets||"—")+'</div>'+
          '</div>'+
          '<div style="text-align:right;flex-shrink:0">'+
            '<div style="font-size:11px;color:var(--suave)">'+fechaFmt+'</div>'+
            (r.contexto?'<div style="font-size:10px;color:#6366f1;font-weight:600;margin-top:2px">'+r.contexto+'</div>':'')+
          '</div>'+
        '</div>'+
      '</div>';
    });
    cont.innerHTML='<div style="font-size:11px;color:var(--suave);margin-bottom:10px">'+n+' partidos · temporada Jun-Ago 2026</div>'+h;
  }catch(e){if(cont)cont.innerHTML='<p class="hint">Error al cargar</p>';}
}

/* ─── FIREBASE ────────────────────────────────────────────────── */
const _noop={get:function(){return Promise.resolve({exists:false,forEach:function(){},data:function(){return{};}});},add:function(){return Promise.resolve({id:"local"});},set:function(){return Promise.resolve();},update:function(){return Promise.resolve();},delete:function(){return Promise.resolve();},where:function(){return _noop;},orderBy:function(){return _noop;},doc:function(){return _noop;},limit:function(){return _noop;},onSnapshot:function(cb){cb({forEach:function(){}});return function(){};},runTransaction:function(fn){return fn(_noop);}};
const _noopDb={collection:function(){return _noop;},runTransaction:function(fn){return fn(_noop);}};
var db=_noopDb;
try{
  firebase.initializeApp({apiKey:"AIzaSyC5WSNETjUxYfUpMr6nkOk8jjDqrD44Snw",authDomain:"atmas-tenis.firebaseapp.com",projectId:"atmas-tenis",storageBucket:"atmas-tenis.firebasestorage.app",messagingSenderId:"545823553419",appId:"1:545823553419:web:7131283910ded048c9a18e"});
  db=firebase.firestore();
  db.enablePersistence({synchronizeTabs:true}).catch(function(e){
    if(e.code==="failed-precondition"){console.warn("Persistencia offline: múltiples tabs abiertas");}
    else if(e.code==="unimplemented"){console.warn("Persistencia offline no soportada en este browser");}
  });
}catch(e){console.warn("Firebase no disponible:",e);}

/* ─── ESTADO DE RED ───────────────────────────────────────────── */
(function(){
  var banner=null;
  function showOfflineBanner(){
    if(banner)return;
    banner=document.createElement("div");
    banner.id="offline-banner";
    banner.textContent="Sin conexión · mostrando datos en caché";
    banner.style.cssText="position:fixed;top:0;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;font-size:12px;font-weight:700;padding:8px 18px;border-radius:0 0 12px 12px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.3);letter-spacing:.3px";
    document.body.appendChild(banner);
  }
  function hideOfflineBanner(){
    if(!banner)return;
    banner.remove();banner=null;
    toast("Conexión restaurada ✓");
  }
  window.addEventListener("offline",showOfflineBanner);
  window.addEventListener("online",hideOfflineBanner);
  if(!navigator.onLine)showOfflineBanner();
})();

/* ─── CONSTANTES ──────────────────────────────────────────────── */
const PAGO={nombre:"Marcelo Andrés Escalona Gálvez",rut:"12.637.853-K",banco:"Mercado Pago",tipo:"Cuenta Vista",cuenta:"1057752328",email:"locampinotenisclub@hotmail.com"};
const avatarColors=["#e74c3c","#e67e22","#f39c12","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00bcd4","#4caf50","#ff5722","#607d8b"];
function initials(n){if(!n)return"?";return n.split(" ").slice(0,2).map(function(x){return x[0];}).join("").toUpperCase();}
function avatarColor(n){if(!n)return avatarColors[0];var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%avatarColors.length;return avatarColors[h];}
function slugify(n){if(!n)return"";return n.toLowerCase().replace(/[^a-z0-9]/g,"_");}
function el(id){return document.getElementById(id);}

/* ─── DATOS INICIALES (solo para semilla) ─────────────────────── */
// Escalerilla Jun-Ago 2026 — actualizado 19/06/2026
var SEED_PLAYERS=[
  ["Manuel Illanes",0,0,0,0,0],
  ["Mauricio Morales",0,0,0,0,0],
  ["Sebastián Brito",0,0,0,0,0],
  ["Andy Cespedes",0,0,0,0,0],
  ["Osvaldo Valdivia",0,0,0,0,0],
  ["Rubén González",0,0,0,0,0],
  ["Emilio Alzérreca",0,0,0,0,0],
  ["Ignacio Peyresblanque",0,0,0,0,0],
  ["Oscar Henríquez",0,0,0,0,0],
  ["Nicolás Martínez",0,0,0,0,0],
  ["Felipe Martínez",0,0,0,0,0],
  ["Patricio Chamorro",0,0,0,0,0],
  ["Marcelo Escalona",0,0,0,0,0],
  ["Rodrigo Bernal",0,0,0,0,0],
  ["Aurelio Saavedra",0,0,0,0,0],
  ["Hipólito Bello",0,0,0,0,0],
  ["Edgardo Pacheco",0,0,0,0,0],
  ["Felipe Miño",0,0,0,0,0],
  ["Vicente Rodríguez",0,0,0,0,0],
  ["Pablo Ortiz",0,0,0,0,0],
  ["Rodrigo Navarro",0,0,0,0,0],
  ["César Moreno",0,0,0,0,0],
  ["Alfredo Muñoz",0,0,0,0,0],
  ["Carlos Tapia",0,0,0,0,0],
  ["Néstor Zárate",0,0,0,0,0],
  ["Pablo Concha",0,0,0,0,0]
];

/* ─── RANKING LIVE DESDE FIRESTORE ───────────────────────────── */
var rankingData=[];
var rankingListener=null;

async function resetearRankingFirestore(){
  try{
    // Verificar si ya se hizo el reset de temporada Jun-Ago 2026
    var flagSnap=await db.collection("config_app").doc("reset_jun2026_v2").get();
    if(flagSnap.exists)return; // Ya se hizo, no repetir
    // Resetear todos los jugadores a cero
    var snap=await db.collection("ranking_atmas").get();
    if(!snap.empty){
      var batch=db.batch();
      snap.forEach(function(doc){
        batch.update(doc.ref,{pts:0,jugados:0,ganados:0,perdidos:0,pct:0});
      });
      await batch.commit();
    } else {
      var batch2=db.batch();
      SEED_PLAYERS.forEach(function(p){
        var ref=db.collection("ranking_atmas").doc(slugify(p[0]));
        batch2.set(ref,{nombre:p[0],pts:0,jugados:0,ganados:0,perdidos:0,pct:0},{merge:true});
      });
      await batch2.commit();
    }
    // Archivar partidos anteriores
    var snapP=await db.collection("partidos_atmas").get();
    if(!snapP.empty){
      var batch3=db.batch();
      snapP.forEach(function(doc){batch3.update(doc.ref,{estado:"archivado"});});
      await batch3.commit();
    }
    // Marcar como hecho para no repetir
    await db.collection("config_app").doc("reset_jun2026_v2").set({done:true,fecha:new Date().toISOString()});
  }catch(e){console.warn("resetearRankingFirestore error:",e);}
}

async function seedRankingIfEmpty(){
  try{
    var snap=await db.collection("ranking_atmas").limit(1).get();
    if(!snap.empty)return;
    var batch=db.batch();
    SEED_PLAYERS.forEach(function(p){
      var ref=db.collection("ranking_atmas").doc(slugify(p[0]));
      batch.set(ref,{nombre:p[0],pts:p[1],jugados:p[2],ganados:p[3],perdidos:p[4],pct:p[5]},{merge:true});
    });
    await batch.commit();
  }catch(e){console.warn("Seed error:",e);}
}

function iniciarRankingLive(){
  if(rankingListener)rankingListener();
  try{
    rankingListener=db.collection("ranking_atmas").orderBy("pts","desc").onSnapshot(function(snap){
      rankingData=[];
      snap.forEach(function(doc){
        var d=doc.data();
        rankingData.push([d.nombre,d.pts||0,d.jugados||0,d.ganados||0,d.perdidos||0,d.pct||0,doc.id,d.socio||false]);
      });
      if(rankingData.length===0)rankingData=SEED_PLAYERS.map(function(p){return p.slice();});
      renderRanking();
      actualizarStats();
    },function(e){
      console.warn("Ranking listener error:",e);
      rankingData=SEED_PLAYERS.map(function(p){return p.slice();});
      renderRanking();
      var el2=el("ranking-list");
      if(el2){var existing=el2.querySelector(".rank-error");if(!existing){var errBanner=document.createElement("div");errBanner.className="rank-error";errBanner.style.cssText="background:#fef9c3;border:1px solid #fbbf24;border-radius:10px;padding:10px 14px;font-size:12px;color:#92400e;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center";errBanner.innerHTML='<span>⚠️ Sin conexión · datos en caché</span><button onclick="iniciarRankingLive();this.parentNode.remove()" style="background:none;border:1px solid #92400e;border-radius:6px;padding:3px 8px;font-size:11px;color:#92400e;cursor:pointer">Reintentar</button>';el2.prepend(errBanner);}}
    });
  }catch(e){
    rankingData=SEED_PLAYERS.map(function(p){return p.slice();});
    renderRanking();
  }
}

function renderRanking(){
  var lista=rankingData.slice().sort(function(a,b){return b[1]-a[1];});
  var maxPts=Math.max(1,...lista.map(function(p){return p[1];}));
  var rh="";
  lista.forEach(function(p,i){
    var c=i===0?"top1":i===1?"top2":i===2?"top3":"";
    var col=avatarColor(p[0]);var ini=initials(p[0]);
    var cat=CAT_A.indexOf(p[0])!==-1?'<span style="font-size:9px;font-weight:700;background:var(--verde-claro);color:var(--verde-osc);border-radius:10px;padding:1px 6px;margin-left:5px">A</span>':CAT_B.indexOf(p[0])!==-1?'<span style="font-size:9px;font-weight:700;background:#e8f4fd;color:#1565c0;border-radius:10px;padding:1px 6px;margin-left:5px">B</span>':"";
    var socioBadge=p[7]===true?'<span style="font-size:9px;font-weight:800;background:#15803d;color:#fff;border-radius:10px;padding:1px 7px;margin-left:5px">SOCIO ✓</span>':"";
    var itemStyle=p[7]===true?'border-left:3px solid #15803d;':'';
    rh+='<div class="rank-item '+c+'" style="'+itemStyle+';cursor:pointer" onclick="verPerfilPublico(\''+p[0].replace(/'/g,"\\'")+'\')"><div class="rank-pos">'+(i+1)+'</div><div class="avatar" style="background:'+col+'">'+ini+'</div><div class="rank-info"><div class="nm">'+p[0]+cat+socioBadge+'</div><div class="sub">'+p[3]+'G &middot; '+p[4]+'P &middot; '+p[2]+' jugados</div><div class="bar"><i style="width:'+(p[1]/maxPts*100)+'%"></i></div></div><div class="rank-pts"><div class="p">'+p[1]+'</div><div class="pct">'+p[5]+'%</div></div></div>';
  });
  var rl=el("ranking-list");if(rl)rl.innerHTML=rh||'<p class="hint">Sin datos</p>';
  // Actualizar tarjeta líder dinámica
  if(lista.length>0){
    var lider=lista[0];
    var ln=el("lider-nombre");var lp=el("lider-pts");var lj=el("lider-jugados");var lpct=el("lider-pct");
    if(ln)ln.textContent="#1 · "+lider[0];
    if(lp)lp.textContent=lider[1];
    if(lj)lj.textContent=lider[2];
    if(lpct)lpct.textContent=lider[5]+"%";
  }
}

async function actualizarStats(){
  var elJ=el("stat-jugadores");
  if(elJ)elJ.textContent=rankingData.length||SEED_PLAYERS.length;
  try{var snap=await db.collection("partidos_atmas").get();var elP=el("stat-partidos");if(elP)elP.textContent=snap.size;}catch(e){}
}

var CAT_A=["Mauricio Morales","Sebastián Brito","Osvaldo Valdivia","Emilio Alzérreca","Oscar Henríquez","Patricio Chamorro","Rodrigo Bernal","Hipólito Bello","Edgardo Pacheco","Pablo Ortiz","Rodrigo Navarro","Carlos Tapia","Néstor Zárate","Pablo Concha"];
var CAT_B=["Manuel Illanes","Andy Cespedes","Ignacio Peyresblanque","Felipe Martínez","Aurelio Saavedra","Felipe Miño","César Moreno","Alfredo Muñoz"];
function generarCuadros(){
  function buildFromList(ps){var n=ps.length;var matches=[];for(var i=0;i<8;i++){var a=ps[i]||null;var b=ps[n-1-i]||null;matches.push([a,b,null]);}return matches;}
  return{oro:buildFromList(CAT_A),plata:buildFromList(CAT_B)};
}
var cuadros={oro:[],plata:[]};
function tie(a,b,w){function c(x){return x?(x===w?"p w":"p"):"p tbd";}return '<div class="tie"><div class="'+c(a)+'">'+(a||"Por definir")+'</div><div class="'+c(b)+'">'+(b||"Por definir")+'</div></div>';}
function renderBracket(k){
  var bk='<div class="round"><h4>Ronda 16</h4>';
  cuadros[k].forEach(function(t){bk+=tie(t[0],t[1],t[2]);});
  bk+='</div><div class="round"><h4>Cuartos</h4>';for(var i=0;i<4;i++)bk+=tie(null,null);
  bk+='</div><div class="round"><h4>Semifinal</h4>';for(var i=0;i<2;i++)bk+=tie(null,null);
  bk+='</div><div class="round"><h4>Final</h4>'+tie(null,null)+'</div>';
  var br=el("bracket");if(br)br.innerHTML=bk;
}
function setCuadro(k){renderBracket(k);var so=el("segOro");var sp=el("segPlata");if(so)so.classList.toggle("on",k==="oro");if(sp)sp.classList.toggle("on",k==="plata");}

/* ─── PROFESORES ──────────────────────────────────────────────── */
const profesores=[{nombre:"Marcelo Escalona G.",rol:"Director ATMAS &middot; Profesor de Tenis",bio:"Entrenador certificado con m&aacute;s de 15 a&ntilde;os de experiencia en formaci&oacute;n y competencia. Director de ATMAS Academia de Tenis AT+ en el Club Las Avestruces, Quilicura. Especialista en desarrollo de jugadores desde iniciaci&oacute;n hasta alto rendimiento.",certs:{"PTR":["Nivel 1","Nivel 2","Nivel 3","High Performance"],"ITF":["Nivel 1","Nivel 2","Play and Stay"],"PST":["Nivel 1 Entrenador Nacional","Nivel 2"],"Play Tenis":["Profesor de Tenis","Pelota Roja","Pelota Naranja"]}}];

function renderProfesores(){
  var epl=el("profes-list");if(!epl)return;
  try{
    var h="";
    profesores.forEach(function(prof){
      var ini=initials(prof.nombre);var col=avatarColor(prof.nombre);
      var certParts=Object.entries(prof.certs).map(function(ent){return ent[0]+' ('+ent[1].join(', ')+')';});
      var certsH='<p style="font-size:13px;color:rgba(255,255,255,.88);line-height:1.7;margin:0">'+certParts.join(' · ')+'</p>';
      h+=
        '<div style="background:#fff;border-radius:20px;margin-bottom:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1)">'+
          // Header verde degradado
          '<div style="background:linear-gradient(135deg,var(--verde-osc),var(--verde-mid));padding:20px 18px 22px">'+
            '<div style="display:flex;align-items:center;gap:14px">'+
              '<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;flex-shrink:0;border:3px solid rgba(255,255,255,.4)">'+ini+'</div>'+
              '<div>'+
                '<div style="font-weight:900;font-size:19px;color:#fff;line-height:1.1">'+prof.nombre+'</div>'+
                '<div style="font-size:12px;color:var(--lima);font-weight:700;margin-top:4px;letter-spacing:.3px">'+prof.rol+'</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
          // Bio + Certificaciones en bloque arcilla
          '<div style="background:linear-gradient(135deg,#7a3010,#b04a18);padding:16px 18px">'+
            '<div style="font-size:10px;font-weight:800;color:var(--lima);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">Sobre el entrenador</div>'+
            '<p style="font-size:14px;color:rgba(255,255,255,.88);line-height:1.65;margin:0 0 18px">'+prof.bio+'</p>'+
            '<div style="font-size:10px;font-weight:800;color:var(--lima);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px">Certificaciones</div>'+
            certsH+
          '</div>'+
        '</div>';
    });
    epl.innerHTML=h;
  }catch(e){console.warn("renderProfesores error:",e);}
}
renderProfesores();
renderSociosBloques();
cargarFeedActividad();

/* ─── VERDADES INCOMODAS ──────────────────────────────────────── */
const verdades=[
  {n:1,t:"Quieres mejorar tu tenis?",url:"https://youtube.com/watch?v=jhkxConxVxU&feature=shared"},
  {n:2,t:"El pasapelotas no te gana.",url:null},
  {n:3,t:"Tu problema no es la raqueta.",url:null},
  {n:4,t:"El miedo a equivocarte te esta frenando.",url:null},
  {n:5,t:"Jugar seguro no siempre es jugar inteligente.",url:null},
  {n:6,t:"Ganar no siempre significa mejorar.",url:null},
  {n:7,t:"Tu rival mas dificil eres tu mismo.",url:null}
];
function renderVerdades(){
  var evl=el("vi-list");if(!evl)return;
  try{
    var h="";
    verdades.forEach(function(v){
      if(v.url){
        h+='<a href="'+v.url+'" target="_blank" rel="noopener" style="text-decoration:none;display:block"><div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.1)"><div style="background:var(--lima);color:var(--negro);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0">'+v.n+'</div><div style="flex:1"><div style="font-size:14px;font-weight:600;color:#fff">'+v.t+'</div><div style="font-size:10px;color:var(--lima);font-weight:700;margin-top:2px">&#9654; Ver en YouTube</div></div><div style="background:var(--lima);color:var(--negro);border-radius:20px;padding:3px 8px;font-size:10px;font-weight:800;white-space:nowrap">NUEVO</div></div></a>';
      }else{
        h+='<div style="opacity:.55;display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.1)"><div style="background:rgba(255,255,255,.15);color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0">'+v.n+'</div><div style="flex:1;font-size:14px;font-weight:600;color:#fff">'+v.t+'</div><div style="font-size:10px;color:rgba(255,255,255,.4);white-space:nowrap">Proximo</div></div>';
      }
    });
    h+='<a href="https://youtube.com/@marceloescalona-p4f" target="_blank" rel="noopener" style="display:block;text-align:center;margin-top:12px;padding:8px;background:rgba(255,255,255,.1);border-radius:12px;color:var(--lima);font-size:12px;font-weight:700;text-decoration:none">&#9654; Ver canal completo en YouTube</a>';
    evl.innerHTML=h;
  }catch(e){console.warn("renderVerdades error:",e);}
}
renderVerdades();

/* ─── MERCADO PAGO ────────────────────────────────────────────── */
const MP={cancha1hr:"https://mpago.la/2JDpPFu",cancha2hrs:"https://mpago.la/1m28aAc",torneo20:"https://mpago.la/REEMPLAZAR_T20",torneo15:"https://mpago.la/REEMPLAZAR_T15",escalerilla:"https://mpago.la/REEMPLAZAR_ESC",socio:"https://mpago.la/REEMPLAZAR_SOCIO",inscripcion:"https://mpago.la/REEMPLAZAR_INSC"};
function pagoHTML(monto,label,link){
  var t=PAGO;
  function _fila(k,v){return '<div class="pagobox row"><span class="k">'+k+':</span><span class="v">'+v+'</span></div>';}
  var _txt="Datos transferencia ATMAS\nNombre: "+t.nombre+"\nRUT: "+t.rut+"\nBanco: "+t.banco+"\nTipo: "+t.tipo+"\nN° Cuenta: "+t.cuenta+"\nEmail: "+t.email+"\nMonto: $"+monto.toLocaleString("es-CL");
  return '<div class="pagobox">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
    '<h4 style="margin:0">&#128180; Datos de transferencia</h4>'+
    '<button class="copy-btn" style="font-size:13px;padding:6px 12px" onclick="navigator.clipboard.writeText(\''+_txt.replace(/'/g,"\\'").replace(/\n/g,'\\n')+'\').then(function(){toast(\'Datos copiados ✓\');})">&#128203; Copiar</button>'+
    '</div>'+
    _fila("Nombre",t.nombre)+_fila("RUT",t.rut)+_fila("Banco",t.banco+' &middot; '+t.tipo)+_fila("N&ordm; Cuenta","<b>"+t.cuenta+"</b>")+_fila("Email",t.email)+
    _fila("Monto",'<b style="font-size:17px;color:var(--verde-osc)">$'+monto.toLocaleString("es-CL")+'</b>')+
    '<a class="btn wa" href="'+link+'" target="_blank" onclick="registrarIntentoPago(\''+label+'\','+monto+')" style="margin-top:12px">Pagar con Mercado Pago &rarr;</a></div>';
}
function registrarIntentoPago(label,monto){try{db.collection("pagos_mp").add({label:label,monto:monto,ts:firebase.firestore.FieldValue.serverTimestamp()});}catch(e){}}

/* ─── AUTH ────────────────────────────────────────────────────── */
var auth=null;
try{auth=firebase.auth();}catch(e){console.warn("Auth no disponible:",e);}

function getPerfil(){try{return JSON.parse(localStorage.getItem("atmas_perfil")||"null");}catch(e){return null;}}

function savePerfil(p){
  try{
    localStorage.setItem("atmas_perfil",JSON.stringify(p));
    var uid=auth&&auth.currentUser?auth.currentUser.uid:null;
    var docId=uid||(p.rut?p.rut.replace(/\./g,"").replace(/-/g,""):null);
    if(docId)db.collection("jugadores").doc(docId).set(p,{merge:true}).catch(function(e){console.warn("savePerfil Firestore error:",e);});
  }catch(e){console.warn("savePerfil error:",e);}
}

var ADMIN_EMAILS=["joseluissalazar81@gmail.com","locampinotenisclub@hotmail.com"];
function esAdmin(nombre,email){
  if(email&&ADMIN_EMAILS.indexOf((email||"").toLowerCase().trim())!==-1)return true;
  if(!nombre)return false;
  var n=nombre.toLowerCase().trim();
  return(n.includes("marcelo")&&n.includes("escalona"))||(n.includes("jorge")&&n.includes("borges"));
}
function formatRut(inp){if(!inp)return;var v=inp.value.replace(/[^0-9kK]/g,"");if(v.length>1){var d=v.slice(0,-1);var dv=v.slice(-1);var fmt="";for(var i=d.length-1,j=0;i>=0;i--,j++){if(j>0&&j%3===0)fmt="."+fmt;fmt=d[i]+fmt;}inp.value=fmt+"-"+dv;}else{inp.value=v;}}

/* ─── AUTH UI: UN SOLO PUNTO DE CONTROL ──────────────────────── */
function mostrarLogin(){
  var ls=el("login-screen");var hd=document.querySelector("header");var ct=document.querySelector(".content");var tb=document.querySelector(".tabbar");
  if(ls)ls.classList.add("show");
  if(hd)hd.style.display="none";
  if(ct)ct.style.display="none";
  if(tb)tb.style.display="none";
}
function mostrarApp(){
  var ls=el("login-screen");var hd=document.querySelector("header");var ct=document.querySelector(".content");var tb=document.querySelector(".tabbar");
  if(ls)ls.classList.remove("show");
  if(hd)hd.style.display="";
  if(ct)ct.style.display="";
  if(tb)tb.style.display="";
}
function showAuthStep1(){
  ["auth-step1","auth-crear","auth-entrar","auth-step2","auth-email","auth-rut"].forEach(function(id){var e=el(id);if(e)e.style.display="none";});
  var s1=el("auth-step1");if(s1)s1.style.display="";
}
function showCrearPerfil(){
  ["auth-step1","auth-entrar","auth-step2","auth-email","auth-rut"].forEach(function(id){var e=el(id);if(e)e.style.display="none";});
  var c=el("auth-crear");if(c)c.style.display="";
}
function showEntrarEmail(){
  ["auth-step1","auth-crear","auth-step2","auth-email","auth-rut"].forEach(function(id){var e=el(id);if(e)e.style.display="none";});
  var e=el("auth-entrar");if(e)e.style.display="";
}
function showAuthEmail(){showEntrarEmail();}
function showAuthRut(){showAuthStep1();}
function showAuthRut(){
  var s1=el("auth-step1");var s2=el("auth-step2");var rutBox=el("auth-rut");
  if(s1)s1.style.display="none";if(s2)s2.style.display="none";
  if(!rutBox)return;
  rutBox.style.display="";
  rutBox.innerHTML='<div style="font-size:18px;font-weight:800;margin-bottom:16px">Ingresar con RUT</div><div class="field"><label>Tu RUT</label><input id="rec-rut" placeholder="Ej: 12.345.678-9" oninput="formatRut(this)" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="characters"></div><button class="btn" onclick="recuperarPerfil()">Buscar mi perfil</button><div style="text-align:center;margin-top:12px"><span onclick="showAuthStep1()" style="font-size:12px;color:#9ca3af;cursor:pointer;text-decoration:underline">Volver</span></div>';
}
function showAuthStep2(){var s1=el("auth-step1");var em=el("auth-email");var s2=el("auth-step2");if(s1)s1.style.display="none";if(em)em.style.display="none";if(s2)s2.style.display="";}

async function loginGoogle(){
  if(!auth){toast("Auth no disponible");return;}
  var provider=new firebase.auth.GoogleAuthProvider();
  try{
    var result=await auth.signInWithPopup(provider);
    if(result&&result.user)return;
  }catch(e){
    if(e.code==="auth/popup-blocked"||e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request"){
      try{
        localStorage.setItem("_gRedirect","1");
        await auth.signInWithRedirect(provider);
      }catch(e2){
        localStorage.removeItem("_gRedirect");
        toast("Error Google: "+e2.message);
      }
    }else{
      toast("Error Google: "+e.message);
    }
  }
}

async function crearCuenta(){
  if(!auth){toast("Auth no disponible");return;}
  var nombre=((el("crear-nombre")||{}).value||"").trim();
  var rut=((el("crear-rut")||{}).value||"").trim();
  var em=((el("crear-em")||{}).value||"").trim();
  var pw=((el("crear-pw")||{}).value||"").trim();
  if(!nombre||!rut){toast("Nombre y RUT son obligatorios");return;}
  if(!em||!pw){toast("Email y contraseña son obligatorios");return;}
  if(pw.length<6){toast("Contraseña: mínimo 6 caracteres");return;}
  try{
    var cred=await auth.createUserWithEmailAndPassword(em,pw);
    var p={nombre:nombre,rut:rut,tel:"",fnac:"",socio:false,email:em};
    var pv=await vincularRankingExistente(p);
    var enRanking=(pv.jugados>0||pv.pts>0);
    savePerfil(p);mostrarApp();renderPerfil();
    if(enRanking){go("escalerilla");toast("¡Bienvenido, "+nombre+"! Tu historial fue vinculado ✓");}
    else{go("inicio");toast("Bienvenido/a "+nombre+"!");}
  }catch(e){
    if(e.code==="auth/email-already-in-use"){
      // Si es Gmail, probablemente ya tiene cuenta Google
      if(em.endsWith("@gmail.com")){
        toast("Ese Gmail ya está registrado. Usa 'Entrar con Google'.");
        setTimeout(function(){showAuthStep1();},1500);
      }else{
        toast("Ese email ya tiene cuenta. Usa 'Ya tengo cuenta · Ingresar'.");
        setTimeout(function(){showEntrarEmail();var f=el("entrar-em");if(f)f.value=em;},1500);
      }
    }else if(e.code==="auth/weak-password"){toast("Contraseña muy débil.");}
    else{toast("Error: "+e.message);}
  }
}

async function loginEmail(){
  if(!auth){toast("Auth no disponible");return;}
  var emEl=el("entrar-em")||el("auth-em");
  var pwEl=el("entrar-pw")||el("auth-pw");
  var em=(emEl?emEl.value||"":"").trim();
  var pw=(pwEl?pwEl.value||"":"").trim();
  if(!em||!pw){toast("Ingresa email y contrasena");return;}
  try{
    await auth.signInWithEmailAndPassword(em,pw);
  }catch(e){
    if(e.code==="auth/user-not-found"||e.code==="auth/wrong-password"||e.code==="auth/invalid-credential"){
      toast("Email o contraseña incorrectos");
    }else{toast("Error: "+e.message);}
  }
}

async function registrarEmail(){
  if(!auth){toast("Auth no disponible");return;}
  var em=(el("auth-em")?el("auth-em").value||"":"").trim();
  var pw=(el("auth-pw")?el("auth-pw").value||"":"").trim();
  if(!em||!pw){toast("Ingresa email y contrasena");return;}
  if(pw.length<6){toast("Minimo 6 caracteres");return;}
  try{
    await auth.createUserWithEmailAndPassword(em,pw);
  }catch(e){
    if(e.code==="auth/configuration-not-found"||e.code==="auth/internal-error"){
      toast("Email Auth no activado aun. Usa RUT por ahora.");showAuthRut();
    }else{toast("Error: "+e.message);}
  }
}

/* ─── AUTH STATE: UNICO CONTROLADOR DE SESION ────────────────── */
async function onAuthStateChanged(user){
  try{
    if(!user){
      if(localStorage.getItem("_gRedirect")){return;}
      var p=getPerfil();
      if(p){mostrarApp();renderPerfil();return;}
      mostrarLogin();showAuthStep1();
      return;
    }
    if(user.isAnonymous){
      var p=getPerfil();
      if(p){mostrarApp();renderPerfil();}
      else{mostrarLogin();showAuthStep1();}
      return;
    }
    var snap=await db.collection("jugadores").doc(user.uid).get();
    if(snap.exists&&snap.data().nombre){
      var p=snap.data();
      localStorage.setItem("atmas_perfil",JSON.stringify(p));
      mostrarApp();renderPerfil();go("inicio");
      toast("Bienvenido, "+p.nombre+"!");
    }else{
      // Usuario Google sin perfil: crear uno con sus datos de Google
      var p={nombre:user.displayName||user.email||"Usuario",rut:"",tel:"",fnac:"",socio:false,email:user.email||""};
      var pv=await vincularRankingExistente(p);
      var enRanking=(pv.jugados>0||pv.pts>0);
      savePerfil(p);mostrarApp();renderPerfil();
      if(enRanking){go("escalerilla");toast("¡Bienvenido, "+p.nombre+"! Tu historial fue vinculado ✓");}
      else{go("perfil");toast("Bienvenido! Completa tu RUT en Mi Perfil.");}
    }
  }catch(e){
    console.warn("onAuthStateChanged error:",e);
    var p=getPerfil();
    if(p){mostrarApp();renderPerfil();}
    else{mostrarLogin();showAuthStep1();}
  }
}

if(auth){auth.onAuthStateChanged(onAuthStateChanged);}

async function vincularMiRanking(){
  var p=getPerfil();if(!p||!p.nombre){toast("Primero completa tu perfil");return;}
  toast("Buscando tu historial...");
  try{
    var docId=slugify(p.nombre);
    var snap=await db.collection("ranking_atmas").doc(docId).get();
    if(!snap.exists){
      toast("Tu nombre \""+p.nombre+"\" no coincide con ningún jugador del ranking. Pedile a Marcelo que lo verifique.");
      return;
    }
    var rd=snap.data();
    p.pts=rd.pts||0;p.jugados=rd.jugados||0;p.ganados=rd.ganados||0;
    p.perdidos=rd.perdidos||0;p.pct=rd.pct||0;
    if(rd.socio)p.socio=true;
    if(p.rut)await db.collection("ranking_atmas").doc(docId).set({rut:p.rut,tel:p.tel||""},{merge:true});
    savePerfil(p);renderPerfil();
    toast("✓ Historial vinculado — "+p.jugados+" partido(s), "+p.pts+" puntos");
  }catch(e){toast("Error al vincular: "+e.message);}
}

async function vincularRankingExistente(perfil){
  try{
    var docId=slugify(perfil.nombre);
    var snap=await db.collection("ranking_atmas").doc(docId).get();
    if(!snap.exists)return perfil;
    var rd=snap.data();
    perfil.pts=rd.pts||0;perfil.jugados=rd.jugados||0;perfil.ganados=rd.ganados||0;
    perfil.perdidos=rd.perdidos||0;perfil.pct=rd.pct||0;
    if(rd.socio)perfil.socio=true;
    var update={};
    if(perfil.rut)update.rut=perfil.rut;
    if(perfil.tel)update.tel=perfil.tel;
    if(perfil.email)update.email=perfil.email;
    if(Object.keys(update).length)await db.collection("ranking_atmas").doc(docId).set(update,{merge:true});
    return perfil;
  }catch(e){console.warn("vincularRankingExistente:",e);return perfil;}
}

async function completarPerfil(){
  var nombre=((el("reg-nombre")||{}).value||"").trim();
  var rut=((el("reg-rut")||{}).value||"").trim();
  var tel=((el("reg-tel")||{}).value||"").trim();
  var fnac=(el("reg-fnac")||{}).value||"";
  if(!nombre||!rut){toast("Nombre y RUT son obligatorios");return;}
  var p={nombre:nombre,rut:rut,tel:tel,fnac:fnac,socio:false};
  var enRanking=false;
  try{
    var pv=await vincularRankingExistente(p);
    enRanking=(pv.jugados>0||pv.pts>0);
  }catch(e){}
  savePerfil(p);mostrarApp();renderPerfil();
  if(enRanking){go("escalerilla");toast("¡Bienvenido, "+nombre+"! Tu historial fue vinculado ✓");}
  else{go("inicio");toast("Bienvenido "+nombre+"!");}
}

async function recuperarPerfil(){
  var rutEl=el("rec-rut");
  var rut=(rutEl?rutEl.value||"":"").trim();
  if(!rut){toast("Ingresa tu RUT");return;}
  toast("Buscando perfil...");
  try{
    var rutNorm=rut.replace(/\./g,"").replace(/-/g,"");
    var direct=await db.collection("jugadores").doc(rutNorm).get();
    if(direct.exists&&direct.data().nombre){
      var p=direct.data();
      savePerfil(p);mostrarApp();renderPerfil();go("inicio");
      toast("Bienvenido de vuelta, "+p.nombre+"!");return;
    }
    var snap=await db.collection("jugadores").where("rut","==",rut).limit(1).get();
    if(!snap.empty){
      var p=snap.docs[0].data();
      savePerfil(p);mostrarApp();renderPerfil();go("inicio");
      toast("Bienvenido de vuelta, "+p.nombre+"!");return;
    }
    toast("RUT no encontrado. Crea tu perfil.");
    var rutBox=el("auth-rut");
    if(rutBox){rutBox.innerHTML='<div style="font-size:18px;font-weight:800;margin-bottom:12px">Ingresar con RUT</div><div style="background:#fee2e2;border-radius:12px;padding:12px;font-size:13px;color:#b91c1c;margin-bottom:14px">&#10060; RUT <b>'+rut+'</b> no tiene perfil en el sistema.</div><button class="btn" onclick="prepararCrearPerfil(\''+rut+'\')">Crear mi perfil ahora</button><div style="text-align:center;margin-top:12px"><span onclick="showAuthRut()" style="font-size:12px;color:#9ca3af;cursor:pointer;text-decoration:underline">Intentar otro RUT</span> &nbsp;·&nbsp; <span onclick="showAuthStep1()" style="font-size:12px;color:#9ca3af;cursor:pointer;text-decoration:underline">Volver</span></div>';}
  }catch(e){
    console.warn("recuperarPerfil error:",e);
    toast("Error de conexion. Intenta de nuevo.");
    var rutBox2=el("auth-rut");
    if(rutBox2){rutBox2.innerHTML='<div style="font-size:18px;font-weight:800;margin-bottom:12px">Ingresar con RUT</div><div style="background:#fee2e2;border-radius:12px;padding:12px;font-size:13px;color:#b91c1c;margin-bottom:14px">&#9888; No se pudo conectar. Intenta de nuevo.</div><button class="btn" onclick="showAuthRut()">Reintentar</button><button class="btn sec" style="margin-top:8px" onclick="prepararCrearPerfil(\''+rut+'\')">Crear perfil nuevo</button><div style="text-align:center;margin-top:12px"><span onclick="showAuthStep1()" style="font-size:12px;color:#9ca3af;cursor:pointer;text-decoration:underline">Volver</span></div>';}
  }
}

function registrarPerfil(){completarPerfil();}
function prepararCrearPerfil(rut){showAuthStep2();var rEl=el("reg-rut");if(rEl)rEl.value=rut;var tit=document.querySelector("#auth-step2 div");if(tit)tit.textContent="Crear mi perfil";}

function cerrarSesion(){
  localStorage.removeItem("atmas_perfil");
  if(auth)auth.signOut().catch(function(){});
  mostrarLogin();showAuthStep1();
  toast("Sesion cerrada");
}

/* ─── PERFIL ──────────────────────────────────────────────────── */
function renderPerfil(){
  var pBody=el("perfil-body");if(!pBody)return;
  try{
    var p=getPerfil();
    if(!p){
      pBody.innerHTML='<div class="hero" style="margin-bottom:14px"><div class="ball"></div><h2>Bienvenido a ATMAS</h2><p>Tu academia de tenis en un solo lugar.</p></div><div class="infobox" style="margin-bottom:12px"><div style="font-weight:800;font-size:14px;margin-bottom:10px">Ya soy miembro &middot; Ingresar con RUT</div><div class="field"><label>Tu RUT</label><input id="rec-rut" placeholder="Ej: 12.345.678-9" oninput="formatRut(this)"></div><button class="btn" onclick="recuperarPerfil()">Ingresar</button></div><div style="text-align:center;color:var(--suave);font-size:12px;margin:8px 0">o</div><div class="infobox"><div style="font-weight:800;font-size:14px;margin-bottom:10px">Soy nuevo &middot; Crear perfil</div><div class="field"><label>Nombre completo</label><input id="reg-nombre" placeholder="Ej: Juan Perez"></div><div class="field"><label>RUT</label><input id="reg-rut" placeholder="Ej: 12.345.678-9" oninput="formatRut(this)"></div><div class="field"><label>Fecha de nacimiento</label><input id="reg-fnac" type="date"></div><div class="field"><label>Telefono</label><input id="reg-tel" type="tel" placeholder="+569 XXXX XXXX"></div><button class="btn sec" onclick="registrarPerfil()">Crear mi perfil</button></div>';
      return;
    }
    if(esAdmin(p.nombre,p.email||"")){adminUnlocked=true;renderPerfilAdmin(p,pBody);return;}
    var jugador=rankingData.find(function(j){return j[0].toLowerCase()===p.nombre.toLowerCase();});
    var pos=jugador?rankingData.indexOf(jugador)+1:null;
    var ini=initials(p.nombre);var col=avatarColor(p.nombre);
    var esSocio=p.socio||!!getSocioTier();
    var socioTag=esSocio?'<span class="cupos" style="background:#15803d;color:#fff;font-weight:800">SOCIO ✓</span>':'<span class="cupos">Sin members&iacute;a</span>';
    var pct=jugador?jugador[5]:0;
    var statsHtml=jugador?'<div class="mycard" style="margin-bottom:14px"><div class="pos">Posicion #'+pos+' &middot; Escalerilla ATMAS</div><div class="name">'+p.nombre+'</div><div class="row"><div><span class="big">'+jugador[1]+'</span><span class="cap">Puntos</span></div><div><span class="big">'+jugador[3]+'</span><span class="cap">Ganados</span></div><div><span class="big">'+jugador[4]+'</span><span class="cap">Perdidos</span></div><div><span class="big">'+pct+'%</span><span class="cap">Rendimiento</span></div></div></div>':'<div class="aviso">Aun no tienes partidos en la escalerilla. Juega y sube tu ranking!</div>';
    var estiloTag=(p.estilo||p.golpe)?'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+[p.estilo,p.golpe,p.superficie].filter(Boolean).map(function(x){return'<span style="background:var(--verde-claro);color:var(--verde-osc);border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">'+x+'</span>';}).join('')+'</div>':"";
    pBody.innerHTML=
      '<div style="display:flex;align-items:center;gap:13px;background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div class="avatar" style="background:'+col+';width:54px;height:54px;font-size:19px;flex-shrink:0">'+ini+'</div><div style="flex:1"><div style="font-weight:800;font-size:17px">'+p.nombre+'</div><div style="font-size:12px;color:var(--suave)">RUT: '+p.rut+'</div><div style="font-size:12px;color:var(--suave);margin-top:2px">'+(p.tel||"")+'</div>'+estiloTag+'</div>'+socioTag+'</div>'+
      statsHtml+
      // Accesos rápidos
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'+
        '<button class="acc" onclick="go(\'escalerilla\')" style="text-align:center;padding:14px 8px">'+
          '<div style="font-size:22px">🏆</div>'+
          '<div style="font-size:13px;font-weight:700;margin-top:4px">Escalerilla</div>'+
          '<div style="font-size:11px;color:var(--suave)">Ver ranking</div>'+
        '</button>'+
        '<button class="acc" onclick="go(\'mis-reservas\')" style="text-align:center;padding:14px 8px">'+
          '<div style="font-size:22px">📋</div>'+
          '<div style="font-size:13px;font-weight:700;margin-top:4px">Mis reservas</div>'+
          '<div style="font-size:11px;color:var(--suave)">Historial</div>'+
        '</button>'+
      '</div>'+
      '<div id="mis-partidos-pend"></div>'+
      '<div class="section-title">Mis &uacute;ltimos partidos</div>'+
      '<div id="historial-list"><p style="color:var(--suave);font-size:13px;padding:8px 4px">Cargando...</p></div>'+
      '<button class="btn" onclick="openModal(\'partido\')">+ Registrar partido</button>'+
      '<button class="btn sec" style="margin-top:8px" onclick="openModal(\'caracteristicas\')">Mi estilo de juego</button>'+
      '<button class="btn dark" style="margin-top:8px" onclick="openModal(\'socio\')">Membres&iacute;a ATMAS</button>'+
      '<button class="btn sec" style="margin-top:8px" onclick="go(\'cancha\')">Reservar cancha</button>'+
      (!p.jugados?'<button class="btn sec" style="margin-top:8px;border-color:#6366f1;color:#6366f1" onclick="vincularMiRanking()">🔗 Vincular mi historial de ranking</button>':'')+
      '<button class="btn sec" style="margin-top:8px;font-size:13px;padding:10px" onclick="cerrarSesion()">Cerrar sesi&oacute;n</button>'+
      '<p class="foot" style="margin-top:16px">@ATMAS_TENIS &middot; Club Las Avestruces</p>';
    cargarMisReservas(p.nombre);cargarPartidosPendientes(p.nombre);cargarHistorial(p.nombre);mostrarPopupTorneos();
  }catch(e){console.warn("renderPerfil error:",e);}
}

async function cargarHistorial(nombre){
  var ehl=el("historial-list");if(!ehl)return;
  try{
    var snap1=await db.collection("partidos_atmas").where("ganador","==",nombre).where("estado","==","aprobado").limit(10).get();
    var snap2=await db.collection("partidos_atmas").where("perdedor","==",nombre).where("estado","==","aprobado").limit(10).get();
    var docs=[];
    snap1.forEach(function(d){docs.push(Object.assign({},d.data(),{_gane:true,_fecha:d.data().fecha||""}));});
    snap2.forEach(function(d){docs.push(Object.assign({},d.data(),{_gane:false,_fecha:d.data().fecha||""}));});
    docs.sort(function(a,b){return a._fecha<b._fecha?1:-1;});
    docs=docs.slice(0,6);
    if(docs.length===0){ehl.innerHTML='<p style="color:var(--suave);font-size:13px">Aun no tienes partidos registrados.</p>';return;}
    var h="";
    docs.forEach(function(r){
      var rival=r._gane?r.perdedor:r.ganador;
      var fd=r._fecha?r._fecha.split("-").reverse().join("/"):"";
      var win=r._gane;
      h+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--linea)">';
      h+='<div style="width:28px;height:28px;border-radius:50%;background:'+(win?"var(--verde-osc)":"#e74c3c")+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0">'+(win?"G":"P")+'</div>';
      h+='<div style="flex:1"><div style="font-weight:700;font-size:13px">'+rival+'</div><div style="font-size:11px;color:var(--suave)">'+(r.sets||"")+' &middot; '+fd+'</div></div>';
      h+='<div style="font-size:12px;font-weight:700;color:'+(win?"var(--verde-osc)":"#e74c3c")+'">'+(win?"+5":"+1")+'pts</div>';
      h+='</div>';
    });
    ehl.innerHTML=h;
  }catch(e){var ehl2=el("historial-list");if(ehl2)ehl2.innerHTML='<p style="color:var(--suave);font-size:13px">No se pudo cargar el historial.</p>';}
}

function mostrarPopupTorneos(){
  try{
    var torneosAbiertos=torneos.filter(function(t){
      if(!t.c)return false;
      var m=t.c.match(/^(\d+)\s*cupo/i);
      return m&&parseInt(m[1])>0;
    });
    if(!torneosAbiertos.length)return;
    setTimeout(function(){
      var t=torneosAbiertos[0];
      var sc=el("sheet-content");var mo=el("modal");

      if(!sc||!mo)return;
      sc.innerHTML='<div style="text-align:center;padding:8px 0"><div style="font-size:42px;margin-bottom:8px">&#127942;</div><div style="font-weight:900;font-size:17px;color:var(--verde-osc);margin-bottom:4px">Inscripciones abiertas</div><div style="font-weight:700;font-size:15px;margin-bottom:4px">'+t.n+'</div><div style="font-size:13px;color:var(--suave);margin-bottom:14px">'+t.f+' &middot; '+t.p+'</div><button class="btn" onclick="closeModal();go(&quot;torneos&quot;)">Ver torneos &rarr;</button><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Despues</button></div>';
      mo.classList.add("show");
      setTimeout(function(){mo.classList.remove("show");},6000);
    },4000);
  }catch(e){}
}

async function cargarPartidosPendientes(nombre){
  var epp=el("mis-partidos-pend");if(!epp)return;
  try{
    var snap=await db.collection("partidos_atmas").where("perdedor","==",nombre).where("estado","==","pendiente_rival").get();
    if(snap.empty){epp.innerHTML="";return;}
    window._misPendQ=[];
    var h='<div class="section-title" style="color:#b45309;margin-top:0">Confirmar resultado</div>';
    snap.forEach(function(doc){
      var r=doc.data();var qi=window._misPendQ.length;
      window._misPendQ.push({id:doc.id,gan:r.ganador,per:r.perdedor});
      h+='<div class="res-card" style="border-color:#f59e0b;margin-bottom:8px"><div class="rc-top"><span class="rc-name">'+r.ganador+' declara victoria</span><span class="rc-date">'+(r.fecha||"")+'</span></div><div class="rc-sub">Sets: '+(r.sets||"sin sets indicados")+'</div><div style="display:flex;gap:8px;margin-top:8px"><button class="btn" style="flex:1;padding:8px;font-size:12px" onclick="miConfirmar('+qi+')">Es correcto &#10003;</button><button class="btn sec" style="flex:1;padding:8px;font-size:12px;border:1px solid #b45309;color:#b45309" onclick="miDisputar('+qi+')">Disputar</button></div></div>';
    });
    epp.innerHTML=h;
  }catch(e){console.warn("cargarPartidosPendientes error:",e);}
}

function guardarCaracteristicas(){
  try{
    var estilo=(el("car-estilo")||{}).value||"";
    var golpe=(el("car-golpe")||{}).value||"";
    var sup=(el("car-sup")||{}).value||"";
    var p=getPerfil();if(!p)return;
    if(estilo)p.estilo=estilo;if(golpe)p.golpe=golpe;if(sup)p.superficie=sup;
    savePerfil(p);closeModal();renderPerfil();toast("Perfil actualizado");
  }catch(e){toast("Error al guardar caracteristicas.");}
}

async function miConfirmar(i){
  var q=window._misPendQ[i];if(!q)return;
  try{
    await db.collection("partidos_atmas").doc(q.id).update({estado:"pendiente_admin",rivalConfirmo:true});
    notificarMarcelo("✅ Partido confirmado por rival — pendiente tu validación\n"+q.gan+" ganó a "+q.per+"\n\nAbre el admin para aprobar y sumar los puntos.");
    toast("Confirmado. Marcelo validará y sumará los puntos.");
    cargarPartidosPendientes((getPerfil()||{}).nombre||"");
  }catch(e){toast("Error al confirmar.");}
}
async function miDisputar(i){
  var q=window._misPendQ[i];if(!q)return;
  try{
    await db.collection("partidos_atmas").doc(q.id).update({estado:"pendiente_admin",rivalConfirmo:false});
    notificarMarcelo("⚠️ Partido EN DISPUTA — necesita tu resolución\n"+q.gan+" vs "+q.per+"\n\nEl rival no está de acuerdo con el resultado.");
    toast("Disputado. Marcelo Escalona resolverá.");
    cargarPartidosPendientes((getPerfil()||{}).nombre||"");
  }catch(e){toast("Error al disputar.");}
}

async function cargarMisReservas(nombre){
  var emr=el("mis-reservas-list");if(!emr)return;
  var hoy=new Date().toISOString().split("T")[0];
  try{
    var snap=await db.collection("reservas").where("nombre","==",nombre).get();
    var proximas=[];
    snap.forEach(function(doc){var d=doc.data();if(d.fecha>=hoy)proximas.push(d);});
    proximas.sort(function(a,b){return(a.fecha+a.hora)<(b.fecha+b.hora)?-1:1;});
    if(proximas.length===0){emr.innerHTML='<p style="color:var(--suave);font-size:13px;padding:8px 4px">No tienes reservas proximas.</p>';return;}
    var h="";
    proximas.forEach(function(r){
      var fechaFmt=r.fecha?r.fecha.split("-").reverse().join("/"):"-";
      h+='<div class="lcard" style="flex-direction:column;align-items:flex-start;gap:4px"><div style="display:flex;justify-content:space-between;width:100%"><div style="font-weight:800;font-size:14px">'+(r.cancha||"Cancha")+' &middot; '+(r.hora||"")+' </div><span class="cupos" style="background:#dcfce7;color:#15803d">Conf.</span></div><div style="font-size:12px;color:var(--suave)">'+fechaFmt+' &middot; '+(r.duracion||"1 hora")+' &middot; $'+(r.monto||0).toLocaleString("es-CL")+'</div></div>';
    });
    emr.innerHTML=h;
  }catch(e){var emr2=el("mis-reservas-list");if(emr2)emr2.innerHTML='<p style="color:var(--suave);font-size:13px;padding:8px 4px">No se pudieron cargar las reservas.</p>';}
}

async function renderPerfilAdmin(p,pBody){
  try{
    var hoy=new Date().toISOString().split("T")[0];
    var statStyle='background:rgba(255,255,255,.15);border-radius:12px;padding:10px 4px;cursor:pointer;transition:.15s';
    pBody.innerHTML='<div style="background:linear-gradient(135deg,var(--verde-osc),var(--verde-mid));border-radius:20px;padding:18px;color:#fff;margin-bottom:14px">'+
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'+
      '<div class="avatar" style="background:rgba(255,255,255,.25);width:54px;height:54px;font-size:19px;flex-shrink:0">'+initials(p.nombre)+'</div>'+
      '<div style="flex:1"><div style="font-weight:900;font-size:17px">'+p.nombre+'</div><div style="font-size:12px;opacity:.85">Director &middot; ATMAS</div></div>'+
      '<span style="background:rgba(255,255,255,.2);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">ADMIN</span></div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">'+
      '<div style="'+statStyle+'" onclick="go(\'admin\')" title="Ver reservas">'+
        '<div style="font-size:22px;font-weight:800" id="pa-res-hoy">...</div>'+
        '<div style="font-size:10px;opacity:.85">Reservas hoy</div></div>'+
      '<div style="'+statStyle+'" onclick="go(\'admin\')" title="Ver inscripciones">'+
        '<div style="font-size:22px;font-weight:800" id="pa-insc">...</div>'+
        '<div style="font-size:10px;opacity:.85">Inscripciones</div></div>'+
      '<div style="'+statStyle+'" onclick="go(\'admin\')" title="Ver recaudado">'+
        '<div style="font-size:18px;font-weight:800" id="pa-total">...</div>'+
        '<div style="font-size:10px;opacity:.85">Recaudado hoy</div>'+
        '<div style="font-size:9px;opacity:.65">confirmadas</div></div>'+
      '</div></div>'+
      '<div class="section-title">MIS OPCIONES</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">'+
      '<button class="btn" style="font-size:15px;padding:14px" onclick="go(\'admin\')">&#128197; Gestionar actividades del d&iacute;a</button>'+
      '<button class="btn dark" onclick="openModal(\'jugador\')">+ Agregar jugador al ranking</button>'+
      '<button class="btn dark" onclick="openModal(\'partido\')">+ Registrar partido</button>'+
      '<button class="btn sec" onclick="go(\'cancha\')">Reservar cancha</button>'+
      '<button class="btn sec" style="margin-top:8px" onclick="go(\'escalerilla\')">&#127942; Ver escalerilla</button>'+
      '<button class="btn sec" style="margin-top:8px" onclick="go(\'mis-reservas\')">&#128203; Mis reservas</button>'+
      '<button class="btn sec" style="font-size:13px;padding:10px" onclick="cerrarSesion()">Cerrar sesi&oacute;n</button></div>'+
      '<p class="foot" style="margin-top:16px">@ATMAS_TENIS &middot; Club Las Avestruces</p>';
    var snapHoy=await db.collection("reservas").where("fecha","==",hoy).get();
    var resHoy=[];snapHoy.forEach(function(d){var r=d.data();if(r.estado!=="cancelada")resHoy.push(r);});
    var erh=el("pa-res-hoy");var etotal=el("pa-total");
    if(erh)erh.textContent=resHoy.length;
    // Solo contar como recaudado las que están confirmadas_pagadas (transferencia verificada por admin)
    var recaudado=resHoy.filter(function(r){return r.estado==="confirmada_pagada";}).reduce(function(s,r){return s+(r.monto||0);},0);
    if(etotal)etotal.textContent=recaudado>0?"$"+recaudado.toLocaleString("es-CL"):"$0";
    var snap3=await db.collection("inscripciones_atmas").get();
    var einsc=el("pa-insc");if(einsc)einsc.textContent=snap3.size;
  }catch(e){console.warn("renderPerfilAdmin error:",e);}
}

/* ─── TORNEOS ─────────────────────────────────────────────────── */
const ZONA_NORTE_INSCRITOS=["Franco Gutiérrez","Marcelo Escalona","Ariel Araya","Fabián Cataldo"];

var ZONA_NORTE_SEED={
  nombre:"Ranking Zona Norte - Fecha 7",fecha:"Sabado 18 Julio 2026",
  octavos:[
    {a:"Ariel Araya",b:"Hipólito Bello",hora:"12:00",gan:null,res:null},
    {a:"Rodrigo Bernal",b:"Roro Turchan",hora:"12:00",gan:null,res:null},
    {a:"Marco Carrasco",b:"Osvaldo Valdivia",hora:"12:00",gan:null,res:null},
    {a:"Mauro Morales",b:"Pablo Ortiz",hora:"12:00",gan:null,res:null},
    {a:"Marcelo Escalona",b:"Oscar Henríquez",hora:"14:00",gan:null,res:null},
    {a:"Ignacio Soto",b:"Seba Brito",hora:"14:00",gan:null,res:null},
    {a:"Edgardo Pacheco",b:"Roro Navarro",hora:"14:00",gan:null,res:null},
    {a:"M.Escalona",b:"Ignacio Soto",hora:"14:00",gan:null,res:null}
  ],
  cuartos:[
    {a:null,b:null,hora:"16:00",gan:null},{a:null,b:null,hora:"16:00",gan:null},
    {a:null,b:null,hora:"16:00",gan:null},{a:null,b:null,hora:"16:00",gan:null}
  ],
  semis:[{a:null,b:null,hora:"18:00",gan:null},{a:null,b:null,hora:"18:00",gan:null}],
  final:{a:null,b:null,hora:"20:00",gan:null}
};
// Lista jugadores Zona Norte Fecha 7
var ZONA_NORTE_JUGADORES=["Franco Gutiérrez","Marcelo Escalona","Ariel Araya","Fabián Cataldo","Disponible","Disponible","Disponible","Disponible","Disponible","Disponible","Disponible","Disponible","Disponible","Disponible","Disponible","Disponible"];
const torneos=[
  {n:"Torneo Novicios 5",f:"22 agosto 2026 &middot; 16:00 y 17:30",p:"$20.000",c:"10 cupos",monto:20000},
  {n:"Ranking Zona Norte - Fecha 7",f:"18 julio 2026 &middot; 12:00 a 14:00 &middot; Full Tenis",p:"$20.000",c:"12 cupos",monto:20000},
  {n:"Torneo Novicios 4",f:"18 julio 2026 &middot; 16:00 y 18:00",p:"$20.000",c:"Cerrado",monto:20000},
  {n:"Torneo Novicios 3",f:"13 junio 2026",p:"$15.000",c:"Cerrado",monto:15000},
  {n:"Nueva Escalerilla Jun-Ago",f:"Series A y B &middot; $15.000 por partido",p:"$35.000",c:"4 cupos",monto:35000}
];

(function renderTorneosList(){
  var tl=el("torneos-list");if(!tl)return;
  var th="";
  torneos.forEach(function(t,i){
    var cerrado=t.c==="Cerrado";
    var sinCupos=!cerrado&&t.c&&parseInt(t.c)===0;
    var bloqueado=cerrado||sinCupos;
    var estadoLabel=cerrado?"Cerrado":sinCupos?"Cupo completo":t.c;
    th+=
      '<div class="tcard" '+(bloqueado
        ?'style="opacity:.6;border-left-color:#cbd5e1;pointer-events:none"'
        :'onclick="openModal(\'torneo\','+i+')" style="cursor:pointer" ontouchstart="this.style.opacity=\'.8\'" ontouchend="this.style.opacity=\'1\'"'
      )+'>'+
        '<div class="tn">'+t.n+'</div>'+
        '<div class="tm">&#128197; '+t.f+'</div>'+
        '<div class="trow">'+
          '<span class="price">'+t.p+'</span>'+
          (bloqueado
            ?'<span class="cupos" style="background:#f1f5f9;color:#94a3b8">'+estadoLabel+'</span>'
            :'<span class="cupos">'+estadoLabel+'</span>'
          )+
          (bloqueado?'':'<button class="mini wa" style="margin-left:auto;pointer-events:none">Ver m&aacute;s &rarr;</button>')+
        '</div>'+
      '</div>';
  });
  tl.innerHTML=th||'<p class="hint">Sin torneos disponibles</p>';
})();

async function cargarInscripciones(){
  var enl=el("novicios-list");if(!enl)return;
  try{
    var snap=await db.collection("inscripciones_atmas").where("torneo","==","Torneo Novicios 5").get();
    var inscritos=[];snap.forEach(function(doc){inscritos.push(doc.data().nombre);});
    // Jugadores fijos confirmados
    ["Máximo Escalona","Felipe Muñoz","Alex Berrocal","Fabián Araneda","Mauricio Melo","Marcos Hernández"].forEach(function(n){if(inscritos.indexOf(n)===-1)inscritos.push(n);});
    var nh="";
    inscritos.forEach(function(n){var col=avatarColor(n);var ini=initials(n);nh+='<div class="lcard"><div class="avatar" style="background:'+col+';width:32px;height:32px;font-size:12px;flex-shrink:0">'+ini+'</div><div style="flex:1"><div class="nm">'+n+'</div></div><span style="color:#15803d;font-size:12px;font-weight:700">✓</span></div>';});
    var lleno=inscritos.length>=16;
    for(var i=inscritos.length;i<16;i++)nh+='<div class="lcard"><div style="width:32px;height:32px;border-radius:50%;background:var(--gris);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--suave)">'+(i+1)+'</div><div style="flex:1"><div class="ds">Cupo disponible</div></div>'+(lleno?'<span style="color:#b91c1c;font-size:11px">Completo</span>':'<button class="mini" onclick="openModal(\'torneo\',0)">Unirme</button>')+'</div>';
    enl.innerHTML=nh;
  }catch(e){console.warn("cargarInscripciones error:",e);}
}

async function cargarInscripcionesZonaNorte(){
  var ezl=el("zonanorte-list");if(!ezl)return;
  try{
    var snap=await db.collection("inscripciones_atmas").where("torneo","==","Ranking Zona Norte - Fecha 7").get();
    var nuevos=[];snap.forEach(function(doc){var n=doc.data().nombre;if(!ZONA_NORTE_INSCRITOS.includes(n))nuevos.push(n);});
    var todos=ZONA_NORTE_INSCRITOS.concat(nuevos);
    var nh="";
    todos.forEach(function(n,i){var col=avatarColor(n);var ini=initials(n);var esConf=ZONA_NORTE_INSCRITOS.includes(n);nh+='<div class="lcard"><div style="width:24px;text-align:center;font-size:11px;font-weight:800;color:var(--suave)">'+(i+1)+'</div><div class="avatar" style="background:'+col+';width:32px;height:32px;font-size:12px;flex-shrink:0">'+ini+'</div><div style="flex:1"><div class="nm">'+n+'</div></div><span style="font-size:10px;color:'+(esConf?"var(--verde-osc)":"#6366f1")+'">'+(esConf?"Conf.":"Pend.")+'</span></div>';});
    var lleno=todos.length>=16;
    for(var i=todos.length;i<16;i++)nh+='<div class="lcard"><div style="width:24px;text-align:center;font-size:11px;color:var(--suave)">'+(i+1)+'</div><div style="width:32px;height:32px;border-radius:50%;background:var(--gris);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--suave)">+</div><div style="flex:1"><div class="ds">Cupo disponible</div></div>'+(lleno?'<span style="color:#b91c1c;font-size:11px">Completo</span>':'<button class="mini" onclick="openModal(\'torneo\',1)">Inscribirme</button>')+'</div>';
    ezl.innerHTML=nh;
  }catch(e){console.warn("cargarInscripcionesZonaNorte error:",e);}
}
cargarInscripciones();
cargarInscripcionesZonaNorte();

/* ─── DOBLE-SUBMIT GUARD ──────────────────────────────────────── */
var _submitting={};
function btnLoad(id,loading,txt){
  var b=el(id);if(!b)return;
  if(loading){b.disabled=true;b.dataset.orig=b.textContent;b.textContent=txt||"Guardando...";}
  else{b.disabled=false;b.textContent=b.dataset.orig||b.textContent;}
}

/* ─── PARTIDOS ────────────────────────────────────────────────── */
async function guardarPartido(){
  if(_submitting.partido)return;
  var yo=((el("pt-yo")||{}).value||"").trim();
  var rival=(el("pt-rival")||{}).value||"";
  var resultado=(el("pt-resultado")||{}).value||"gane";
  var s1=(el("pt-s1")||{}).value||"";
  var s2=(el("pt-s2")||{}).value||"";
  var s3=(el("pt-s3")||{}).value||"";
  var cancha=(el("pt-cancha")||{}).value||"Cancha 1";
  var fecha=(el("pt-fecha")||{}).value||"";
  var ctx=(el("pt-contexto")||{}).value||"Escalerilla ATMAS";
  var ctxOtro=((el("pt-contexto-otro")||{}).value||"").trim();
  var contexto=(ctx==="otro"&&ctxOtro)?ctxOtro:ctx;
  if(!yo){toast("Escribe tu nombre");return;}
  if(!rival){toast("Selecciona el rival");return;}
  if(!fecha){toast("Selecciona la fecha del partido");return;}
  var ganador=resultado==="gane"?yo:rival;
  var perdedor=resultado==="gane"?rival:yo;
  var sets=[s1,s2,s3].filter(function(s){return s&&s!=="--";}).join(", ");
  _submitting.partido=true;btnLoad("btn-guardar-partido",true,"Enviando...");
  try{
    await db.collection("partidos_atmas").add({
      jugador1:yo,jugador2:rival,ganador:ganador,perdedor:perdedor,
      sets:sets,cancha:cancha,fecha:fecha,contexto:contexto,estado:"pendiente_rival",
      ts:firebase.firestore.FieldValue.serverTimestamp()
    });
    notificarMarcelo("🎾 Partido registrado\n"+ganador+" ganó a "+perdedor+"\nSets: "+sets+"\nCancha: "+cancha+" · "+fecha+"\n⏳ Pendiente confirmación de "+perdedor);
    closeModal();
    var sc=el("sheet-content");var mo=el("modal");
    if(sc)sc.innerHTML='<div style="text-align:center;padding:16px 0"><div style="font-size:48px">&#128203;</div><div style="font-weight:900;font-size:18px;color:var(--verde-osc);margin:10px 0">Partido enviado</div><div style="font-size:13px;color:var(--suave);line-height:1.6">Enviado al rival para confirmar.<br>Si disputa el resultado, Marcelo Escalona decide.<br>Los puntos se suman una vez confirmado.</div></div><button class="btn sec" style="margin-top:16px" onclick="closeModal()">Entendido</button>';
    if(mo)mo.classList.add("show");
  }catch(e){console.warn("guardarPartido error:",e);toast("Error al guardar. Intenta de nuevo.");}
  finally{_submitting.partido=false;btnLoad("btn-guardar-partido",false);}
}

function pendAprobar(i){var q=window._pendQ[i];if(q)aprobarPartido(q.id,q.gan,q.per);}
function pendRechazar(i){var q=window._pendQ[i];if(q)rechazarPartido(q.id);}

async function aprobarPartido(docId,ganador,perdedor){
  if(_submitting["apr_"+docId])return;
  _submitting["apr_"+docId]=true;
  try{
    var ganRef=db.collection("ranking_atmas").doc(slugify(ganador));
    var perRef=db.collection("ranking_atmas").doc(slugify(perdedor));
    var partRef=db.collection("partidos_atmas").doc(docId);
    await db.runTransaction(async function(tx){
      var ganDoc=await tx.get(ganRef);
      var perDoc=await tx.get(perRef);
      var gd=ganDoc.exists?ganDoc.data():{nombre:ganador,pts:0,jugados:0,ganados:0,perdidos:0,pct:0};
      var pd=perDoc.exists?perDoc.data():{nombre:perdedor,pts:0,jugados:0,ganados:0,perdidos:0,pct:0};
      gd.pts+=5;gd.jugados+=1;gd.ganados+=1;gd.pct=Math.round(gd.ganados/gd.jugados*100);
      pd.pts+=1;pd.jugados+=1;pd.perdidos+=1;pd.pct=Math.round((pd.ganados||0)/pd.jugados*100);
      tx.set(ganRef,gd);tx.set(perRef,pd);
      tx.update(partRef,{estado:"aprobado"});
    });
    toast("Partido aprobado. Puntos sumados.");
    var pSnap=await db.collection("partidos_atmas").doc(docId).get();
    var pData=pSnap.exists?pSnap.data():{};
    mostrarTarjetaPartido(ganador,perdedor,pData.sets||"",pData.contexto||"");
    renderAdmin();
  }catch(e){console.warn("aprobarPartido error:",e);toast("Error al aprobar partido. Verifica tu conexión.");}
  finally{delete _submitting["apr_"+docId];}
}

async function rechazarPartido(docId){
  try{
    await db.collection("partidos_atmas").doc(docId).update({estado:"rechazado"});
    toast("Partido rechazado.");
    renderAdmin();
  }catch(e){toast("Error al rechazar partido.");}
}

/* ─── CANCHA: CALENDARIO + RESERVAS ──────────────────────────── */
var calMes=new Date().getMonth();
var calAnio=new Date().getFullYear();
var calFechaSel=null;
var calConteo={};
var slotSeleccionado=null;var slotDurHrs=1;var slotMonto=15000;

async function reservarCancha(){
  if(_submitting.reserva)return;
  var nombre=((el("can-nombre")||{}).value||"").trim();
  var tel=((el("can-tel")||{}).value||"").trim();
  var fecha=calFechaSel;
  var cancha=(el("can-cancha")||{}).value||"Sin preferencia";
  var monto=slotMonto||15000;var durHrs=slotDurHrs||1;
  var durText=durHrs===2?"2 horas - $25.000":"1 hora - $15.000";
  if(!nombre){toast("Escribe tu nombre");return;}
  if(!tel){toast("Escribe tu teléfono de contacto");return;}
  if(!fecha){toast("Selecciona una fecha en el calendario");return;}
  if(!slotSeleccionado){toast("Selecciona un horario disponible");return;}
  var hIni=parseInt(slotSeleccionado.split(":")[0]);
  var horaFin=String(hIni+durHrs).padStart(2,"0")+":00";
  var fechaFmt=fecha?fecha.split("-").reverse().join("/"):"-";
  _submitting.reserva=true;btnLoad("btn-reservar-cancha",true,"Reservando...");
  try{
    await db.collection("reservas").add({nombre:nombre,tel:tel,fecha:fecha,hora:slotSeleccionado,horaFin:horaFin,cancha:cancha,duracion:durText,durHrs:durHrs,monto:monto,ts:firebase.firestore.FieldValue.serverTimestamp()});
    var horaConf=slotSeleccionado;
    slotSeleccionado=null;slotDurHrs=1;slotMonto=15000;calFechaSel=null;
    renderCalendario();
    var esc=el("slots-container");
    if(esc)esc.innerHTML='<div style="text-align:center;padding:16px 0"><div style="font-size:48px">&#127937;</div><div style="font-weight:900;color:var(--verde-osc);font-size:17px;margin:8px 0">Cancha reservada!</div><div style="font-size:13px;color:var(--suave)">'+fechaFmt+' &middot; '+horaConf+' - '+horaFin+'<br>'+cancha+'</div></div>'+pagoHTML(monto,"arriendo de cancha",monto===15000?MP.cancha1hr:MP.cancha2hrs);
    var cf=el("can-form");if(cf)cf.style.display="none";
  }catch(e){console.warn("reservarCancha error:",e);toast("Error al reservar. Verifica tu conexión e intenta de nuevo.");}
  finally{_submitting.reserva=false;btnLoad("btn-reservar-cancha",false);}
}

/* ─── MODALES ─────────────────────────────────────────────────── */
function openModal(tipo,idx){
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  var html="";
  try{
    if(tipo==="torneo"){
      var t=torneos[idx];if(!t)return;var perfil=getPerfil()||{};
      var turnoField=t.n.includes("Novicios 4")?'<div class="field"><label>Turno preferido</label><select id="ti-turno"><option>16:00 hrs</option><option>18:00 hrs</option></select></div>':"";
      var mpLink=t.monto===20000?MP.torneo20:t.monto===15000?MP.torneo15:MP.escalerilla;
      var cuposNum=t.c==="Cerrado"?0:parseInt(t.c)||0;
      var cuposTag=t.c==="Cerrado"?'<span style="background:#fee2e2;color:#dc2626;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">Cerrado</span>':cuposNum===0?'<span style="background:#fee2e2;color:#dc2626;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">Sin cupos</span>':'<span style="background:var(--verde-claro);color:var(--verde-osc);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">'+t.c+'</span>';
      html=
        // Hero del torneo
        '<div style="background:linear-gradient(135deg,var(--verde-osc),var(--verde-mid));border-radius:16px;padding:18px;margin-bottom:16px;color:#fff">'+
          '<div style="font-size:10px;font-weight:700;color:var(--lima);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">&#127942; ATMAS Torneos</div>'+
          '<div style="font-size:18px;font-weight:900;line-height:1.2;margin-bottom:10px">'+t.n+'</div>'+
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px"><span style="font-size:14px">📅</span><span style="font-size:13px;opacity:.9">'+t.f+'</span></div>'+
          '<div style="display:flex;align-items:center;justify-content:space-between">'+
            '<div><div style="font-size:10px;opacity:.7;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Inscripción</div><div style="font-size:26px;font-weight:900;color:var(--lima)">'+t.p+'</div></div>'+
            cuposTag+
          '</div>'+
        '</div>'+
        // Formulario
        '<div class="field"><label>Tu nombre</label><input id="ti-nombre" placeholder="Ej: Juan Pérez" value="'+(perfil.nombre||'')+'"></div>'+
        '<div class="field"><label>Teléfono</label><input id="ti-tel" type="tel" placeholder="+569 XXXX XXXX" value="'+(perfil.tel||'')+'"></div>'+
        turnoField+
        '<button id="btn-inscribir-torneo" class="btn" onclick="inscribirTorneo('+idx+')" style="margin-bottom:12px">✓ Confirmar inscripción</button>'+
        pagoHTML(t.monto,t.n,mpLink)+
        '<button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cerrar</button>';
    }else if(tipo==="clase"&&idx==="individual"){
      html='<h3>📅 Clases Individuales</h3><div id="slots-list"><p style="text-align:center;padding:20px;color:var(--suave)">Cargando horarios...</p></div><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cerrar</button>';
      setTimeout(cargarSlotsIndividuales,50);
    }else if(tipo==="clase"){
      var planes={iniciacion:{t:"Iniciacion - Sabados",opciones:[{l:"1 dia - Sabados",v:60000}]},intermedio:{t:"Intermedios",opciones:[{l:"1 dia",v:70000},{l:"2 dias",v:120000},{l:"3 dias",v:150000}]},avanzado:{t:"Avanzados",opciones:[{l:"1 dia",v:80000},{l:"2 dias",v:120000},{l:"3 dias",v:150000}]},individual:{t:"Clases individuales",opciones:[{l:"4 clases",v:120000},{l:"8 clases",v:200000}]}};
      var plan=planes[idx]||planes.individual;
      var optsHtml=plan.opciones.map(function(o){return'<option value="'+o.v+'">'+o.l+' &middot; $'+o.v.toLocaleString("es-CL")+'</option>';}).join("");
      html='<h3>Inscripcion &middot; '+plan.t+'</h3><div class="field"><label>Nombre</label><input id="cls-nombre" placeholder="Ej: Juan Perez"></div><div class="field"><label>Plan</label><select id="cls-plan" onchange="actualizarPagoClase()">'+optsHtml+'</select></div><div id="cls-pago"></div><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';setTimeout(actualizarPagoClase,50);
    }else if(tipo==="oferta-dunlop"){
      html='<h3>🎾 Tarro Dunlop FORT</h3><div style="background:#f0fdf4;border-radius:12px;padding:14px;margin-bottom:16px"><div style="font-weight:700;font-size:15px;color:#1a2e1a">All Court · 3 pelotas</div><div style="font-size:22px;font-weight:900;color:var(--verde-osc);margin-top:4px">$10.500</div></div><div class="field"><label>Tu nombre</label><input id="dun-nombre" placeholder="Ej: Juan Pérez"></div><div class="field"><label>Cantidad</label><input id="dun-cant" type="number" min="1" value="1"></div><button class="btn wa" onclick="pedirDunlopWA()">📲 Coordinar por WhatsApp</button><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';
    }else if(tipo==="encordado"){
      html='<h3>Solicitar encordado ATMAS</h3><div class="field"><label>Tu nombre</label><input id="enc-nombre" placeholder="Ej: Juan Perez"></div><div class="field"><label>Tipo</label><select id="enc-tipo"><option>Control</option><option>Competencia</option><option>Potencia</option><option>Hibrido</option></select></div><button class="btn wa" onclick="enviarEncordadoWA()">Coordinar por WhatsApp</button><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';
    }else if(tipo==="partido"){
      var perfil=getPerfil();var miNombre=perfil?perfil.nombre:"";
      var oh="";rankingData.forEach(function(p){if(p[0]!==miNombre)oh+='<option>'+p[0]+'</option>';});
      html='<h3>Registrar partido</h3>'+
        '<div class="field"><label>Tu nombre</label><input id="pt-yo" value="'+miNombre+'" placeholder="Tu nombre"'+(miNombre?' readonly style="background:#f4f5f7"':'')+' ></div>'+
        '<div class="field"><label>Oponente</label><select id="pt-rival">'+oh+'</select></div>'+
        '<div class="field"><label>Resultado</label><select id="pt-resultado"><option value="gane">Gané</option><option value="perdi">Perdí</option></select></div>'+
        '<div class="field"><label>Sets</label><div class="sets"><input id="pt-s1" placeholder="6-3"><input id="pt-s2" placeholder="4-6"><input id="pt-s3" placeholder="--"></div></div>'+
        '<div class="field"><label>Contexto / Torneo</label><select id="pt-contexto">'+
          '<option value="Escalerilla ATMAS">Escalerilla ATMAS</option>'+
          '<option value="Ranking Zona Norte">Ranking Zona Norte</option>'+
          '<option value="Torneo Novicios">Torneo Novicios</option>'+
          '<option value="Partido amistoso">Partido amistoso</option>'+
          '<option value="Partido a puntos">Partido a puntos</option>'+
          '<option value="otro">Otro (especificar abajo)</option>'+
        '</select></div>'+
        '<div class="field"><label>Especificar (si aplica)</label><input id="pt-contexto-otro" placeholder="Ej: Final Torneo Verano"></div>'+
        '<div class="field"><label>Cancha</label><select id="pt-cancha"><option>Cancha 1</option><option>Cancha 2</option><option>Cancha 3</option><option>Cancha 4</option></select></div>'+
        '<div class="field"><label>Fecha</label><input id="pt-fecha" type="date" value="'+new Date().toISOString().split("T")[0]+'"></div>'+
        '<button id="btn-guardar-partido" class="btn" onclick="guardarPartido()">Guardar partido</button>'+
        '<button class="btn sec" onclick="closeModal()">Cancelar</button>';
    }else if(tipo==="socio"){openSocioModal();return;
    }else if(tipo==="caracteristicas"){
      var p2=getPerfil()||{};
      html='<h3>Mi estilo de juego</h3><div class="field"><label>Estilo</label><select id="car-estilo"><option value="">-- Elige --</option><option'+(p2.estilo==="Jugador de fondo"?" selected":"")+'>Jugador de fondo</option><option'+(p2.estilo==="Saque y volea"?" selected":"")+'>Saque y volea</option><option'+(p2.estilo==="Agresivo desde el fondo"?" selected":"")+'>Agresivo desde el fondo</option><option'+(p2.estilo==="Contragolpeador"?" selected":"")+'>Contragolpeador</option></select></div><div class="field"><label>Golpe favorito</label><select id="car-golpe"><option value="">-- Elige --</option><option'+(p2.golpe==="Derecha"?" selected":"")+'>Derecha</option><option'+(p2.golpe==="Reves"?" selected":"")+'>Reves</option><option'+(p2.golpe==="Saque"?" selected":"")+'>Saque</option><option'+(p2.golpe==="Volea"?" selected":"")+'>Volea</option></select></div><div class="field"><label>Superficie preferida</label><select id="car-sup"><option value="">-- Elige --</option><option'+(p2.superficie==="Arcilla"?" selected":"")+'>Arcilla</option><option'+(p2.superficie==="Cemento"?" selected":"")+'>Cemento</option><option'+(p2.superficie==="Grass"?" selected":"")+'>Grass</option></select></div><button class="btn" onclick="guardarCaracteristicas()">Guardar mi estilo</button><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';
    }else if(tipo==="jugador"){
      html='<h3>Agregar jugador</h3><div class="field"><label>Nombre</label><input id="jg-nombre" placeholder="Ej: Juan Perez"></div><div class="field"><label>Puntos iniciales</label><input id="jg-pts" type="number" value="0"></div><button class="btn" onclick="confirmarJugador()">Agregar a la escalerilla</button><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';
    }
    sc.innerHTML=html;
    mo.classList.add("show");
  }catch(e){console.warn("openModal error:",e);}
}

function actualizarPagoClase(){var sel=el("cls-plan");if(!sel)return;var monto=parseInt(sel.value);var ecp=el("cls-pago");if(ecp)ecp.innerHTML=pagoHTML(monto,"inscripcion academia",MP.inscripcion);}
function notificarMarcelo(msg){
  var wp=(_configCache&&_configCache.wp)||"56956343558";
  var url="https://wa.me/"+wp+"?text="+encodeURIComponent("🔔 ATMAS APP\n"+msg);
  window.open(url,"_blank");
}
function pedirDunlopWA(){var nombre=((el("dun-nombre")||{}).value||"").trim();var cant=((el("dun-cant")||{}).value)||"1";var msg=encodeURIComponent("Hola ATMAS! Quiero pedir "+cant+" tarro(s) Dunlop FORT. Nombre: "+(nombre||"sin indicar"));closeModal();window.open("https://wa.me/56956343558?text="+msg,"_blank");}
function enviarEncordadoWA(){var nombre=((el("enc-nombre")||{}).value||"").trim();var tipo=(el("enc-tipo")||{}).value||"Control";var msg=encodeURIComponent("Hola ATMAS! Quiero solicitar encordado. Nombre: "+(nombre||"sin indicar")+" Tipo: "+tipo);closeModal();window.open("https://wa.me/56956343558?text="+msg,"_blank");}

async function confirmarJugador(){
  var nombre=((el("jg-nombre")||{}).value||"").trim();
  var pts=parseInt((el("jg-pts")||{}).value||"0",10)||0;
  if(!nombre){toast("Escribe el nombre del jugador");return;}
  try{
    await db.collection("ranking_atmas").doc(slugify(nombre)).set({nombre:nombre,pts:pts,jugados:0,ganados:0,perdidos:0,pct:0},{merge:true});
    closeModal();toast("Jugador agregado al ranking");
  }catch(e){toast("Error al agregar jugador");}
}

async function inscribirTorneo(idx){
  if(_submitting["ins_"+idx])return;
  var nombre=((el("ti-nombre")||{}).value||"").trim();
  var tel=((el("ti-tel")||{}).value||"").trim();
  var turnoEl=el("ti-turno");var turno=turnoEl?turnoEl.value:"";
  var t=torneos[idx];if(!t){toast("Torneo no encontrado");return;}
  if(!nombre){toast("Escribe tu nombre completo");return;}
  if(!tel){toast("Escribe tu número de teléfono");return;}
  _submitting["ins_"+idx]=true;
  var btnI=el("btn-inscribir-torneo");if(btnI){btnI.disabled=true;btnI.dataset.orig=btnI.textContent;btnI.textContent="Inscribiendo...";}
  try{
    var totalSnap=await db.collection("inscripciones_atmas").where("torneo","==",t.n).get();
    if(totalSnap.size>=16){toast("Torneo completo. No hay mas cupos.");return;}
    var existe=await db.collection("inscripciones_atmas").where("torneo","==",t.n).where("nombre","==",nombre).get();
    if(!existe.empty){toast("Ya estás inscrito en este torneo ✓");return;}
    await db.collection("inscripciones_atmas").add({nombre:nombre,tel:tel,torneo:t.n,turno:turno,monto:t.monto,estado:"pendiente_pago",ts:firebase.firestore.FieldValue.serverTimestamp()});
    toast("Inscripción registrada — completa el pago para confirmar tu cupo");
    notificarMarcelo("🏆 Nueva inscripción torneo\nJugador: "+nombre+"\nTorneo: "+t.n+"\nMonto: $"+Number(t.monto).toLocaleString("es-CL")+"\nTel: "+tel);
  }catch(e){toast("Error al inscribir. Verifica tu conexión e intenta de nuevo.");}
  finally{_submitting["ins_"+idx]=false;if(btnI){btnI.disabled=false;btnI.textContent=btnI.dataset.orig||"Confirmar inscripción";}}
}

/* ─── MEMBRESIA ───────────────────────────────────────────────── */
const MESES_INSCRIPCION=["Marzo","Junio","Septiembre","Diciembre"];
function openSocioModal(){
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  sc.innerHTML='<h3>Membresia ATMAS</h3><div class="infobox" style="margin-bottom:12px"><div class="hrow"><span class="dia" style="font-weight:800">Inscripcion trimestral</span><span class="hrs" style="color:var(--verde-osc);font-weight:800">$30.000</span></div><div style="font-size:12px;color:var(--suave);padding:4px 0">Se paga en: '+MESES_INSCRIPCION.join(' &middot; ')+'</div></div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px"><button class="btn" onclick="pagarMembresia(\'mensualidad\',90000)">Mensualidad socio &middot; $90.000/mes</button><button class="btn sec" onclick="pagarMembresia(\'inscripcion\',30000)">Inscripcion trimestral &middot; $30.000</button></div><button class="btn sec" onclick="closeModal()">Cerrar</button>';
  mo.classList.add("show");
}
function pagarMembresia(tipo,monto){
  var label=tipo==="mensualidad"?"mensualidad socio ATMAS":"inscripcion trimestral ATMAS";
  var mpLink=tipo==="mensualidad"?MP.socio:MP.inscripcion;
  var sc=el("sheet-content");if(sc)sc.innerHTML='<h3>Pago '+tipo+'</h3>'+pagoHTML(monto,label,mpLink)+'<button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cerrar</button>';
}

var modalEl=el("modal");if(modalEl)modalEl.addEventListener("click",function(e){if(e.target===this)closeModal();});

/* ─── ADMIN PIN ───────────────────────────────────────────────── */
const ADMIN_PIN="2025";var adminUnlocked=false;var pinBuffer="";
function abrirAdmin(){
  if(adminUnlocked){go("admin");return;}
  pinBuffer="";
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  sc.innerHTML='<h3 style="text-align:center">Panel de administracion</h3><div class="pin-wrap"><p style="color:var(--suave);font-size:13px">Ingresa el PIN de acceso</p><div class="pin-dots" id="pin-dots"><div class="pin-dot" id="pd0"></div><div class="pin-dot" id="pd1"></div><div class="pin-dot" id="pd2"></div><div class="pin-dot" id="pd3"></div></div><div class="pin-pad">'+[1,2,3,4,5,6,7,8,9,"",0,"X"].map(function(k){var kTxt=(k===""?"&nbsp;":String(k));return'<button class="pin-btn" onclick="pinPress(\''+k+'\')">'+ kTxt+'</button>';}).join('')+'</div><p id="pin-err" style="color:#b91c1c;font-size:12px;min-height:16px"></p></div>';
  mo.classList.add("show");
}
function pinPress(k){
  if(k==="X"){pinBuffer=pinBuffer.slice(0,-1);}
  else if(pinBuffer.length<4&&k!==""){pinBuffer+=k;}
  for(var i=0;i<4;i++){var d=el("pd"+i);if(d)d.classList.toggle("filled",i<pinBuffer.length);}
  if(pinBuffer.length===4){
    if(pinBuffer===ADMIN_PIN){adminUnlocked=true;closeModal();go("admin");}
    else{var perr=el("pin-err");if(perr)perr.textContent="PIN incorrecto";pinBuffer="";for(var i=0;i<4;i++){var d=el("pd"+i);if(d)d.classList.remove("filled");}}
  }
}

/* ─── ADMIN PANEL ─────────────────────────────────────────────── */
async function renderAdmin(){
  var eab=el("admin-body");if(!eab)return;
  var h="";
  h+='<div class="admin-header"><div><h2>Panel Admin</h2><p>Club Las Avestruces &middot; ATMAS</p></div>';
  h+='<button onclick="adminSalir()" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer">Salir</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">'+
    '<button id="atab-reservas" class="on" onclick="adminTab(this,\'reservas\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:var(--verde);color:#fff">📋 Reservas</button>'+
    '<button id="atab-sanciones" onclick="adminTab(this,\'sanciones\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--verde-mid)">🚫 Sanciones</button>'+
    '<button id="atab-torneos" onclick="adminTab(this,\'torneos\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--verde-mid)">🏆 Torneos</button>'+
    '<button id="atab-ranking" onclick="adminTab(this,\'ranking\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--verde-mid)">📊 Ranking</button>'+
    '<button id="atab-agenda" onclick="adminTab(this,\'agenda\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--verde-mid)">📅 Agenda</button>'+
    '<button id="atab-config" onclick="adminTab(this,\'config\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--verde-mid)">⚙️ Config</button>'+
    '<button id="atab-ingresos" onclick="adminTab(this,\'ingresos\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--verde-mid)">💰 Ingresos</button>'+
    '<button id="atab-evaluar" onclick="adminTab(this,\'evaluar\')" style="border:none;border-radius:10px;padding:9px 4px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:var(--verde-mid)">&#128104;&#8205;&#127979; Evaluar</button>'+
    '</div>';
  h+='<div id="admin-tab-reservas"><div class="section-title">Reservas de canchas</div><div id="admin-reservas-cont"><p class="hint">Cargando...</p></div></div>';
  h+='<div id="admin-tab-sanciones" style="display:none"><div class="section-title">Sanciones activas</div><div id="admin-sanciones-cont"><p class="hint">Cargando...</p></div></div>';
  h+='<div id="admin-tab-torneos" style="display:none">';
  h+='<div class="admin-section"><button class="btn" onclick="abrirFormCrearTorneo()">+ Crear torneo</button><div id="admin-form-torneo" style="display:none;margin-top:14px;background:#fff;border-radius:16px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.07)">'+
    '<div class="section-title" style="margin-top:0">Nuevo torneo</div>'+
    '<div class="field"><label>Nombre</label><input id="nt-nombre" placeholder="Ej: Torneo Novicios 5"></div>'+
    '<div class="field"><label>Fecha</label><input id="nt-fecha" type="date"></div>'+
    '<div class="field"><label>Hora</label><input id="nt-hora" placeholder="Ej: 16:00 y 18:00"></div>'+
    '<div class="field"><label>Precio inscripci&oacute;n</label><input id="nt-precio" type="number" placeholder="20000"></div>'+
    '<div class="field"><label>Cupos disponibles</label><input id="nt-cupos" type="number" placeholder="16"></div>'+
    '<div class="field"><label>Descripci&oacute;n (opcional)</label><input id="nt-desc" placeholder="Detalles del torneo"></div>'+
    '<button class="btn" onclick="guardarNuevoTorneo()">Crear torneo</button>'+
    '<button class="btn sec" style="margin-top:8px" onclick="el(\'admin-form-torneo\').style.display=\'none\'">Cancelar</button>'+
    '</div></div>';
  h+='<div class="admin-section"><div class="section-title">Torneos activos</div><div id="admin-torneos-lista"><p class="hint">Cargando...</p></div></div>';
  h+='<div class="admin-section"><div class="section-title" style="color:#b45309">Partidos en disputa</div><div id="a-pendientes"><p class="hint">Cargando...</p></div></div>';
  h+='<div class="admin-section"><div class="section-title">Inscripciones torneo</div><div id="a-inscripciones"><p class="hint">Cargando...</p></div></div>';
  h+='</div>';
  h+='<div id="admin-tab-ranking" style="display:none">'+
    '<div class="admin-section"><div class="section-title">Tipos de usuario</div><div id="admin-tipos-cont"><p class="hint">Cargando...</p></div></div>'+
    '<div class="admin-section"><div class="section-title">Gestionar ranking</div><div id="a-ranking-admin"></div>'+
    '<button class="btn dark" style="margin-top:8px" onclick="openModal(\'jugador\')">+ Agregar jugador</button>'+
    '<button class="btn sec" style="margin-top:8px;border-color:#dc2626;color:#dc2626" onclick="resetearRanking()">🔄 Resetear ranking a cero</button></div>'+
    '<div class="admin-section"><div class="section-title">📋 Planilla de resultados</div><div id="admin-planilla-cont"><p class="hint">Cargando...</p></div></div>'+
    '</div>';
  h+='<div id="admin-tab-agenda" style="display:none"><div class="admin-section"><div class="section-title">📅 Agenda Clases Individuales</div><div id="admin-slots-cont"><p class="hint">Cargando...</p></div></div></div>';
  h+='<div id="admin-tab-config" style="display:none"><div id="admin-config-cont"><p class="hint">Cargando...</p></div></div>';
  h+='<div id="admin-tab-evaluar" style="display:none"><div class="admin-section"><div class="section-title">&#128104;&#8205;&#127979; Evaluar Alumnos</div><div id="admin-evaluar-cont"><p class="hint">Cargando...</p></div></div></div>';
  h+='<div id="admin-tab-ingresos" style="display:none"><div class="admin-section">'+
    '<div class="section-title">💰 Informe de Ingresos</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
      '<div class="field" style="margin:0"><label style="font-size:11px">Desde</label><input type="date" id="ing-desde" style="font-size:13px;padding:8px;border:1.5px solid var(--gris);border-radius:10px;width:100%"></div>'+
      '<div class="field" style="margin:0"><label style="font-size:11px">Hasta</label><input type="date" id="ing-hasta" style="font-size:13px;padding:8px;border:1.5px solid var(--gris);border-radius:10px;width:100%"></div>'+
    '</div>'+
    '<button class="btn" onclick="generarInformeIngresos()">Ver informe</button>'+
    '<div id="admin-ingresos-cont" style="margin-top:14px"></div>'+
  '</div></div>';
  h+='<div style="height:20px"></div>';
  eab.innerHTML=h;
  renderAdminReservas();
  loadAdminTorneos();
  var rh="";rankingData.forEach(function(p,i){rh+='<div class="lcard"><div class="rank-pos" style="width:24px;font-size:12px">'+(i+1)+'</div><div style="flex:1"><div class="nm">'+p[0]+'</div><div class="ds">'+p[1]+' pts &middot; '+p[3]+'G '+p[4]+'P</div></div><button class="mini" style="color:#dc2626" onclick="eliminarJugador(\''+p[0].replace(/'/g,"\\'")+'\')">&times;</button></div>';});
  var ara=el("a-ranking-admin");if(ara)ara.innerHTML=rh||'<p class="hint">Cargando ranking...</p>';
}

function adminTab(el_,tab){if(tab===undefined){tab=el_;}
  ["reservas","sanciones","torneos","ranking","agenda","config","ingresos","evaluar"].forEach(function(t){
    var div=el("admin-tab-"+t);if(div)div.style.display=t===tab?"":"none";
    var btn=el("atab-"+t);if(btn){btn.style.background=t===tab?"var(--verde)":"#fff";btn.style.color=t===tab?"#fff":"var(--verde-mid)";}
  });
  if(tab==="sanciones")renderAdminSanciones();
  if(tab==="ranking"){renderAdminTipos();cargarPlanillaResultados();}
  if(tab==="agenda")renderAdminSlots();
  if(tab==="config"){renderAdminConfig();setTimeout(cargarCodigosLista,300);}
  if(tab==="torneos"){loadAdminTorneos();cargarListaTorneos();}
  if(tab==="ingresos")iniciarInformeIngresos();
  if(tab==="evaluar")renderAdminEvaluar();
}
function iniciarInformeIngresos(){
  var hoy=new Date().toISOString().split("T")[0];
  var primerDiaMes=hoy.substring(0,8)+"01";
  var d=el("ing-desde");var h=el("ing-hasta");
  if(d&&!d.value)d.value=primerDiaMes;
  if(h&&!h.value)h.value=hoy;
}
async function generarInformeIngresos(){
  var desde=(el("ing-desde")||{}).value||"";
  var hasta=(el("ing-hasta")||{}).value||"";
  if(!desde||!hasta){toast("Selecciona rango de fechas");return;}
  var cont=el("admin-ingresos-cont");
  if(cont)cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var snap=await db.collection("reservas").where("fecha",">=",desde).where("fecha","<=",hasta).get();
    var todas=[];snap.forEach(function(doc){todas.push(doc.data());});
    var pagadas=todas.filter(function(r){return r.estado==="confirmada_pagada";});
    var canceladas=todas.filter(function(r){return r.estado==="cancelada";});
    // Agrupar por tipo de usuario
    var porTipo={};
    pagadas.forEach(function(r){
      var t=r.tipo||"otro";
      if(!porTipo[t])porTipo[t]={count:0,total:0};
      porTipo[t].count++;porTipo[t].total+=(r.monto||0);
    });
    var totalGeneral=pagadas.reduce(function(s,r){return s+(r.monto||0);},0);
    // Agrupar por día
    var porDia={};
    pagadas.forEach(function(r){
      if(!r.fecha)return;
      if(!porDia[r.fecha])porDia[r.fecha]=0;
      porDia[r.fecha]+=(r.monto||0);
    });
    var diasOrden=Object.keys(porDia).sort();
    var labelTipo={"socio_mensual":"Socio Mensual","socio_partido":"Pago por partido","invitado":"Invitado","academia":"Academia","arriendo":"Arriendo"};
    var h2='<div style="background:linear-gradient(135deg,#0f3d08,#2f6b1a);border-radius:16px;padding:16px;color:#fff;margin-bottom:12px">'+
      '<div style="font-size:11px;opacity:.75;margin-bottom:4px">TOTAL CONFIRMADO '+desde.split("-").reverse().join("/")+" → "+hasta.split("-").reverse().join("/")+'</div>'+
      '<div style="font-size:28px;font-weight:900">$'+totalGeneral.toLocaleString("es-CL")+'</div>'+
      '<div style="font-size:12px;opacity:.8;margin-top:4px">'+pagadas.length+' reservas pagadas &middot; '+canceladas.length+' canceladas</div>'+
    '</div>';
    // Desglose por tipo
    h2+='<div class="section-title" style="margin-top:0">Desglose por tipo</div>';
    Object.keys(porTipo).forEach(function(t){
      var p=porTipo[t];
      h2+='<div class="lcard" style="justify-content:space-between"><div><div class="nm">'+(labelTipo[t]||t)+'</div><div class="ds">'+p.count+' reservas</div></div><div style="font-weight:800;color:var(--verde-mid)">$'+p.total.toLocaleString("es-CL")+'</div></div>';
    });
    if(Object.keys(porTipo).length===0)h2+='<p class="hint">Sin ingresos en este período</p>';
    // Desglose por día
    if(diasOrden.length>0){
      h2+='<div class="section-title">Por día</div>';
      diasOrden.forEach(function(fecha){
        var parts=fecha.split("-");
        var fechaFmt=parts[2]+"/"+parts[1]+"/"+parts[0];
        h2+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gris)"><div style="font-size:13px;color:var(--texto)">'+fechaFmt+'</div><div style="font-weight:700;color:var(--verde-mid)">$'+porDia[fecha].toLocaleString("es-CL")+'</div></div>';
      });
    }
    if(cont)cont.innerHTML=h2;
  }catch(e){console.warn("informe error:",e);if(cont)cont.innerHTML='<p class="hint">Error al cargar. Revisa la conexión.</p>';}
}

function abrirFormCrearTorneo(){
  var f=el("admin-form-torneo");if(!f)return;
  f.style.display=f.style.display==="none"?"":"none";
  // Fecha por defecto: hoy
  var fi=el("nt-fecha");if(fi&&!fi.value)fi.value=new Date().toISOString().split("T")[0];
}

async function guardarNuevoTorneo(){
  var nombre=((el("nt-nombre")||{}).value||"").trim();
  var fecha=((el("nt-fecha")||{}).value||"").trim();
  var hora=((el("nt-hora")||{}).value||"").trim();
  var precio=parseInt((el("nt-precio")||{}).value||"0")||0;
  var cupos=parseInt((el("nt-cupos")||{}).value||"0")||0;
  var desc=((el("nt-desc")||{}).value||"").trim();
  if(!nombre||!fecha){toast("Completa nombre y fecha");return;}
  try{
    await db.collection("torneos_app").add({
      nombre:nombre,fecha:fecha,hora:hora,precio:precio,cupos:cupos,cuposDisp:cupos,
      descripcion:desc,activo:true,ts:firebase.firestore.FieldValue.serverTimestamp()
    });
    toast("Torneo creado ✓");
    el("admin-form-torneo").style.display="none";
    ["nt-nombre","nt-hora","nt-desc"].forEach(function(id){var e=el(id);if(e)e.value="";});
    cargarListaTorneos();
  }catch(e){toast("Error: "+e.message);}
}

async function cargarListaTorneos(){
  var cont=el("admin-torneos-lista");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var snap=await db.collection("torneos_app").orderBy("ts","desc").limit(20).get();
    if(snap.empty){cont.innerHTML='<p class="hint">Sin torneos creados aún</p>';return;}
    var h="";
    snap.forEach(function(doc){
      var t=doc.data();
      var fechaFmt=t.fecha?new Date(t.fecha+"T12:00").toLocaleDateString("es-CL",{weekday:"short",day:"numeric",month:"short",year:"numeric"}):"";
      var cuposLabel=t.cuposDisp!==undefined?t.cuposDisp+" cupos":"";
      h+='<div class="reserva-card" style="margin-bottom:8px">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
        '<div>'+
          '<div style="font-weight:700;font-size:14px">'+t.nombre+'</div>'+
          '<div style="font-size:12px;color:#4b5563">'+fechaFmt+(t.hora?' &middot; '+t.hora:'')+'</div>'+
          '<div style="font-size:12px;color:#4b5563">'+(t.precio>0?"$"+Number(t.precio).toLocaleString("es-CL"):"")+' &middot; '+cuposLabel+'</div>'+
          (t.descripcion?'<div style="font-size:11px;color:var(--suave);margin-top:2px">'+t.descripcion+'</div>':'')+
        '</div>'+
        '<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">'+
          '<span style="font-size:11px;font-weight:700;color:'+(t.activo?"#16a34a":"#9ca3af")+'">'+(t.activo?"ACTIVO":"INACTIVO")+'</span>'+
          '<button class="mini" style="color:#dc2626" onclick="toggleTorneo(\''+doc.id+'\','+(t.activo?'false':'true')+')">'+( t.activo?"Desactivar":"Activar")+'</button>'+
          '<button class="mini" onclick="editarCuposTorneo(\''+doc.id+'\','+t.cuposDisp+')">Cupos</button>'+
          '<button class="mini" style="color:#dc2626;font-weight:800" onclick="eliminarTorneo(\''+doc.id+'\',\''+t.nombre.replace(/'/g,"\\'")+'\')">&times; Eliminar</button>'+
        '</div></div></div>';
    });
    cont.innerHTML=h;
  }catch(e){cont.innerHTML='<p class="hint">Error: '+e.message+'</p>';}
}

async function eliminarTorneo(id,nombre){
  if(!confirm("¿Eliminar torneo \""+nombre+"\"? Esta acción no se puede deshacer."))return;
  try{await db.collection("torneos_app").doc(id).delete();toast("Torneo eliminado");cargarListaTorneos();}
  catch(e){toast("Error: "+e.message);}
}
async function eliminarInscripcion(id,nombre){
  if(!confirm("¿Eliminar inscripción de \""+nombre+"\"?"))return;
  try{await db.collection("inscripciones_atmas").doc(id).delete();toast("Inscripción eliminada");loadAdminTorneos();}
  catch(e){toast("Error: "+e.message);}
}
async function eliminarJugador(nombre){
  if(!confirm("¿Eliminar jugador \""+nombre+"\" del ranking?"))return;
  try{
    var snap=await db.collection("ranking_atmas").where("nombre","==",nombre).get();
    var batch=db.batch();snap.forEach(function(doc){batch.delete(doc.ref);});
    await batch.commit();
    rankingData=rankingData.filter(function(p){return p[0]!==nombre;});
    renderRanking();
    var ara=el("a-ranking-admin");
    if(ara){var rh="";rankingData.forEach(function(p,i){rh+='<div class="lcard"><div class="rank-pos" style="width:24px;font-size:12px">'+(i+1)+'</div><div style="flex:1"><div class="nm">'+p[0]+'</div><div class="ds">'+p[1]+' pts &middot; '+p[3]+'G '+p[4]+'P</div></div><button class="mini" style="color:#dc2626" onclick="eliminarJugador(\''+p[0].replace(/'/g,"\\'")+'\')">&times;</button></div>';});ara.innerHTML=rh;}
    toast("Jugador eliminado: "+nombre);
  }catch(e){toast("Error: "+e.message);}
}
async function toggleTorneo(id,activo){
  try{await db.collection("torneos_app").doc(id).update({activo:activo});toast(activo?"Torneo activado":"Torneo desactivado");cargarListaTorneos();}
  catch(e){toast("Error: "+e.message);}
}

async function editarCuposTorneo(id,actual){
  var n=prompt("Cupos disponibles (actual: "+actual+"):");
  if(n===null||n==="")return;
  var v=parseInt(n);if(isNaN(v)||v<0){toast("Número inválido");return;}
  try{await db.collection("torneos_app").doc(id).update({cuposDisp:v});toast("Cupos actualizados: "+v);cargarListaTorneos();}
  catch(e){toast("Error: "+e.message);}
}

async function loadAdminTorneos(){
  try{
    var snapPend=await db.collection("partidos_atmas").where("estado","==","pendiente_admin").orderBy("ts","desc").limit(20).get();
    var ap=el("a-pendientes");
    if(!ap){}else if(snapPend.empty){ap.innerHTML='<p class="hint">Sin partidos pendientes</p>';}
    else{
      window._pendQ=[];var hp="";
      snapPend.forEach(function(doc){var r=doc.data();var qi=window._pendQ.length;window._pendQ.push({id:doc.id,gan:r.ganador,per:r.perdedor});
        var rivalTag=r.rivalConfirmo===true?'<span style="background:#dcfce7;color:#15803d;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700">✅ Rival confirmó</span>':r.rivalConfirmo===false?'<span style="background:#fee2e2;color:#b91c1c;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700">⚠️ En disputa</span>':'<span style="background:#fef3c7;color:#b45309;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700">⏳ Sin confirmar</span>';
        hp+='<div class="res-card" style="border-color:#f59e0b"><div class="rc-top"><span class="rc-name">'+r.ganador+' ganó</span><span class="rc-date">'+(r.fecha||"")+'</span></div>'+rivalTag+(r.contexto?'<div style="font-size:11px;font-weight:700;color:#b45309;margin:4px 0">'+r.contexto+'</div>':'')+'<div class="rc-sub" style="margin-top:4px">vs '+r.perdedor+' &middot; '+(r.sets||"sin sets")+'</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn" style="flex:1;padding:8px;font-size:12px" onclick="pendAprobar('+qi+')">✓ Aprobar +pts</button><button class="btn sec" style="flex:1;padding:8px;font-size:12px" onclick="pendRechazar('+qi+')">✗ Rechazar</button></div></div>';});
      ap.innerHTML=hp;
    }
  }catch(e){var ap2=el("a-pendientes");if(ap2)ap2.innerHTML='<p class="hint">Error</p>';}
  try{
    var snap2=await db.collection("inscripciones_atmas").orderBy("ts","desc").limit(40).get();
    var ai=el("a-inscripciones");
    if(!ai){}else if(snap2.empty){ai.innerHTML='<p class="hint">Sin inscripciones</p>';}
    else{var h2="";snap2.forEach(function(doc){var r=doc.data();h2+='<div class="res-card" style="border-color:#6366f1"><div class="rc-top"><span class="rc-name">'+(r.nombre||"?")+'</span><span style="font-size:11px;color:var(--suave)">'+(r.torneo||r.categoria||"")+'</span></div><div class="rc-sub">'+(r.tel||"")+' &middot; '+(r.estado||"pendiente")+'</div><button class="mini" style="color:#dc2626;margin-top:6px" onclick="eliminarInscripcion(\''+doc.id+'\',\''+((r.nombre||"").replace(/'/g,"\\'"))+'\')">&times; Eliminar</button></div>';});ai.innerHTML=h2;}
  }catch(e){}
}


/* ─── CUADROS ─────────────────────────────────────────────────── */
function generarYRenderCuadros(){cuadros=generarCuadros();renderBracket("oro");}

/* ─── CUADRO TORNEO NOVICIOS 3 ─────────────────────────────────── */
var NOVICIOS3_SEED={
  nombre:"Torneo Novicios 3",fecha:"Sabado 13 Junio 2026",
  octavos:[
    {a:"Franco Gutiérrez",b:"Seba Bustamante",hora:"16:00",gan:"Franco Gutiérrez",res:"6/1 6/1"},
    {a:"Pedro González",b:"Claudio Rocha",hora:"17:30",gan:"Pedro González",res:"6/3 3/6 10/8"},
    {a:"Marcos Hernández",b:"Vicente Rodríguez",hora:"16:00",gan:"Marcos Hernández",res:"6/3 6/1"},
    {a:"Fco. Morales",b:"Mauricio Melo",hora:"17:30",gan:"Mauricio Melo",res:"6/0 6/0"},
    {a:"Máximo Escalona",b:"Daniel Rojas",hora:"16:00",gan:"Máximo Escalona",res:"6/0 6/4"},
    {a:"Rafa Zarate",b:"Matías Córdova",hora:"16:00",gan:"Matías Córdova",res:"6/3 6/1"},
    {a:"Luis Irribarra",b:"Rodrigo Arancibia",hora:"17:30",gan:"Rodrigo Arancibia",res:"6/1 6/1"},
    {a:"Andy Cespedes",b:"Fabián Araneda",hora:"17:30",gan:"Andy Cespedes",res:"6/4 7/5"}
  ],
  cuartos:[
    {a:"Franco Gutiérrez",b:"Pedro González",hora:"Por definir",gan:null},
    {a:"Marcos Hernández",b:"Mauricio Melo",hora:"Por definir",gan:null},
    {a:"Máximo Escalona",b:"Matías Córdova",hora:"Por definir",gan:null},
    {a:"Rodrigo Arancibia",b:"Andy Cespedes",hora:"Por definir",gan:null}
  ],
  semis:[{a:null,b:null,hora:"Por definir",gan:null},{a:null,b:null,hora:"Por definir",gan:null}],
  final:{a:null,b:null,hora:"Por definir",gan:null}
};
var cuadroListener=null;var cuadroData=null;

async function seedCuadroNovicios3(){
  try{await db.collection("torneos_cuadro").doc("novicios3").set(NOVICIOS3_SEED);}catch(e){console.warn("seedCuadro error:",e);}
}

async function seedCuadroZonaNorte(){
  try{
    var snap=await db.collection("torneos_cuadro").doc("zonanorte6").get();
    if(!snap.exists)await db.collection("torneos_cuadro").doc("zonanorte6").set(ZONA_NORTE_SEED);
  }catch(e){console.warn("seedZonaNorte error:",e);}
}

var zonaNorteListener=null;var zonaNorteData=null;
function iniciarZonaNorteLive(){
  if(zonaNorteListener)zonaNorteListener();
  try{
    zonaNorteListener=db.collection("torneos_cuadro").doc("zonanorte6").onSnapshot(function(snap){
      zonaNorteData=snap.exists?snap.data():ZONA_NORTE_SEED;
      renderCuadroZonaNorte(zonaNorteData);
    },function(){zonaNorteData=ZONA_NORTE_SEED;renderCuadroZonaNorte(ZONA_NORTE_SEED);});
  }catch(e){zonaNorteData=ZONA_NORTE_SEED;renderCuadroZonaNorte(ZONA_NORTE_SEED);}
}

function renderCuadroZonaNorte(data){
  var ecn=el("cuadro-zonanorte");if(!ecn)return;
  try{
    var _p=getPerfil()||{};var admin=esAdmin(_p.nombre||"",_p.email||"");
    function mhtml(ronda,idx,m){
      var aCls=m.gan&&m.gan===m.a?"gan":"";var bCls=m.gan&&m.gan===m.b?"gan":"";
      var adminBtn=admin&&m.a&&m.b&&!m.gan?'<button class="mini" style="width:100%;margin-top:4px;font-size:10px" onclick="openModalGanadorZN(\''+ronda+'\','+idx+')">Registrar ganador</button>':"";
      var resTag=m.res?'<div style="font-size:9px;color:var(--suave);text-align:center;margin-top:2px">'+m.res+'</div>':"";
      var badge=m.gan?'<div style="font-size:9px;color:var(--verde-osc);font-weight:700;text-align:center;margin-top:3px">&#10003; '+m.gan+'</div>'+resTag:adminBtn;
      return'<div class="cuadro-match"><div class="cuadro-hora">'+m.hora+'</div><div class="cuadro-player '+(m.a?"":"tbd")+' '+aCls+'">'+(m.a||"Por definir")+'</div><div style="font-size:9px;color:var(--suave);text-align:center;padding:2px 0">vs</div><div class="cuadro-player '+(m.b?"":"tbd")+' '+bCls+'">'+(m.b||"Por definir")+'</div>'+badge+'</div>';
    }
    var oct=data.octavos||[];var cua=data.cuartos||[];var sem=data.semis||[];var fin=data.final||{};
    var h='<div class="cuadro-bracket">';
    h+='<div class="cuadro-col"><div class="cuadro-col-title">Octavos &middot; S&aacute;b 21/6</div>';
    oct.forEach(function(m,i){h+=mhtml("octavos",i,m);});
    h+='</div><div class="cuadro-col cuadro-col-mid"><div class="cuadro-col-title">Cuartos &middot; 16:00</div>';
    cua.forEach(function(m,i){h+=mhtml("cuartos",i,m);});
    h+='</div><div class="cuadro-col cuadro-col-mid"><div class="cuadro-col-title">Semis &middot; 18:00</div>';
    sem.forEach(function(m,i){h+=mhtml("semis",i,m);});
    h+='</div><div class="cuadro-col cuadro-col-mid"><div class="cuadro-col-title">Final &middot; 20:00</div>';
    h+=mhtml("final",0,fin);
    if(fin.gan){h+='<div style="text-align:center;padding:6px 0"><div style="font-size:26px">&#127942;</div><div style="font-weight:900;font-size:12px;color:var(--verde-osc)">Campe&oacute;n!</div><div style="font-size:11px;font-weight:700">'+fin.gan+'</div></div>';}
    h+='</div></div>';
    ecn.innerHTML=h;
  }catch(e){console.warn("renderCuadroZonaNorte error:",e);}
}

function openModalGanadorZN(ronda,idx){
  if(!zonaNorteData)return;
  var m=ronda==="final"?zonaNorteData.final:zonaNorteData[ronda][idx];
  if(!m||!m.a||!m.b)return;
  window._ganModalZN={ronda:ronda,idx:idx,a:m.a,b:m.b};
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  sc.innerHTML='<h3>Registrar ganador</h3><p style="font-size:13px;color:var(--suave);margin-bottom:14px">'+m.a+' vs '+m.b+'</p>'+
    '<button class="btn" style="margin-bottom:8px" onclick="guardarGanadorZN(0)">&#127942; '+m.a+'</button>'+
    '<button class="btn sec" style="margin-bottom:8px" onclick="guardarGanadorZN(1)">&#127942; '+m.b+'</button>'+
    '<div class="field" style="margin-top:8px"><label>Resultado (opcional)</label><input id="zn-res" placeholder="6/4 7/5"></div>'+
    '<button class="btn sec" onclick="closeModal()">Cancelar</button>';
  mo.classList.add("show");
}

async function guardarGanadorZN(idx){
  var g=window._ganModalZN;if(!g)return;
  var gan=idx===0?g.a:g.b;
  var res=((el("zn-res")||{}).value||"").trim();
  var update={};
  if(g.ronda==="final"){update["final.gan"]=gan;if(res)update["final.res"]=res;}
  else{update[g.ronda+"."+g.idx+".gan"]=gan;if(res)update[g.ronda+"."+g.idx+".res"]=res;}
  // Avanzar ganador al siguiente cuadro
  var data=zonaNorteData;
  var newData=JSON.parse(JSON.stringify(data));
  if(g.ronda==="octavos"){
    var qIdx=Math.floor(g.idx/2);
    var slot=g.idx%2===0?"a":"b";
    newData.cuartos[qIdx][slot]=gan;
    newData.octavos[g.idx].gan=gan;if(res)newData.octavos[g.idx].res=res;
  }else if(g.ronda==="cuartos"){
    var sIdx=Math.floor(g.idx/2);var slot=g.idx%2===0?"a":"b";
    newData.semis[sIdx][slot]=gan;newData.cuartos[g.idx].gan=gan;if(res)newData.cuartos[g.idx].res=res;
  }else if(g.ronda==="semis"){
    var slot=g.idx===0?"a":"b";newData.final[slot]=gan;newData.semis[g.idx].gan=gan;if(res)newData.semis[g.idx].res=res;
  }else if(g.ronda==="final"){newData.final.gan=gan;if(res)newData.final.res=res;}
  try{await db.collection("torneos_cuadro").doc("zonanorte6").set(newData);toast("Ganador registrado: "+gan);closeModal();}
  catch(e){toast("Error: "+e.message);}
}

function iniciarCuadroLive(){
  if(cuadroListener)cuadroListener();
  try{
    cuadroListener=db.collection("torneos_cuadro").doc("novicios3").onSnapshot(function(snap){
      cuadroData=snap.exists?snap.data():NOVICIOS3_SEED;
      renderCuadroNovicios3(cuadroData);
    },function(e){cuadroData=NOVICIOS3_SEED;renderCuadroNovicios3(cuadroData);});
  }catch(e){cuadroData=NOVICIOS3_SEED;renderCuadroNovicios3(cuadroData);}
}

function renderCuadroNovicios3(data){
  var ecn=el("cuadro-novicios3");if(!ecn)return;
  try{
    var _p=getPerfil()||{};var admin=esAdmin(_p.nombre||"",_p.email||"");
    function mhtml(ronda,idx,m){
      var aCls=m.gan&&m.gan===m.a?"gan":"";
      var bCls=m.gan&&m.gan===m.b?"gan":"";
      var adminBtn=admin&&m.a&&m.b&&!m.gan?'<button class="mini" style="width:100%;margin-top:4px;font-size:10px" onclick="openModalGanador(\''+ronda+'\','+idx+')">Registrar ganador</button>':"";
      var resTag=m.res?'<div style="font-size:9px;color:var(--suave);text-align:center;margin-top:2px">'+m.res+'</div>':"";
      var badge=m.gan?'<div style="font-size:9px;color:var(--verde-osc);font-weight:700;text-align:center;margin-top:3px">&#10003; '+m.gan+'</div>'+resTag:adminBtn;
      return '<div class="cuadro-match"><div class="cuadro-hora">'+m.hora+'</div><div class="cuadro-player '+(m.a?"":"tbd")+' '+aCls+'">'+(m.a||"Por definir")+'</div><div style="font-size:9px;color:var(--suave);text-align:center;padding:2px 0">vs</div><div class="cuadro-player '+(m.b?"":"tbd")+' '+bCls+'">'+(m.b||"Por definir")+'</div>'+badge+'</div>';
    }
    var oct=data.octavos||[];var cua=data.cuartos||[];var sem=data.semis||[];var fin=data.final||{};
    var h='<div class="cuadro-bracket">';
    h+='<div class="cuadro-col"><div class="cuadro-col-title">Octavos &middot; Hoy</div>';
    oct.forEach(function(m,i){h+=mhtml("octavos",i,m);});
    h+='</div><div class="cuadro-col cuadro-col-mid"><div class="cuadro-col-title">Cuartos</div>';
    cua.forEach(function(m,i){h+=mhtml("cuartos",i,m);});
    h+='</div><div class="cuadro-col cuadro-col-mid"><div class="cuadro-col-title">Semis</div>';
    sem.forEach(function(m,i){h+=mhtml("semis",i,m);});
    h+='</div><div class="cuadro-col cuadro-col-mid"><div class="cuadro-col-title">Final</div>';
    h+=mhtml("final",0,fin);
    if(fin.gan){h+='<div style="text-align:center;padding:6px 0"><div style="font-size:26px">&#127942;</div><div style="font-weight:900;font-size:12px;color:var(--verde-osc)">&#127942; Campeon!</div><div style="font-size:11px;font-weight:700">'+fin.gan+'</div></div>';}
    h+='</div></div>';
    ecn.innerHTML=h;
  }catch(e){console.warn("renderCuadroNovicios3 error:",e);}
}

function openModalGanador(ronda,idx){
  if(!cuadroData)return;
  try{
    var m=ronda==="final"?cuadroData.final:cuadroData[ronda][idx];
    if(!m||!m.a||!m.b)return;
    window._ganModal={ronda:ronda,idx:idx,a:m.a,b:m.b};
    var html='<h3>Registrar ganador</h3><p style="font-size:13px;color:var(--suave);margin-bottom:14px">'+m.a+' vs '+m.b+'</p>';
    html+='<button class="btn" style="margin-bottom:8px" onclick="guardarGanadorPartido(0)">&#127942; '+m.a+'</button>';
    html+='<button class="btn sec" style="margin-bottom:8px" onclick="guardarGanadorPartido(1)">&#127942; '+m.b+'</button>';
    html+='<button class="btn sec" style="margin-top:4px" onclick="closeModal()">Cancelar</button>';
    var sc=el("sheet-content");var mo=el("modal");
    if(sc)sc.innerHTML=html;if(mo)mo.classList.add("show");
  }catch(e){console.warn("openModalGanador error:",e);}
}

async function guardarGanadorPartido(slot){
  closeModal();
  var gm=window._ganModal;if(!gm||!cuadroData)return;
  try{
    var ganador=slot===0?gm.a:gm.b;
    var ronda=gm.ronda;var idx=gm.idx;
    var update={};
    if(ronda==="final"){
      update["final.gan"]=ganador;
    }else{
      var arr=cuadroData[ronda].map(function(x){return Object.assign({},x);});
      arr[idx].gan=ganador;
      update[ronda]=arr;
      if(ronda==="octavos"){
        var cua2=cuadroData.cuartos.map(function(x){return Object.assign({},x);});
        var ci=Math.floor(idx/2);
        if(idx%2===0){cua2[ci].a=ganador;}else{cua2[ci].b=ganador;}
        update.cuartos=cua2;
      }else if(ronda==="cuartos"){
        var sem2=cuadroData.semis.map(function(x){return Object.assign({},x);});
        var si=Math.floor(idx/2);
        if(idx%2===0){sem2[si].a=ganador;}else{sem2[si].b=ganador;}
        update.semis=sem2;
      }else if(ronda==="semis"){
        var fin2=Object.assign({},cuadroData.final);
        if(idx===0){fin2.a=ganador;}else{fin2.b=ganador;}
        update.final=fin2;
      }
    }
    await db.collection("torneos_cuadro").doc("novicios3").update(update);
    toast("Ganador guardado!");
  }catch(e){toast("Error al guardar ganador.");}
}

/* ─── INICIO ──────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE RESERVAS ATMAS
   ═══════════════════════════════════════════════════════════════ */

var CONFIG_RES={
  tarifa1h:{socio_mensual:0,socio_partido:15000,invitado:15000,arriendo:15000,academia_individual:15000,academia_grupal:15000},
  tarifa2h:{socio_mensual:0,socio_partido:25000,invitado:25000,arriendo:25000,academia_individual:25000,academia_grupal:25000},
  canchas:[
    {id:1,nombre:"Cancha 1",tipos:["socio_mensual","socio_partido"]},
    {id:2,nombre:"Cancha 2",tipos:["socio_mensual","socio_partido"]},
    {id:3,nombre:"Cancha 3",tipos:["invitado","arriendo","academia"]},
    {id:4,nombre:"Cancha 4",tipos:["invitado","arriendo","academia"]}
  ],
  // Lun-Vie: horas de inicio disponibles (bloques 1h)
  horasLV:[8,9,10,11,12,13,14,15,16,17],
  // Sáb-Dom: bloques fijos 2h mañana, luego 1h libre desde las 14h
  bloquesFijosFDS:[[8,10],[10,12],[12,14]],
  horasLibresFDS:[14,15,16,17],
  labelTipo:{socio_mensual:"Socio mensualidad",socio_partido:"Socio paga partido",invitado:"Invitado",arriendo:"Arriendo",academia:"Academia"}
};

var resState={tipo:null,fecha:null,canchaId:null,horaInicio:null,horaFin:null,duracion:1};

function canchasPermitidas(tipo){
  if(tipo==="admin")return CONFIG_RES.canchas;
  return CONFIG_RES.canchas.filter(function(c){return c.tipos.indexOf(tipo)!==-1;});
}
function tarifaTipo(tipo,duracion){
  if(duracion===2)return CONFIG_RES.tarifa2h[tipo]||0;
  return CONFIG_RES.tarifa1h[tipo]||0;
}
function esFDS(fecha){
  var d=new Date(fecha+"T12:00");var dow=d.getDay();return dow===0||dow===6;
}
function getSlotsParaDia(fecha){
  // Retorna array de {hi, hf, fijo2h}
  var slots=[];
  if(esFDS(fecha)){
    CONFIG_RES.bloquesFijosFDS.forEach(function(b){
      slots.push({hi:padH(b[0])+":00",hf:padH(b[1])+":00",fijo2h:true});
    });
    CONFIG_RES.horasLibresFDS.forEach(function(h){
      slots.push({hi:padH(h)+":00",hf:padH(h+1)+":00",fijo2h:false});
    });
  }else{
    CONFIG_RES.horasLV.forEach(function(h){
      slots.push({hi:padH(h)+":00",hf:padH(h+1)+":00",fijo2h:false});
    });
  }
  return slots;
}

function renderCalendario(){
  handlePaymentReturn();
  var p=getPerfil();
  var tipo=(p&&p.tipo)||null;
  var ts=el("res-tipo-selector"),rm=el("res-main");
  if(!tipo||tipo==="admin"){
    if(ts)ts.style.display="";if(rm)rm.style.display="none";
    // Admin: show cambiar tipo button
    var cbt=el("res-cambiar-tipo");if(cbt)cbt.style.display=tipo==="admin"?"":"none";
  }else{
    resState.tipo=tipo;
    if(ts)ts.style.display="none";if(rm)rm.style.display="";
    var cbt2=el("res-cambiar-tipo");if(cbt2)cbt2.style.display="none";
    // Pre-seleccionar hoy
    if(!resState.fecha){resState.fecha=new Date().toISOString().split("T")[0];}
    actualizarLabelTipo();renderDayStrip();renderCourtTabs();renderSlots();verificarSancionBanner();
  }
}

function showTipoSelector(){
  var ts=el("res-tipo-selector"),rm=el("res-main");
  if(ts)ts.style.display="";if(rm)rm.style.display="none";
}

function setTipoReserva(tipo){
  resState.tipo=tipo;resState.fecha=new Date().toISOString().split("T")[0];resState.canchaId=null;resState.horaInicio=null;resState.duracion=1;
  var ts=el("res-tipo-selector"),rm=el("res-main");
  if(ts)ts.style.display="none";if(rm)rm.style.display="";
  actualizarLabelTipo();renderDayStrip();renderCourtTabs();renderSlots();verificarSancionBanner();
  var cbt=el("res-cambiar-tipo");if(cbt)cbt.style.display="";
}

function actualizarLabelTipo(){
  var lbl=el("res-tipo-label");if(!lbl)return;
  var t1=tarifaTipo(resState.tipo,1),t2=tarifaTipo(resState.tipo,2);
  var precio=t1>0?"$"+t1.toLocaleString("es-CL")+"/hr · $"+t2.toLocaleString("es-CL")+"/2hr":"incluido";
  lbl.textContent=(CONFIG_RES.labelTipo[resState.tipo]||resState.tipo)+" — "+precio;
}

var _calMes=null;var _calAnio=null;
function renderDayStrip(){
  var strip=el("day-strip");if(!strip)return;
  var hoy=new Date();
  if(_calMes===null){_calMes=hoy.getMonth();_calAnio=hoy.getFullYear();}
  var meses=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var dias=["D","L","M","M","J","V","S"];
  var hoyStr=hoy.toISOString().split("T")[0];
  // Primer día del mes y cuántos días tiene
  var primerDia=new Date(_calAnio,_calMes,1).getDay();
  var diasMes=new Date(_calAnio,_calMes+1,0).getDate();
  // Mes anterior navegación
  var puedeAtras=(_calAnio>hoy.getFullYear())||(_calAnio===hoy.getFullYear()&&_calMes>hoy.getMonth());
  var h='<div style="background:#fff;border-radius:16px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,.07);margin-bottom:12px">';
  // Cabecera mes
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'+
    '<button onclick="navMes(-1)" style="background:none;border:none;font-size:20px;cursor:pointer;color:'+(puedeAtras?"var(--verde-osc)":"#d1d5db")+';padding:4px 8px" '+(puedeAtras?'':'disabled')+'>&#8249;</button>'+
    '<div style="font-weight:800;font-size:15px">'+meses[_calMes]+' '+_calAnio+'</div>'+
    '<button onclick="navMes(1)" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--verde-osc);padding:4px 8px">&#8250;</button>'+
    '</div>';
  // Cabecera días
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">';
  dias.forEach(function(d){h+='<div style="text-align:center;font-size:11px;font-weight:700;color:#9ca3af;padding:2px 0">'+d+'</div>';});
  h+='</div>';
  // Grid días
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">';
  for(var i=0;i<primerDia;i++)h+='<div></div>';
  for(var dia=1;dia<=diasMes;dia++){
    var fs=_calAnio+'-'+(String(_calMes+1).padStart(2,'0'))+'-'+(String(dia).padStart(2,'0'));
    var pasado=fs<hoyStr;
    var esHoy=fs===hoyStr;
    var selec=fs===resState.fecha;
    var fds=(new Date(fs+"T12:00").getDay()===0||new Date(fs+"T12:00").getDay()===6);
    var bg=selec?"var(--verde-osc)":esHoy?"var(--verde-claro)":"transparent";
    var color=selec?"#fff":pasado?"#d1d5db":fds?"var(--verde-mid)":"#1f2937";
    var weight=selec||esHoy?"800":"400";
    var cursor=pasado?"default":"pointer";
    var click=pasado?"":'onclick="selectFechaRes(\''+fs+'\')"';
    h+='<div '+click+' style="text-align:center;padding:5px 2px;border-radius:8px;background:'+bg+';color:'+color+';font-weight:'+weight+';font-size:14px;cursor:'+cursor+(esHoy&&!selec?';border:2px solid var(--verde-mid)':'')+'">'+dia+'</div>';
  }
  h+='</div>';
  // Leyenda precios
  var t1=tarifaTipo(resState.tipo,1),t2=tarifaTipo(resState.tipo,2);
  if(t1>0){
    h+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6">';
    h+='<div style="display:flex;justify-content:space-between;font-size:12px;color:#4b5563;padding:3px 0"><span>Lun-Vie 08:00&ndash;17:00</span><b style="color:var(--verde-osc)">1 hr &middot; $'+t1.toLocaleString("es-CL")+'</b></div>';
    h+='<div style="display:flex;justify-content:space-between;font-size:12px;color:#4b5563;padding:3px 0"><span>S&aacute;b-Dom 08:00&ndash;14:00</span><b style="color:var(--verde-osc)">2 hrs &middot; $'+t2.toLocaleString("es-CL")+'</b></div>';
    h+='<div style="display:flex;justify-content:space-between;font-size:12px;color:#4b5563;padding:3px 0"><span>S&aacute;b-Dom desde 14:00</span><b style="color:var(--verde-osc)">1 hr &middot; $'+t1.toLocaleString("es-CL")+'</b></div>';
    h+='</div>';
  }
  h+='</div>';
  strip.innerHTML=h;
}

function navMes(dir){
  var hoy=new Date();
  _calMes+=dir;
  if(_calMes<0){_calMes=11;_calAnio--;}
  if(_calMes>11){_calMes=0;_calAnio++;}
  // No permitir ir antes del mes actual
  if(_calAnio<hoy.getFullYear()||(_calAnio===hoy.getFullYear()&&_calMes<hoy.getMonth())){_calMes=hoy.getMonth();_calAnio=hoy.getFullYear();}
  renderDayStrip();
}

function renderCourtTabs(){
  var tabs=el("court-tabs");if(!tabs)return;
  tabs.innerHTML="";
  var canchas=canchasPermitidas(resState.tipo);
  // Auto-seleccionar primera cancha si no hay ninguna elegida
  if(!resState.canchaId&&canchas.length>0){resState.canchaId=canchas[0].id;}
  canchas.forEach(function(c){
    var btn=document.createElement("button");
    btn.textContent=c.nombre;
    btn.className=resState.canchaId===c.id?"on":"";
    btn.onclick=(function(cid){return function(){selectCanchaRes(cid);};})(c.id);
    tabs.appendChild(btn);
  });
}

function selectFechaRes(fecha){
  resState.fecha=fecha;resState.horaInicio=null;resState.duracion=1;
  renderDayStrip();ocultarFormRes();renderSlots();
}

function selectCanchaRes(cid){
  resState.canchaId=cid;resState.horaInicio=null;resState.duracion=1;
  renderCourtTabs();ocultarFormRes();
  if(resState.fecha)renderSlots();
}

async function renderSlots(){
  var cont=el("slots-res");if(!cont)return;
  if(!resState.fecha||!resState.canchaId){
    cont.innerHTML='<p class="hint">Selecciona día y cancha</p>';return;
  }
  cont.innerHTML='<p class="hint">Cargando horarios...</p>';
  try{
    var snap=await db.collection("reservas")
      .where("canchaId","==",resState.canchaId)
      .where("fecha","==",resState.fecha)
      .where("estado","in",["confirmada","confirmada_pagada","pendiente_pago"])
      .get();
    var ocupadas={};
    snap.forEach(function(doc){
      var r=doc.data();
      ocupadas[r.horaInicio]=true;
      // marcar también la segunda hora si fue reserva de 2h
      if(r.duracion===2||r.horaFin){
        var h2=parseInt(r.horaInicio)+1;
        if(h2<10)ocupadas["0"+h2+":00"]=true;
        else ocupadas[h2+":00"]=true;
      }
    });
    var ahora=new Date();
    var slots=getSlotsParaDia(resState.fecha);
    if(!slots.length){cont.innerHTML='<p class="hint">Sin horarios configurados</p>';return;}
    var htmlS='<div class="slot-grid">';
    slots.forEach(function(s){
      var slotDt=new Date(resState.fecha+"T"+s.hi);
      var pasado=slotDt<ahora;
      // Para slot fijo 2h: verificar que ambas horas estén libres
      var ocup=!!ocupadas[s.hi];
      if(s.fijo2h){
        var h2=parseInt(s.hi)+1;
        var hi2=(h2<10?"0"+h2:h2)+":00";
        ocup=ocup||!!ocupadas[hi2];
      }
      var sel=resState.horaInicio===s.hi;
      var cls="slot-block"+(pasado||ocup?" ocupado":sel?" seleccionado":" libre");
      var durLabel=s.fijo2h?"2 hrs":"1 hr";
      var click=(!pasado&&!ocup)?'onclick="selectSlotRes(\''+s.hi+'\',\''+s.hf+'\','+(s.fijo2h?2:1)+')"':'';
      htmlS+='<div class="'+cls+'" '+click+'>'+
        '<div class="sl-h">'+s.hi+'</div>'+
        '<div class="sl-f">'+s.hf+'</div>'+
        '<div class="sl-e">'+(pasado?"Pasado":ocup?"Ocupado":durLabel)+'</div>'+
        '</div>';
    });
    htmlS+='</div>';
    cont.innerHTML=htmlS;
  }catch(e){cont.innerHTML='<p class="hint">Error al cargar</p>';console.warn(e);}
}

function padH(h){return h<10?"0"+Math.floor(h):String(Math.floor(h));}

function selectSlotRes(hi,hf,dur){
  resState.horaInicio=hi;resState.horaFin=hf;resState.duracion=dur||1;
  renderSlots();mostrarFormRes();
}

function mostrarFormRes(){
  var form=el("res-form");if(!form)return;
  form.style.display="";
  var p=getPerfil();
  if(p){var nb=el("res-nombre");if(nb&&!nb.value)nb.value=p.nombre||"";var tb=el("res-tel");if(tb&&!tb.value)tb.value=p.tel||"";}
  actualizarResumenForm();
  setTimeout(function(){form.scrollIntoView({behavior:"smooth",block:"nearest"});},100);
}

function actualizarResumenForm(){
  var cancha=CONFIG_RES.canchas.find(function(c){return c.id===resState.canchaId;});
  var fechaFmt=new Date(resState.fecha+"T12:00").toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"});
  var hIni=parseInt(resState.horaInicio);
  var hFinNum=hIni+resState.duracion;
  var horaFinStr=(hFinNum<10?"0"+hFinNum:hFinNum)+":00";
  resState.horaFin=horaFinStr;
  var rs=el("res-resumen");if(rs)rs.innerHTML='<b>'+(cancha?cancha.nombre:"Cancha "+resState.canchaId)+'</b> &middot; '+fechaFmt+'<br>'+resState.horaInicio+' &ndash; '+horaFinStr;
  // Selector de duración (solo si no es bloque fijo 2h de FDS)
  var durDiv=el("res-duracion");
  if(durDiv){
    var esFijo=esFDS(resState.fecha)&&hIni<14;
    if(esFijo){
      durDiv.innerHTML='';
    }else{
      var t1=tarifaTipo(resState.tipo,1),t2=tarifaTipo(resState.tipo,2);
      var lbl1=t1>0?"1 hora &mdash; $"+t1.toLocaleString("es-CL"):"1 hora &mdash; incluido";
      var lbl2=t2>0?"2 horas &mdash; $"+t2.toLocaleString("es-CL"):"2 horas &mdash; incluido";
      durDiv.innerHTML='<div style="display:flex;gap:8px;margin-bottom:12px">'+
        '<button class="mini'+(resState.duracion===1?" on":"")+'" style="flex:1;padding:9px 0;font-size:13px" onclick="cambiarDuracion(1)">'+lbl1+'</button>'+
        '<button class="mini'+(resState.duracion===2?" on":"")+'" style="flex:1;padding:9px 0;font-size:13px" onclick="cambiarDuracion(2)">'+lbl2+'</button>'+
        '</div>';
    }
  }
  var tarifa=tarifaTipo(resState.tipo,resState.duracion);
  // Panel de pago al estilo "Datos de transferencia"
  var md=el("res-monto");
  if(md){
    if(tarifa>0){
      var t=PAGO;
      var linkMP=resState.duracion===2?MP.cancha2hrs:MP.cancha1hr;
      var textoCopia="Datos de transferencia ATMAS\nNombre: "+t.nombre+"\nRUT: "+t.rut+"\nBanco: "+t.banco+"\nTipo: "+t.tipo+"\nN° Cuenta: "+t.cuenta+"\nEmail: "+t.email+"\nMonto: $"+tarifa.toLocaleString("es-CL");
      function fila(k,v,big){return '<div class="pagobox row"><span class="k">'+k+':</span><span class="v'+(big?' big':'')+'">'+v+'</span></div>';}
      md.innerHTML=
        '<a href="'+linkMP+'" target="_blank" style="display:block;background:#009ee3;color:#fff;text-align:center;padding:14px;border-radius:14px;font-size:15px;font-weight:800;text-decoration:none;margin-bottom:12px">&#128179;&nbsp; Pagar con MercadoPago &rarr; $'+tarifa.toLocaleString("es-CL")+'</a>'+
        '<div style="text-align:center;font-size:12px;color:#9ca3af;margin:-4px 0 12px">&mdash; o transferencia bancaria &mdash;</div>'+
        '<div class="pagobox">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
        '<h4 style="margin:0">&#128180; Datos de transferencia</h4>'+
        '<button class="copy-btn" style="font-size:13px;padding:6px 12px" onclick="navigator.clipboard.writeText(\''+textoCopia.replace(/'/g,"\\'").replace(/\n/g,'\\n')+'\').then(function(){toast(\'Datos copiados ✓\');})">&#128203; Copiar datos</button>'+
        '</div>'+
        fila("Nombre",t.nombre)+
        fila("RUT",t.rut)+
        fila("Banco",t.banco)+
        fila("Tipo",t.tipo)+
        fila("N&ordm; Cuenta",'<b>'+t.cuenta+'</b>')+
        fila("Email",t.email)+
        fila("Monto",'<b style="font-size:17px;color:var(--verde-osc)">$'+tarifa.toLocaleString("es-CL")+'</b>',true)+
        '</div>'+
        '<p style="font-size:12px;color:#6b7280;text-align:center;margin:6px 0 4px">Env&iacute;a comprobante por WhatsApp para confirmar.</p>';
    }else{
      md.innerHTML='<p style="color:var(--verde-osc);font-weight:700;font-size:14px;margin-bottom:12px">&#10003; Sin costo adicional &mdash; incluido en tu membres&iacute;a</p>';
    }
  }
  var btn=el("res-btn");if(btn)btn.textContent=tarifa>0?"Enviar comprobante por WhatsApp":"Confirmar reserva";
}

function cambiarDuracion(d){resState.duracion=d;actualizarResumenForm();}

function ocultarFormRes(){var f=el("res-form");if(f)f.style.display="none";}
function cancelarSeleccionRes(){resState.horaInicio=null;resState.horaFin=null;renderSlots();ocultarFormRes();}

async function verificarSancionBanner(){
  var banner=el("res-sancion-banner"),txt=el("res-sancion-txt");
  if(!banner||!txt)return;
  var p=getPerfil();var uid=(p&&p.uid)||(auth&&auth.currentUser&&auth.currentUser.uid);
  if(!uid){banner.style.display="none";return;}
  try{
    var snap=await db.collection("sanciones").doc(uid).get();
    if(!snap.exists){banner.style.display="none";return;}
    var san=snap.data();
    if(san.bloqIndef){
      banner.style.display="";banner.style.background="#fee2e2";banner.style.borderColor="#fca5a5";
      txt.style.color="#dc2626";txt.textContent="⛔ Reservas bloqueadas indefinidamente. Contacta al administrador.";
      var btn=el("res-btn");if(btn)btn.disabled=true;
    }else if(san.bloqHasta){
      var hasta=san.bloqHasta.toDate?san.bloqHasta.toDate():new Date(san.bloqHasta);
      if(hasta>new Date()){
        banner.style.display="";banner.style.background="#fee2e2";banner.style.borderColor="#fca5a5";
        txt.style.color="#dc2626";txt.textContent="⛔ Bloqueado hasta "+hasta.toLocaleDateString("es-CL")+" "+hasta.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"});
        var btn2=el("res-btn");if(btn2)btn2.disabled=true;return;
      }
    }
    if(san.estado==="advertencia"){
      banner.style.display="";banner.style.background="#fef3c7";banner.style.borderColor="#fcd34d";
      txt.style.color="#d97706";txt.textContent="⚠️ Advertencia: tienes "+san.faltas+" inasistencia(s) registrada(s).";
    }else{banner.style.display="none";}
  }catch(e){banner.style.display="none";}
}

async function confirmarReserva(){
  var p=getPerfil();
  var nombre=((el("res-nombre")||{}).value||"").trim()||(p&&p.nombre)||"";
  var tel=((el("res-tel")||{}).value||"").trim()||(p&&p.tel)||"";
  if(!nombre){toast("Ingresa tu nombre");return;}
  if(!resState.fecha||!resState.canchaId||!resState.horaInicio){toast("Selecciona un horario");return;}
  var tarifa=tarifaTipo(resState.tipo,resState.duracion);
  var cancha=CONFIG_RES.canchas.find(function(c){return c.id===resState.canchaId;});
  var btn=el("res-btn");if(btn){btn.disabled=true;btn.textContent="Procesando...";}
  try{
    // Re-verificar disponibilidad
    var snap=await db.collection("reservas")
      .where("canchaId","==",resState.canchaId)
      .where("fecha","==",resState.fecha)
      .where("horaInicio","==",resState.horaInicio)
      .where("estado","in",["confirmada","confirmada_pagada","pendiente_pago"])
      .get();
    if(!snap.empty){toast("Ese horario acaba de ser reservado. Elige otro.");renderSlots();ocultarFormRes();return;}
    var rutId=p&&p.rut?p.rut.replace(/\./g,"").replace(/-/g,""):null;
    var uid=(p&&p.uid)||(auth&&auth.currentUser&&!auth.currentUser.isAnonymous?auth.currentUser.uid:null)||rutId||"anonimo";
    var reservaData={
      userId:uid,nombre:nombre,tel:tel,tipo:resState.tipo,
      canchaId:resState.canchaId,canchaNombre:cancha?cancha.nombre:"Cancha "+resState.canchaId,
      fecha:resState.fecha,horaInicio:resState.horaInicio,horaFin:resState.horaFin,
      estado:tarifa>0?"pendiente_pago":"confirmada",monto:tarifa,asistio:null,
      ts:firebase.firestore.FieldValue.serverTimestamp()
    };
    var docRef=await db.collection("reservas").add(reservaData);
    if(tarifa>0){
      // Abrir WhatsApp con comprobante
      var fechaFmt=new Date(resState.fecha+"T12:00").toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"});
      var msg="Hola ATMAS! Adjunto comprobante de transferencia para reserva:\n"+
        "• "+(cancha?cancha.nombre:"Cancha "+resState.canchaId)+"\n"+
        "• "+fechaFmt+"\n"+
        "• "+resState.horaInicio+" – "+resState.horaFin+"\n"+
        "• Monto: $"+tarifa.toLocaleString("es-CL")+"\n"+
        "• Nombre: "+nombre;
      window.open("https://wa.me/56956343558?text="+encodeURIComponent(msg),"_blank");
      toast("Reserva registrada. Envía el comprobante por WhatsApp.");
      ocultarFormRes();resState.horaInicio=null;resState.horaFin=null;renderSlots();
    }else{
      toast("¡Reserva confirmada! "+resState.horaInicio+" "+(cancha?cancha.nombre:""));
      ocultarFormRes();resState.horaInicio=null;resState.horaFin=null;renderSlots();
    }
  }catch(e){toast("Error: "+e.message);}
  finally{if(btn){btn.disabled=false;btn.textContent=tarifa>0?"Pagar con MercadoPago":"Confirmar reserva";}}
}

async function iniciarPagoMP(reservaId,monto,titulo){
  try{
    var res=await fetch("/api/crear-pago",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({titulo:titulo,monto:monto,reservaId:reservaId})});
    var data=await res.json();
    if(data.error){toast("Error MP: "+data.error);return;}
    window.location.href=data.init_point||data.sandbox_init_point;
  }catch(e){toast("Error al conectar con MercadoPago: "+e.message);}
}

function handlePaymentReturn(){
  var params=new URLSearchParams(window.location.search);
  var pago=params.get("pago");var rid=params.get("rid");
  if(!pago||!rid)return;
  window.history.replaceState({},"","/");
  if(pago==="ok"){
    var payId=params.get("payment_id")||"";
    db.collection("reservas").doc(rid).update({estado:"confirmada_pagada",mpPaymentId:payId}).catch(function(){});
    setTimeout(function(){toast("¡Pago confirmado! Tu reserva está lista ✓");},500);
  }else if(pago==="error"){
    db.collection("reservas").doc(rid).update({estado:"cancelada"}).catch(function(){});
    setTimeout(function(){toast("El pago no fue procesado. Intenta de nuevo.");},500);
  }else if(pago==="pendiente"){
    setTimeout(function(){toast("Pago pendiente de confirmación.");},500);
  }
}

/* ─── MIS RESERVAS ──────────────────────────────────────────── */
async function renderMisReservas(){
  var cont=el("mis-reservas-list");if(!cont)return;
  var p=getPerfil();
  var rutId2=p&&p.rut?p.rut.replace(/\./g,"").replace(/-/g,""):null;
  var uid=(p&&p.uid)||(auth&&auth.currentUser&&!auth.currentUser.isAnonymous?auth.currentUser.uid:null)||rutId2;
  if(!uid||uid==="anonimo"){cont.innerHTML='<p class="hint">Inicia sesión para ver tus reservas</p>';return;}
  cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var hoy=new Date().toISOString().split("T")[0];
    var snap=await db.collection("reservas").where("userId","==",uid).orderBy("fecha","desc").limit(30).get();
    if(snap.empty){cont.innerHTML='<p class="hint">No tienes reservas aún</p>';return;}
    var html="";
    snap.forEach(function(doc){
      var r=doc.data();
      var ec={confirmada:"#2563eb",confirmada_pagada:"#16a34a",pendiente_pago:"#d97706",cancelada:"#9ca3af"};
      var et={confirmada:"Confirmada",confirmada_pagada:"Pagada ✓",pendiente_pago:"Pago pendiente",cancelada:"Cancelada"};
      var color=ec[r.estado]||"#6b7280";var label=et[r.estado]||r.estado;
      var pasada=r.fecha<hoy;
      html+='<div class="reserva-card'+(pasada?" pasada":"")+'">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">'+
        '<div style="font-weight:700;font-size:14px">'+(r.canchaNombre||"Cancha "+r.canchaId)+'</div>'+
        '<span style="font-size:11px;font-weight:700;color:'+color+'">'+label+'</span></div>'+
        '<div style="font-size:13px;color:#4b5563">'+fechaLarga(r.fecha)+' &middot; '+(r.horaInicio||"")+' &ndash; '+(r.horaFin||"")+'</div>'+
        (r.monto>0?'<div style="font-size:12px;color:var(--suave)">$'+Number(r.monto).toLocaleString("es-CL")+'</div>':'')+
        (!pasada&&r.estado!=="cancelada"?'<button class="mini" style="margin-top:8px;background:#fee2e2;color:#dc2626" onclick="cancelarMiReserva(\''+doc.id+'\')">Cancelar</button>':'')+
        '</div>';
    });
    cont.innerHTML=html;
  }catch(e){cont.innerHTML='<p class="hint">Error al cargar</p>';console.warn(e);}
}

function fechaLarga(f){if(!f)return"";var d=new Date(f+"T12:00");return d.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"});}

async function cancelarMiReserva(id){
  if(!confirm("¿Cancelar esta reserva?"))return;
  try{await db.collection("reservas").doc(id).update({estado:"cancelada"});toast("Reserva cancelada");renderMisReservas();}
  catch(e){toast("Error: "+e.message);}
}

/* ─── SANCIONES ─────────────────────────────────────────────── */
async function registrarFalta(userId,nombreUsuario,reservaId,fecha){
  var ref=db.collection("sanciones").doc(userId);
  var snap=await ref.get();
  var data=snap.exists?snap.data():{userId:userId,nombre:nombreUsuario,faltas:0,historial:[],estado:"ok",bloqHasta:null,bloqIndef:false};
  data.faltas=(data.faltas||0)+1;
  data.historial=data.historial||[];
  data.historial.push({fecha:fecha,reservaId:reservaId,ts:new Date().toISOString()});
  data.nombre=nombreUsuario||data.nombre;
  var now=new Date();
  if(data.faltas===1){data.estado="advertencia";data.bloqHasta=null;data.bloqIndef=false;}
  else if(data.faltas===2){data.estado="bloqueado";data.bloqHasta=new Date(now.getTime()+72*3600*1000);data.bloqIndef=false;}
  else if(data.faltas===3){data.estado="bloqueado";data.bloqHasta=new Date(now.getTime()+7*24*3600*1000);data.bloqIndef=false;}
  else{data.estado="bloqueado";data.bloqHasta=null;data.bloqIndef=true;}
  await ref.set(data);
  return data;
}

async function levantarSancion(userId){
  try{await db.collection("sanciones").doc(userId).update({estado:"ok",bloqHasta:null,bloqIndef:false,faltas:0});toast("Sanción levantada");}
  catch(e){toast("Error: "+e.message);}
}

/* ─── ADMIN: RESERVAS Y SANCIONES ───────────────────────────── */
async function renderAdminReservas(){
  var cont=el("admin-reservas-cont");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var hoy=new Date();var desde=new Date(hoy);desde.setDate(desde.getDate()-2);
    var desdeStr=desde.toISOString().split("T")[0];
    var snap=await db.collection("reservas").where("fecha",">=",desdeStr).orderBy("fecha","asc").limit(150).get();
    if(snap.empty){cont.innerHTML='<p class="hint">Sin reservas en este período</p>';return;}
    var html="";var fechaAct="";var hoyStr=hoy.toISOString().split("T")[0];
    snap.forEach(function(doc){
      var r=doc.data();
      if(r.fecha!==fechaAct){if(fechaAct)html+='</div>';fechaAct=r.fecha;html+='<div class="section-title" style="margin-top:12px">'+fechaLarga(r.fecha)+(r.fecha===hoyStr?' — <span style="color:var(--verde-osc)">HOY</span>':'')+'</div><div>';}
      var ec={confirmada:"#2563eb",confirmada_pagada:"#16a34a",pendiente_pago:"#d97706",cancelada:"#9ca3af"};
      var el_={confirmada:"CONF",confirmada_pagada:"PAGADA",pendiente_pago:"PEND",cancelada:"CANC"};
      var pasada=r.fecha<hoyStr||(r.fecha===hoyStr&&(r.horaFin||"")<=hoy.toTimeString().slice(0,5));
      html+='<div class="reserva-card" style="margin-bottom:8px">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
        '<div><div style="font-weight:700;font-size:13px">'+(r.canchaNombre||"C"+r.canchaId)+' &middot; '+(r.horaInicio||"")+'&ndash;'+(r.horaFin||"")+'</div>'+
        '<div style="font-size:12px;color:#4b5563">'+(r.nombre||"")+(r.tel?' &middot; '+r.tel:'')+'</div>'+
        '<div style="font-size:11px;color:var(--suave)">'+(CONFIG_RES.labelTipo[r.tipo]||r.tipo||"")+(r.monto>0?' &middot; $'+Number(r.monto).toLocaleString("es-CL"):' &middot; Gratis')+'</div></div>'+
        '<span style="font-size:10px;font-weight:700;color:'+(ec[r.estado]||"#6b7280")+'">'+(el_[r.estado]||r.estado)+'</span></div>';
      if(r.estado!=="cancelada"){
        html+='<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">';
        if(pasada&&r.asistio===null){
          html+='<button class="mini" style="background:#dcfce7;color:#16a34a" onclick="marcarAsistencia(\''+doc.id+'\',\''+r.userId+'\',\''+r.nombre+'\',\''+r.fecha+'\',true)">✓ Asistió</button>';
          html+='<button class="mini" style="background:#fee2e2;color:#dc2626" onclick="marcarAsistencia(\''+doc.id+'\',\''+r.userId+'\',\''+r.nombre+'\',\''+r.fecha+'\',false)">✗ No asistió</button>';
        }else if(r.asistio===true){html+='<span style="font-size:11px;color:#16a34a">✓ Asistió</span>';}
        else if(r.asistio===false){html+='<span style="font-size:11px;color:#dc2626">✗ No asistió</span>';}
        html+='<button class="mini" style="color:#dc2626" onclick="adminCancelarReserva(\''+doc.id+'\')">Cancelar</button>';
        html+='</div>';
      }
      html+='</div>';
    });
    if(fechaAct)html+='</div>';
    cont.innerHTML=html||'<p class="hint">Sin reservas</p>';
  }catch(e){cont.innerHTML='<p class="hint">Error: '+e.message+'</p>';console.warn(e);}
}

async function marcarAsistencia(reservaId,userId,nombre,fecha,asistio){
  try{
    await db.collection("reservas").doc(reservaId).update({asistio:asistio});
    if(!asistio&&userId&&userId!=="anonimo"){
      var san=await registrarFalta(userId,nombre,reservaId,fecha);
      var msg="Falta registrada ("+san.faltas+" total)";
      if(san.estado==="advertencia")msg+=" — advertencia enviada";
      else if(san.bloqIndef)msg+=" — bloqueado indefinidamente";
      else if(san.bloqHasta)msg+=" — bloqueado hasta "+new Date(san.bloqHasta).toLocaleDateString("es-CL");
      toast(msg);
    }else{toast(asistio?"Asistencia confirmada":"Inasistencia registrada");}
    renderAdminReservas();
  }catch(e){toast("Error: "+e.message);}
}

async function adminCancelarReserva(id){
  if(!confirm("¿Cancelar esta reserva?"))return;
  try{await db.collection("reservas").doc(id).update({estado:"cancelada"});toast("Reserva cancelada");renderAdminReservas();}
  catch(e){toast("Error: "+e.message);}
}

async function renderAdminSanciones(){
  var cont=el("admin-sanciones-cont");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var snap=await db.collection("sanciones").get();
    if(snap.empty){cont.innerHTML='<p class="hint">Sin sanciones registradas</p>';return;}
    var html="";var count=0;
    snap.forEach(function(doc){
      var s=doc.data();
      if(!s.faltas||s.estado==="ok")return;
      count++;
      var color=s.bloqIndef||s.estado==="bloqueado"?"#dc2626":"#d97706";
      var estado=s.bloqIndef?"Bloqueado indefinidamente":s.bloqHasta?"Bloqueado hasta "+new Date(s.bloqHasta.toDate?s.bloqHasta.toDate():s.bloqHasta).toLocaleDateString("es-CL"):"Advertencia";
      html+='<div class="reserva-card" style="border-left:3px solid '+color+'">'+
        '<div style="display:flex;justify-content:space-between"><div style="font-weight:700">'+(s.nombre||doc.id)+'</div>'+
        '<span style="font-size:11px;color:'+color+';font-weight:700">'+s.faltas+' falta(s)</span></div>'+
        '<div style="font-size:12px;color:'+color+'">'+estado+'</div>'+
        '<div style="font-size:11px;color:var(--suave);margin-top:2px">'+(s.historial||[]).slice(-2).map(function(h){return h.fecha;}).join(", ")+'</div>'+
        '<button class="mini" style="margin-top:8px;background:#dcfce7;color:#16a34a" onclick="levantarSancion(\''+doc.id+'\').then(function(){renderAdminSanciones();})">Levantar sanción</button>'+
        '</div>';
    });
    cont.innerHTML=count?html:'<p class="hint">Sin sanciones activas</p>';
  }catch(e){cont.innerHTML='<p class="hint">Error: '+e.message+'</p>';}
}

var _configCache=null;
/* ─── AGENDA CLASES INDIVIDUALES ──────────────────────────────── */
var HORARIOS_PERMITIDOS={0:{min:"14:00",max:"20:00"},1:{min:"08:00",max:"16:00"},2:{min:"08:00",max:"16:00"},3:{min:"08:00",max:"16:00"},4:{min:"08:00",max:"16:00"},5:{min:"08:00",max:"14:00"},6:{min:"14:00",max:"20:00"}};
var DIAS_ES=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
async function cargarSlotsIndividuales(){
  var cont=el("slots-list");if(!cont)return;
  try{
    var snap=await db.collection("slots_individuales").get();
    var docs=[];
    snap.forEach(function(doc){var d=doc.data();if(d.estado==="disponible")docs.push({id:doc.id,data:d});});
    docs.sort(function(a,b){return a.data.fecha===b.data.fecha?a.data.hora.localeCompare(b.data.hora):a.data.fecha.localeCompare(b.data.fecha);});
    if(!docs.length){cont.innerHTML='<div style="text-align:center;padding:24px"><div style="font-size:36px;margin-bottom:8px">📅</div><div style="font-size:14px;color:var(--suave)">No hay horarios disponibles.<br>Consulta a Marcelo.</div></div>';return;}
    var h='<div style="font-size:12px;color:var(--suave);margin-bottom:12px">Elige un horario disponible:</div>';
    docs.forEach(function(doc){
      var s=doc.data;
      var fechaFmt=s.fecha?new Date(s.fecha+"T12:00").toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"}):"";
      h+='<div style="background:#f0fdf4;border-radius:12px;padding:14px;margin-bottom:8px;border-left:4px solid var(--verde)">'+
        '<div style="display:flex;align-items:center;justify-content:space-between">'+
          '<div>'+
            '<div style="font-weight:800;font-size:14px;color:#1a2e1a;text-transform:capitalize">'+fechaFmt+'</div>'+
            '<div style="font-size:13px;color:var(--verde-osc);font-weight:700;margin-top:2px">🕐 '+s.hora+'</div>'+
            (s.nota?'<div style="font-size:11px;color:var(--suave);margin-top:2px">'+s.nota+'</div>':'')+
          '</div>'+
          '<button class="btn" style="padding:9px 14px;font-size:13px" onclick="reservarSlot(\''+doc.id+'\',\''+fechaFmt+'\',\''+s.hora+'\')">Reservar</button>'+
        '</div>'+
      '</div>';
    });
    cont.innerHTML=h;
  }catch(e){cont.innerHTML='<p style="color:var(--suave);text-align:center">Error cargando horarios</p>';}
}

async function reservarSlot(id,fecha,hora){
  var perfil=getPerfil();
  var nombre=perfil?perfil.nombre:"";
  var tel=perfil?perfil.tel:"";
  var cont=el("slots-list");if(!cont)return;
  var objetivos=['Servicio','Derecho','Revés','Volea','Smash','Resto','Juego de red','Táctica general','Otro'];
  var objOpts=objetivos.map(function(o){return'<option>'+o+'</option>';}).join('');
  cont.innerHTML=
    '<div style="font-size:14px;font-weight:700;margin-bottom:12px">Confirmar reserva</div>'+
    '<div style="background:#f0fdf4;border-radius:10px;padding:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">'+
      '<div><div style="font-weight:700;text-transform:capitalize">'+fecha+'</div>'+
      '<div style="color:var(--verde-osc);font-weight:700">🕐 '+hora+'</div></div>'+
      '<div style="text-align:right"><div style="font-size:11px;color:var(--suave)">Valor clase</div><div style="font-size:20px;font-weight:900;color:var(--verde-osc)">$30.000</div></div>'+
    '</div>'+
    '<div class="field"><label>Tu nombre</label><input id="slot-nombre" value="'+nombre+'" placeholder="Ej: Juan Pérez"></div>'+
    '<div class="field"><label>Teléfono</label><input id="slot-tel" value="'+tel+'" placeholder="+56 9 xxxx xxxx" type="tel"></div>'+
    '<div class="field"><label>🎯 Objetivo de la clase</label><select id="slot-objetivo">'+objOpts+'</select></div>'+
    '<div class="field"><label>Detalle adicional (opcional)</label><input id="slot-detalle" placeholder="Ej: quiero mejorar mi segundo servicio"></div>'+
    '<button class="btn" onclick="confirmarReservaSlot(\''+id+'\',\''+fecha+'\',\''+hora+'\')">✓ Confirmar reserva · $30.000</button>'+
    '<button class="btn sec" style="margin-top:8px" onclick="cargarSlotsIndividuales()">← Volver</button>';
}

async function confirmarReservaSlot(id,fecha,hora){
  if(_submitting["slot_"+id])return;
  var nombre=((el("slot-nombre")||{}).value||"").trim();
  var tel=((el("slot-tel")||{}).value||"").trim();
  var objetivo=(el("slot-objetivo")||{}).value||"";
  var detalle=((el("slot-detalle")||{}).value||"").trim();
  if(!nombre){toast("Ingresa tu nombre");return;}
  if(!tel){toast("Ingresa tu teléfono de contacto");return;}
  _submitting["slot_"+id]=true;
  try{
    await db.collection("slots_individuales").doc(id).update({
      estado:"reservado",nombre_reserva:nombre,tel_reserva:tel,
      objetivo:objetivo,detalle:detalle,monto:30000,
      ts_reserva:firebase.firestore.FieldValue.serverTimestamp()
    });
    var cont=el("slots-list");
    if(cont)cont.innerHTML=
      '<div style="text-align:center;padding:24px">'+
        '<div style="font-size:48px;margin-bottom:10px">✅</div>'+
        '<div style="font-weight:800;font-size:16px;margin-bottom:6px">¡Reserva confirmada!</div>'+
        '<div style="font-size:13px;color:var(--suave);text-transform:capitalize">'+fecha+'</div>'+
        '<div style="font-size:15px;font-weight:700;color:var(--verde-osc);margin-top:4px">🕐 '+hora+'</div>'+
        '<div style="font-size:12px;color:var(--suave);margin-top:12px">Marcelo se pondrá en contacto contigo.</div>'+
      '</div>';
    toast("Clase reservada ✓");
    notificarMarcelo("📅 Nueva reserva clase individual\nAlumno: "+nombre+"\nFecha: "+fecha+" "+hora+"\nObjetivo: "+objetivo+(detalle?"\nDetalle: "+detalle:"")+"\nTel: "+tel);
  }catch(e){toast("Error al reservar: "+e.message);}
  finally{delete _submitting["slot_"+id];}
}

/* ─── ADMIN: GESTIONAR SLOTS ──────────────────────────────────── */
async function renderAdminSlots(){
  var cont=el("admin-slots-cont");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var snap=await db.collection("slots_individuales").orderBy("fecha").orderBy("hora").limit(50).get();
    var h='<div style="background:#f0fdf4;border-radius:12px;padding:12px;margin-bottom:14px;font-size:12px">'+
      '<div style="font-weight:800;color:var(--verde-osc);margin-bottom:6px">⏰ Horarios permitidos clases individuales</div>'+
      '<div style="color:#444;line-height:1.8">'+
        'Lun – Jue: 08:00 a 16:00<br>'+
        'Viernes: 08:00 a 14:00<br>'+
        'Sáb – Dom: 14:00 a 20:00'+
      '</div></div>'+
      '<div class="field"><label>Fecha</label><input id="ns-fecha" type="date"></div>'+
      '<div class="field"><label>Hora</label><input id="ns-hora" placeholder="Ej: 10:00"></div>'+
      '<div class="field"><label>Nota (opcional)</label><input id="ns-nota" placeholder="Ej: Cancha 1"></div>'+
      '<button class="btn" onclick="crearSlot()" style="margin-bottom:16px">+ Agregar horario</button>'+
      '<div class="section-title" style="margin-top:0">Horarios creados</div>';
    if(snap.empty){h+='<p class="hint">Sin horarios creados</p>';}
    snap.forEach(function(doc){
      var s=doc.data();
      var fechaFmt=s.fecha?new Date(s.fecha+"T12:00").toLocaleDateString("es-CL",{weekday:"short",day:"numeric",month:"short"}):"";
      var estadoColor=s.estado==="reservado"?"#dc2626":"var(--verde-osc)";
      var estadoLabel=s.estado==="reservado"?"Reservado · "+s.nombre_reserva+(s.objetivo?" · "+s.objetivo:""):"Disponible";
      h+='<div class="lcard"><div style="flex:1"><div class="nm" style="text-transform:capitalize">'+fechaFmt+' &middot; '+s.hora+'</div><div class="ds" style="color:'+estadoColor+'">'+estadoLabel+'</div></div>'+
        (s.estado==="reservado"?'<button class="mini" onclick="liberarSlot(\''+doc.id+'\')">Liberar</button>':'')+
        '<button class="mini" style="color:#dc2626" onclick="eliminarSlot(\''+doc.id+'\')">×</button></div>';
    });
    cont.innerHTML=h;
    var fi=el("ns-fecha");if(fi&&!fi.value)fi.value=new Date().toISOString().split("T")[0];
  }catch(e){cont.innerHTML='<p class="hint">Error: '+e.message+'</p>';}
}
async function crearSlot(){
  var fecha=((el("ns-fecha")||{}).value||"").trim();
  var hora=((el("ns-hora")||{}).value||"").trim();
  var nota=((el("ns-nota")||{}).value||"").trim();
  if(!fecha||!hora){toast("Ingresa fecha y hora");return;}
  // Validar rango según día
  var d=new Date(fecha+"T12:00");var dow=d.getDay();
  var rango=HORARIOS_PERMITIDOS[dow];
  if(hora<rango.min||hora>=rango.max){
    toast("⚠️ "+DIAS_ES[dow]+": solo "+rango.min+" a "+rango.max);return;
  }
  try{
    await db.collection("slots_individuales").add({fecha,hora,nota,estado:"disponible",ts:firebase.firestore.FieldValue.serverTimestamp()});
    toast("Horario agregado ✓");["ns-hora","ns-nota"].forEach(function(id){var e=el(id);if(e)e.value="";});
    renderAdminSlots();
  }catch(e){toast("Error: "+e.message);}
}
async function liberarSlot(id){
  try{await db.collection("slots_individuales").doc(id).update({estado:"disponible",nombre_reserva:"",tel_reserva:""});toast("Horario liberado");renderAdminSlots();}catch(e){toast("Error");}
}
async function eliminarSlot(id){
  if(!confirm("¿Eliminar este horario?"))return;
  try{await db.collection("slots_individuales").doc(id).delete();toast("Horario eliminado");renderAdminSlots();}catch(e){toast("Error");}
}
function getSocioTier(){return localStorage.getItem("atmas_socio_tier")||null;}
async function validarCodigoSocio(){
  var cod=((el("inp-cod-socio")||{}).value||"").trim().toUpperCase();
  if(!cod){toast("Ingresa un código");return;}
  var cfg={};
  try{var snap=await db.collection("config_app").doc("precios").get();if(snap.exists)cfg=snap.data();}catch(e){}
  var codAntiguo=(cfg.cod_antiguo||"ATMAS80").toUpperCase();
  var codNuevo=(cfg.cod_nuevo||"ATMAS100").toUpperCase();
  // Buscar también en códigos personalizados de Firestore
  var codigos=[];
  try{var csnap=await db.collection("codigos_socio").get();csnap.forEach(function(doc){codigos.push(doc.data());});}catch(e){}
  var codPersonalizado=codigos.find(function(c){return(c.codigo||"").toUpperCase()===cod;});
  if(codPersonalizado){
    var precio=codPersonalizado.precio||100000;
    localStorage.setItem("atmas_socio_tier","custom");
    localStorage.setItem("atmas_socio_precio",precio);
    localStorage.setItem("atmas_socio_label",codPersonalizado.label||"Socio Mensualidad");
    toast("✓ Código válido · Mensualidad $"+Number(precio).toLocaleString("es-CL"));
    guardarSocioEnFirestore("custom");
    renderSociosBloques();
  }else
  if(cod===codAntiguo){
    localStorage.setItem("atmas_socio_tier","antiguo");
    toast("✓ Código válido — Socio Antiguo desbloqueado");
    guardarSocioEnFirestore("antiguo");
    renderSociosBloques();
  }else if(cod===codNuevo){
    localStorage.setItem("atmas_socio_tier","nuevo");
    toast("✓ Código válido — Socio Nuevo desbloqueado");
    guardarSocioEnFirestore("nuevo");
    renderSociosBloques();
  }else{
    toast("Código incorrecto");
  }
}
async function guardarSocioEnFirestore(tier){
  try{
    var p=getPerfil();if(!p||!p.nombre)return;
    var docId=slugify(p.nombre);
    await db.collection("ranking_atmas").doc(docId).set({socio:true,socioTier:tier},{merge:true});
    p.socio=true;savePerfil(p);
    renderRanking();
  }catch(e){console.warn("guardarSocioEnFirestore error:",e);}
}
function renderSociosBloques(){
  var cont=el("socios-bloques");if(!cont)return;
  var tier=getSocioTier();
  var h='';
  if(tier==="antiguo"||tier==="nuevo"||tier==="custom"){
    var precioNum=tier==="custom"?parseInt(localStorage.getItem("atmas_socio_precio")||"100000"):tier==="antiguo"?80000:100000;
    var precio="$"+Number(precioNum).toLocaleString("es-CL");
    var label=tier==="custom"?(localStorage.getItem("atmas_socio_label")||"Socio Mensualidad"):tier==="antiguo"?"Socio Antiguo":"Socio Nuevo";
    h+='<div style="background:linear-gradient(135deg,#0f3d08,#2f6b1a);border-radius:16px;padding:16px;margin-bottom:10px;color:#fff">'+
      '<div style="font-size:10px;font-weight:800;color:var(--lima);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">✓ Desbloqueado</div>'+
      '<div style="font-size:15px;font-weight:900;margin-bottom:10px">'+label+'</div>'+
      '<div style="font-size:11px;color:rgba(255,255,255,.75);margin-bottom:4px">Inscripción</div>'+
      '<div style="font-size:18px;font-weight:900;color:var(--lima);margin-bottom:8px">$30.000</div>'+
      '<div style="font-size:11px;color:rgba(255,255,255,.75);margin-bottom:4px">Mensualidad</div>'+
      '<div style="font-size:18px;font-weight:900;color:var(--lima);margin-bottom:12px">'+precio+'</div>'+
      '<button class="btn" style="background:var(--lima);color:#1a2e1a;font-size:12px;padding:8px" onclick="openModal(\'socio\')">Inscribirse</button>'+
      '</div>';
  }
  h+='<div style="background:linear-gradient(135deg,#7a3010,#b04a18);border-radius:16px;padding:16px;margin-bottom:10px;color:#fff">'+
    '<div style="font-size:10px;font-weight:800;color:#ffd700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Por cancha</div>'+
    '<div style="font-size:15px;font-weight:900;margin-bottom:10px">Socio Pago Cancha</div>'+
    '<div style="font-size:11px;color:rgba(255,255,255,.75);margin-bottom:4px">Inscripción</div>'+
    '<div style="font-size:18px;font-weight:900;color:#ffd700;margin-bottom:8px">$35.000</div>'+
    '<div style="font-size:11px;color:rgba(255,255,255,.75);margin-bottom:4px">Por cancha/hr</div>'+
    '<div style="font-size:18px;font-weight:900;color:#ffd700;margin-bottom:12px">$15.000</div>'+
    '<button class="btn" style="background:#ffd700;color:#5c2e00;font-size:12px;padding:8px" onclick="openModal(\'socio\')">Inscribirse</button>'+
    '</div>';
  if(!tier){
    h+='<div style="background:#fff;border-radius:14px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.07)">'+
      '<div style="font-size:13px;font-weight:700;margin-bottom:6px">🔑 ¿Tienes un código de socio?</div>'+
      '<div style="font-size:12px;color:var(--suave);margin-bottom:10px">Marcelo te entrega un código para acceder a la mensualidad.</div>'+
      '<div style="display:flex;gap:8px">'+
      '<input id="inp-cod-socio" placeholder="Ingresa tu código" style="flex:1;border:1.5px solid var(--gris);border-radius:10px;padding:10px;font-size:14px">'+
      '<button class="btn" style="padding:10px 14px;font-size:13px" onclick="validarCodigoSocio()">OK</button>'+
      '</div></div>';
  }else{
    h+='<div style="text-align:center;margin-top:4px"><button style="border:none;background:none;color:var(--suave);font-size:11px;text-decoration:underline;cursor:pointer" onclick="localStorage.removeItem(\'atmas_socio_tier\');renderSociosBloques()">Cerrar sesión de socio</button></div>';
  }
  cont.innerHTML=h;
}
async function cargarCodigosLista(){
  var cont=el("codigos-lista");if(!cont)return;
  try{
    var snap=await db.collection("codigos_socio").orderBy("ts","desc").get();
    if(snap.empty){cont.innerHTML='<p class="hint">Sin códigos creados</p>';return;}
    var h="";
    snap.forEach(function(doc){
      var c=doc.data();
      h+='<div class="lcard"><div style="flex:1"><div class="nm">'+c.codigo+'</div><div class="ds">'+(c.label||"Socio")+" · $"+Number(c.precio||0).toLocaleString("es-CL")+'</div></div><button class="mini" style="color:#dc2626" onclick="eliminarCodigoSocio(\''+doc.id+'\')">× Eliminar</button></div>';
    });
    cont.innerHTML=h;
  }catch(e){cont.innerHTML='<p class="hint">Error cargando</p>';}
}
async function crearCodigoSocio(){
  var codigo=((el("nc-codigo")||{}).value||"").trim().toUpperCase();
  var precio=parseInt((el("nc-precio")||{}).value||"0");
  var label=((el("nc-label")||{}).value||"").trim()||"Socio Mensualidad";
  if(!codigo||!precio){toast("Completa código y precio");return;}
  try{
    await db.collection("codigos_socio").add({codigo,precio,label,ts:firebase.firestore.FieldValue.serverTimestamp()});
    toast("Código creado: "+codigo);
    ["nc-codigo","nc-precio","nc-label"].forEach(function(id){var e=el(id);if(e)e.value="";});
    cargarCodigosLista();
  }catch(e){toast("Error: "+e.message);}
}
async function eliminarCodigoSocio(id){
  if(!confirm("¿Eliminar este código?"))return;
  try{await db.collection("codigos_socio").doc(id).delete();toast("Código eliminado");cargarCodigosLista();}catch(e){toast("Error");}
}
async function renderAdminConfig(){
  var cont=el("admin-config-cont");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando...</p>';
  // Leer config desde Firestore o usar valores por defecto
  var cfg={};
  try{var snap=await db.collection("config_app").doc("precios").get();if(snap.exists)cfg=snap.data();}catch(e){}
  _configCache=cfg;
  var c1h=cfg.cancha1h||15000,c2h=cfg.cancha2h||25000;
  var ac1=cfg.academia_iniciacion||60000,ac2=cfg.academia_intermedio||70000,ac3=cfg.academia_avanzado||80000,ac4=cfg.academia_individual_4c||120000,ac5=cfg.academia_individual_8c||200000;
  var wp=cfg.wp||"56956343558";
  // Cuenta bancaria
  var bnombre=cfg.banco_nombre||PAGO.nombre,brut=cfg.banco_rut||PAGO.rut,bbanco=cfg.banco_banco||PAGO.banco,btipo=cfg.banco_tipo||PAGO.tipo,bcuenta=cfg.banco_cuenta||PAGO.cuenta,bemail=cfg.banco_email||PAGO.email;
  function fi(id,lbl,val,type){return '<div class="field"><label>'+lbl+'</label><input id="cfg-'+id+'" type="'+(type||"text")+'" value="'+val+'"></div>';}
  var h='<div class="admin-section"><div class="section-title">Precios de canchas</div>'+
    fi("c1h","1 hora (todos excepto socio mensual)",c1h,"number")+
    fi("c2h","2 horas",c2h,"number")+
    '</div>'+
    '<div class="admin-section"><div class="section-title">Precios clases academia</div>'+
    fi("ac1","Iniciación (3-7 años) /mes",ac1,"number")+
    fi("ac2","Intermedios /mes",ac2,"number")+
    fi("ac3","Avanzados /mes",ac3,"number")+
    fi("ac4","Individuales · 4 clases",ac4,"number")+
    fi("ac5","Individuales · 8 clases",ac5,"number")+
    '</div>'+
    '<div class="admin-section"><div class="section-title">Datos de cuenta transferencia</div>'+
    fi("bnombre","Nombre titular",bnombre)+
    fi("brut","RUT",brut)+
    fi("bbanco","Banco",bbanco)+
    fi("btipo","Tipo de cuenta",btipo)+
    fi("bcuenta","Número de cuenta",bcuenta)+
    fi("bemail","Email",bemail)+
    fi("wp","WhatsApp (sin +)",wp)+
    '</div>'+
    '<div class="admin-section"><div class="section-title">🔑 Códigos de Socio Mensualidad</div>'+
    '<p style="font-size:12px;color:var(--suave);margin-bottom:12px">Crea un código por jugador con el precio que defines tú. Entrégaselo por WhatsApp.</p>'+
    '<div style="display:flex;gap:6px;margin-bottom:8px"><input id="nc-codigo" placeholder="Código (ej: JUAN2026)" style="flex:2;border:1.5px solid var(--gris);border-radius:10px;padding:9px;font-size:13px"><input id="nc-precio" type="number" placeholder="Precio $" style="flex:1;border:1.5px solid var(--gris);border-radius:10px;padding:9px;font-size:13px"></div>'+
    '<div style="display:flex;gap:6px;margin-bottom:12px"><input id="nc-label" placeholder="Nombre (ej: Socio Juan)" style="flex:1;border:1.5px solid var(--gris);border-radius:10px;padding:9px;font-size:13px"><button class="btn" style="padding:9px 14px;font-size:13px" onclick="crearCodigoSocio()">+ Crear</button></div>'+
    '<div id="codigos-lista"><p class="hint">Cargando...</p></div>'+
    '</div>'+
    '<button class="btn" onclick="guardarAdminConfig()">Guardar cambios</button>'+
    '<div class="admin-section" style="margin-top:16px;border:1.5px solid #fca5a5;border-radius:14px;padding:14px">'+
      '<div class="section-title" style="color:#dc2626;margin-top:0">⚠️ Zona peligrosa</div>'+
      '<button class="btn sec" style="border-color:#dc2626;color:#dc2626;margin-top:4px" onclick="limpiarPartidosPrueba()">🗑️ Eliminar partidos de prueba (Jorge Luis Borges)</button>'+
    '</div>';
  cont.innerHTML=h;
}

async function autoLimpiarPruebas(){
  try{
    var flag=await db.collection("config_app").doc("cleanup_pruebas_jul2026_v2").get();
    if(flag.exists)return;
    var snap=await db.collection("partidos_atmas").get();
    var batch=db.batch();var n=0;
    snap.forEach(function(doc){
      var d=doc.data();
      if(d.jugador1==="Jorge Luis Borges"||d.jugador2==="Jorge Luis Borges"||d.ganador==="Jorge Luis Borges"||d.perdedor==="Jorge Luis Borges"){
        batch.delete(doc.ref);n++;
      }
    });
    if(n>0)await batch.commit();
    await db.collection("config_app").doc("cleanup_pruebas_jul2026_v2").set({done:true,borrados:n});
    if(n>0)cargarFeedActividad();
  }catch(e){console.warn("autoLimpiarPruebas:",e);}
}

async function limpiarPartidosPrueba(){
  if(!confirm("¿Eliminar TODOS los partidos de prueba de Jorge Luis Borges?\n\nEsta acción no se puede deshacer."))return;
  try{
    var snap=await db.collection("partidos_atmas").get();
    var batch=db.batch();var n=0;
    snap.forEach(function(doc){
      var d=doc.data();
      if(d.jugador1==="Jorge Luis Borges"||d.jugador2==="Jorge Luis Borges"||d.ganador==="Jorge Luis Borges"||d.perdedor==="Jorge Luis Borges"){
        batch.delete(doc.ref);n++;
      }
    });
    if(n===0){toast("No se encontraron partidos de prueba");return;}
    await batch.commit();
    toast("✓ "+n+" partido(s) de prueba eliminados");
    cargarPlanillaResultados();
  }catch(e){toast("Error al eliminar: "+e.message);}
}

async function guardarAdminConfig(){
  function gv(id){var e=el("cfg-"+id);return e?e.value.trim():"";}
  var data={
    cancha1h:parseInt(gv("c1h"))||15000,cancha2h:parseInt(gv("c2h"))||25000,
    academia_iniciacion:parseInt(gv("ac1"))||60000,academia_intermedio:parseInt(gv("ac2"))||70000,
    academia_avanzado:parseInt(gv("ac3"))||80000,academia_individual_4c:parseInt(gv("ac4"))||120000,academia_individual_8c:parseInt(gv("ac5"))||200000,
    banco_nombre:gv("bnombre"),banco_rut:gv("brut"),banco_banco:gv("bbanco"),banco_tipo:gv("btipo"),banco_cuenta:gv("bcuenta"),banco_email:gv("bemail"),wp:gv("wp"),
    cod_antiguo:"ATMAS80",cod_nuevo:"ATMAS100"
  };
  try{
    await db.collection("config_app").doc("precios").set(data,{merge:true});
    // Actualizar CONFIG_RES en memoria
    CONFIG_RES.tarifa1h.socio_partido=data.cancha1h;CONFIG_RES.tarifa1h.invitado=data.cancha1h;CONFIG_RES.tarifa1h.arriendo=data.cancha1h;CONFIG_RES.tarifa1h.academia_individual=data.cancha1h;CONFIG_RES.tarifa1h.academia_grupal=data.cancha1h;
    CONFIG_RES.tarifa2h.socio_partido=data.cancha2h;CONFIG_RES.tarifa2h.invitado=data.cancha2h;CONFIG_RES.tarifa2h.arriendo=data.cancha2h;CONFIG_RES.tarifa2h.academia_individual=data.cancha2h;CONFIG_RES.tarifa2h.academia_grupal=data.cancha2h;
    // Actualizar PAGO en memoria
    PAGO.nombre=data.banco_nombre;PAGO.rut=data.banco_rut;PAGO.banco=data.banco_banco;PAGO.tipo=data.banco_tipo;PAGO.cuenta=data.banco_cuenta;PAGO.email=data.banco_email;
    toast("Configuración guardada ✓");
  }catch(e){toast("Error: "+e.message);}
}

/* ─── FEED ACTIVIDAD RECIENTE ─────────────────────────────────── */
async function cargarFeedActividad(){
  var cont=el("feed-actividad");if(!cont)return;
  try{
    var snap=await db.collection("partidos_atmas").where("estado","==","aprobado").limit(30).get();
    if(snap.empty){cont.innerHTML='<p class="hint">Sin partidos aprobados aún</p>';return;}
    var docs=[];snap.forEach(function(d){docs.push(d.data());});
    docs.sort(function(a,b){var ta=a.ts&&a.ts.seconds?a.ts.seconds:0;var tb=b.ts&&b.ts.seconds?b.ts.seconds:0;return tb-ta;});
    docs=docs.slice(0,8);
    var h="";
    docs.forEach(function(r){
      var col=avatarColor(r.ganador||"?");var ini=initials(r.ganador||"?");
      var fecha=r.ts?new Date(r.ts.toDate()).toLocaleDateString("es-CL",{day:"numeric",month:"short"}):"";
      var ctx=r.contexto?'<span style="background:var(--verde-claro);color:var(--verde-osc);border-radius:8px;padding:1px 6px;font-size:10px;font-weight:700;margin-left:4px">'+r.contexto+'</span>':"";
      h+='<div class="feed-card">'+
        '<div class="fc-avatar" style="background:'+col+'">'+ini+'</div>'+
        '<div class="fc-body">'+
          '<div class="fc-name">'+r.ganador+' <span style="font-size:11px;font-weight:400;color:var(--suave)">ganó a</span> '+(r.perdedor||"?")+'</div>'+
          '<div style="display:flex;align-items:center;gap:4px;margin-top:2px">'+
            '<span class="fc-sets">'+(r.sets||"")+'</span>'+ctx+
          '</div>'+
          '<div class="fc-sub">'+fecha+'</div>'+
        '</div>'+
        '<div style="font-size:20px">🎾</div>'+
      '</div>';
    });
    cont.innerHTML=h;
  }catch(e){cont.innerHTML='<p class="hint">Sin actividad reciente</p>';}
}

/* ─── HEAD TO HEAD ────────────────────────────────────────────── */
function initH2H(){
  var j1=el("h2h-j1");var j2=el("h2h-j2");if(!j1||!j2)return;
  if(j1.options.length>1)return;
  var opts=rankingData.map(function(p){return'<option>'+p[0]+'</option>';}).join("");
  j1.innerHTML=opts;j2.innerHTML=opts;
  if(rankingData.length>1)j2.selectedIndex=1;
}

async function buscarH2H(){
  var j1=(el("h2h-j1")||{}).value;var j2=(el("h2h-j2")||{}).value;
  if(!j1||!j2||j1===j2){toast("Elige dos jugadores distintos");return;}
  var cont=el("h2h-result");if(!cont)return;
  cont.innerHTML='<p class="hint">Buscando...</p>';
  try{
    var [s1,s2]=await Promise.all([
      db.collection("partidos_atmas").where("ganador","==",j1).where("perdedor","==",j2).get(),
      db.collection("partidos_atmas").where("ganador","==",j2).where("perdedor","==",j1).get()
    ]);
    var gJ1=s1.size,gJ2=s2.size,total=gJ1+gJ2;
    var ini1=initials(j1),ini2=initials(j2),col1=avatarColor(j1),col2=avatarColor(j2);
    var pct1=total?Math.round(gJ1/total*100):50;
    var h='<div class="match-card">'+
      '<div class="mc-title">⚔️ Head to Head · '+total+' partido'+(total!==1?'s':'')+'</div>'+
      '<div class="mc-players">'+
        '<div style="text-align:center">'+
          '<div style="width:48px;height:48px;border-radius:50%;background:'+col1+';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff;margin:0 auto 6px">'+ini1+'</div>'+
          '<div style="font-size:12px;font-weight:700;max-width:80px;line-height:1.2">'+j1+'</div>'+
        '</div>'+
        '<div style="text-align:center">'+
          '<div class="mc-score">'+gJ1+' – '+gJ2+'</div>'+
          '<div class="mc-detail">victorias</div>'+
        '</div>'+
        '<div style="text-align:center">'+
          '<div style="width:48px;height:48px;border-radius:50%;background:'+col2+';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff;margin:0 auto 6px">'+ini2+'</div>'+
          '<div style="font-size:12px;font-weight:700;max-width:80px;line-height:1.2">'+j2+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="background:rgba(255,255,255,.15);border-radius:20px;height:8px;margin-bottom:6px;overflow:hidden">'+
        '<div style="background:var(--lima);height:100%;width:'+pct1+'%;border-radius:20px;transition:width .5s"></div>'+
      '</div>'+
      '<div class="mc-detail">'+pct1+'% dominio '+j1.split(' ')[0]+'</div>'+
    '</div>';
    // Últimos partidos
    var todos=[];
    s1.forEach(function(d){todos.push(Object.assign({},d.data(),{_gan:j1}));});
    s2.forEach(function(d){todos.push(Object.assign({},d.data(),{_gan:j2}));});
    todos.sort(function(a,b){return(b.ts&&b.ts.seconds||0)-(a.ts&&a.ts.seconds||0);});
    if(todos.length){
      h+='<div class="section-title">Últimos partidos</div>';
      todos.slice(0,6).forEach(function(r){
        var fecha=r.ts?new Date(r.ts.toDate()).toLocaleDateString("es-CL",{day:"numeric",month:"short",year:"2-digit"}):"";
        var gano=r._gan===j1?j1:j2;
        h+='<div class="res-card" style="border-color:'+(gano===j1?"var(--verde)":"#f59e0b")+'">'+
          '<div class="rc-top"><span class="rc-name">'+gano+' ganó</span><span class="rc-date">'+fecha+'</span></div>'+
          (r.contexto?'<div style="font-size:10px;color:var(--suave)">'+r.contexto+'</div>':'')+
          '<div class="rc-sub">'+(r.sets||"sin sets")+'</div>'+
        '</div>';
      });
    }
    if(total===0)h+='<p class="hint" style="text-align:center">Aún no se han enfrentado 🎾</p>';
    cont.innerHTML=h;
  }catch(e){cont.innerHTML='<p class="hint">Error: '+e.message+'</p>';}
}

/* ─── TARJETA VISUAL DE PARTIDO ───────────────────────────────── */
function mostrarTarjetaPartido(ganador,perdedor,sets,contexto){
  var col=avatarColor(ganador);
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  var fecha=new Date().toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"});
  sc.innerHTML=
    '<div class="match-card" id="match-share-card">'+
      '<div class="mc-title">🎾 ATMAS · Resultado</div>'+
      '<div style="font-size:11px;color:rgba(255,255,255,.6);margin-bottom:12px">'+fecha+(contexto?' · '+contexto:'')+'</div>'+
      '<div class="mc-players">'+
        '<div style="text-align:center">'+
          '<div style="width:52px;height:52px;border-radius:50%;background:'+col+';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#fff;margin:0 auto 6px;border:3px solid var(--lima)">'+initials(ganador)+'</div>'+
          '<div style="font-size:12px;font-weight:800;color:var(--lima);max-width:80px;line-height:1.2">'+ganador+'</div>'+
          '<div style="font-size:10px;color:rgba(255,255,255,.6);margin-top:2px">GANADOR</div>'+
        '</div>'+
        '<div style="text-align:center;padding:0 8px">'+
          '<div style="font-size:32px;font-weight:900;color:#fff">'+sets+'</div>'+
          '<div style="font-size:10px;color:rgba(255,255,255,.5)">vs</div>'+
        '</div>'+
        '<div style="text-align:center">'+
          '<div style="width:52px;height:52px;border-radius:50%;background:'+avatarColor(perdedor)+';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#fff;margin:0 auto 6px;opacity:.7">'+initials(perdedor)+'</div>'+
          '<div style="font-size:12px;font-weight:800;color:rgba(255,255,255,.7);max-width:80px;line-height:1.2">'+perdedor+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:8px">@ATMAS_TENIS · Club Las Avestruces</div>'+
    '</div>'+
    '<button class="btn wa" onclick="compartirResultadoWA(\''+ganador+'\',\''+perdedor+'\',\''+sets+'\')">📲 Compartir por WhatsApp</button>'+
    '<button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cerrar</button>';
  mo.classList.add("show");
}

function compartirResultadoWA(gan,per,sets){
  var msg="🎾 *ATMAS Tenis*\n✅ *"+gan+"* ganó a *"+per+"*\n📊 Sets: "+sets+"\n🏆 Escalerilla ATMAS · Club Las Avestruces";
  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
}

// Al iniciar, cargar config desde Firestore si existe
(function cargarConfigInicial(){
  db.collection("config_app").doc("precios").get().then(function(snap){
    if(!snap.exists)return;
    var d=snap.data();
    if(d.cancha1h){CONFIG_RES.tarifa1h.socio_partido=CONFIG_RES.tarifa1h.invitado=CONFIG_RES.tarifa1h.arriendo=CONFIG_RES.tarifa1h.academia_individual=CONFIG_RES.tarifa1h.academia_grupal=d.cancha1h;}
    if(d.cancha2h){CONFIG_RES.tarifa2h.socio_partido=CONFIG_RES.tarifa2h.invitado=CONFIG_RES.tarifa2h.arriendo=CONFIG_RES.tarifa2h.academia_individual=CONFIG_RES.tarifa2h.academia_grupal=d.cancha2h;}
    if(d.banco_nombre)PAGO.nombre=d.banco_nombre;if(d.banco_rut)PAGO.rut=d.banco_rut;
    if(d.banco_banco)PAGO.banco=d.banco_banco;if(d.banco_tipo)PAGO.tipo=d.banco_tipo;
    if(d.banco_cuenta)PAGO.cuenta=d.banco_cuenta;if(d.banco_email)PAGO.email=d.banco_email;
  }).catch(function(){});
})();

function adminSalir(){adminUnlocked=false;go('inicio');}

(function(){
  try{resetearRankingFirestore().then(function(){iniciarRankingLive();generarYRenderCuadros();});}catch(e){}
  try{seedCuadroNovicios3().then(function(){iniciarCuadroLive();});}catch(e){}
  try{iniciarZonaNorteLive();}catch(e){}
  try{autoLimpiarPruebas();}catch(e){}
  if(auth){
    // Manejar resultado del redirect de Google antes de signInAnonymously
    auth.getRedirectResult().then(function(result){
      localStorage.removeItem("_gRedirect");
      if(result&&result.user){
        return;
      }
      // Solo iniciar anónimo si no hay redirect pendiente
      auth.signInAnonymously().catch(function(e){
        console.warn("signInAnonymously error:",e);
        var p=getPerfil();
        if(p){mostrarApp();renderPerfil();}
        else{mostrarLogin();showAuthStep1();}
      });
    }).catch(function(e){
      console.warn("getRedirectResult error:",e);
      auth.signInAnonymously().catch(function(){});
    });
  }else{
    var p=getPerfil();
    if(p){mostrarApp();renderPerfil();}
    else{mostrarLogin();showAuthStep1();}
  }
})();

/* ─── ADMIN: TIPOS DE USUARIO ───────────────────────────────── */
async function renderAdminTipos(){
  var cont=el("admin-tipos-cont");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando jugadores...</p>';
  try{
    // Merge jugadores (perfiles con login) + ranking_atmas (todos los jugadores)
    var snapJ=await db.collection("jugadores").limit(200).get();
    var snapR=await db.collection("ranking_atmas").limit(200).get();
    var tipos={socio_mensual:"Socio mensualidad",socio_partido:"Socio paga partido",invitado:"Invitado",arriendo:"Arriendo",academia:"Academia"};
    // Build map by nombre (normalized)
    var jugMap={};
    snapJ.forEach(function(doc){var p=doc.data();if(p.nombre)jugMap[doc.id]={...p,_col:"jugadores",_id:doc.id};});
    // Add ranking players not already in jugadores (match by nombre)
    var jugNombres={};snapJ.forEach(function(doc){var p=doc.data();if(p.nombre)jugNombres[p.nombre.toLowerCase()]=true;});
    snapR.forEach(function(doc){var p=doc.data();if(p.nombre&&!jugNombres[p.nombre.toLowerCase()])jugMap["rank_"+doc.id]={nombre:p.nombre,rut:"",tipo:p.tipo||null,_col:"ranking_atmas",_id:doc.id};});
    var entries=Object.values(jugMap).sort(function(a,b){return a.nombre.localeCompare(b.nombre);});
    if(!entries.length){cont.innerHTML='<p class="hint">No hay jugadores</p>';return;}
    var html='<div style="font-size:11px;color:var(--suave);margin-bottom:8px">'+entries.length+' jugadores</div>';
    entries.forEach(function(p){
      var docId=p._id;var tipoActual=p.tipo||"";
      var selId="tipo-sel-"+docId.replace(/[^a-zA-Z0-9]/g,"_");
      var col=avatarColor(p.nombre);var ini=initials(p.nombre);
      var tipoLabel=tipoActual?(tipos[tipoActual]||tipoActual):"Sin asignar";
      var socioBadge=p.socio?'<span style="background:#15803d;color:#fff;border-radius:8px;padding:1px 7px;font-size:9px;font-weight:800;margin-left:6px">SOCIO ✓</span>':"";
      var jugadorRank=rankingData.find(function(r){return r[0].toLowerCase()===(p.nombre||"").toLowerCase();});
      html+='<div class="lcard" style="flex-direction:column;gap:0;padding:12px 14px;cursor:pointer" onclick="verPerfilAdmin(\''+docId.replace(/'/g,"\\'")+'\',\''+p._col+'\')" >'+
        '<div style="display:flex;align-items:center;gap:10px">'+
          '<div class="avatar" style="background:'+col+';width:36px;height:36px;font-size:13px;flex-shrink:0">'+ini+'</div>'+
          '<div style="flex:1">'+
            '<div style="font-weight:800;font-size:13px">'+p.nombre+socioBadge+'</div>'+
            '<div style="font-size:11px;color:var(--suave)">'+tipoLabel+(jugadorRank?' &middot; '+jugadorRank[1]+' pts':'')+'</div>'+
          '</div>'+
          '<span style="font-size:18px;color:var(--gris)">›</span>'+
        '</div>'+
        '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'+
          '<select id="'+selId+'" style="flex:1;padding:7px;border-radius:8px;border:1px solid #e5e7eb;font-size:12px" onclick="event.stopPropagation()">'+
          '<option value="">-- Sin asignar --</option>';
      Object.keys(tipos).forEach(function(k){
        html+='<option value="'+k+'"'+(tipoActual===k?' selected':'')+'>'+tipos[k]+'</option>';
      });
      html+='</select>'+
          '<button class="mini" style="background:var(--verde-claro);color:var(--verde-osc);flex-shrink:0" onclick="event.stopPropagation();guardarTipoUsuario(\''+p._col+'\',\''+docId+'\',\''+selId+'\')">OK</button>'+
        '</div>'+
        '</div>';
    });
    cont.innerHTML=html;
  }catch(e){cont.innerHTML='<p class="hint">Error: '+e.message+'</p>';}
}

async function verPerfilAdmin(docId,col){
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  sc.innerHTML='<p class="hint">Cargando perfil...</p>';mo.classList.add("show");
  try{
    var snap=await db.collection(col).doc(docId).get();
    var p=snap.exists?snap.data():{nombre:docId};
    var jugadorRank=rankingData.find(function(r){return r[0].toLowerCase()===(p.nombre||"").toLowerCase();});
    var col2=avatarColor(p.nombre||"");var ini=initials(p.nombre||"");
    var tipos={socio_mensual:"Socio mensualidad",socio_partido:"Pago por partido",invitado:"Invitado",arriendo:"Arriendo",academia:"Academia"};
    var tipoLabel=p.tipo?(tipos[p.tipo]||p.tipo):"Sin asignar";
    var tipoColor=p.tipo==="socio_mensual"?"#15803d":p.tipo==="socio_partido"?"#1565c0":"#6b7280";
    var socioBadge=p.socio?'<span style="background:#15803d;color:#fff;border-radius:8px;padding:2px 8px;font-size:10px;font-weight:800">SOCIO ✓</span>':"";
    var fnacFmt=p.fnac?p.fnac.split("-").reverse().join("/"):"—";
    var edad="";
    if(p.fnac){var hoy=new Date();var fn=new Date(p.fnac);edad=" · "+(hoy.getFullYear()-fn.getFullYear())+" años";}
    var row=function(label,val){return val?'<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f3f4f6"><div style="font-size:12px;color:var(--suave)">'+label+'</div><div style="font-size:13px;font-weight:600;color:var(--texto)">'+val+'</div></div>':"";}
    var statsH="";
    if(jugadorRank){
      statsH='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0">'+
        ['<div style="text-align:center;background:var(--verde-claro);border-radius:10px;padding:8px"><div style="font-size:18px;font-weight:900;color:var(--verde-mid)">'+jugadorRank[1]+'</div><div style="font-size:9px;color:var(--suave)">PTS</div></div>',
         '<div style="text-align:center;background:#f0fdf4;border-radius:10px;padding:8px"><div style="font-size:18px;font-weight:900;color:#15803d">'+jugadorRank[3]+'</div><div style="font-size:9px;color:var(--suave)">WINS</div></div>',
         '<div style="text-align:center;background:#fef2f2;border-radius:10px;padding:8px"><div style="font-size:18px;font-weight:900;color:#dc2626">'+jugadorRank[4]+'</div><div style="font-size:9px;color:var(--suave)">LOST</div></div>',
         '<div style="text-align:center;background:#f8fafc;border-radius:10px;padding:8px"><div style="font-size:18px;font-weight:900;color:#1e3a5f">'+jugadorRank[5]+'%</div><div style="font-size:9px;color:var(--suave)">PCT</div></div>'].join("")+
      '</div>';
    }
    sc.innerHTML=
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'+
        '<div class="avatar" style="background:'+col2+';width:52px;height:52px;font-size:18px;flex-shrink:0">'+ini+'</div>'+
        '<div><div style="font-weight:900;font-size:17px">'+p.nombre+'</div>'+
          '<div style="display:flex;gap:6px;align-items:center;margin-top:4px">'+
            '<span style="background:'+tipoColor+';color:#fff;border-radius:8px;padding:2px 8px;font-size:10px;font-weight:700">'+tipoLabel+'</span>'+
            socioBadge+
          '</div>'+
        '</div>'+
      '</div>'+
      statsH+
      '<div style="background:#f9fafb;border-radius:12px;padding:0 12px">'+
        row("RUT",p.rut||"—")+
        row("Teléfono",p.tel?'<a href="tel:'+p.tel+'" style="color:var(--verde-mid)">'+p.tel+'</a>':"—")+
        row("Email",p.email||"—")+
        row("Nacimiento",fnacFmt+edad)+
        row("Estilo",p.estilo||"—")+
        row("Golpe",p.golpe||"—")+
        row("Superficie",p.superficie||"—")+
      '</div>'+
      '<button class="btn sec" style="margin-top:14px" onclick="closeModal()">Cerrar</button>';
  }catch(e){sc.innerHTML='<p class="hint">Error: '+e.message+'</p>';}
}
async function guardarTipoUsuario(col,docId,selId){
  var sel=el(selId);if(!sel)return;
  var tipo=sel.value;if(!tipo){toast("Elige un tipo");return;}
  try{
    await db.collection(col).doc(docId).update({tipo:tipo});
    toast("Tipo guardado: "+(CONFIG_RES.labelTipo[tipo]||tipo));
  }catch(e){
    // Si no existe el doc en jugadores, crearlo
    if(e.code==="not-found"||e.message.includes("No document")){
      await db.collection(col).doc(docId).set({tipo:tipo},{merge:true});
      toast("Tipo asignado: "+(CONFIG_RES.labelTipo[tipo]||tipo));
    }else{toast("Error: "+e.message);}
  }
}

async function resetearRanking(){
  if(!confirm("⚠️ ¿Resetear TODOS los puntos a cero? Esto no se puede deshacer."))return;
  if(!confirm("Confirma nuevamente: se borrarán todos los puntos, partidos ganados y perdidos."))return;
  try{
    toast("Reseteando...");
    var snap=await db.collection("ranking_atmas").get();
    var batch=db.batch();
    snap.forEach(function(doc){
      batch.update(doc.ref,{pts:0,jugados:0,ganados:0,perdidos:0,pct:0});
    });
    await batch.commit();
    // Marcar todos los partidos como archivados
    var snapP=await db.collection("partidos_atmas").get();
    var batch2=db.batch();
    snapP.forEach(function(doc){batch2.update(doc.ref,{estado:"archivado"});});
    await batch2.commit();
    toast("✓ Ranking reseteado a cero");
    iniciarRankingLive();
  }catch(e){toast("Error: "+e.message);}
}

async function cargarPlanillaResultados(){
  var cont=el("admin-planilla-cont");if(!cont)return;
  cont.innerHTML='<p class="hint">Cargando...</p>';
  try{
    var snap=await db.collection("partidos_atmas").orderBy("ts","desc").limit(150).get();
    if(snap.empty){cont.innerHTML='<p class="hint">Sin partidos registrados aún</p>';return;}
    var filas="";var n=0;
    snap.forEach(function(doc){
      n++;var r=doc.data();
      var fechaFmt=r.fecha?r.fecha.split("-").reverse().join("/"):"-";
      var bgRow=n%2===0?"#f9fafb":"#fff";
      var estadoColor=r.estado==="aprobado"?"#15803d":r.estado==="archivado"?"#9ca3af":r.estado==="pendiente_admin"?"#b45309":"#6b7280";
      var estadoLabel=r.estado==="aprobado"?"✓":r.estado==="archivado"?"arc":r.estado==="pendiente_admin"?"⏳":"?";
      filas+='<div style="display:grid;grid-template-columns:20px 1fr auto auto;gap:6px;align-items:center;padding:8px 10px;background:'+bgRow+';border-radius:8px;margin-bottom:3px">'+
        '<div style="font-size:10px;color:var(--suave)">'+n+'</div>'+
        '<div><div style="font-size:12px;font-weight:700">'+r.ganador+'</div><div style="font-size:10px;color:var(--suave)">vs '+r.perdedor+' · '+(r.sets||"—")+' · '+fechaFmt+'</div></div>'+
        '<span style="font-size:10px;font-weight:700;color:'+estadoColor+'">'+estadoLabel+'</span>'+
        '<button onclick="eliminarPartido(\''+doc.id+'\')" style="background:none;border:none;color:#dc2626;font-size:16px;cursor:pointer;padding:2px 4px">&times;</button>'+
        '</div>';
    });
    cont.innerHTML='<div style="font-size:11px;color:var(--suave);margin-bottom:8px">'+n+' partidos totales</div>'+filas;
  }catch(e){if(cont)cont.innerHTML='<p class="hint">Error al cargar</p>';}
}
async function eliminarPartido(docId){
  if(!confirm("⚠️ ¿Eliminar este partido?\n\nLos puntos NO se revierten automáticamente. Esta acción no se puede deshacer."))return;
  if(_submitting["del_"+docId])return;
  _submitting["del_"+docId]=true;
  try{
    await db.collection("partidos_atmas").doc(docId).delete();
    toast("Partido eliminado");
    cargarPlanillaResultados();
  }catch(e){toast("Error al eliminar: "+e.message);}
  finally{delete _submitting["del_"+docId];}
}

/* ─── CATÁLOGO DE PROGRAMAS FORMATIVOS ───────────────────────── */
var PROGRAMAS_ACADEMIA=[
  {
    id:"escuela_ninos",
    nombre:"Escuela Niños",
    emoji:"👦",
    color:"#f59e0b",
    duracion:"3 meses",
    edadTarget:"5 - 12 años",
    horariosEjemplo:"Sáb 09:30-11:00 · Mié 16:00-17:30",
    objetivos:["Desarrollar coordinación motriz y psicomotricidad","Aprender los golpes básicos con pelota roja y naranja","Fomentar el amor por el tenis y el deporte en equipo","Crear hábitos de esfuerzo, disciplina y fair play"],
    resultadosEsperados:["Ejecuta rally de derecha con consistencia de 5+ pelotas","Controla el bote de pelota roja/naranja con ambas manos","Conoce las reglas básicas y el puntaje del tenis","Se desplaza lateral y frontalmente de forma coordinada"],
    planSemanal:[
      {dia:"Lunes",actividad:"Coordinación y calentamiento lúdico"},
      {dia:"Miércoles",actividad:"Fundamentos de derecha y revés (pelota roja)"},
      {dia:"Viernes",actividad:"Juegos de puntería y mini-partidos"},
      {dia:"Sábado",actividad:"Rally libre, saque y juego competitivo adaptado"}
    ],
    rubricas:["Saque","Derecha","Revés","Volea","Desplazamiento","Táctica","Mentalidad"]
  },
  {
    id:"adultos_iniciacion",
    nombre:"Adultos Iniciación",
    emoji:"🎾",
    color:"#3b82f6",
    duracion:"3 meses",
    edadTarget:"Adultos principiantes",
    horariosEjemplo:"Lun 19:00-20:30 · Jue 19:00-20:30",
    objetivos:["Aprender los fundamentos técnicos del tenis desde cero","Desarrollar consistencia en rally de fondo de cancha","Comprender el sistema de puntaje y las reglas del juego","Ganar confianza para jugar partidos amistosos"],
    resultadosEsperados:["Mantiene rally cruzado de derecha de 8+ pelotas","Sirve con movimiento técnico básico correctamente","Comprende y aplica el puntaje durante el juego","Juega partidos completos con reglas reales"],
    planSemanal:[
      {dia:"Lunes",actividad:"Calentamiento y trabajo técnico de derecha"},
      {dia:"Martes",actividad:"Revés y movimiento lateral"},
      {dia:"Jueves",actividad:"Saque y devolución"},
      {dia:"Sábado",actividad:"Juego libre supervisado y correcciones"}
    ],
    rubricas:["Saque","Derecha","Revés","Volea","Desplazamiento","Táctica","Mentalidad"]
  },
  {
    id:"perfeccionamiento",
    nombre:"Perfeccionamiento",
    emoji:"⬆️",
    color:"#8b5cf6",
    duracion:"3 meses",
    edadTarget:"Nivel intermedio",
    horariosEjemplo:"Mar 18:30-20:00 · Jue 18:30-20:00 · Sáb 08:00-09:30",
    objetivos:["Incorporar patrones tácticos de juego ofensivo y defensivo","Mejorar la técnica del saque con mayor velocidad y variedad","Desarrollar consistencia bajo presión de puntos reales","Construir puntos con criterio desde la línea de base"],
    resultadosEsperados:["Ejecuta punto ganador con approach y volea en 60%+ de los intentos","Sirve primero con 60%+ de efectividad","Construye puntos con variación de ritmo y dirección","Mantiene concentración táctica durante sets completos"],
    planSemanal:[
      {dia:"Martes",actividad:"Patrones tácticos de fondo: cruzado y línea"},
      {dia:"Jueves",actividad:"Saque + approach + volea (punto construido)"},
      {dia:"Viernes",actividad:"Juego de presión: tie-breaks y situaciones de partido"},
      {dia:"Sábado",actividad:"Partido supervisado con análisis y corrección"}
    ],
    rubricas:["Saque","Derecha","Revés","Volea","Desplazamiento","Táctica","Mentalidad"]
  },
  {
    id:"competencia",
    nombre:"Competencia",
    emoji:"🏆",
    color:"#ef4444",
    duracion:"3 meses",
    edadTarget:"Nivel avanzado",
    horariosEjemplo:"Lun 18:30-20:00 · Mié 18:30-20:00 · Sáb 08:00-10:00",
    objetivos:["Preparar al jugador para torneos y competencia real","Desarrollar mentalidad competitiva y gestión de la presión","Perfeccionar golpes específicos y situaciones de match play","Analizar el juego propio y del rival para adaptar táctica"],
    resultadosEsperados:["Compite en torneos internos con autonomía táctica","Gestiona situaciones de presión (break point, tie-break) con calma","Ejecuta plan de juego adaptado al rival","Muestra liderazgo emocional en momentos clave del partido"],
    planSemanal:[
      {dia:"Lunes",actividad:"Entrenamiento físico-técnico de alta intensidad"},
      {dia:"Miércoles",actividad:"Match play: situaciones específicas de partido"},
      {dia:"Viernes",actividad:"Video análisis y preparación táctica"},
      {dia:"Sábado",actividad:"Torneo interno o sparring supervisado"}
    ],
    rubricas:["Saque","Derecha","Revés","Volea","Desplazamiento","Táctica","Mentalidad"]
  }
];

var RUBRICA_LABELS={1:"Iniciando",2:"En proceso",3:"Logrado",4:"Destacado"};
var RUBRICA_COLORS={1:"#9ca3af",2:"#f59e0b",3:"#84cc16",4:"#16a34a"};

function renderProgramasAcademia(){
  var cont=el("programas-list");if(!cont)return;
  try{
    var h="";
    PROGRAMAS_ACADEMIA.forEach(function(prog){
      h+='<div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.07);border-left:4px solid '+prog.color+'">'+
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">'+
          '<div>'+
            '<div style="font-size:15px;font-weight:800;color:#1f2937">'+prog.emoji+' '+prog.nombre+'</div>'+
            '<div style="font-size:11px;color:#6b7280;margin-top:2px">'+prog.edadTarget+'</div>'+
          '</div>'+
          '<span style="background:'+prog.color+'22;color:'+prog.color+';border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0">'+prog.duracion+'</span>'+
        '</div>'+
        '<ul style="margin:0 0 10px 16px;padding:0;list-style:disc">'+
          prog.objetivos.slice(0,3).map(function(o){return'<li style="font-size:12px;color:#4b5563;margin-bottom:3px">'+o+'</li>';}).join('')+
        '</ul>'+
        '<button class="mini" onclick="verDetallePrograma(\''+prog.id+'\')" style="background:'+prog.color+';color:#fff;border:none;font-size:11px;padding:6px 14px;border-radius:20px;cursor:pointer;font-weight:700">Ver detalle &rarr;</button>'+
      '</div>';
    });
    cont.innerHTML=h||'<p class="hint">Sin programas</p>';
  }catch(e){console.warn("renderProgramasAcademia error:",e);}
}

function verDetallePrograma(id){
  var prog=PROGRAMAS_ACADEMIA.find(function(p){return p.id===id;});
  if(!prog)return;
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  function showTab(t){
    ["programa","plan","rubricas"].forEach(function(k){
      var d=el("ptab-cont-"+k);if(d)d.style.display=k===t?"":"none";
      var b=el("ptab-btn-"+k);if(b){b.style.background=k===t?prog.color:"#f3f4f6";b.style.color=k===t?"#fff":"#374151";}
    });
  }
  window._showProgTab=showTab;
  var html=
    '<div style="background:linear-gradient(135deg,'+prog.color+','+prog.color+'cc);border-radius:16px;padding:18px;margin-bottom:16px;color:#fff">'+
      '<div style="font-size:32px;margin-bottom:6px">'+prog.emoji+'</div>'+
      '<div style="font-size:20px;font-weight:900;line-height:1.1">'+prog.nombre+'</div>'+
      '<div style="font-size:12px;opacity:.85;margin-top:4px">'+prog.edadTarget+' · '+prog.duracion+'</div>'+
      '<div style="font-size:11px;opacity:.75;margin-top:4px">'+prog.horariosEjemplo+'</div>'+
    '</div>'+
    // Tabs
    '<div style="display:flex;gap:6px;margin-bottom:14px">'+
      '<button id="ptab-btn-programa" onclick="window._showProgTab(\'programa\')" style="flex:1;border:none;border-radius:20px;padding:8px 4px;font-size:11px;font-weight:700;cursor:pointer;background:'+prog.color+';color:#fff">📋 Programa</button>'+
      '<button id="ptab-btn-plan" onclick="window._showProgTab(\'plan\')" style="flex:1;border:none;border-radius:20px;padding:8px 4px;font-size:11px;font-weight:700;cursor:pointer;background:#f3f4f6;color:#374151">📅 Plan semanal</button>'+
      '<button id="ptab-btn-rubricas" onclick="window._showProgTab(\'rubricas\')" style="flex:1;border:none;border-radius:20px;padding:8px 4px;font-size:11px;font-weight:700;cursor:pointer;background:#f3f4f6;color:#374151">🎯 Rúbricas</button>'+
    '</div>'+
    // Tab: Programa
    '<div id="ptab-cont-programa">'+
      '<div style="font-size:12px;font-weight:800;color:#374151;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Objetivos</div>'+
      prog.objetivos.map(function(o){return'<div style="display:flex;gap:8px;margin-bottom:6px"><span style="color:'+prog.color+';font-size:14px;flex-shrink:0">✓</span><span style="font-size:13px;color:#374151">'+o+'</span></div>';}).join('')+
      '<div style="font-size:12px;font-weight:800;color:#374151;margin:14px 0 8px;text-transform:uppercase;letter-spacing:.5px">Resultados esperados</div>'+
      prog.resultadosEsperados.map(function(r){return'<div style="display:flex;gap:8px;margin-bottom:6px"><span style="font-size:14px;flex-shrink:0">⭐</span><span style="font-size:13px;color:#374151">'+r+'</span></div>';}).join('')+
    '</div>'+
    // Tab: Plan semanal
    '<div id="ptab-cont-plan" style="display:none">'+
      '<div style="font-size:12px;font-weight:800;color:#374151;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">Plan semanal</div>'+
      prog.planSemanal.map(function(d){return'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f9fafb;border-radius:10px;margin-bottom:6px"><div style="background:'+prog.color+';color:#fff;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:800;white-space:nowrap;flex-shrink:0">'+d.dia+'</div><div style="font-size:13px;color:#374151">'+d.actividad+'</div></div>';}).join('')+
    '</div>'+
    // Tab: Rúbricas
    '<div id="ptab-cont-rubricas" style="display:none">'+
      '<div style="font-size:12px;font-weight:800;color:#374151;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">Dimensiones de evaluación</div>'+
      '<div style="background:#f0fdf4;border-radius:12px;padding:12px;margin-bottom:12px">'+
        '<div style="font-size:12px;color:#374151;line-height:1.7">'+
          Object.keys(RUBRICA_LABELS).map(function(k){return'<div style="display:flex;align-items:center;gap:8px;padding:3px 0"><span style="background:'+RUBRICA_COLORS[k]+';color:#fff;border-radius:20px;padding:1px 8px;font-size:11px;font-weight:700">'+k+'</span><span style="font-size:12px;color:#374151">'+RUBRICA_LABELS[k]+'</span></div>';}).join('')+
        '</div>'+
      '</div>'+
      prog.rubricas.map(function(r){return'<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f3f4f6"><span style="font-size:13px;font-weight:700;color:#1f2937">'+r+'</span><div style="display:flex;gap:4px">'+[1,2,3,4].map(function(n){return'<span style="background:'+RUBRICA_COLORS[n]+';color:#fff;border-radius:20px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">'+n+'</span>';}).join('')+'</div></div>';}).join('')+
    '</div>'+
    '<button class="btn sec" style="margin-top:16px" onclick="closeModal()">Cerrar</button>';
  sc.innerHTML=html;
  mo.classList.add("show");
}

/* ─── ADMIN: EVALUAR ALUMNOS ─────────────────────────────────── */
function renderAdminEvaluar(){
  var cont=el("admin-evaluar-cont");if(!cont)return;
  var alumnos=rankingData.slice().sort(function(a,b){return a[0].localeCompare(b[0]);});
  var h='<div class="field" style="margin-bottom:10px"><input id="eval-search" placeholder="Buscar alumno..." oninput="filtrarAlumnos()" style="width:100%;border:1.5px solid var(--gris);border-radius:10px;padding:9px 12px;font-size:13px;box-sizing:border-box"></div>';
  h+='<div id="eval-alumnos-list">';
  alumnos.forEach(function(p){
    var col=avatarColor(p[0]);var ini=initials(p[0]);
    h+='<div class="lcard" style="cursor:pointer" onclick="abrirEvaluacionAlumno(\''+p[0].replace(/'/g,"\\'")+'\')">'+
      '<div class="avatar" style="background:'+col+';width:36px;height:36px;font-size:13px;flex-shrink:0">'+ini+'</div>'+
      '<div style="flex:1"><div class="nm">'+p[0]+'</div><div class="ds">'+p[1]+' pts</div></div>'+
      '<span style="font-size:18px;color:var(--gris)">&#8250;</span>'+
    '</div>';
  });
  h+='</div>';
  cont.innerHTML=h;
}

function filtrarAlumnos(){
  var q=(el("eval-search")||{}).value||"";q=q.toLowerCase().trim();
  var list=el("eval-alumnos-list");if(!list)return;
  var items=list.querySelectorAll(".lcard");
  items.forEach(function(item){
    var nombre=(item.querySelector(".nm")||{}).textContent||"";
    item.style.display=nombre.toLowerCase().includes(q)||!q?"":"none";
  });
}

function abrirEvaluacionAlumno(nombre){
  var sc=el("sheet-content");var mo=el("modal");if(!sc||!mo)return;
  var progOpts=PROGRAMAS_ACADEMIA.map(function(p){return'<option value="'+p.id+'">'+p.emoji+' '+p.nombre+'</option>';}).join("");
  var rubricas=PROGRAMAS_ACADEMIA[0].rubricas;
  var rubricasHtml=rubricas.map(function(r,ri){
    return'<div style="margin-bottom:12px">'+
      '<div style="font-size:13px;font-weight:700;color:#1f2937;margin-bottom:6px">'+r+'</div>'+
      '<div style="display:flex;gap:6px">'+
        [1,2,3,4].map(function(n){
          return'<button id="eval-rb-'+ri+'-'+n+'" onclick="seleccionarRubrica('+ri+','+n+')" style="flex:1;height:30px;border-radius:20px;border:1.5px solid '+RUBRICA_COLORS[n]+';background:#fff;color:'+RUBRICA_COLORS[n]+';font-size:11px;font-weight:700;cursor:pointer">'+n+'</button>';
        }).join('')+
      '</div>'+
    '</div>';
  }).join("");
  window._evalAlumno={nombre:nombre,rubricas:{},programaId:PROGRAMAS_ACADEMIA[0].id,totalRub:rubricas.length};
  var html=
    '<div style="font-size:17px;font-weight:900;margin-bottom:4px">Evaluar alumno</div>'+
    '<div style="font-size:13px;color:var(--suave);margin-bottom:14px">'+nombre+'</div>'+
    '<div class="field"><label>Programa</label><select id="eval-programa" onchange="window._evalAlumno.programaId=this.value" style="width:100%;border:1.5px solid var(--gris);border-radius:10px;padding:9px;font-size:13px">'+progOpts+'</select></div>'+
    '<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#374151;margin-bottom:10px">Rúbricas (1-4)</div>'+
    rubricasHtml+
    '<div class="field"><label>Observaciones del entrenador</label><textarea id="eval-obs" rows="3" style="width:100%;border:1.5px solid var(--gris);border-radius:10px;padding:9px;font-size:13px;box-sizing:border-box;resize:vertical" placeholder="Fortalezas, áreas de mejora, recomendaciones..."></textarea></div>'+
    '<button class="btn" onclick="guardarEvaluacion(\''+nombre.replace(/'/g,"\\'")+'\')">Guardar evaluación</button>'+
    '<button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';
  sc.innerHTML=html;
  mo.classList.add("show");
}

function seleccionarRubrica(ri,valor){
  var rubricas=PROGRAMAS_ACADEMIA[0].rubricas;
  var rubNombre=rubricas[ri];
  if(!window._evalAlumno)return;
  window._evalAlumno.rubricas[rubNombre]=valor;
  // Actualizar estilos botones de esta fila
  [1,2,3,4].forEach(function(n){
    var btn=el("eval-rb-"+ri+"-"+n);
    if(!btn)return;
    if(n===valor){
      btn.style.background=RUBRICA_COLORS[n];
      btn.style.color="#fff";
    }else{
      btn.style.background="#fff";
      btn.style.color=RUBRICA_COLORS[n];
    }
  });
}

async function guardarEvaluacion(nombre){
  if(!window._evalAlumno){toast("Error: sin datos");return;}
  var rubricas=PROGRAMAS_ACADEMIA[0].rubricas;
  // Verificar que todas las rúbricas tienen valor
  var rubricasEval=window._evalAlumno.rubricas;
  for(var i=0;i<rubricas.length;i++){
    if(!rubricasEval[rubricas[i]]){toast("Evalúa todas las rúbricas ("+rubricas[i]+")");return;}
  }
  var programaId=(el("eval-programa")||{}).value||window._evalAlumno.programaId;
  var observaciones=((el("eval-obs")||{}).value||"").trim();
  var today=new Date().toISOString().split("T")[0];
  try{
    await db.collection("progreso_alumnos").doc(slugify(nombre)).set({
      nombre:nombre,
      programa:programaId,
      fecha:today,
      rubricas:rubricasEval,
      observaciones:observaciones,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();
    toast("Evaluación guardada para "+nombre);
  }catch(e){console.warn("guardarEvaluacion error:",e);toast("Error al guardar: "+e.message);}
}

/* ─── PORTAFOLIO DE PROGRESO DEL ALUMNO ─────────────────────── */
async function cargarPortafolioAlumno(nombre){
  var sec=el("mi-portafolio-section");var cont=el("mi-portafolio-cont");if(!sec||!cont)return;
  try{
    var snap=await db.collection("progreso_alumnos").doc(slugify(nombre)).get();
    if(!snap.exists){sec.style.display="none";return;}
    var data=snap.data();
    var prog=PROGRAMAS_ACADEMIA.find(function(p){return p.id===data.programa;})||{nombre:"Programa",emoji:"🎾"};
    var fechaFmt=data.fecha?data.fecha.split("-").reverse().join("/"):"";
    var rubricas=PROGRAMAS_ACADEMIA[0].rubricas;
    var rubricasData=data.rubricas||{};
    // Calcular promedio
    var total=0;var count=0;
    rubricas.forEach(function(r){if(rubricasData[r]){total+=rubricasData[r];count++;}});
    var prom=count>0?(total/count):0;
    var motivacion=prom>=3.5?"¡Desempeño destacado! Sigue así.":prom>=2.5?"Buen progreso, cerca del objetivo.":prom>=1.5?"En camino, cada entrenamiento cuenta.":"Inicio del camino. ¡El esfuerzo da frutos!";
    var h=
      '<div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.07)">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'+
          '<div>'+
            '<div style="font-size:14px;font-weight:800">'+prog.emoji+' '+prog.nombre+'</div>'+
            '<div style="font-size:11px;color:var(--suave);margin-top:2px">Última evaluación: '+fechaFmt+'</div>'+
          '</div>'+
          '<div style="text-align:center;background:var(--verde-claro);border-radius:12px;padding:8px 12px">'+
            '<div style="font-size:20px;font-weight:900;color:var(--verde-osc)">'+prom.toFixed(1)+'</div>'+
            '<div style="font-size:9px;color:var(--suave)">PROM</div>'+
          '</div>'+
        '</div>'+
        // Barras de progreso por rúbrica
        rubricas.map(function(r){
          var val=rubricasData[r]||0;
          var pct=(val/4)*100;
          var col=val===4?"#16a34a":val===3?"#84cc16":val===2?"#f59e0b":"#9ca3af";
          var lbl=RUBRICA_LABELS[val]||"—";
          return'<div style="margin-bottom:10px">'+
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">'+
              '<span style="font-size:12px;font-weight:700;color:#374151">'+r+'</span>'+
              '<span style="font-size:11px;font-weight:600;color:'+col+'">'+lbl+'</span>'+
            '</div>'+
            '<div style="height:8px;border-radius:4px;background:#f3f4f6">'+
              '<div style="height:8px;border-radius:4px;background:'+col+';width:'+pct+'%;transition:width .3s"></div>'+
            '</div>'+
          '</div>';
        }).join('')+
      '</div>'+
      // Observaciones
      (data.observaciones?
        '<div style="background:#f0fdf4;border-radius:12px;padding:12px;margin-bottom:10px">'+
          '<div style="font-size:11px;font-weight:800;color:var(--verde-osc);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Observaciones del entrenador</div>'+
          '<div style="font-size:13px;color:#374151;line-height:1.6">'+data.observaciones+'</div>'+
        '</div>'
      :"")+
      // Mensaje motivacional
      '<div style="background:var(--negro);border-radius:12px;padding:12px;text-align:center">'+
        '<div style="font-size:13px;font-weight:700;color:var(--lima)">'+motivacion+'</div>'+
      '</div>';
    cont.innerHTML=h;
    sec.style.display="";
  }catch(e){console.warn("cargarPortafolioAlumno error:",e);sec.style.display="none";}
}
