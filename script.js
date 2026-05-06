// ✅ WEBHOOKS
const SEARCH_WEBHOOK = 'https://n8n-1-ex3t.onrender.com/webhook/job-search';
const GET_WEBHOOK = 'https://n8n-1-ex3t.onrender.com/webhook/get-jobs';

const SUBSCRIBE_URL = 'YOUR_SUBSCRIBE_WEBHOOK_HERE';

let currentJobs = [];
let saved = JSON.parse(localStorage.getItem('sm_saved') || '[]');

// ---------- HELPERS ----------
function timeAgo(d){
  if(!d) return '';
  const days = Math.floor((Date.now() - new Date(d)) / 864e5);
  if(days === 0) return 'Today';
  if(days === 1) return '1 day ago';
  return days + ' days ago';
}

function countUp(el, target, suffix=''){
  let n = 0;
  const step = target / 40;
  const t = setInterval(()=>{
    n = Math.min(n + step, target);
    el.textContent = Math.round(n) + suffix;
    if(n >= target) clearInterval(t);
  }, 30);
}

const loadMsgs = [
  'Fetching live jobs...',
  'Calling job API...',
  'Updating database...',
  'Building your report...'
];

let msgI = 0, msgTimer;

// ---------- MAIN SEARCH ----------
async function doSearch(role){

  if(!role) role = document.getElementById('roleInput').value.trim();
  if(!role){
    document.getElementById('roleInput').focus();
    return;
  }

  document.getElementById('roleInput').value = role;

  document.getElementById('results').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
  document.getElementById('errorMsg').style.display = 'none';

  msgI = 0;
  msgTimer = setInterval(()=>{
    document.getElementById('loadTxt').textContent = loadMsgs[msgI++ % loadMsgs.length];
  }, 1500);

  try{
    // 🔥 STEP 1: trigger pipeline
    await fetch(SEARCH_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: role + ' India' })
    });

    // ⏳ wait for pipeline
    await new Promise(r => setTimeout(r, 3000));

    // 🔥 STEP 2: fetch updated jobs
    const res = await fetch(GET_WEBHOOK);
    const json = await res.json();
    const jobs = json.data || [];

    clearInterval(msgTimer);

    currentJobs = jobs;

    render(jobs, role);

  } catch(e){
    clearInterval(msgTimer);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('errorMsg').style.display = 'block';
    console.error(e);
  }
}

// ---------- RENDER ----------
function render(jobs, role){

  document.getElementById('loading').style.display = 'none';

  const total = jobs.length;

  const remote = jobs.filter(j => (j.remote || '').toLowerCase() === 'yes').length;

  const senior = jobs.filter(j=>{
    const l = (j.level || '').toLowerCase();
    return l.includes('senior') || l.includes('lead');
  }).length;

  const skillMap = {};
  jobs.forEach(j=>{
    (j.skills || '').split(',').forEach(s=>{
      s = s.trim();
      if(s) skillMap[s] = (skillMap[s] || 0) + 1;
    });
  });

  const sorted = Object.entries(skillMap).sort((a,b)=>b[1]-a[1]);
  const top15 = sorted.slice(0,15);
  const top10 = sorted.slice(0,10);
  const maxC = sorted[0]?.[1] || 1;

  document.getElementById('resultsTitle').innerHTML =
    `Market report: <em>${role}</em>`;

  document.getElementById('resultsSub').textContent =
    `${total} jobs analyzed`;

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-item"><div class="stat-n" id="sn1">0</div><div class="stat-l">Jobs analyzed</div></div>
    <div class="stat-item"><div class="stat-n" id="sn2">0%</div><div class="stat-l">Remote roles</div></div>
    <div class="stat-item"><div class="stat-n" id="sn3">0</div><div class="stat-l">Senior / Lead</div></div>
    <div class="stat-item"><div class="stat-n" id="sn4">0</div><div class="stat-l">Unique skills</div></div>
  `;

  setTimeout(()=>{
    countUp(document.getElementById('sn1'), total);
    countUp(document.getElementById('sn2'), Math.round(remote/total*100), '%');
    countUp(document.getElementById('sn3'), senior);
    countUp(document.getElementById('sn4'), Object.keys(skillMap).length);
  },100);

  document.getElementById('skillsCloud').innerHTML = top15.map(([s,c])=>{
    const r = c / maxC;
    const cls = r>0.65?'hot':r>0.35?'warm':'';
    return `<span class="skill-tag ${cls}">${s}</span>`;
  }).join('');

  document.getElementById('trendRows').innerHTML = top10.map(([s,c],i)=>`
    <div class="trend-row">
      <span class="tr-num">${i+1}</span>
      <span class="tr-name">${s}</span>
      <div class="tr-track"><div class="tr-fill" id="tf${i}"></div></div>
      <span class="tr-pct">${Math.round(c/maxC*100)}%</span>
    </div>
  `).join('');

  setTimeout(()=>{
    top10.forEach(([,c],i)=>{
      const el = document.getElementById('tf'+i);
      if(el) el.style.width = Math.round(c/maxC*100)+'%';
    });
  },100);

  document.getElementById('jobCountLabel').textContent = total+' results';

  document.getElementById('jobsGrid').innerHTML = jobs.map(j=>{

    const skills = (j.skills||'')
      .split(',')
      .slice(0,4)
      .map(s=>s.trim());

    const isSaved = saved.includes(j.job_title + j.company);
    const rem = (j.remote||'').toLowerCase();

    const applyLink = j.apply_link || "#";

    return `
    <div class="job-card">
      <div class="jc-left">
        <div class="jc-title">${j.job_title||''}</div>
        <div class="jc-meta">${j.company||''}</div>
        <div class="jc-tags">${skills.map(s=>`<span class="jc-tag">${s}</span>`).join('')}</div>
        <div class="jc-summary">${j.summary||''}</div>
      </div>

      <div class="jc-right">
        <span class="jc-level">${j.level||''}</span>
        ${j.salary && j.salary!=='Not Listed' ? `<span class="jc-salary">${j.salary}</span>` : ''}
        <span class="jc-remote">${rem==='yes'?'Remote':'On-site'}</span>

        <a class="btn-apply" href="${applyLink === '#' ? 
          `https://www.google.com/search?q=${encodeURIComponent(j.job_title + ' ' + j.company + ' apply')}` 
          : applyLink}" target="_blank">
          Apply →
        </a>

        <button class="btn-save ${isSaved?'saved':''}" onclick="toggleSave('${j.job_title+j.company}',this)">
          ${isSaved?'★':'☆'}
        </button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('results').style.display = 'block';
}

// ---------- SAVE ----------
function toggleSave(id,btn){
  const i = saved.indexOf(id);
  if(i===-1){
    saved.push(id);
    btn.textContent='★';
  } else {
    saved.splice(i,1);
    btn.textContent='☆';
  }
  localStorage.setItem('sm_saved', JSON.stringify(saved));
}

// ---------- ENTER KEY ----------
document.getElementById('roleInput')
  .addEventListener('keydown', e=>{
    if(e.key==='Enter') doSearch();
  });