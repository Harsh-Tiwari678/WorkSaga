const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
const SUBSCRIBE_URL = 'YOUR_SUBSCRIBE_WEBHOOK_HERE';

const DEMO = [
  {job_title:'Senior Frontend Engineer',company:'Razorpay',skills:'React, TypeScript, Next.js, GraphQL, Tailwind CSS, Jest, Webpack',level:'Senior',salary:'₹28L–₹45L',remote:'Yes',summary:'Building payment experiences for 10M+ merchants across India.',apply_link:'#',location:'Bangalore',posted_date:new Date(Date.now()-2*864e5).toISOString()},
  {job_title:'Frontend Developer',company:'Zepto',skills:'React Native, JavaScript, Redux, REST APIs, CSS-in-JS, Git',level:'Mid',salary:'₹15L–₹24L',remote:'No',summary:'Own the mobile UI layer serving 2M+ daily orders.',apply_link:'#',location:'Mumbai',posted_date:new Date(Date.now()-1*864e5).toISOString()},
  {job_title:'React Engineer',company:'Postman',skills:'React, TypeScript, Node.js, CSS Modules, Testing Library',level:'Mid',salary:'₹20L–₹32L',remote:'Hybrid',summary:'Build the world\'s most popular API platform used by 30M+ developers.',apply_link:'#',location:'Bangalore',posted_date:new Date(Date.now()-3*864e5).toISOString()},
  {job_title:'Lead Frontend Architect',company:'CRED',skills:'React, TypeScript, Micro-frontends, Module Federation, Performance',level:'Lead',salary:'₹40L–₹65L',remote:'Hybrid',summary:'Lead frontend architecture for India\'s premium financial platform.',apply_link:'#',location:'Bangalore',posted_date:new Date(Date.now()-4*864e5).toISOString()},
  {job_title:'Junior Frontend Developer',company:'Groww',skills:'React, JavaScript, HTML5, CSS3, Git, REST APIs',level:'Junior',salary:'₹8L–₹14L',remote:'No',summary:'Entry-level role building investment interfaces for 8M+ investors.',apply_link:'#',location:'Bangalore',posted_date:new Date(Date.now()-5*864e5).toISOString()},
];

let currentJobs = [];
let saved = JSON.parse(localStorage.getItem('sm_saved')||'[]');

function timeAgo(d){
  if(!d) return '';
  const days = Math.floor((Date.now()-new Date(d))/864e5);
  if(days===0) return 'Today';
  if(days===1) return '1 day ago';
  return days+' days ago';
}

function countUp(el,target,suffix=''){
  let n=0;const step=target/40;
  const t=setInterval(()=>{
    n=Math.min(n+step,target);
    el.textContent=Math.round(n)+suffix;
    if(n>=target)clearInterval(t);
  },30);
}

const loadMsgs=['Fetching live jobs...','Running AI analysis...','Extracting skill signals...','Building your report...'];
let msgI=0,msgTimer;

async function doSearch(role){
  if(!role) role=document.getElementById('roleInput').value.trim();
  if(!role){document.getElementById('roleInput').focus();return;}
  document.getElementById('roleInput').value=role;
  document.getElementById('results').style.display='none';
  document.getElementById('loading').style.display='block';
  document.getElementById('errorMsg').style.display='none';
  document.getElementById('loading').scrollIntoView({behavior:'smooth',block:'center'});
  msgI=0;
  msgTimer=setInterval(()=>{
    document.getElementById('loadTxt').textContent=loadMsgs[msgI++%loadMsgs.length];
  },1800);
  try{
    let jobs;
    if(WEBHOOK_URL==='YOUR_N8N_WEBHOOK_URL_HERE'){
      await new Promise(r=>setTimeout(r,2000));
      jobs=DEMO;
    } else {
      const res=await fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:role+' India'})});
      if(!res.ok) throw new Error();
      jobs=await res.json();
      if(!Array.isArray(jobs)) jobs=[jobs];
    }
    clearInterval(msgTimer);
    currentJobs=jobs;
    render(jobs,role);
  } catch(e){
    clearInterval(msgTimer);
    document.getElementById('loading').style.display='none';
    document.getElementById('errorMsg').style.display='block';
  }
}

function render(jobs,role){
  document.getElementById('loading').style.display='none';
  const total=jobs.length;
  const remote=jobs.filter(j=>(j.remote||'').toLowerCase()==='yes').length;
  const senior=jobs.filter(j=>{const l=(j.level||'').toLowerCase();return l.includes('senior')||l.includes('lead');}).length;
  const skillMap={};
  jobs.forEach(j=>(j.skills||'').split(',').forEach(s=>{s=s.trim();if(s)skillMap[s]=(skillMap[s]||0)+1;}));
  const sorted=Object.entries(skillMap).sort((a,b)=>b[1]-a[1]);
  const top15=sorted.slice(0,15),top10=sorted.slice(0,10),maxC=sorted[0]?.[1]||1;

  document.getElementById('resultsTitle').innerHTML=`Market report: <em>${role}</em>`;
  document.getElementById('resultsSub').textContent=`${total} jobs analyzed`;

  document.getElementById('statsRow').innerHTML=`
    <div class="stat-item"><div class="stat-n" id="sn1">0</div><div class="stat-l">Jobs analyzed</div></div>
    <div class="stat-item"><div class="stat-n" id="sn2">0%</div><div class="stat-l">Remote roles</div></div>
    <div class="stat-item"><div class="stat-n" id="sn3">0</div><div class="stat-l">Senior / Lead</div></div>
    <div class="stat-item"><div class="stat-n" id="sn4">0</div><div class="stat-l">Unique skills</div></div>`;
  setTimeout(()=>{
    countUp(document.getElementById('sn1'),total);
    countUp(document.getElementById('sn2'),Math.round(remote/total*100),'%');
    countUp(document.getElementById('sn3'),senior);
    countUp(document.getElementById('sn4'),Object.keys(skillMap).length);
  },100);

  document.getElementById('skillsCloud').innerHTML=top15.map(([s,c])=>{
    const r=c/maxC;
    const cls=r>0.65?'hot':r>0.35?'warm':'';
    return `<span class="skill-tag ${cls}">${s}</span>`;
  }).join('');

  document.getElementById('trendRows').innerHTML=top10.map(([s,c],i)=>`
    <div class="trend-row">
      <span class="tr-num">${i+1}</span>
      <span class="tr-name">${s}</span>
      <div class="tr-track"><div class="tr-fill" id="tf${i}"></div></div>
      <span class="tr-pct">${Math.round(c/maxC*100)}%</span>
    </div>`).join('');
  setTimeout(()=>top10.forEach(([,c],i)=>{
    const el=document.getElementById('tf'+i);
    if(el) el.style.width=Math.round(c/maxC*100)+'%';
  }),100);

  document.getElementById('jobCountLabel').textContent=total+' results';
  document.getElementById('jobsGrid').innerHTML=jobs.map(j=>{
    const skills=(j.skills||'').split(',').slice(0,4).map(s=>s.trim()).filter(Boolean);
    const isSaved=saved.includes(j.job_title+j.company);
    const rem=(j.remote||'').toLowerCase();
    return `<div class="job-card">
      <div class="jc-left">
        <div class="jc-title">${j.job_title||''}</div>
        <div class="jc-meta">${j.company||''} · ${j.location||''} · ${timeAgo(j.posted_date)}</div>
        <div class="jc-tags">${skills.map(s=>`<span class="jc-tag">${s}</span>`).join('')}</div>
        <div class="jc-summary">${j.summary||''}</div>
      </div>
      <div class="jc-right">
        <span class="jc-level">${j.level||''}</span>
        ${j.salary&&j.salary!=='Not Listed'?`<span class="jc-salary">${j.salary}</span>`:''}
        <span class="jc-remote">${rem==='yes'?'Remote':rem==='hybrid'?'Hybrid':'On-site'}</span>
        ${j.apply_link&&j.apply_link!=='#'?`<a class="btn-apply" href="${j.apply_link}" target="_blank">Apply →</a>`:'<span class="btn-apply" style="opacity:0.4;cursor:default;">Apply →</span>'}
        <button class="btn-save ${isSaved?'saved':''}" onclick="toggleSave('${j.job_title+j.company}',this)">${isSaved?'★':'☆'}</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('results').style.display='block';
  document.getElementById('results').scrollIntoView({behavior:'smooth',block:'start'});
  if(document.getElementById('mySkills').value) runGap();
}

function toggleSave(id,btn){
  const i=saved.indexOf(id);
  if(i===-1){saved.push(id);btn.textContent='★';btn.classList.add('saved');}
  else{saved.splice(i,1);btn.textContent='☆';btn.classList.remove('saved');}
  localStorage.setItem('sm_saved',JSON.stringify(saved));
}

function runGap(){
  const raw=document.getElementById('mySkills').value;
  if(!raw.trim()||!currentJobs.length) return;
  document.getElementById('gapResult').style.display='block';
  const mine=raw.toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
  const sm={};
  currentJobs.forEach(j=>(j.skills||'').split(',').forEach(s=>{s=s.trim();if(s)sm[s]=(sm[s]||0)+1;}));
  const top=Object.entries(sm).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([s])=>s);
  const have=top.filter(s=>mine.some(m=>s.toLowerCase().includes(m)||m.includes(s.toLowerCase())));
  const miss=top.filter(s=>!mine.some(m=>s.toLowerCase().includes(m)||m.includes(s.toLowerCase())));
  const score=Math.round(have.length/top.length*100);
  document.getElementById('gapScore').textContent=score+'%';
  document.getElementById('gapVerdict').textContent=score>=70?'Strong match':score>=40?'Partial match':'Needs work';
  document.getElementById('gapDetail').textContent=`You have ${have.length} of the top ${top.length} required skills`;
  document.getElementById('haveList').innerHTML=have.map(s=>`<div class="gap-skill-item have">✓ ${s}</div>`).join('')||'<div class="gap-skill-item miss">None from top 10</div>';
  document.getElementById('missList').innerHTML=miss.map(s=>`<div class="gap-skill-item miss">— ${s}</div>`).join('');
}

async function subscribe(){
  const email=document.getElementById('digestEmail').value.trim();
  if(!email||!email.includes('@')) return;
  try{
    if(SUBSCRIBE_URL!=='YOUR_SUBSCRIBE_WEBHOOK_HERE')
      await fetch(SUBSCRIBE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
  } catch(e){}
  document.getElementById('digestOk').style.display='block';
  document.getElementById('digestEmail').value='';
}

document.getElementById('roleInput').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});