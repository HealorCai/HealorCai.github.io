'use strict';
const $ = id => document.getElementById(id);
const tasks = [
 ['Stack Cups','Sequentially stack the two side cups onto the center cup.',77.78,'Progress milestones: picking and stacking each side cup.','stack-cups'],
 ['Pour Water','Coordinate a bottle and a cup to perform pouring.',87.50,'Progress milestones: lifting the bottle and cup.','pour-water'],
 ['Place Fruit into Box','Place a mango and an apple into a box.',70.83,'Progress milestones: placing each fruit.','place-fruit'],
 ['Put a Wrist Guard into a Drawer','Place the wrist guard into a drawer and then close it.',83.33,'Progress milestones: inserting the wrist guard and closing the drawer.','put-into-drawer']
];
const variations = [
 ['Middle-cup position','Human demonstrations vary the middle-cup position in Stack Cups; this variation is absent from the robot demonstrations.',408,200,'position'],
 ['Wrist rotation','Human demonstrations cover a wrist-rotation variation in Pour Water that is absent from the robot demonstrations.',1105,200,'rotation'],
 ['Distractors in the target box','Human demonstrations introduce distractors in the target box for Place Fruit into Box, covering a setting absent from robot data.',408,568,'distractors'],
 ['Target drawer height','Human demonstrations cover a target drawer height absent from robot data. Cotraining increases SR on this variation from 0% to 100%.',1105,568,'height']
];
let task=0,prediction=0;
let executionSpeed=2;
let transferSpeed=2;
let predictionSpeed=2;
let backgroundSpeed=2;
let simulationSpeed=1;
function pressed(container,key,value){document.querySelectorAll(`#${container} button`).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset[key])===value)));}
function crop(id,x,y,w,h,label){const svg=$(id).querySelector('svg');svg.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);svg.setAttribute('aria-label',label);}
function bar(label,value,accent=false){return `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill ${accent?'accent':''}" style="width:${value}%"></div></div><strong>${value.toFixed(2)}%</strong></div>`;}
function selectTask(i){task=i;pressed('task-tabs','task',i);$('task-title').textContent=tasks[i][0];$('task-description').textContent=tasks[i][1];$('task-score').innerHTML=`${tasks[i][2].toFixed(2)}<span>%</span>`;$('task-insight').textContent=tasks[i][3];$('task-trials').textContent=`· ${i===0?18:24} evaluation trials`;$('execution-video').dataset.media=`execution/${tasks[i][4]}`;$('execution-video').dataset.label=`${tasks[i][0]} · robot execution`;renderMedia($('execution-video'));}
function transfer(i){pressed('transfer-tabs','variation',i);const v=variations[i];$('variation-title').textContent=v[0];$('variation-description').textContent=v[1];crop('transfer-scene',v[2],v[3],690,358,v[0]);const rows=window.SKEL_RESULTS.human;const before=Number(rows[2][i+2].split('/')[0]);const after=Number(rows[3][i+2].split('/')[0]);$('transfer-bars').innerHTML=bar('Robot data only',before)+bar('+ Human demonstrations',after,true);$('transfer-gain').textContent=`+${(after-before).toFixed(2)} percentage points`;['human','cotrain','prediction'].forEach(type=>{const slot=$(`transfer-${type}`);slot.dataset.media=`transfer/${v[4]}/${type}`;renderMedia(slot);});}
function ablation(){const o=$('overlay').checked,k=$('keypoints').checked;const state=o&&k?[86.11,'The full cotrained model achieves 86.11% average SR. Removing overlays reduces SR to 50.00%; removing keypoints reduces SR below 17%, with or without overlays.']:o?[13.89,'Without structured keypoints, the cotrained model achieves 13.89% average SR despite retaining skeleton overlays.']:k?[50,'Without overlays, the cotrained model achieves 50.00% average SR, compared with 86.11% for the full model.']:[16.67,'Removing both skeleton representations reduces cotrained average SR to 16.67%.'];$('ablation-score').innerHTML=`${state[0].toFixed(2)}<span>%</span>`;$('ablation-explanation').textContent=state[1];}
function options(){const rows=window.SKEL_RESULTS[$('benchmark').value];$('result-task').replaceChildren(...rows[0].slice(1).map((label,i)=>new Option(label,i+1)));chart();}
function chart(){const bench=$('benchmark').value,rows=window.SKEL_RESULTS[bench],col=Number($('result-task').value),metric=Number($('metric').value);$('result-chart').innerHTML=rows.slice(1).map(row=>bar(row[0],Number(row[col].split('/')[metric]),row[0]==='Skel-WAM'||row[0]==='Skel-WAM, cotrain')).join('');$('result-context').textContent={real:'Robot-only training · four real-world tasks · 24 trials per task, except Stack Cups (18).',human:'Human-covered task variations · 9 evaluation trials per task. Ablations use human–robot cotraining.',background:'Robot-only training · unseen background · 6 evaluation trials per task.',sim:'Robot-only training · seven EgoVLA-Sim tasks · 93 episodes per task: 27 in-distribution and 66 with unseen tables or backgrounds.',sim_ablation:'Robot-only training · average over seven simulation tasks.'}[bench];filterTables();}
// Add verified local video paths in media.js. Missing assets remain explicit placeholders.
function renderMedia(slot){slot.querySelectorAll('video').forEach(v=>v.pause());slot.replaceChildren();slot.classList.remove('demo-completed');const key=slot.dataset.media;const entry=(window.SKEL_MEDIA||{})[key];if(entry&&entry.src){const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.src=entry.src;if(slot.id==='execution-video'){video.defaultPlaybackRate=executionSpeed;video.playbackRate=executionSpeed;video.addEventListener('loadedmetadata',()=>{video.playbackRate=executionSpeed;});video.addEventListener('ratechange',()=>{executionSpeed=video.playbackRate;updateExecutionSpeedButtons();});}if(slot.dataset.media.startsWith('transfer/')){video.defaultPlaybackRate=transferSpeed;video.playbackRate=transferSpeed;video.addEventListener('loadedmetadata',()=>{video.playbackRate=transferSpeed;});}if(slot.dataset.media.startsWith('prediction/')){video.defaultPlaybackRate=predictionSpeed;video.playbackRate=predictionSpeed;video.addEventListener('loadedmetadata',()=>{video.playbackRate=predictionSpeed;});}if(slot.dataset.media.startsWith('background/')){video.defaultPlaybackRate=backgroundSpeed;video.playbackRate=backgroundSpeed;video.addEventListener('loadedmetadata',()=>{video.playbackRate=backgroundSpeed;});}if(slot.dataset.media.startsWith('simulation/')){video.defaultPlaybackRate=simulationSpeed;video.playbackRate=simulationSpeed;video.addEventListener('loadedmetadata',()=>{video.playbackRate=simulationSpeed;});}video.setAttribute('aria-label',slot.dataset.label);if(entry.poster)video.poster=entry.poster;slot.append(video);attachCompletionState(slot,video,entry);video.addEventListener('error',()=>{const note=document.createElement('p');note.textContent='Video unavailable. Please check the media file.';slot.append(note);});}else{const icon=document.createElement('span');icon.className='play-outline';icon.textContent='▷';const title=document.createElement('strong');title.textContent=slot.dataset.label;const note=document.createElement('span');note.textContent='Video coming soon';slot.append(icon,title,note);}}
document.querySelectorAll('#task-tabs button').forEach(b=>b.addEventListener('click',()=>selectTask(Number(b.dataset.task))));
document.querySelectorAll('#transfer-tabs button').forEach(b=>b.addEventListener('click',()=>transfer(Number(b.dataset.variation))));
document.querySelectorAll('#prediction-tabs button').forEach(b=>b.addEventListener('click',()=>{prediction=Number(b.dataset.prediction);pressed('prediction-tabs','prediction',prediction);['full','without'].forEach(type=>{const slot=$(`prediction-video-${type}`);slot.dataset.media=`prediction/${prediction?'mango':'wrist-guard'}/${type}`;renderMedia(slot);});}));
$('overlay').addEventListener('change',ablation);$('keypoints').addEventListener('change',ablation);$('benchmark').addEventListener('change',options);$('result-task').addEventListener('change',chart);$('metric').addEventListener('change',chart);
document.querySelectorAll('[data-media]').forEach(renderMedia);selectTask(0);transfer(0);options();
function initSync(group){
 const ui=document.querySelector(`[data-sync="${group}"]`);
 const slots={transfer:['transfer-human','transfer-cotrain','transfer-prediction'],prediction:['prediction-video-full','prediction-video-without'],simulation:['sim-execution','sim-prediction'],background:['background-execution','background-prediction']}[group];
 const play=ui.querySelector('[data-action="play"]'),pause=ui.querySelector('[data-action="pause"]'),seek=ui.querySelector('input'),speed=ui.querySelector('select'),status=ui.querySelector('span');
 let videos=[],ready=false;
 function update(){videos=slots.map(id=>$(id).querySelector('video'));ready=videos.every(v=>v&&Number.isFinite(v.duration)&&v.duration>0);[play,pause,seek,speed].forEach(el=>el.disabled=!ready);if(ready){seek.max=Math.min(...videos.map(v=>v.duration));videos.forEach(v=>v.playbackRate=Number(speed.value));status.textContent='';}else{status.textContent=videos.every(Boolean)?'Loading comparison videos…':'';}}
 let binding;
 function bind(){if(binding)binding.abort();binding=new AbortController();const eventOptions={signal:binding.signal};update();videos.filter(Boolean).forEach(v=>{v.addEventListener('loadedmetadata',update,eventOptions);v.addEventListener('error',()=>{ready=false;[play,pause,seek,speed].forEach(el=>el.disabled=true);status.textContent='A comparison video could not be loaded.';},eventOptions);});const leader=videos[0];if(leader)leader.addEventListener('timeupdate',()=>{if(!ready)return;seek.value=leader.currentTime;if(leader.currentTime>=Number(seek.max)){videos.forEach(v=>v.pause());return;}if(!leader.paused)videos.slice(1).forEach(v=>{if(Math.abs(v.currentTime-leader.currentTime)>.2)v.currentTime=leader.currentTime;});},eventOptions);}
 play.addEventListener('click',async()=>{if(!ready)return;const time=Number(seek.value)>=Number(seek.max)?0:Number(seek.value);videos.forEach(v=>v.currentTime=time);const results=await Promise.allSettled(videos.map(v=>v.play()));if(results.some(r=>r.status==='rejected')){videos.forEach(v=>v.pause());status.textContent='Playback failed. Try the individual video controls.';}});
 pause.addEventListener('click',()=>videos.filter(Boolean).forEach(v=>v.pause()));seek.addEventListener('input',()=>{if(ready)videos.forEach(v=>v.currentTime=Number(seek.value));});speed.addEventListener('change',()=>{if(group==='transfer')transferSpeed=Number(speed.value);if(group==='prediction')predictionSpeed=Number(speed.value);if(group==='background')backgroundSpeed=Number(speed.value);if(group==='simulation')simulationSpeed=Number(speed.value);videos.filter(Boolean).forEach(v=>{v.defaultPlaybackRate=Number(speed.value);v.playbackRate=Number(speed.value);});});
 slots.forEach(id=>new MutationObserver(()=>{seek.value=0;bind();}).observe($(id),{childList:true}));bind();
}
initSync('transfer');initSync('prediction');

// Compact task explorers retain the existing media keys.
const simTasks = [
 ['stack-can','Stack can'],['push-box','Push box'],['open-drawer','Open drawer'],
 ['close-drawer','Close drawer'],['flip-mug','Flip mug'],['pour-balls','Pour balls'],['open-laptop','Open laptop']
];
function selectSimulation(i){
 const [key,label]=simTasks[i];
 document.querySelectorAll('[data-sim]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.sim)===i)));
 $('sim-title').textContent=label;
 const row=window.SKEL_RESULTS.sim.find(r=>r[0]==='Skel-WAM');
 $('sim-score').textContent=Number(row[i+2].split('/')[0]).toFixed(2)+'%';
 ['execution','prediction'].forEach(type=>{const slot=$('sim-'+type);slot.dataset.media=`simulation/${key}/${type}`;slot.dataset.label=`${label} · ${type==='prediction'?'visual prediction':'execution'}`;renderMedia(slot);});
}
function selectBackground(i){
 const [key,label]=[['stack-cups','Stack Cups'],['pour-water','Pour Water'],['place-fruit','Place Fruit into Box'],['put-into-drawer','Put a Wrist Guard into a Drawer']][i];
 pressed('background-tabs','background',i);
 ['execution','prediction'].forEach(type=>{const slot=$('background-'+type);slot.dataset.media=`background/${key}/${type}`;slot.dataset.label=`${label} · ${type==='prediction'?'visual prediction':'execution'}`;renderMedia(slot);});
}
function filterTables(){
 const showAll=$('show-all-tables').checked,category=$('benchmark').value;
 document.querySelectorAll('[data-result-table]').forEach(table=>table.hidden=!showAll&&table.dataset.resultTable!==category);
 document.querySelectorAll('[data-result-note]').forEach(note=>note.hidden=!showAll&&note.dataset.resultNote!==category);
}
$('show-all-tables').addEventListener('change',filterTables);
document.querySelectorAll('[data-sim]').forEach(b=>b.addEventListener('click',()=>selectSimulation(Number(b.dataset.sim))));
document.querySelectorAll('[data-background]').forEach(b=>b.addEventListener('click',()=>selectBackground(Number(b.dataset.background))));
// Arrow keys move through related choices; Tab still reaches every control.
document.querySelectorAll('.pills,.sim-directory').forEach(group=>group.addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
 const buttons=Array.from(group.querySelectorAll('button'));const index=buttons.indexOf(document.activeElement);if(index<0)return;
 event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+buttons.length)%buttons.length;
 buttons[next].focus();buttons[next].click();
}));
selectSimulation(0);selectBackground(0);initSync('simulation');initSync('background');
const sectionLinks=Array.from(document.querySelectorAll('.nav>div a'));
const sectionNodes=sectionLinks.map(a=>document.querySelector(a.getAttribute('href')));
let scrollQueued=false;
function updateReading(){
 const length=document.documentElement.scrollHeight-window.innerHeight;
 $('reading-progress').style.width=(length>0?Math.min(100,window.scrollY/length*100):0)+'%';
 let current=-1;sectionNodes.forEach((node,i)=>{if(node&&node.getBoundingClientRect().top<=140)current=i;});
 sectionLinks.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 scrollQueued=false;
}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateReading);}},{passive:true});
window.addEventListener('resize',updateReading);updateReading();
// Pause local clips as they leave the viewport; never auto-start them.
if('IntersectionObserver' in window){const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)entry.target.querySelectorAll('video').forEach(video=>video.pause());}),{threshold:0});document.querySelectorAll('[data-media]').forEach(slot=>visibility.observe(slot));}

function updateExecutionSpeedButtons(){
 document.querySelectorAll('[data-execution-speed]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.executionSpeed)===executionSpeed)));
}
function setExecutionSpeed(speed){
 executionSpeed=speed;
 const video=$('execution-video').querySelector('video');
 if(video){video.defaultPlaybackRate=speed;video.playbackRate=speed;}
 updateExecutionSpeedButtons();
}
document.querySelectorAll('[data-execution-speed]').forEach(button=>button.addEventListener('click',()=>setExecutionSpeed(Number(button.dataset.executionSpeed))));

// completion time marks the first held frame, not the end of the padded file.
function attachCompletionState(slot,video,entry){
 if(!Number.isFinite(entry.completedAt))return;
 const badge=document.createElement('span');
 badge.className='completion-badge';badge.textContent=entry.completionLabel||'✓ Demo completed';badge.hidden=true;
 badge.setAttribute('role','status');slot.append(badge);
 const update=()=>{const completed=video.currentTime>=entry.completedAt;slot.classList.toggle('demo-completed',completed);badge.hidden=!completed;};
 ['timeupdate','seeking','seeked','loadedmetadata','ended'].forEach(event=>video.addEventListener(event,update));
 update();
}

// Slide the chapter navigation over the page without shifting its content.
const chapterNav = $('section-nav');
const chapterToggle = $('nav-toggle');
function setChapterNavigation(open) {
  chapterNav.classList.toggle('is-open', open);
  chapterNav.inert = !open;
  chapterToggle.setAttribute('aria-expanded', String(open));
  const label = open ? 'Collapse navigation' : 'Expand navigation';
  chapterToggle.setAttribute('aria-label', label);
  chapterToggle.title = label;
  chapterToggle.firstElementChild.textContent = open ? '‹' : '›';
}
chapterToggle.addEventListener('click', () => {
  setChapterNavigation(chapterToggle.getAttribute('aria-expanded') !== 'true');
});
chapterNav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    setChapterNavigation(false);
    chapterToggle.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && chapterToggle.getAttribute('aria-expanded') === 'true') {
    setChapterNavigation(false);
    chapterToggle.focus({ preventScroll: true });
  }
});
document.addEventListener('click', event => {
  if (!chapterNav.contains(event.target) && !chapterToggle.contains(event.target)) {
    setChapterNavigation(false);
  }
});
