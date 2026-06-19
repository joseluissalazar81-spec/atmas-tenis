function toast(m){var t=document.getElementById("toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show");},3000);}
function go(s){document.querySelectorAll(".screen").forEach(function(e){e.classList.remove("active");});var sc=document.getElementById(s);if(sc)sc.classList.add("active");document.querySelectorAll(".tab").forEach(function(t){t.classList.toggle("active",t.dataset.s===s);});var ct=document.querySelector(".content");if(ct)ct.scrollTop=0;if(s==="perfil")renderPerfil();if(s==="admin")renderAdmin();if(s==="cancha")renderCalendario();if(s==="mis-reservas")renderMisReservas();}
function closeModal(){var m=document.getElementById("modal");if(m)m.classList.remove("show");}
function setVista(v){var r=document.getElementById("vista-rank");var c=document.getElementById("vista-cuadro");if(r)r.style.display=v==="rank"?"block":"none";if(c)c.style.display=v==="cuadro"?"block":"none";var vr=document.getElementById("vRank");var vc=document.getElementById("vCuadro");if(vr)vr.classList.toggle("on",v==="rank");if(vc)vc.classList.toggle("on",v==="cuadro");}

/* ─── FIREBASE ────────────────────────────────────────────────── */
const _noop={get:function(){return Promise.resolve({exists:false,forEach:function(){},data:function(){return{};}});},add:function(){return Promise.resolve({id:"local"});},set:function(){return Promise.resolve();},update:function(){return Promise.resolve();},delete:function(){return Promise.resolve();},where:function(){return _noop;},orderBy:function(){return _noop;},doc:function(){return _noop;},limit:function(){return _noop;},onSnapshot:function(cb){cb({forEach:function(){}});return function(){};},runTransaction:function(fn){return fn(_noop);}};
const _noopDb={collection:function(){return _noop;},runTransaction:function(fn){return fn(_noop);}};
var db=_noopDb;
try{
  firebase.initializeApp({apiKey:"AIzaSyC5WSNETjUxYfUpMr6nkOk8jjDqrD44Snw",authDomain:"atmas-tenis.firebaseapp.com",projectId:"atmas-tenis",storageBucket:"atmas-tenis.firebasestorage.app",messagingSenderId:"545823553419",appId:"1:545823553419:web:7131283910ded048c9a18e"});
  db=firebase.firestore();
}catch(e){console.warn("Firebase no disponible:",e);}

/* ─── CONSTANTES ──────────────────────────────────────────────── */
const PAGO={nombre:"Marcelo Andres Escalona Galvez",rut:"12.637.853-K",banco:"Mercado Pago",tipo:"Cuenta Vista",cuenta:"1057752328",email:"locampinotenisclub@hotmail.com"};
const avatarColors=["#e74c3c","#e67e22","#f39c12","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00bcd4","#4caf50","#ff5722","#607d8b"];
function initials(n){if(!n)return"?";return n.split(" ").slice(0,2).map(function(x){return x[0];}).join("").toUpperCase();}
function avatarColor(n){if(!n)return avatarColors[0];var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%avatarColors.length;return avatarColors[h];}
function slugify(n){if(!n)return"";return n.toLowerCase().replace(/[^a-z0-9]/g,"_");}
function el(id){return document.getElementById(id);}

/* ─── DATOS INICIALES (solo para semilla) ─────────────────────── */
var SEED_PLAYERS=[
  ["Rodrigo Bernal",66,14,13,1,92.86],["Mauricio Morales",64,16,12,4,75],
  ["Felipe Muñoz",60,13,11,2,84.62],["Jonathan Muñoz",59,16,11,5,68.75],
  ["Matías Córdova",58,14,11,3,78.57],["Juan Pablo Vera",54,14,10,4,71.43],
  ["Juan Carlos Abarca",52,14,10,4,71.43],["Mauricio Melo",51,14,9,5,64.29],
  ["Cristian Valdes",49,16,9,7,56.25],["Ignacio Cofre",46,14,8,6,57.14],
  ["Rodrigo Araya",44,13,8,5,61.54],["Andrés Beltrán",42,14,8,6,57.14],
  ["Juan David Vera",40,12,7,5,58.33],["Nicolás Tapia",38,12,7,5,58.33],
  ["Felipe Alvarado",36,14,6,8,42.86],["Sebastián Rojas",34,13,6,7,46.15],
  ["Álvaro Espinoza",32,12,6,6,50],["Claudio Saavedra",30,12,6,6,50],
  ["Máximo Escalona",28,11,5,6,45.45],["Cristian Valdes B",26,11,5,6,45.45],
  ["Fabián Araneda",24,10,4,6,40],["Franco Gutiérrez",22,10,4,6,40],
  ["Andrés Gutiérrez",20,10,4,6,40],["Benjamin Diaz",18,8,3,5,37.5],
  ["Nicolás Martínez",16,8,3,5,37.5],["Alex Berrocal",14,8,2,6,25],
  ["Victor Saavedra",12,7,2,5,28.57],["Pablo Araneda",8,6,1,5,16.67],
  ["Waldo Escalona",6,6,0,6,0],["César Moreno",6,6,0,6,0]
];

/* ─── RANKING LIVE DESDE FIRESTORE ───────────────────────────── */
var rankingData=[];
var rankingListener=null;

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
        rankingData.push([d.nombre,d.pts||0,d.jugados||0,d.ganados||0,d.perdidos||0,d.pct||0,doc.id]);
      });
      if(rankingData.length===0)rankingData=SEED_PLAYERS.map(function(p){return p.slice();});
      renderRanking();
      actualizarStats();
    },function(e){
      console.warn("Ranking listener error:",e);
      rankingData=SEED_PLAYERS.map(function(p){return p.slice();});
      renderRanking();
    });
  }catch(e){
    rankingData=SEED_PLAYERS.map(function(p){return p.slice();});
    renderRanking();
  }
}

function renderRanking(){
  var lista=rankingData.slice();
  var maxPts=Math.max(1,...lista.map(function(p){return p[1];}));
  var rh="";
  lista.forEach(function(p,i){
    var c=i===0?"top1":i===1?"top2":i===2?"top3":"";
    var col=avatarColor(p[0]);var ini=initials(p[0]);
    rh+='<div class="rank-item '+c+'"><div class="rank-pos">'+(i+1)+'</div><div class="avatar" style="background:'+col+'">'+ini+'</div><div class="rank-info"><div class="nm">'+p[0]+'</div><div class="sub">'+p[3]+'G &middot; '+p[4]+'P &middot; '+p[2]+' jugados</div><div class="bar"><i style="width:'+(p[1]/maxPts*100)+'%"></i></div></div><div class="rank-pts"><div class="p">'+p[1]+'</div><div class="pct">'+p[5]+'%</div></div></div>';
  });
  var rl=el("ranking-list");if(rl)rl.innerHTML=rh;
}

async function actualizarStats(){
  var elJ=el("stat-jugadores");
  if(elJ)elJ.textContent=rankingData.length||SEED_PLAYERS.length;
  try{var snap=await db.collection("partidos_atmas").get();var elP=el("stat-partidos");if(elP)elP.textContent=snap.size;}catch(e){}
}

function generarCuadros(){
  var lista=rankingData.slice().sort(function(a,b){return b[1]-a[1];});
  function buildMatches(start){var ps=lista.slice(start,start+16);var n=ps.length;var matches=[];for(var i=0;i<8;i++){var a=ps[i]?ps[i][0]:null;var b=ps[n-1-i]?ps[n-1-i][0]:null;matches.push([a,b,null]);}return matches;}
  return{oro:buildMatches(0),plata:buildMatches(16)};
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
const profesores=[{nombre:"Marcelo Escalona G.",rol:"Director ATMAS &middot; Profesor de Tenis",bio:"Entrenador certificado con mas de 15 anos de experiencia en formacion y competencia. Director de ATMAS Academia de Tenis AT+ en el Club Las Avestruces, Quilicura. Especialista en desarrollo de jugadores desde iniciacion hasta alto rendimiento.",certs:{"PTR":["Nivel 1","Nivel 2","Nivel 3","High Performance"],"ITF":["Nivel 1","Nivel 2","Play and Stay"],"PST":["Nivel 1 Entrenador Nacional","Nivel 2"],"Play Tenis":["Profesor de Tenis","Pelota Roja","Pelota Naranja"]}}];

function renderProfesores(){
  var epl=el("profes-list");if(!epl)return;
  try{
    var h="";
    profesores.forEach(function(prof){
      var ini=initials(prof.nombre);var col=avatarColor(prof.nombre);
      var certsH="";
      Object.entries(prof.certs).forEach(function(ent){
        certsH+='<div style="margin-top:12px"><div style="font-size:10px;font-weight:800;color:var(--verde-osc);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">'+ent[0]+'</div><div style="display:flex;flex-wrap:wrap;gap:5px">'+ent[1].map(function(i){return'<span style="background:var(--verde-claro);color:var(--verde-osc);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600">'+i+'</span>';}).join('')+'</div></div>';
      });
      h+='<div style="background:#fff;border-radius:18px;padding:18px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.07)"><div style="display:flex;align-items:center;gap:14px;margin-bottom:14px"><div class="avatar" style="background:'+col+';width:60px;height:60px;font-size:20px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">'+ini+'</div><div><div style="font-weight:900;font-size:17px;color:var(--texto)">'+prof.nombre+'</div><div style="font-size:12px;color:var(--verde-osc);font-weight:600;margin-top:2px">'+prof.rol+'</div></div></div><p style="font-size:13px;color:var(--suave);line-height:1.6;border-top:1px solid var(--linea);padding-top:12px;margin-bottom:4px">'+prof.bio+'</p><div style="border-top:1px solid var(--linea);margin-top:12px;padding-top:4px">'+certsH+'</div></div>';
    });
    epl.innerHTML=h;
  }catch(e){console.warn("renderProfesores error:",e);}
}
renderProfesores();

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
const MP={cancha1hr:"https://mpago.li/2Up5tJ7",cancha2hrs:"https://mpago.la/1JgQ4Y5",torneo20:"https://mpago.la/REEMPLAZAR_T20",torneo15:"https://mpago.la/REEMPLAZAR_T15",escalerilla:"https://mpago.la/REEMPLAZAR_ESC",socio:"https://mpago.la/REEMPLAZAR_SOCIO",inscripcion:"https://mpago.la/REEMPLAZAR_INSC"};
function pagoHTML(monto,label,link){
  var t=PAGO;
  return '<div class="pagobox"><h4>&#128180; Datos de transferencia</h4>'+
    '<div class="row"><span class="k">Nombre:</span><span class="v">'+t.nombre+'</span></div>'+
    '<div class="row"><span class="k">RUT:</span><span class="v">'+t.rut+'</span></div>'+
    '<div class="row"><span class="k">Banco:</span><span class="v">'+t.banco+' &middot; '+t.tipo+'</span></div>'+
    '<div class="row"><span class="k">N&ordm; Cuenta:</span><span class="v">'+t.cuenta+'</span></div>'+
    '<div class="row"><span class="k">Email:</span><span class="v">'+t.email+'</span></div>'+
    '<div class="row"><span class="k">Monto:</span><span class="v" style="font-weight:800;font-size:16px;color:var(--verde-osc)">$'+monto.toLocaleString("es-CL")+'</span></div>'+
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
    savePerfil(p);mostrarApp();renderPerfil();go("inicio");
    toast("Bienvenido/a "+nombre+"!");
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
      // Usuario Google sin perfil: crear uno con sus datos de Google y entrar directo
      var p={nombre:user.displayName||user.email||"Usuario",rut:"",tel:"",fnac:"",socio:false,email:user.email||""};
      savePerfil(p);mostrarApp();renderPerfil();go("perfil");
      toast("Bienvenido! Completa tu RUT en Mi Perfil.");
    }
  }catch(e){
    console.warn("onAuthStateChanged error:",e);
    var p=getPerfil();
    if(p){mostrarApp();renderPerfil();}
    else{mostrarLogin();showAuthStep1();}
  }
}

if(auth){auth.onAuthStateChanged(onAuthStateChanged);}

async function completarPerfil(){
  var nombre=((el("reg-nombre")||{}).value||"").trim();
  var rut=((el("reg-rut")||{}).value||"").trim();
  var tel=((el("reg-tel")||{}).value||"").trim();
  var fnac=(el("reg-fnac")||{}).value||"";
  if(!nombre||!rut){toast("Nombre y RUT son obligatorios");return;}
  var p={nombre:nombre,rut:rut,tel:tel,fnac:fnac,socio:false};
  savePerfil(p);mostrarApp();renderPerfil();go("inicio");toast("Bienvenido "+nombre+"!");
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
    var socioTag=p.socio?'<span class="cupos" style="background:#ffd700;color:#7a5c00">SOCIO</span>':'<span class="cupos">Sin membresia</span>';
    var pct=jugador?jugador[5]:0;
    var statsHtml=jugador?'<div class="mycard" style="margin-bottom:14px"><div class="pos">Posicion #'+pos+' &middot; Escalerilla ATMAS</div><div class="name">'+p.nombre+'</div><div class="row"><div><span class="big">'+jugador[1]+'</span><span class="cap">Puntos</span></div><div><span class="big">'+jugador[3]+'</span><span class="cap">Ganados</span></div><div><span class="big">'+jugador[4]+'</span><span class="cap">Perdidos</span></div><div><span class="big">'+pct+'%</span><span class="cap">Rendimiento</span></div></div></div>':'<div class="aviso">Aun no tienes partidos en la escalerilla. Juega y sube tu ranking!</div>';
    var estiloTag=(p.estilo||p.golpe)?'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+[p.estilo,p.golpe,p.superficie].filter(Boolean).map(function(x){return'<span style="background:var(--verde-claro);color:var(--verde-osc);border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">'+x+'</span>';}).join('')+'</div>':"";
    pBody.innerHTML='<div style="display:flex;align-items:center;gap:13px;background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div class="avatar" style="background:'+col+';width:54px;height:54px;font-size:19px;flex-shrink:0">'+ini+'</div><div style="flex:1"><div style="font-weight:800;font-size:17px">'+p.nombre+'</div><div style="font-size:12px;color:var(--suave)">RUT: '+p.rut+'</div><div style="font-size:12px;color:var(--suave);margin-top:2px">'+(p.tel||"")+' </div>'+estiloTag+'</div>'+socioTag+'</div>'+statsHtml+'<div id="mis-partidos-pend"></div><div class="section-title">Mis ultimos partidos</div><div id="historial-list"><p style="color:var(--suave);font-size:13px;padding:8px 4px">Cargando...</p></div><div class="section-title">Mis proximas reservas</div><div id="mis-reservas-list"><p style="color:var(--suave);font-size:13px;padding:8px 4px">Cargando...</p></div><button class="btn" onclick="openModal(\'partido\')">+ Registrar partido</button><button class="btn sec" style="margin-top:8px" onclick="openModal(\'caracteristicas\')">Mi estilo de juego</button><button class="btn dark" style="margin-top:8px" onclick="openModal(\'socio\')">Membresia ATMAS</button><button class="btn sec" style="margin-top:8px" onclick="go(\'cancha\')">Reservar cancha</button><button class="btn sec" style="margin-top:8px;font-size:13px;padding:10px" onclick="cerrarSesion()">Cerrar sesion</button><p class="foot" style="margin-top:16px">@ATMAS_TENIS &middot; Club Las Avestruces</p>';
    cargarMisReservas(p.nombre);cargarPartidosPendientes(p.nombre);cargarHistorial(p.nombre);mostrarPopupTorneos();
  }catch(e){console.warn("renderPerfil error:",e);}
}

async function cargarHistorial(nombre){
  var ehl=el("historial-list");if(!ehl)return;
  try{
    var snap1=await db.collection("partidos_atmas").where("ganador","==",nombre).where("estado","==","aprobado").orderBy("ts","desc").limit(5).get();
    var snap2=await db.collection("partidos_atmas").where("perdedor","==",nombre).where("estado","==","aprobado").orderBy("ts","desc").limit(5).get();
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

function miConfirmar(i){var q=window._misPendQ[i];if(q)aprobarPartido(q.id,q.gan,q.per);}
async function miDisputar(i){
  var q=window._misPendQ[i];if(!q)return;
  try{
    await db.collection("partidos_atmas").doc(q.id).update({estado:"pendiente_admin"});
    toast("Enviado a Marcelo Escalona para resolver");
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
const ZONA_NORTE_INSCRITOS=["Marcelo Escalona","Ariel Araya","Rodrigo Bernal","Osvaldo Valdivia","Marco Carrasco","Hipólito Bello","Ignacio Soto","Roro Navarro","Mauro Morales","Seba Brito","Edgardo Pacheco","Pablo Ortiz","Oscar Henríquez","Roro Turchan","Seba López","Miguel Osores"];

var ZONA_NORTE_SEED={
  nombre:"Ranking Zona Norte - Sexta Fecha",fecha:"Sabado 21 Junio 2026",
  octavos:[
    {a:"Ariel Araya",b:"Hipólito Bello",hora:"12:00",gan:null,res:null},
    {a:"Rodrigo Bernal",b:"Roro Turchan",hora:"12:00",gan:null,res:null},
    {a:"Osvaldo Valdivia",b:"Seba López",hora:"12:00",gan:null,res:null},
    {a:"Edgardo Pacheco",b:"Miguel Osores",hora:"12:00",gan:null,res:null},
    {a:"Mauro Morales",b:"Roro Navarro",hora:"14:00",gan:null,res:null},
    {a:"Marcelo Escalona",b:"Pablo Ortiz",hora:"14:00",gan:null,res:null},
    {a:"Seba Brito",b:"Oscar Henríquez",hora:"14:00",gan:null,res:null},
    {a:"Marco Carrasco",b:"Ignacio Soto",hora:"14:00",gan:null,res:null}
  ],
  cuartos:[
    {a:null,b:null,hora:"16:00",gan:null},{a:null,b:null,hora:"16:00",gan:null},
    {a:null,b:null,hora:"16:00",gan:null},{a:null,b:null,hora:"16:00",gan:null}
  ],
  semis:[{a:null,b:null,hora:"18:00",gan:null},{a:null,b:null,hora:"18:00",gan:null}],
  final:{a:null,b:null,hora:"20:00",gan:null}
};
const torneos=[
  {n:"Ranking Zona Norte - Sexta Fecha",f:"21 junio 2026 &middot; Full Tenis",p:"$20.000",c:"0 cupos",monto:20000},
  {n:"Torneo Novicios 4",f:"11 julio 2026 &middot; 16:00 y 18:00",p:"$20.000",c:"6 cupos",monto:20000},
  {n:"Torneo Novicios 3",f:"13 junio 2026",p:"$15.000",c:"Cerrado",monto:15000},
  {n:"Nueva Escalerilla Jun-Ago",f:"Series A y B &middot; $15.000 por partido",p:"$35.000",c:"4 cupos",monto:35000}
];

(function renderTorneosList(){
  var tl=el("torneos-list");if(!tl)return;
  var th="";
  torneos.forEach(function(t,i){
    var bloqueado=t.c==="Cerrado";
    th+='<div class="tcard"><div class="tn">'+t.n+'</div><div class="tm">'+t.f+'</div><div class="trow"><span class="price">'+t.p+'</span><span class="cupos" style="'+(bloqueado?'background:#fee2e2;color:#b91c1c':'')+'">'+t.c+'</span>'+(bloqueado?'<button class="mini" disabled style="opacity:.4">Cerrado</button>':'<button class="mini wa" onclick="openModal(\'torneo\','+i+')">Inscribirme</button>')+'</div></div>';
  });
  tl.innerHTML=th;
})();

async function cargarInscripciones(){
  var enl=el("novicios-list");if(!enl)return;
  try{
    var snap=await db.collection("inscripciones_atmas").where("torneo","==","Torneo Novicios 4").get();
    var inscritos=[];snap.forEach(function(doc){inscritos.push(doc.data().nombre);});
    var nh="";
    inscritos.forEach(function(n){var col=avatarColor(n);var ini=initials(n);nh+='<div class="lcard"><div class="avatar" style="background:'+col+';width:32px;height:32px;font-size:12px;flex-shrink:0">'+ini+'</div><div style="flex:1"><div class="nm">'+n+'</div></div><span>OK</span></div>';});
    var lleno=inscritos.length>=16;
    for(var i=inscritos.length;i<16;i++)nh+='<div class="lcard"><div style="width:32px;height:32px;border-radius:50%;background:var(--gris);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--suave)">'+(i+1)+'</div><div style="flex:1"><div class="ds">Cupo disponible</div></div>'+(lleno?'<span style="color:#b91c1c;font-size:11px">Completo</span>':'<button class="mini" onclick="openModal(\'torneo\',1)">Unirme</button>')+'</div>';
    enl.innerHTML=nh;
  }catch(e){console.warn("cargarInscripciones error:",e);}
}

async function cargarInscripcionesZonaNorte(){
  var ezl=el("zonanorte-list");if(!ezl)return;
  try{
    var snap=await db.collection("inscripciones_atmas").where("torneo","==","Ranking Zona Norte - Sexta Fecha").get();
    var nuevos=[];snap.forEach(function(doc){var n=doc.data().nombre;if(!ZONA_NORTE_INSCRITOS.includes(n))nuevos.push(n);});
    var todos=ZONA_NORTE_INSCRITOS.concat(nuevos);
    var nh="";
    todos.forEach(function(n,i){var col=avatarColor(n);var ini=initials(n);var esConf=ZONA_NORTE_INSCRITOS.includes(n);nh+='<div class="lcard"><div style="width:24px;text-align:center;font-size:11px;font-weight:800;color:var(--suave)">'+(i+1)+'</div><div class="avatar" style="background:'+col+';width:32px;height:32px;font-size:12px;flex-shrink:0">'+ini+'</div><div style="flex:1"><div class="nm">'+n+'</div></div><span style="font-size:10px;color:'+(esConf?"var(--verde-osc)":"#6366f1")+'">'+(esConf?"Conf.":"Pend.")+'</span></div>';});
    var lleno=todos.length>=16;
    for(var i=todos.length;i<16;i++)nh+='<div class="lcard"><div style="width:24px;text-align:center;font-size:11px;color:var(--suave)">'+(i+1)+'</div><div style="width:32px;height:32px;border-radius:50%;background:var(--gris);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--suave)">+</div><div style="flex:1"><div class="ds">Cupo disponible</div></div>'+(lleno?'<span style="color:#b91c1c;font-size:11px">Completo</span>':'<button class="mini" onclick="openModal(\'torneo\',0)">Inscribirme</button>')+'</div>';
    ezl.innerHTML=nh;
  }catch(e){console.warn("cargarInscripcionesZonaNorte error:",e);}
}
cargarInscripciones();
cargarInscripcionesZonaNorte();

/* ─── PARTIDOS ────────────────────────────────────────────────── */
async function guardarPartido(){
  var yo=((el("pt-yo")||{}).value||"").trim();
  var rival=(el("pt-rival")||{}).value||"";
  var resultado=(el("pt-resultado")||{}).value||"gane";
  var s1=(el("pt-s1")||{}).value||"";
  var s2=(el("pt-s2")||{}).value||"";
  var s3=(el("pt-s3")||{}).value||"";
  var cancha=(el("pt-cancha")||{}).value||"Cancha 1";
  var fecha=(el("pt-fecha")||{}).value||"";
  if(!yo){toast("Escribe tu nombre");return;}
  var ganador=resultado==="gane"?yo:rival;
  var perdedor=resultado==="gane"?rival:yo;
  var sets=[s1,s2,s3].filter(function(s){return s&&s!=="--";}).join(", ");
  try{
    await db.collection("partidos_atmas").add({
      jugador1:yo,jugador2:rival,ganador:ganador,perdedor:perdedor,
      sets:sets,cancha:cancha,fecha:fecha,estado:"pendiente_rival",
      ts:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();
    var sc=el("sheet-content");var mo=el("modal");
    if(sc)sc.innerHTML='<div style="text-align:center;padding:16px 0"><div style="font-size:48px">&#128203;</div><div style="font-weight:900;font-size:18px;color:var(--verde-osc);margin:10px 0">Partido enviado</div><div style="font-size:13px;color:var(--suave);line-height:1.6">Enviado al rival para confirmar.<br>Si disputa el resultado, Marcelo Escalona decide.<br>Los puntos se suman una vez confirmado.</div></div><button class="btn sec" style="margin-top:16px" onclick="closeModal()">Entendido</button>';
    if(mo)mo.classList.add("show");
  }catch(e){console.warn("guardarPartido error:",e);toast("Error al guardar. Intenta de nuevo.");}
}

function pendAprobar(i){var q=window._pendQ[i];if(q)aprobarPartido(q.id,q.gan,q.per);}
function pendRechazar(i){var q=window._pendQ[i];if(q)rechazarPartido(q.id);}

async function aprobarPartido(docId,ganador,perdedor){
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
    renderAdmin();
  }catch(e){console.warn("aprobarPartido error:",e);toast("Error al aprobar partido.");}
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
  var nombre=((el("can-nombre")||{}).value||"").trim();
  var tel=((el("can-tel")||{}).value||"").trim();
  var fecha=calFechaSel;
  var cancha=(el("can-cancha")||{}).value||"Sin preferencia";
  var monto=slotMonto||15000;var durHrs=slotDurHrs||1;
  var durText=durHrs===2?"2 horas - $25.000":"1 hora - $15.000";
  if(!nombre){toast("Escribe tu nombre");return;}
  if(!slotSeleccionado){toast("Selecciona un horario");return;}
  var hIni=parseInt(slotSeleccionado.split(":")[0]);
  var horaFin=String(hIni+durHrs).padStart(2,"0")+":00";
  var fechaFmt=fecha?fecha.split("-").reverse().join("/"):"-";
  try{
    await db.collection("reservas").add({nombre:nombre,tel:tel,fecha:fecha,hora:slotSeleccionado,horaFin:horaFin,cancha:cancha,duracion:durText,durHrs:durHrs,monto:monto,ts:firebase.firestore.FieldValue.serverTimestamp()});
    var horaConf=slotSeleccionado;
    slotSeleccionado=null;slotDurHrs=1;slotMonto=15000;calFechaSel=null;
    renderCalendario();
    var esc=el("slots-container");
    if(esc)esc.innerHTML='<div style="text-align:center;padding:16px 0"><div style="font-size:48px">&#127937;</div><div style="font-weight:900;color:var(--verde-osc);font-size:17px;margin:8px 0">Cancha reservada!</div><div style="font-size:13px;color:var(--suave)">'+fechaFmt+' &middot; '+horaConf+' - '+horaFin+'<br>'+cancha+'</div></div>'+pagoHTML(monto,"arriendo de cancha",monto===15000?MP.cancha1hr:MP.cancha2hrs);
    var cf=el("can-form");if(cf)cf.style.display="none";
  }catch(e){console.warn("reservarCancha error:",e);toast("Error al reservar. Intenta de nuevo.");}
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
      html='<h3>Inscripcion &middot; '+t.n+'</h3><div class="field"><label>Tu nombre</label><input id="ti-nombre" placeholder="Ej: Juan Perez" value="'+(perfil.nombre||"")+'"></div><div class="field"><label>Telefono</label><input id="ti-tel" type="tel" placeholder="+569 XXXX XXXX" value="'+(perfil.tel||"")+'"></div>'+turnoField+'<button class="btn" onclick="inscribirTorneo('+idx+')" style="margin-bottom:4px">Confirmar inscripcion</button>'+pagoHTML(t.monto,t.n,mpLink)+'<button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';
    }else if(tipo==="clase"){
      var planes={iniciacion:{t:"Iniciacion - Sabados",opciones:[{l:"1 dia - Sabados",v:60000}]},intermedio:{t:"Intermedios",opciones:[{l:"1 dia",v:70000},{l:"2 dias",v:120000},{l:"3 dias",v:150000}]},avanzado:{t:"Avanzados",opciones:[{l:"1 dia",v:80000},{l:"2 dias",v:120000},{l:"3 dias",v:150000}]},individual:{t:"Clases individuales",opciones:[{l:"4 clases",v:120000},{l:"8 clases",v:200000}]}};
      var plan=planes[idx]||planes.individual;
      var optsHtml=plan.opciones.map(function(o){return'<option value="'+o.v+'">'+o.l+' &middot; $'+o.v.toLocaleString("es-CL")+'</option>';}).join("");
      html='<h3>Inscripcion &middot; '+plan.t+'</h3><div class="field"><label>Nombre</label><input id="cls-nombre" placeholder="Ej: Juan Perez"></div><div class="field"><label>Plan</label><select id="cls-plan" onchange="actualizarPagoClase()">'+optsHtml+'</select></div><div id="cls-pago"></div><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';setTimeout(actualizarPagoClase,50);
    }else if(tipo==="encordado"){
      html='<h3>Solicitar encordado ATMAS</h3><div class="field"><label>Tu nombre</label><input id="enc-nombre" placeholder="Ej: Juan Perez"></div><div class="field"><label>Tipo</label><select id="enc-tipo"><option>Control</option><option>Competencia</option><option>Potencia</option><option>Hibrido</option></select></div><button class="btn wa" onclick="enviarEncordadoWA()">Coordinar por WhatsApp</button><button class="btn sec" style="margin-top:8px" onclick="closeModal()">Cancelar</button>';
    }else if(tipo==="partido"){
      var perfil=getPerfil();var miNombre=perfil?perfil.nombre:"";
      var oh="";rankingData.forEach(function(p){if(p[0]!==miNombre)oh+='<option>'+p[0]+'</option>';});
      html='<h3>Registrar partido</h3><div class="field"><label>Tu nombre</label><input id="pt-yo" value="'+miNombre+'" placeholder="Tu nombre"'+(miNombre?' readonly style="background:#f4f5f7"':'')+' ></div><div class="field"><label>Oponente</label><select id="pt-rival">'+oh+'</select></div><div class="field"><label>Resultado</label><select id="pt-resultado"><option value="gane">Gane</option><option value="perdi">Perdi</option></select></div><div class="field"><label>Sets</label><div class="sets"><input id="pt-s1" placeholder="6-3"><input id="pt-s2" placeholder="4-6"><input id="pt-s3" placeholder="--"></div></div><div class="field"><label>Cancha</label><select id="pt-cancha"><option>Cancha 1</option><option>Cancha 2</option><option>Cancha 3</option><option>Cancha 4</option></select></div><div class="field"><label>Fecha</label><input id="pt-fecha" type="date" value="'+new Date().toISOString().split("T")[0]+'"></div><button class="btn" onclick="guardarPartido()">Guardar partido</button><button class="btn sec" onclick="closeModal()">Cancelar</button>';
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
  var nombre=((el("ti-nombre")||{}).value||"").trim();
  var tel=((el("ti-tel")||{}).value||"").trim();
  var turnoEl=el("ti-turno");var turno=turnoEl?turnoEl.value:"";
  var t=torneos[idx];if(!t){toast("Torneo no encontrado");return;}
  if(!nombre){toast("Escribe tu nombre");return;}
  try{
    var totalSnap=await db.collection("inscripciones_atmas").where("torneo","==",t.n).get();
    if(totalSnap.size>=16){toast("Torneo completo. No hay mas cupos.");return;}
    var existe=await db.collection("inscripciones_atmas").where("torneo","==",t.n).where("nombre","==",nombre).get();
    if(!existe.empty){toast("Ya estas inscrito en este torneo");return;}
    await db.collection("inscripciones_atmas").add({nombre:nombre,tel:tel,torneo:t.n,turno:turno,monto:t.monto,estado:"pendiente_pago",ts:firebase.firestore.FieldValue.serverTimestamp()});
    toast("Inscripcion registrada - Ahora completa el pago");
  }catch(e){toast("Error al inscribir. Intenta de nuevo.");}
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
  h+='<div class="seg" style="margin-bottom:14px">';
  h+='<button id="atab-reservas" class="on" onclick="adminTab(this,\'reservas\')">Reservas</button>';
  h+='<button id="atab-sanciones" onclick="adminTab(this,\'sanciones\')">Sanciones</button>';
  h+='<button id="atab-torneos" onclick="adminTab(this,\'torneos\')">Torneos</button>';
  h+='<button id="atab-ranking" onclick="adminTab(this,\'ranking\')">Ranking</button>';
  h+='<button id="atab-config" onclick="adminTab(this,\'config\')">Config</button>';
  h+='</div>';
  h+='<div id="admin-tab-reservas"><div class="section-title">Reservas de canchas</div><div id="admin-reservas-cont"><p class="hint">Cargando...</p></div></div>';
  h+='<div id="admin-tab-sanciones" style="display:none"><div class="section-title">Sanciones activas</div><div id="admin-sanciones-cont"><p class="hint">Cargando...</p></div></div>';
  h+='<div id="admin-tab-torneos" style="display:none">';
  h+='<div class="admin-section"><div class="section-title" style="color:#b45309">Partidos en disputa</div><div id="a-pendientes"><p class="hint">Cargando...</p></div></div>';
  h+='<div class="admin-section"><div class="section-title">Inscripciones torneo</div><div id="a-inscripciones"><p class="hint">Cargando...</p></div></div>';
  h+='</div>';
  h+='<div id="admin-tab-ranking" style="display:none"><div class="admin-section"><div class="section-title">Tipos de usuario</div><div id="admin-tipos-cont"><p class="hint">Cargando...</p></div></div><div class="admin-section"><div class="section-title">Gestionar ranking</div><div id="a-ranking-admin"></div>';
  h+='<button class="btn dark" style="margin-top:8px" onclick="openModal(\'jugador\')">+ Agregar jugador</button></div></div>';
  h+='<div id="admin-tab-config" style="display:none"><div id="admin-config-cont"><p class="hint">Cargando...</p></div></div>';
  h+='<div style="height:20px"></div>';
  eab.innerHTML=h;
  renderAdminReservas();
  loadAdminTorneos();
  var rh="";rankingData.slice(0,10).forEach(function(p,i){rh+='<div class="lcard"><div class="rank-pos" style="width:24px;font-size:12px">'+(i+1)+'</div><div style="flex:1"><div class="nm">'+p[0]+'</div><div class="ds">'+p[1]+' pts &middot; '+p[3]+'G '+p[4]+'P</div></div></div>';});
  var ara=el("a-ranking-admin");if(ara)ara.innerHTML=rh||'<p class="hint">Cargando ranking...</p>';
}

function adminTab(el_,tab){if(tab===undefined){tab=el_;}
  ["reservas","sanciones","torneos","ranking","config"].forEach(function(t){
    var div=el("admin-tab-"+t);if(div)div.style.display=t===tab?"":"none";
    var btn=el("atab-"+t);if(btn)btn.className=t===tab?"on":"";
  });
  if(tab==="sanciones")renderAdminSanciones();
  if(tab==="ranking")renderAdminTipos();
  if(tab==="config")renderAdminConfig();
}

async function loadAdminTorneos(){
  try{
    var snapPend=await db.collection("partidos_atmas").where("estado","==","pendiente_admin").orderBy("ts","desc").limit(20).get();
    var ap=el("a-pendientes");
    if(!ap){}else if(snapPend.empty){ap.innerHTML='<p class="hint">Sin partidos pendientes</p>';}
    else{
      window._pendQ=[];var hp="";
      snapPend.forEach(function(doc){var r=doc.data();var qi=window._pendQ.length;window._pendQ.push({id:doc.id,gan:r.ganador,per:r.perdedor});hp+='<div class="res-card" style="border-color:#f59e0b"><div class="rc-top"><span class="rc-name">'+r.ganador+' ganó</span><span class="rc-date">'+(r.fecha||"")+'</span></div><div class="rc-sub">vs '+r.perdedor+' &middot; '+(r.sets||"sin sets")+'</div><div style="display:flex;gap:8px;margin-top:8px"><button class="btn" style="flex:1;padding:8px;font-size:12px" onclick="pendAprobar('+qi+')">Aprobar +5/+1</button><button class="btn sec" style="flex:1;padding:8px;font-size:12px" onclick="pendRechazar('+qi+')">Rechazar</button></div></div>';});
      ap.innerHTML=hp;
    }
  }catch(e){var ap2=el("a-pendientes");if(ap2)ap2.innerHTML='<p class="hint">Error</p>';}
  try{
    var snap2=await db.collection("inscripciones_atmas").orderBy("ts","desc").limit(40).get();
    var ai=el("a-inscripciones");
    if(!ai){}else if(snap2.empty){ai.innerHTML='<p class="hint">Sin inscripciones</p>';}
    else{var h2="";snap2.forEach(function(doc){var r=doc.data();h2+='<div class="res-card" style="border-color:#6366f1"><div class="rc-top"><span class="rc-name">'+(r.nombre||"?")+'</span><span style="font-size:11px;color:var(--suave)">'+(r.torneo||r.categoria||"")+'</span></div><div class="rc-sub">'+(r.tel||"")+' &middot; '+(r.estado||"pendiente")+'</div></div>';});ai.innerHTML=h2;}
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
      function fila(k,v,big){return '<div class="pagobox row"><span class="k">'+k+':</span><span class="v'+(big?' big':'')+'">'+v+'</span></div>';}
      md.innerHTML=
        '<a href="'+linkMP+'" target="_blank" style="display:block;background:#009ee3;color:#fff;text-align:center;padding:14px;border-radius:14px;font-size:15px;font-weight:800;text-decoration:none;margin-bottom:12px">&#128179;&nbsp; Pagar con MercadoPago &rarr; $'+tarifa.toLocaleString("es-CL")+'</a>'+
        '<div style="text-align:center;font-size:12px;color:#9ca3af;margin:-4px 0 12px">&mdash; o transferencia bancaria &mdash;</div>'+
        '<div class="pagobox">'+
        '<h4>&#128180; Datos de transferencia</h4>'+
        fila("Nombre",t.nombre)+
        fila("RUT",t.rut)+
        fila("Banco",t.banco)+
        fila("Tipo",t.tipo)+
        fila("N&ordm; Cuenta",t.cuenta)+
        fila("Email",t.email)+
        fila("Monto",'<b style="font-size:16px;color:var(--verde-osc)">$'+tarifa.toLocaleString("es-CL")+'</b>',true)+
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
    '<button class="btn" onclick="guardarAdminConfig()">Guardar cambios</button>';
  cont.innerHTML=h;
}

async function guardarAdminConfig(){
  function gv(id){var e=el("cfg-"+id);return e?e.value.trim():"";}
  var data={
    cancha1h:parseInt(gv("c1h"))||15000,cancha2h:parseInt(gv("c2h"))||25000,
    academia_iniciacion:parseInt(gv("ac1"))||60000,academia_intermedio:parseInt(gv("ac2"))||70000,
    academia_avanzado:parseInt(gv("ac3"))||80000,academia_individual_4c:parseInt(gv("ac4"))||120000,academia_individual_8c:parseInt(gv("ac5"))||200000,
    banco_nombre:gv("bnombre"),banco_rut:gv("brut"),banco_banco:gv("bbanco"),banco_tipo:gv("btipo"),banco_cuenta:gv("bcuenta"),banco_email:gv("bemail"),wp:gv("wp")
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
  try{seedRankingIfEmpty().then(function(){iniciarRankingLive();generarYRenderCuadros();});}catch(e){}
  try{seedCuadroNovicios3().then(function(){iniciarCuadroLive();});}catch(e){}
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
      html+='<div class="reserva-card" style="margin-bottom:8px">'+
        '<div style="font-weight:700;font-size:13px">'+p.nombre+'</div>'+
        '<div style="font-size:11px;color:var(--suave);margin-bottom:8px">'+(p.rut||p.email||"")+(p._col==="ranking_atmas"?' &middot; <span style="color:#6366f1">ranking</span>':'')+'</div>'+
        '<select id="'+selId+'" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;font-size:13px;margin-bottom:6px">'+
        '<option value="">-- Sin asignar --</option>';
      Object.keys(tipos).forEach(function(k){
        html+='<option value="'+k+'"'+(tipoActual===k?' selected':'')+'>'+tipos[k]+'</option>';
      });
      html+='</select>'+
        '<button class="mini" style="background:var(--verde-claro);color:var(--verde-osc)" onclick="guardarTipoUsuario(\''+p._col+'\',\''+docId+'\',\''+selId+'\')">Guardar</button>'+
        '</div>';
    });
    cont.innerHTML=html;
  }catch(e){cont.innerHTML='<p class="hint">Error: '+e.message+'</p>';}
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
