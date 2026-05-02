const socket = io();

let myId=null, myRoom=null, isHost=false;
let phase='lobby';
let selSkill=null, selTarget=null, selSecondTarget=null, stackCount=1;
let submitted=false, curPlayers=[], curCat='基础';
let sniperMode=false;
let revealTimer=null;

const SK = {
  chong:{n:'冲',c:0,d:'+1费',cat:'基础'},wuzhuang:{n:'武装',c:0,d:'+1费 防2',cat:'基础'},bird:{n:'bird冲',c:0,d:'+1费 免疫近战 反弹弩/狙击',cat:'基础'},
  gaofang:{n:'高防',c:0,d:'防10',cat:'防御'},gangao:{n:'钢高',c:1,d:'防30',cat:'防御'},fantan:{n:'反弹',c:0,d:'反弹/防御(可叠)',cat:'防御',stack:true},
  jiaxue:{n:'加血',c:0,d:'+1血(限3次)',cat:'回血'},shuangjia:{n:'双加',c:1,d:'+2血',cat:'回血'},niurou:{n:'牛肉',c:2,d:'+4血(限1次)',cat:'回血'},zhurou:{n:'猪肉',c:4,d:'+6血(限1次)',cat:'回血'},chaoniu:{n:'超牛',c:10,d:'+10血(限1次)',cat:'回血'},
  xueji:{n:'血祭',c:0,d:'群伤2 自损1',cat:'血攻',selfDmg:1},
  xuehen:{n:'血痕',c:0,d:'群伤4 自损2',cat:'血攻',selfDmg:2},
  xuelun:{n:'血轮',c:0,d:'群伤6 自损4',cat:'血攻',selfDmg:4},
  xueyu:{n:'血浴',c:0,d:'群伤7 需八卦',cat:'血攻',consumeBagua:1},
  shuangxuelun:{n:'双血轮',c:0,d:'群伤12 自损8',cat:'血攻',selfDmg:8},
  shuangxueyu:{n:'双血浴',c:0,d:'群伤14 需2八卦',cat:'血攻',consumeBagua:2},
  bagua:{n:'八卦',c:1,d:'抵御≤30伤害',cat:'挂件'},shuangbagua:{n:'双八卦',c:2,d:'抵御≤30×2',cat:'挂件'},baguazhen:{n:'八卦阵',c:3,d:'防60(可叠)',cat:'挂件',stack:true},
  keqi:{n:'可弃',c:0,d:'判定:武装/高防',cat:'判定'},daniao:{n:'打鸟',c:0,d:'判定:bird冲',cat:'判定'},keda:{n:'可打',c:1,d:'判定:鸟/武装/高防',cat:'判定'},quanke:{n:'拳可',c:3,d:'群判∞ 破八卦',cat:'判定'},zhonglie:{n:'重裂',c:3,d:'群判∞ 对bird',cat:'判定'},chaoke:{n:'超可',c:5,d:'群判∞ 对钢/武装/高防',cat:'判定'},shuangke:{n:'双可',c:1,d:'2×可弃 可分目标',cat:'判定',split:true},
  xiaodao:{n:'小刀',c:0,d:'近战1 +1刀',cat:'近战'},shuangdao:{n:'双刀',c:1,d:'近战2 +2刀 可分',cat:'近战',split:true},sidao:{n:'四刀',c:2,d:'近战4 +4刀 可分',cat:'近战',split:true},zhua:{n:'爪',c:1,d:'近战3/个 需刀(可叠)',cat:'近战',stack:true},
  baibao:{n:'白爆',c:1,d:'群伤1(可叠)',cat:'远程',stack:true},danbao:{n:'单爆',c:3,d:'群伤5 不可反弹',cat:'远程'},hongbao:{n:'红爆',c:4,d:'群伤8 不可反弹',cat:'远程'},nu:{n:'弩',c:1,d:'远程1.5 破武装防 被bird反弹',cat:'远程'},juji:{n:'狙击',c:1,d:'远程1 破武装防 先出招后选目标 被bird反弹',cat:'远程'},
  pojun:{n:'破军',c:10,d:'近战群100',cat:'终极'},poguo:{n:'破国',c:15,d:'远程群100',cat:'终极'},heidong:{n:'黑洞',c:20,d:'秒杀全场',cat:'终极'},baidong:{n:'白洞',c:3,d:'抵御黑洞',cat:'终极'},
  aoli:{n:'奥利给',c:0,d:'+3费 自损1',cat:'特殊'},
};

const CATS=['基础','防御','回血','血攻','挂件','判定','近战','远程','终极','特殊'];
const CAT_COLORS={'基础':'var(--cat-basic)','防御':'var(--cat-def)','回血':'var(--cat-heal)','血攻':'var(--cat-blood)','挂件':'var(--cat-buff)','判定':'var(--cat-judge)','近战':'var(--cat-melee)','远程':'var(--cat-ranged)','终极':'var(--cat-ulti)','特殊':'var(--cat-spec)'};
const NEED_TG=['xiaodao','shuangdao','sidao','nu','keqi','daniao','keda','shuangke','juji'];
const GROUP_SKILLS=['xueji','xuehen','xuelun','xueyu','shuangxuelun','shuangxueyu','baibao','danbao','hongbao','pojun','poguo','heidong','quanke','zhonglie','chaoke'];

const EMOJIS = [
  {id:'taunt',icon:'😤',label:'来啊！'},{id:'smug',icon:'😏',label:'你不行'},{id:'scared',icon:'😱',label:'完了'},
  {id:'laugh',icon:'😂',label:'笑死'},{id:'skull',icon:'💀',label:'等死吧'},{id:'pray',icon:'🙏',label:'饶命'},
  {id:'cool',icon:'😎',label:'就这？'},{id:'fire',icon:'🔥',label:'燃起来了'},{id:'angel',icon:'😇',label:'下辈子吧'},{id:'muscle',icon:'💪',label:'看我的'},
];

const $ = id => document.getElementById(id);
function showScreen(n){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('s-'+n).classList.add('active');}

// 表情
function initEmojiPanel() {
  $('emoji-panel').innerHTML = EMOJIS.map(e =>
    `<div class="emoji-btn" data-eid="${e.id}"><span class="eb-icon">${e.icon}</span><span class="eb-label">${e.label}</span></div>`
  ).join('');
  document.querySelectorAll('.emoji-btn').forEach(el => {
    el.onclick = () => { socket.emit('sendEmoji', { emojiId: el.dataset.eid }); $('emoji-panel').style.display='none'; };
  });
}
$('emoji-toggle').onclick = () => { const p=$('emoji-panel'); p.style.display=p.style.display==='none'?'grid':'none'; };
document.addEventListener('click', e => { if (!e.target.closest('.emoji-bar')) $('emoji-panel').style.display='none'; });
function showFloatingEmoji(pid, emoji) {
  const card = document.querySelector(`.pc[data-pid="${pid}"]`);
  if (!card) return;
  const el = document.createElement('div'); el.className='float-emoji'; el.textContent=emoji;
  card.appendChild(el); setTimeout(()=>el.remove(), 2000);
}

// 大厅
$('btn-create').onclick = () => {
  const name = $('inp-name').value.trim();
  if (!name) return alert('请输入名字');
  socket.emit('createRoom', {name}, ({roomId, playerId, error}) => {
    if (error) return alert(error);
    myId=playerId; myRoom=roomId; isHost=true;
    $('d-room').textContent=roomId; $('btn-start').style.display='block'; showScreen('wait');
  });
};
$('btn-join').onclick = () => {
  const name = $('inp-name').value.trim();
  const rid = $('inp-room').value.trim().toUpperCase();
  if (!name) return alert('请输入名字');
  if (!rid) return alert('请输入房间号');
  socket.emit('joinRoom', {roomId:rid, name}, ({roomId, playerId, error}) => {
    if (error) return alert(error);
    myId=playerId; myRoom=roomId; isHost=false;
    $('d-room').textContent=roomId; $('btn-start').style.display='none'; showScreen('wait');
  });
};
$('btn-copy').onclick = () => { navigator.clipboard?.writeText(myRoom); $('btn-copy').textContent='✓'; setTimeout(()=>$('btn-copy').textContent='复制',1200); };
$('btn-start').onclick = () => socket.emit('startGame');
$('btn-back').onclick = () => location.reload();
$('btn-restart').onclick = () => socket.emit('restartGame');
$('inp-name').onkeydown = e => { if(e.key==='Enter') $('btn-create').click(); };
$('inp-room').onkeydown = e => { if(e.key==='Enter') $('btn-join').click(); };

function renderWait(ps) {
  $('wait-list').innerHTML = ps.map(p =>
    `<div class="lp"><b>${p.name}${p.id===myId?' (你)':''}</b>${p.isHost?'<span class="badge">房主</span>':''}</div>`
  ).join('');
  if (isHost && ps.length >= 2) $('btn-start').style.display='block';
}

function getMe() { return curPlayers.find(p=>p.id===myId); }

// ★ 血攻使用条件检查
function isSkillUsable(id, me) {
  if (!me) return true;
  const sk = SK[id];
  if (!sk) return false;
  if (!sk.stack && me.fee < sk.c) return false;
  if (sk.selfDmg && me.hp < sk.selfDmg) return false;
  if (sk.consumeBagua && me.bagua < sk.consumeBagua) return false;
  return true;
}

function renderPlayers(ps) {
  curPlayers = ps;
  const me = getMe();
  if (me) { $('my-hp').textContent=Math.max(0,me.hp); $('my-fee').textContent=me.fee; $('my-knives').textContent=me.knives; $('my-bagua').textContent=me.bagua; }
  const needTg = !sniperMode && NEED_TG.includes(selSkill);
  const needSecond = !sniperMode && SK[selSkill]?.split && selTarget;
  $('area-p').innerHTML = ps.map(p => {
    const cls = ['pc'];
    if (p.id===myId) cls.push('self');
    if (!p.alive) cls.push('dead');
    if (p.id===selTarget || p.id===selSecondTarget) cls.push('target');
    if (p.hasChosen && p.alive && phase==='selecting') cls.push('ready');
    if ((needTg || needSecond || sniperMode) && p.id!==myId && p.alive) cls.push('can-tg');
    if (sniperMode && p.id===myId) cls.push('can-tg');
    let badge = '';
    if (p.hasChosen && p.alive && phase==='selecting') badge = '<span class="ready-badge">✓</span>';
    return `<div class="${cls.join(' ')}" data-pid="${p.id}">${badge}
      <div class="pn">${p.name}${p.id===myId?'(你)':''}${p.alive?'':' ☠'}</div>
      <div class="ps">❤<b>${Math.max(0,p.hp)}</b> ⚡<b>${p.fee}</b>${p.knives?' 🔪'+p.knives:''}${p.bagua?' 🔮'+p.bagua:''}</div>
    </div>`;
  }).join('');
  bindCardClicks();
}

function renderPlayersWithReveal(ps, choices) {
  curPlayers = ps;
  const me = getMe();
  if (me) { $('my-hp').textContent=Math.max(0,me.hp); $('my-fee').textContent=me.fee; $('my-knives').textContent=me.knives; $('my-bagua').textContent=me.bagua; }
  $('area-p').innerHTML = ps.map(p => {
    const cls = ['pc'];
    if (p.id===myId) cls.push('self');
    if (!p.alive) cls.push('dead');
    if (sniperMode && p.alive && p.id!==myId) cls.push('can-tg');
    if (sniperMode && p.id===myId) cls.push('can-tg');
    const choice = choices?.find(c=>c.id===p.id);
    let skLine = '';
    if (choice && choice.skillName && p.alive) {
      let txt = choice.skillName;
      if (choice.stackCount > 1) txt += ' ×' + choice.stackCount;
      skLine = `<div class="sk-reveal">${txt}</div>`;
    }
    return `<div class="${cls.join(' ')}" data-pid="${p.id}">
      <div class="pn">${p.name}${p.id===myId?'(你)':''}${p.alive?'':' ☠'}</div>
      <div class="ps">❤<b>${Math.max(0,p.hp)}</b> ⚡<b>${p.fee}</b>${p.knives?' 🔪'+p.knives:''}${p.bagua?' 🔮'+p.bagua:''}</div>
      ${skLine}
    </div>`;
  }).join('');
  bindCardClicks();
}

function bindCardClicks() {
  document.querySelectorAll('.can-tg').forEach(el => {
    el.onclick = () => {
      const pid = el.dataset.pid;
      if (sniperMode) { pickSniperTarget(pid); return; }
      const needS = SK[selSkill]?.split && selTarget;
      if (needS && pid !== selTarget) { selSecondTarget = pid; }
      else { selTarget = pid; selSecondTarget=null; }
      renderPlayers(curPlayers); showConfirm();
    };
  });
}

function renderCatTabs() {
  $('cat-tabs').innerHTML = CATS.map(c =>
    `<div class="ct${c===curCat?' sel':''}" data-cat="${c}" style="border-color:${CAT_COLORS[c]};${c===curCat?'background:'+CAT_COLORS[c]+';color:var(--bg)':''}">${c}</div>`
  ).join('');
  document.querySelectorAll('.ct').forEach(el => { el.onclick = () => { curCat=el.dataset.cat; renderCatTabs(); renderSkills(); }; });
}

function renderSkills() {
  const me = getMe();
  const skillsInCat = Object.entries(SK).filter(([_,s])=>s.cat===curCat);
  $('grid-sk').innerHTML = skillsInCat.map(([id,s]) => {
    const feeOk = me ? me.fee >= (s.stack ? 0 : s.c) : true;
    const usable = isSkillUsable(id, me);
    const cls = ['sb'];
    if (selSkill===id) cls.push('sel');
    if (!feeOk || !usable || submitted || phase!=='selecting') cls.push('off');
    const cc = CAT_COLORS[s.cat] || 'var(--dim)';
    return `<div class="${cls.join(' ')}" data-sid="${id}">
      <div class="sn">${s.n}</div><div class="sd">${s.d}</div>
      ${s.c>0?`<div class="sc" style="color:${cc}">-${s.c}费</div>`:''}
    </div>`;
  }).join('');
  if (!submitted && phase==='selecting') {
    document.querySelectorAll('.sb:not(.off)').forEach(el => { el.onclick = () => pickSkill(el.dataset.sid); });
  }
}

function updateStackPanel() {
  const sk = SK[selSkill];
  if (!sk || !sk.stack) { $('stack-panel').style.display='none'; return; }
  $('stack-panel').style.display='flex';
  $('stk-val').textContent = stackCount;
  const me = getMe();
  let cost;
  if (selSkill==='fantan') cost = Math.max(0, stackCount-1);
  else if (selSkill==='zhua') cost = stackCount;
  else cost = (sk.c||1) * stackCount;
  let extra = selSkill==='zhua' ? ` | 需${stackCount}刀` : '';
  $('stk-cost').textContent = `费用: ${cost}费${extra}`;
}

$('stk-minus').onclick = () => { if(stackCount>1) stackCount--; updateStackPanel(); };
$('stk-plus').onclick = () => {
  const me = getMe(); if(!me) return;
  let max = 8;
  if (selSkill==='fantan') max = me.fee + 1;
  else if (selSkill==='zhua') max = Math.min(8, me.knives, me.fee);
  else if (selSkill==='baguazhen') max = Math.floor(me.fee / 3) || 1;
  else if (selSkill==='baibao') max = me.fee || 1;
  if (stackCount < max) stackCount++;
  updateStackPanel();
};

function pickSkill(sid) {
  if (submitted || phase !== 'selecting') return;
  selSkill = sid; selTarget = null; selSecondTarget = null; stackCount = 1; sniperMode = false;
  const sk = SK[sid];
  const isGroup = GROUP_SKILLS.includes(sid);
  const needTg = NEED_TG.includes(sid);
  if (sk?.stack) { updateStackPanel(); } else { $('stack-panel').style.display='none'; }
  if (sid === 'juji') { submit(); return; }
  if (isGroup || !needTg) { submit(); return; }
  const others = curPlayers.filter(p=>p.id!==myId && p.alive);
  if (others.length === 1 && !sk?.split) { selTarget = others[0].id; submit(); return; }
  renderSkills(); renderPlayers(curPlayers);
  $('target-hint').textContent = sk?.split ? '点击玩家卡片选择主目标' : '点击玩家卡片选择目标';
  $('target-hint').style.display = 'block';
}

function showConfirm() {
  const sk = SK[selSkill]; if (!sk) { $('panel-cfm').style.display='none'; return; }
  const needTg = NEED_TG.includes(selSkill);
  const isGroup = GROUP_SKILLS.includes(selSkill);
  if (needTg && !selTarget && !isGroup) { $('panel-cfm').style.display='none'; return; }
  let txt = sk.n;
  if (stackCount > 1) txt += ` ×${stackCount}`;
  if (isGroup) txt += ' → 全体';
  else if (selTarget) {
    const t = curPlayers.find(p=>p.id===selTarget);
    txt += ` → ${t?.name||'?'}`;
    if (selSecondTarget) { const t2 = curPlayers.find(p=>p.id===selSecondTarget); txt += ` + ${t2?.name||'?'}`; }
  }
  $('cfm-txt').textContent = txt;
  $('panel-cfm').style.display = 'flex';
  $('target-hint').style.display = 'none';
}

$('btn-cfm').onclick = () => submit();
$('btn-cancel').onclick = () => {
  selSkill=null; selTarget=null; selSecondTarget=null; stackCount=1;
  $('panel-cfm').style.display='none'; $('target-hint').style.display='none'; $('stack-panel').style.display='none';
  renderSkills(); renderPlayers(curPlayers);
};

function submit() {
  if (!selSkill || submitted) return;
  submitted = true;
  socket.emit('selectSkill', { skillId:selSkill, targetId:selTarget||null, secondTargetId:selSecondTarget||null, stackCount });
  $('panel-cfm').style.display='none'; $('target-hint').style.display='none'; $('stack-panel').style.display='none';
  $('d-status').textContent = '已出招，等待其他玩家…';
  renderSkills();
}

function pickSniperTarget(pid) {
  socket.emit('selectSniperTarget', { targetId: pid });
  sniperMode = false;
  $('sniper-panel').style.display = 'none';
  $('d-status').textContent = '狙击已发射，等待结算…';
  renderPlayers(curPlayers);
}

function showReveal(choices) {
  const overlay = $('reveal-overlay');
  const container = $('reveal-cards');
  container.innerHTML = choices.map(c => {
    const sk = SK[c.skillId];
    const cat = sk?.cat || '';
    const color = CAT_COLORS[cat] || 'var(--dim)';
    let extra = c.stackCount > 1 ? `×${c.stackCount}` : '';
    const p = curPlayers.find(pp=>pp.id===c.id);
    const isDead = p && !p.alive;
    return `<div class="rc${isDead?' dead-card':''}">
      <div class="rc-name">${c.name}${c.id===myId?'(你)':''}</div>
      ${c.skillName ? `<div class="rc-skill" style="background:${color}22;color:${color};border:1px solid ${color}44">${c.skillName}${extra?' '+extra:''}</div>` : '<div class="rc-skill" style="color:var(--dim)">已阵亡</div>'}
    </div>`;
  }).join('');
  overlay.style.display = 'flex';
  clearTimeout(revealTimer);
  revealTimer = setTimeout(() => { overlay.style.display = 'none'; }, 4000);
}

function addLog(lines) {
  const el = $('log-el');
  lines.forEach(t => {
    const d = document.createElement('div');
    d.className = 'll' + (t.startsWith('📋')||t.startsWith('☠️')||t.startsWith('🏆') ? ' section' : '');
    d.textContent = t; el.appendChild(d);
  });
  el.scrollTop = el.scrollHeight;
}

// ★ 隐藏/显示游戏UI（用于结算状态切换）
function hideGameUI() {
  ['cat-tabs','grid-sk','stack-panel','target-hint','panel-cfm','sniper-panel'].forEach(id => $(id).style.display='none');
  $('emoji-panel').style.display='none';
}
function showGameUI() {
  $('cat-tabs').style.display='flex';
  $('grid-sk').style.display='grid';
  $('gameover-bar').style.display='none';
}

// ==================== Socket ====================
initEmojiPanel();

socket.on('playerUpdate', ({players}) => {
  if ($('s-wait').classList.contains('active')) renderWait(players);
});

socket.on('gameStart', ({round, log, players}) => {
  showScreen('game');
  phase='selecting'; submitted=false; sniperMode=false;
  showGameUI();
  $('d-round').textContent=`回合 ${round}`;
  $('d-status').textContent='第一回合强制出"冲"';
  $('log-el').innerHTML='';
  $('reveal-overlay').style.display='none';
  $('sniper-panel').style.display='none';
  renderCatTabs(); renderPlayers(players); renderSkills();
  addLog(log);
});

socket.on('roundStart', ({round, players}) => {
  phase='selecting'; submitted=false; sniperMode=false;
  selSkill=null; selTarget=null; selSecondTarget=null; stackCount=1;
  showGameUI();
  $('d-round').textContent=`回合 ${round}`;
  $('d-status').textContent='选择招式中…';
  $('panel-cfm').style.display='none';
  $('target-hint').style.display='none';
  $('stack-panel').style.display='none';
  $('sniper-panel').style.display='none';
  $('reveal-overlay').style.display='none';
  $('log-el').innerHTML='';
  renderPlayers(players); renderCatTabs(); renderSkills();
});

socket.on('playerReady', ({playerId, players}) => { renderPlayers(players); });

socket.on('revealPhase', ({choices}) => {
  phase='reveal'; submitted=false;
  $('d-status').textContent='揭示招式…';
  showReveal(choices);
  renderPlayersWithReveal(curPlayers, choices);
});

socket.on('roundResult', ({log, players}) => {
  phase='resolving'; submitted=false; sniperMode=false;
  $('d-status').textContent='结算中…';
  $('sniper-panel').style.display='none';
  $('reveal-overlay').style.display='none';
  addLog(log); renderPlayers(players); renderSkills();
});

socket.on('sniperPhase', ({players, choices}) => {
  phase='sniper'; sniperMode=true; submitted=false;
  $('d-status').textContent='🎯 狙击阶段：选择目标';
  $('sniper-panel').style.display='block';
  renderPlayersWithReveal(players, choices);
  renderSkills();
});

socket.on('waitingSniper', () => {
  phase='sniper-wait';
  $('d-status').textContent='等待狙击手选择目标…';
});

socket.on('sniperConfirmed', () => {
  $('sniper-panel').style.display='none';
  $('d-status').textContent='狙击已发射，等待结算…';
});

socket.on('showEmoji', ({playerId, playerName, emojiId}) => {
  const em = EMOJIS.find(e=>e.id===emojiId);
  if (!em) return;
  showFloatingEmoji(playerId, em.icon);
  addLog([`${em.icon} ${playerName}：${em.label}`]);
});

// ★ 游戏结束：停留在游戏界面，显示结算栏
socket.on('gameOver', ({message, players}) => {
  phase='ended';
  $('reveal-overlay').style.display='none';
  hideGameUI();
  $('d-status').textContent='游戏结束';

  $('gameover-bar').style.display='block';
  $('gameover-txt').textContent=message;
  $('btn-restart').style.display = isHost ? 'inline-block' : 'none';

  addLog(['', message]);
  renderPlayers(players);
});

socket.on('gameReset', ({players}) => {
  showGameUI();
  showScreen('wait');
  renderWait(players);
});
