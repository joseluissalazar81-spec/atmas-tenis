var tt;
function toast(m){var t=document.getElementById("toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show");},2800);}
function go(s){document.querySelectorAll(".screen").forEach(function(e){e.classList.remove("active");});document.getElementById(s).classList.add("active");document.querySelectorAll(".tab").forEach(function(t){t.classList.toggle("active",t.dataset.s===s);});document.querySelector(".content").scrollTop=0;if(s==="perfil")renderPerfil();if(s==="admin")renderAdmin();if(s==="cancha")renderCalendario();}
function closeModal(){document.getElementById("modal").classList.remove("show");}
function setVista(v){document.getElementById("vista-rank").style.display=v==="rank"?"block":"none";document.getElementById("vista-cuadro").style.display=v==="cuadro"?"block":"none";document.getElementById("vRank").classList.toggle("on",v==="rank");document.getElementById("vCuadro").classList.toggle("on",v==="cuadro");}
