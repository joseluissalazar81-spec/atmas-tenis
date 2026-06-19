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
const PAGO={nombre:"Marcelo Andrés Escalona Gálvez",rut:"12.637.853-K",banco:"Mercado Pago",tipo:"Cuenta Vista",cuenta:"1057752328",email:"locampinotenisclub@hotmail.com"};
const avatarColors=["#e74c3c","#e67e22","#f39c12","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00bcd4","#4caf50","#ff5722","#607d8b"];
function initials(n){if(!n)return"?";return n.split(" ").slice(0,2).map(function(x){return x[0];}).join("").toUpperCase();}
function avatarColor(n){if(!n)return avatarColors[0];var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%avatarColors.length;return avatarColors[h];}
function slugify(n){if(!n)return"";return n.toLowerCase().replace(/[^a-z0-9]/g,"_");}
function el(id){return document.getElementById(id);}