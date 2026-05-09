/* ============================================================
   TIRTH JOSHI v3 — Portfolio JS
   Matrix · Node graph · Cursor · Typewriter · Stat counters
   Harry Potter Easter Egg (4 triggers) · Console hint
   ============================================================ */
'use strict';

/* ── Custom cursor ─────────────────────────────────────── */
const curRing = document.getElementById('curRing');
const curDot  = document.getElementById('curDot');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function tick(){
  rx += (mx-rx)*.12; ry += (my-ry)*.12;
  if(curRing){ curRing.style.left=rx+'px'; curRing.style.top=ry+'px'; }
  if(curDot){ curDot.style.left=mx+'px'; curDot.style.top=my+'px'; }
  requestAnimationFrame(tick);
})();
document.querySelectorAll('a,button,.stat-c,.build-card,.r-card,.proj-card,.wi,.term-card,.fhint,.tag-hire,.sg-c span,.ib-tags span').forEach(el=>{
  el.addEventListener('mouseenter',()=>curRing?.classList.add('big'));
  el.addEventListener('mouseleave',()=>curRing?.classList.remove('big'));
});

/* ── Nav scroll style ──────────────────────────────────── */
const navEl = document.getElementById('nav');
window.addEventListener('scroll',()=> navEl?.classList.toggle('sc',scrollY>24),{passive:true});

/* ── Matrix rain ───────────────────────────────────────── */
(function initMatrix(){
  const cv = document.getElementById('matrixCanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  let W,H,cols,drops;
  const CHARS='アイウエオカキクケコアカサタナハマヤラワ01∑∏∫∂∇λφψΩ⊕⊗∈⊆≡≠≤≥⟨⟩{}[]//'.split('');
  function rsz(){
    W=cv.width=innerWidth; H=cv.height=innerHeight;
    cols=Math.floor(W/16); drops=Array(cols).fill(1);
  }
  rsz(); window.addEventListener('resize',rsz,{passive:true});
  function draw(){
    ctx.fillStyle='rgba(7,10,14,.07)'; ctx.fillRect(0,0,W,H);
    ctx.font='12px Share Tech Mono,monospace';
    drops.forEach((y,i)=>{
      ctx.fillStyle=Math.random()>.93?'#00ffaa':'#00cc66';
      ctx.globalAlpha=Math.random()*.5+.1;
      ctx.fillText(CHARS[Math.floor(Math.random()*CHARS.length)],i*16,y*16);
      ctx.globalAlpha=1;
      if(y*16>H && Math.random()>.974) drops[i]=0;
      drops[i]++;
    });
  }
  setInterval(draw,52);
})();

/* ── Reveal observer ───────────────────────────────────── */
const revObs = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('vis'); });
},{threshold:.1,rootMargin:'0px 0px -36px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* ── Typewriter ────────────────────────────────────────── */
const PHRASES=[
  'AI_Engineer && Researcher',
  'Building_LLM_Systems.ship()',
  'Multi_Agent_RL.train(policies)',
  'Graph_ML.route(cross_chain)',
  'Privacy_Risk.quantify(rpi)',
  'Blockchain.secure(contracts)',
  'Topology.optimize(grad_descent)',
  'depth_over_breadth = true',
  'systems_over_demos = true',
  'open_to_work = true ✓',
];
let pi=0,ci=0,del=false;
const tyEl=document.getElementById('typedText');
function tyLoop(){
  if(!tyEl) return;
  const s=PHRASES[pi];
  if(!del){ tyEl.textContent=s.slice(0,++ci); if(ci===s.length){del=true;setTimeout(tyLoop,1800);return;} }
  else { tyEl.textContent=s.slice(0,--ci); if(ci===0){del=false;pi=(pi+1)%PHRASES.length;} }
  setTimeout(tyLoop,del?36:68);
}
tyLoop();

/* ── Node graph (hero canvas) ──────────────────────────── */
(function initGraph(){
  const cv=document.getElementById('nodeGraph');
  if(!cv) return;
  const ctx=cv.getContext('2d');
  function rsz(){
    const r=cv.parentElement.getBoundingClientRect();
    cv.width=r.width||400; cv.height=400;
  }
  rsz(); window.addEventListener('resize',rsz,{passive:true});

  const N=[
    {lbl:'LLMs',     x:.5, y:.13,r:20,c:'#00ff88'},
    {lbl:'RL',       x:.18,y:.32,r:15,c:'#00d4ff'},
    {lbl:'Graph',    x:.82,y:.32,r:15,c:'#00d4ff'},
    {lbl:'Privacy',  x:.14,y:.58,r:12,c:'#ffb347'},
    {lbl:'DeFi',     x:.86,y:.58,r:12,c:'#ffb347'},
    {lbl:'Security', x:.5, y:.62,r:13,c:'#a066ff'},
    {lbl:'IoT',      x:.22,y:.8, r:10,c:'#ff6680'},
    {lbl:'RAG',      x:.78,y:.8, r:10,c:'#ff6680'},
    {lbl:'Topology', x:.5, y:.87,r:11,c:'#00ff88'},
    {lbl:'MARL',     x:.36,y:.47,r:9, c:'#00d4ff'},
    {lbl:'TDA',      x:.64,y:.47,r:9, c:'#a066ff'},
  ];
  const E=[[0,1],[0,2],[1,3],[2,4],[0,5],[3,5],[4,5],[1,6],[2,7],[5,8],[9,1],[9,5],[10,2],[10,5],[8,6],[8,7]];

  let t=0;
  function draw(){
    const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    t+=.007;
    const ns=N.map(n=>({
      ...n,
      px:n.x*W+Math.sin(t*.8+n.x*6)*5,
      py:n.y*H+Math.cos(t*.6+n.y*6)*5,
    }));

    /* edges */
    E.forEach(([a,b])=>{
      const A=ns[a],B=ns[b];
      const g=ctx.createLinearGradient(A.px,A.py,B.px,B.py);
      g.addColorStop(0,A.c+'44'); g.addColorStop(1,B.c+'18');
      ctx.beginPath(); ctx.moveTo(A.px,A.py); ctx.lineTo(B.px,B.py);
      ctx.strokeStyle=g; ctx.lineWidth=1; ctx.setLineDash([3,7]); ctx.stroke();
      ctx.setLineDash([]);
      /* traveller dot */
      const f=(Math.sin(t*1.6+a*.8+b*.4)+1)/2;
      ctx.beginPath(); ctx.arc(A.px+(B.px-A.px)*f,A.py+(B.py-A.py)*f,2,0,Math.PI*2);
      ctx.fillStyle=A.c+'bb'; ctx.fill();
    });

    /* nodes */
    ns.forEach(n=>{
      const p=1+Math.sin(t*2.2+n.x*9)*.07;
      /* glow */
      const g=ctx.createRadialGradient(n.px,n.py,0,n.px,n.py,n.r*2.8);
      g.addColorStop(0,n.c+'2a'); g.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(n.px,n.py,n.r*2.8,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      /* ring */
      ctx.beginPath(); ctx.arc(n.px,n.py,n.r*p,0,Math.PI*2);
      ctx.strokeStyle=n.c+'88'; ctx.lineWidth=1.5; ctx.stroke();
      /* dot */
      ctx.beginPath(); ctx.arc(n.px,n.py,3,0,Math.PI*2);
      ctx.fillStyle=n.c; ctx.fill();
      /* label */
      ctx.fillStyle=n.c+'cc'; ctx.font="9px 'Share Tech Mono',monospace";
      ctx.textAlign='center'; ctx.fillText(n.lbl,n.px,n.py+n.r+13);
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Stat counters ─────────────────────────────────────── */
function animStat(el){
  const tgt=parseFloat(el.dataset.target||0);
  const isF=el.dataset.float==='true';
  const dur=1400; let st=null;
  (function step(ts){
    if(!st) st=ts;
    const p=Math.min((ts-st)/dur,1);
    const e=1-Math.pow(1-p,3);
    el.textContent=(isF?(tgt*e).toFixed(1):Math.floor(tgt*e));
    if(p<1) requestAnimationFrame(step);
    else el.textContent=(isF?tgt.toFixed(1):tgt);
  })(performance.now());
}
const stObs=new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){animStat(e.target);stObs.unobserve(e.target);} });
},{threshold:.5});
document.querySelectorAll('.sn2[data-target]').forEach(el=>stObs.observe(el));

/* ── Mobile menu ───────────────────────────────────────── */
const menuBtn=document.getElementById('menuBtn');
const mMenu=document.getElementById('mobileMenu');
function closeMM(){ mMenu?.classList.remove('open'); menuBtn?.classList.remove('open'); }
window.closeMM=closeMM;
menuBtn?.addEventListener('click',()=>{ mMenu?.classList.toggle('open'); menuBtn?.classList.toggle('open'); });

/* ── Active nav highlight ──────────────────────────────── */
const secEls=document.querySelectorAll('section[id]');
const navAs=document.querySelectorAll('.nav-links a');
new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ const id=e.target.id; navAs.forEach(a=>{ a.style.color=a.getAttribute('href')==='#'+id?'var(--ink)':''; }); } });
},{threshold:.35}).observe; // observe each
secEls.forEach(s=>new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){const id=e.target.id;navAs.forEach(a=>{a.style.color=a.getAttribute('href')==='#'+id?'var(--ink)':'';}); }}); },{threshold:.35}).observe(s));

/* ── Parallax hero visual ──────────────────────────────── */
window.addEventListener('scroll',()=>{
  const h=document.querySelector('.hero-r');
  if(h && scrollY<innerHeight) h.style.transform=`translateY(${scrollY*.14}px)`;
},{passive:true});

/* ════════════════════════════════════════════════════════
   HARRY POTTER EASTER EGG
   Triggers: secretCard click · footer hint click ·
             Konami code ↑↑↓↓←→←→ba · type "lumos"
   ════════════════════════════════════════════════════════ */
let hpOpen=false;
function openHP(cx,cy){
  if(hpOpen) return; hpOpen=true;
  spawnStars(cx??innerWidth/2, cy??innerHeight/2);
  document.getElementById('hp-overlay')?.classList.add('show');
  const m=document.getElementById('hp-modal');
  m?.classList.add('show'); m?.removeAttribute('aria-hidden');
  document.body.style.overflow='hidden';
}
function closeHP(){
  hpOpen=false;
  document.getElementById('hp-overlay')?.classList.remove('show');
  const m=document.getElementById('hp-modal');
  m?.classList.remove('show'); m?.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
window.closeHP=closeHP;

function spawnStars(cx,cy){
  for(let i=0;i<22;i++){
    const s=document.createElement('div');
    s.className='hp-star';
    const a=(i/22)*Math.PI*2, d=60+Math.random()*130;
    s.style.cssText=`left:${cx}px;top:${cy}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px`;
    document.body.appendChild(s);
    s.addEventListener('animationend',()=>s.remove());
  }
}

/* Trigger 1: secret card */
document.getElementById('secretCard')?.addEventListener('click',e=>openHP(e.clientX,e.clientY));
/* Trigger 2: footer hint */
document.getElementById('footerHint')?.addEventListener('click',e=>openHP(e.clientX,e.clientY));
/* Trigger 3: Konami */
const KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki=0;
document.addEventListener('keydown',e=>{ ki=(e.key===KON[ki])?ki+1:(e.key===KON[0]?1:0); if(ki===KON.length){openHP();ki=0;} });
/* Trigger 4: type "lumos" */
let tb='';
document.addEventListener('keydown',e=>{ if(!e.key||e.key.length!==1) return; tb=(tb+e.key.toLowerCase()).slice(-5); if(tb==='lumos'){openHP();tb='';} });
/* Escape close */
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&hpOpen) closeHP(); });

/* House buttons */
const HQ={
  'Gryffindor':'🦁 "Brave at heart — daring nerve and chivalry where dwell the brave at heart!"',
  'Hufflepuff':'🦡 "Just and loyal, patient and unafraid of toil — true of heart!"',
  'Ravenclaw': '🦅 "Wit beyond measure is man\'s greatest treasure — curiosity lives here."',
  'Slytherin': '🐍 "Cunning folk who use any means to achieve their ends... welcome, ambitious one."',
};
document.querySelectorAll('.hhouses button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const m=document.getElementById('houseMsg');
    if(m){ m.textContent=HQ[btn.title]||''; setTimeout(()=>{ if(m) m.textContent=''; },4000); }
  });
});

/* ── Console hint ──────────────────────────────────────── */
console.log(
  '%c// TIRTH JOSHI PORTFOLIO v3.0\n'+
  '%c// AI Engineer + Researcher · Open to Full-Time Roles\n'+
  '%c// Stack: HTML + CSS + Vanilla JS · no_frameworks_harmed()\n'+
  '%c// ⚡ Easter egg: type "lumos" or press ↑↑↓↓←→←→BA\n'+
  '%c// Reach out: tirth5828@gmail.com',
  'font:bold 15px monospace;color:#00ff88',
  'font:12px monospace;color:#7499b8',
  'font:12px monospace;color:#3a5570',
  'font:12px monospace;color:#d4af37',
  'font:12px monospace;color:#00d4ff'
);
