const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, 'public')));

// ===================== 41个技能 =====================
const SKILLS = {
  chong:    { name:'冲',     cat:'基础', cost:0,  feeGain:1, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'none',   group:false, maxUse:999 },
  wuzhuang: { name:'武装',   cat:'基础', cost:0,  feeGain:1, def:2,  dmg:0,  selfDmg:0, heal:0,  type:'melee',  group:false, maxUse:999 },
  bird:     { name:'bird冲', cat:'基础', cost:0,  feeGain:1, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'melee',  group:false, maxUse:999, immuneMelee:true },
  gaofang:  { name:'高防',   cat:'防御', cost:0,  feeGain:0, def:10, dmg:0,  selfDmg:0, heal:0,  type:'none',   group:false, maxUse:999 },
  gangao:   { name:'钢高',   cat:'防御', cost:1,  feeGain:0, def:30, dmg:0,  selfDmg:0, heal:0,  type:'none',   group:false, maxUse:999 },
  fantan:   { name:'反弹',   cat:'防御', cost:0,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'reflect',group:false, maxUse:999, stackable:true },
  jiaxue:   { name:'加血',   cat:'回血', cost:0,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:1,  type:'none',   group:false, maxUse:3 },
  shuangjia:{ name:'双加',   cat:'回血', cost:1,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:2,  type:'none',   group:false, maxUse:999 },
  niurou:   { name:'牛肉',   cat:'回血', cost:2,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:4,  type:'none',   group:false, maxUse:1 },
  zhurou:   { name:'猪肉',   cat:'回血', cost:4,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:6,  type:'none',   group:false, maxUse:1 },
  chaoniu:  { name:'超牛',   cat:'回血', cost:10, feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:10, type:'none',   group:false, maxUse:1 },
  xueji:    { name:'血祭',   cat:'血攻', cost:0,  feeGain:0, def:0,  dmg:2,  selfDmg:1, heal:0,  type:'ranged', group:true,  maxUse:999 },
  xuehen:   { name:'血痕',   cat:'血攻', cost:0,  feeGain:0, def:0,  dmg:4,  selfDmg:2, heal:0,  type:'ranged', group:true,  maxUse:999 },
  xuelun:   { name:'血轮',   cat:'血攻', cost:0,  feeGain:0, def:0,  dmg:6,  selfDmg:4, heal:0,  type:'ranged', group:true,  maxUse:999, ignoreBagua:true },
  xueyu:    { name:'血浴',   cat:'血攻', cost:0,  feeGain:0, def:0,  dmg:7,  selfDmg:0, heal:0,  type:'ranged', group:true,  maxUse:999, consumeBagua:1 },
  shuangxuelun:{name:'双血轮',cat:'血攻',cost:0,  feeGain:0, def:0,  dmg:12, selfDmg:8, heal:0,  type:'ranged', group:true,  maxUse:999, ignoreBagua:true },
  shuangxueyu:{name:'双血浴',cat:'血攻', cost:0,  feeGain:0, def:0,  dmg:14, selfDmg:0, heal:0,  type:'ranged', group:true,  maxUse:999, consumeBagua:2 },
  bagua:    { name:'八卦',   cat:'挂件', cost:1,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'buff',   group:false, maxUse:999, addBagua:1 },
  shuangbagua:{name:'双八卦',cat:'挂件', cost:2,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'buff',   group:false, maxUse:999, addBagua:2 },
  baguazhen:{ name:'八卦阵', cat:'挂件', cost:3,  feeGain:0, def:60, dmg:0,  selfDmg:0, heal:0,  type:'buff',   group:false, maxUse:999, stackable:true },
  keqi:     { name:'可弃',   cat:'判定', cost:0,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'judge',  group:false, maxUse:999, judgeTargets:['wuzhuang','gaofang','gangao'], judgeDmg:1 },
  daniao:   { name:'打鸟',   cat:'判定', cost:0,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'judge',  group:false, maxUse:999, judgeTargets:['bird'], judgeDmg:1 },
  keda:     { name:'可打',   cat:'判定', cost:1,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'judge',  group:false, maxUse:999, judgeTargets:['bird','wuzhuang','gaofang'], judgeDmg:1 },
  quanke:   { name:'拳可',   cat:'判定', cost:3,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'judge',  group:true,  maxUse:999, judgeTargets:['wuzhuang','gaofang','gangao'], judgeDmg:Infinity, breakBagua:1 },
  zhonglie: { name:'重裂',   cat:'判定', cost:3,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'judge',  group:true,  maxUse:999, judgeTargets:['bird'], judgeDmg:Infinity },
  chaoke:   { name:'超可',   cat:'判定', cost:5,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'judge',  group:true,  maxUse:999, judgeTargets:['gangao','wuzhuang','gaofang'], judgeDmg:Infinity },
  shuangke: { name:'双可',   cat:'判定', cost:1,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'judge',  group:false, maxUse:999, judgeTargets:['wuzhuang','gaofang','gangao'], judgeDmg:1, judgeCount:2, canSplit:true },
  xiaodao:  { name:'小刀',   cat:'近战', cost:0,  feeGain:0, def:0,  dmg:1,  selfDmg:0, heal:0,  type:'melee',  group:false, maxUse:999, addKnife:1 },
  shuangdao:{ name:'双刀',   cat:'近战', cost:1,  feeGain:0, def:0,  dmg:2,  selfDmg:0, heal:0,  type:'melee',  group:false, maxUse:999, addKnife:2, canSplit:true },
  sidao:    { name:'四刀',   cat:'近战', cost:2,  feeGain:0, def:0,  dmg:4,  selfDmg:0, heal:0,  type:'melee',  group:false, maxUse:999, addKnife:4, canSplit:true },
  zhua:     { name:'爪',     cat:'近战', cost:1,  feeGain:0, def:0,  dmg:3,  selfDmg:0, heal:0,  type:'melee',  group:false, maxUse:999, needKnife:true, stackable:true, maxStack:8 },
  baibao:   { name:'白爆',   cat:'远程', cost:1,  feeGain:0, def:0,  dmg:1,  selfDmg:0, heal:0,  type:'ranged', group:true,  maxUse:999, stackable:true },
  danbao:   { name:'单爆',   cat:'远程', cost:3,  feeGain:0, def:0,  dmg:5,  selfDmg:0, heal:0,  type:'ranged', group:true,  maxUse:999, unreflectable:true },
  hongbao:  { name:'红爆',   cat:'远程', cost:4,  feeGain:0, def:0,  dmg:8,  selfDmg:0, heal:0,  type:'ranged', group:true,  maxUse:999, unreflectable:true },
  nu:       { name:'弩',     cat:'远程', cost:1,  feeGain:0, def:0,  dmg:1.5,selfDmg:0, heal:0,  type:'ranged', group:false, maxUse:999, immuneWuzhuangDef:true, reflectByBird:true },
  juji:     { name:'狙击',   cat:'远程', cost:1,  feeGain:0, def:0,  dmg:1,  selfDmg:0, heal:0,  type:'ranged', group:false, maxUse:999, sniperPhase:true, reflectByBird:true, immuneWuzhuangDef:true },
  pojun:    { name:'破军',   cat:'终极', cost:10, feeGain:0, def:0,  dmg:100,selfDmg:0, heal:0,  type:'melee',  group:true,  maxUse:999 },
  poguo:    { name:'破国',   cat:'终极', cost:15, feeGain:0, def:0,  dmg:100,selfDmg:0, heal:0,  type:'ranged', group:true,  maxUse:999 },
  heidong:  { name:'黑洞',   cat:'终极', cost:20, feeGain:0, def:0,  dmg:9999,selfDmg:0,heal:0,  type:'ranged', group:true,  maxUse:999, isHeidong:true },
  baidong:  { name:'白洞',   cat:'终极', cost:3,  feeGain:0, def:0,  dmg:0,  selfDmg:0, heal:0,  type:'special',group:false, maxUse:999, blockHeidong:true },
  aoli:     { name:'奥利给', cat:'特殊', cost:0,  feeGain:3, def:0,  dmg:0,  selfDmg:1, heal:0,  type:'none',   group:false, maxUse:999 },
};

const SKILL_NAME = {};
for (const [k,v] of Object.entries(SKILLS)) SKILL_NAME[k] = v.name;

// ===================== 房间管理 =====================
const rooms = {};
const makeId = () => Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*30)]).join('');

function createRoom(hostId, name) {
  const id = makeId();
  rooms[id] = { id, hostId, players:{}, phase:'waiting', round:0, log:[], pendingSnipers:null };
  joinRoom(id, hostId, name);
  return id;
}
function joinRoom(rid, pid, name) {
  rooms[rid].players[pid] = {
    id:pid, name, hp:1, fee:0, def:0, knives:0, bagua:0,
    immuneMelee:false, reflectPool:0, hasBaidong:false,
    skillsUsed:{}, alive:true, hasChosen:false,
    skill:null, target:null, secondTarget:null, stackCount:1,
    isSniper:false, sniperTarget:null, snipeHeaven:false
  };
}
function findRoom(pid) { return Object.values(rooms).find(r => r.players[pid]); }

function pubState(room) {
  return Object.values(room.players).map(p => ({
    id:p.id, name:p.name, hp:p.hp, fee:p.fee, knives:p.knives, bagua:p.bagua,
    alive:p.alive, isHost:p.id===room.hostId, hasChosen:p.hasChosen,
    skillsUsed:{...p.skillsUsed}
  }));
}
function revealState(room) {
  return Object.values(room.players).map(p => ({
    id:p.id, name:p.name, alive:p.alive,
    skillId:p.skill, skillName: p.skill ? SKILL_NAME[p.skill] : null,
    target:p.target, secondTarget:p.secondTarget, stackCount:p.stackCount||1
  }));
}

function calcCost(sk, count) {
  if (sk.name === '反弹') return Math.max(0, count - 1);
  if (sk.name === '爪') return count;
  if (sk.stackable) return sk.cost * count;
  return sk.cost;
}

// ===================== 游戏流程 =====================
function startGame(rid) {
  const room = rooms[rid];
  room.phase = 'firstRound'; room.round = 1;
  room.log = ['🎮 游戏开始！第一回合强制出"冲"'];
  Object.values(room.players).forEach(p => {
    p.hp=1; p.fee=0; p.def=0; p.knives=0; p.bagua=0;
    p.immuneMelee=false; p.reflectPool=0; p.hasBaidong=false;
    p.skillsUsed={}; p.alive=true; p.hasChosen=true;
    p.skill='chong'; p.stackCount=1; p.target=null; p.secondTarget=null;
    p.isSniper=false; p.sniperTarget=null; p.snipeHeaven=false;
  });
  io.to(rid).emit('gameStart', { round:1, log:room.log, players:pubState(room) });
  setTimeout(() => {
    room.phase = 'reveal';
    io.to(rid).emit('revealPhase', { choices: revealState(room) });
    setTimeout(() => resolveRound(rid), 4000);
  }, 2000);
}

function beginSelect(rid) {
  const room = rooms[rid];
  room.phase = 'selecting'; room.round++; room.log = [];
  Object.values(room.players).forEach(p => {
    if (p.alive) {
      p.skill=null; p.target=null; p.secondTarget=null; p.stackCount=1;
      p.def=0; p.immuneMelee=false; p.reflectPool=0; p.hasBaidong=false;
      p.isSniper=false; p.sniperTarget=null; p.hasChosen=false;
    }
  });
  io.to(rid).emit('roundStart', { round:room.round, players:pubState(room) });
}

function tryLock(rid) {
  const room = rooms[rid];
  const alive = Object.values(room.players).filter(p=>p.alive);
  if (!alive.every(p=>p.hasChosen)) return;

  room.phase = 'reveal';
  io.to(rid).emit('revealPhase', { choices: revealState(room) });

  setTimeout(() => {
    const snipers = alive.filter(p => SKILLS[p.skill]?.sniperPhase && p.alive);
    if (snipers.length > 0) {
      room.phase = 'sniperPhase';
      room.pendingSnipers = new Set(snipers.map(s=>s.id));
      for (const s of snipers) {
        io.to(s.id).emit('sniperPhase', { players:pubState(room), choices:revealState(room) });
      }
      for (const p of alive) {
        if (!room.pendingSnipers.has(p.id)) io.to(p.id).emit('waitingSniper');
      }
    } else {
      resolveRound(rid);
    }
  }, 4000);
}

// ===================== 结算 =====================
function resolveRound(rid) {
  const room = rooms[rid];
  room.phase = 'resolving';
  const log = [];

  const participants = Object.values(room.players).filter(p => p.alive);
  const deathsThisRound = [];

  const markDead = (p, msg) => {
    if (p.hp <= 0 && !deathsThisRound.includes(p.id)) {
      deathsThisRound.push(p.id);
      log.push(`💀 ${p.name}${msg || ' 阵亡！'}`);
    }
  };

  const eject = (p, msg) => {
    p.alive = false;
    if (!deathsThisRound.includes(p.id)) deathsThisRound.push(p.id);
    log.push(`⚠️ ${p.name}${msg || ' 犯规出局！'}`);
  };

  // 招式公告
  log.push('📋 本轮出招：');
  for (const p of participants) {
    const sk = SKILLS[p.skill]; if (!sk) continue;
    const cnt = p.stackCount||1;
    let desc = sk.name;
    if (cnt>1) desc += ` ×${cnt}`;
    if (sk.group) desc += '（群体）';
    else if (p.target) {
      const t = room.players[p.target];
      if (t) desc += ` → ${t.name}`;
      if (p.secondTarget) { const t2=room.players[p.secondTarget]; if(t2) desc += ` + ${t2.name}`; }
    }
    log.push(`  ${p.name}：${desc}`);
  }

  // Phase 0: 狙天上回合遗留
  for (const p of participants) {
    if (!p.alive) continue;
    if (p.snipeHeaven) {
      p.hp -= 1; p.snipeHeaven = false;
      log.push(`🎯 ${p.name} 因"狙天"受到1点伤害（${Math.max(0,p.hp)}血）`);
      markDead(p);
    }
  }

  // Phase 1: 自身效果
  for (const p of participants) {
    if (!p.alive) continue;
    const sk = SKILLS[p.skill]; if (!sk) continue;
    const count = p.stackCount || 1;
    const cost = calcCost(sk, count);

    if (p.fee < cost) { eject(p, ` 费用不足（需${cost}费/有${p.fee}费）`); continue; }
    if (sk.needKnife && p.knives < count) { eject(p, ` 刀不够（需${count}刀/有${p.knives}把）`); continue; }
    // ★ 血浴无八卦 → 犯规出局（不再致死）
    if (sk.consumeBagua && p.bagua < sk.consumeBagua) { eject(p, ` 没有八卦，无法使用${sk.name}`); continue; }
    // ★ 血攻血量不足 → 犯规出局
    if (sk.selfDmg > 0 && p.hp < sk.selfDmg) { eject(p, ` 血量不足，无法使用${sk.name}（需${sk.selfDmg}血/仅${p.hp}血）`); continue; }

    p.fee -= cost;
    if (sk.feeGain) p.fee += sk.feeGain;
    if (sk.needKnife) p.knives -= count;
    if (sk.consumeBagua) { p.bagua -= sk.consumeBagua; log.push(`🔮 ${p.name} 消耗${sk.consumeBagua}个八卦使用${sk.name}`); }

    p.def = sk.name==='八卦阵' ? 60*count : (sk.def||0);
    p.immuneMelee = !!sk.immuneMelee;
    p.reflectPool = sk.name==='反弹' ? count*2 : 0;
    p.hasBaidong = !!sk.blockHeidong;
    p.isSniper = !!sk.sniperPhase;

    if (sk.heal > 0) {
      const used = p.skillsUsed[sk.name]||0;
      if (used >= sk.maxUse) { eject(p, ` ${sk.name}次数超限`); continue; }
      p.hp += sk.heal; p.skillsUsed[sk.name] = used+1;
      log.push(`💚 ${p.name} ${sk.name} +${sk.heal}血（${p.hp}血）`);
    }
    if (sk.selfDmg > 0) {
      p.hp -= sk.selfDmg;
      log.push(`🩸 ${p.name} ${sk.name} -${sk.selfDmg}血（${Math.max(0,p.hp)}血）`);
      markDead(p);
    }
    if (sk.addKnife) p.knives += sk.addKnife;
    if (sk.addBagua) p.bagua = Math.min(2, p.bagua + sk.addBagua);
    if (p.def > 0 && sk.type!=='buff') log.push(`🛡️ ${p.name} 防御力 ${p.def}`);
    if (p.reflectPool > 0) log.push(`↩️ ${p.name} 反弹池 ${p.reflectPool}点`);
    if (p.immuneMelee) log.push(`🕊️ ${p.name} 免疫近战`);
    if (p.hasBaidong) log.push(`⚪ ${p.name} 白洞就绪`);
  }

  // Phase 2: 战斗伤害
  for (const atk of participants) {
    if (!atk.alive) continue;
    const sk = SKILLS[atk.skill]; if (!sk) continue;
    const count = atk.stackCount || 1;
    let baseDmg = sk.name==='爪' ? 3*count : (sk.stackable ? sk.dmg*count : sk.dmg);
    if (baseDmg <= 0 || !['melee','ranged'].includes(sk.type)) continue;

    if (sk.isHeidong) {
      for (const def of participants) {
        if (def.id===atk.id || !def.alive) continue;
        if (def.hasBaidong) { log.push(`🕳️ ${def.name}的白洞抵御了${atk.name}的黑洞！`); }
        else { def.hp=0; markDead(def, ` 被${atk.name}的黑洞吞噬！`); }
      }
      continue;
    }

    const targets = sk.group
      ? participants.filter(t => t.id!==atk.id && t.alive)
      : [room.players[atk.target]].filter(t => t && t.alive && t.id!==atk.id);

    for (const def of targets) {
      if (def.immuneMelee && (sk.type==='melee' || sk.reflectByBird)) {
        log.push(`🛡️ ${atk.name}的${sk.name}被${def.name}的bird冲免疫`);
        if (sk.reflectByBird) {
          atk.hp -= baseDmg;
          log.push(`↩️ ${atk.name}的${sk.name}被bird冲反弹（-${baseDmg}血）`);
          markDead(atk);
        }
        continue;
      }

      let dmg = baseDmg;
      const typeBonus = (sk.type==='ranged' && !def.immuneMelee) ? 0.5 : 0;
      let effDef = def.def;
      if (sk.immuneWuzhuangDef && def.skill==='wuzhuang') effDef = 0;

      if (def.reflectPool > 0 && sk.type==='ranged') {
        if (!sk.unreflectable && dmg <= def.reflectPool) {
          atk.hp -= dmg; def.reflectPool -= dmg;
          log.push(`↩️ ${def.name}反弹了${atk.name}的${sk.name}（${dmg}点）`);
          markDead(atk); continue;
        } else {
          const d = Math.min(dmg, def.reflectPool); dmg -= d; def.reflectPool -= d;
          if (d > 0) log.push(`↩️ ${def.name}的反弹防御了${d}点`);
        }
      }
      if (def.bagua > 0 && !sk.ignoreBagua && dmg <= 30) {
        def.bagua--; log.push(`🔮 ${def.name}的八卦抵御了${atk.name}的${sk.name}`); continue;
      }
      const final = Math.max(0, Math.round((dmg - effDef + typeBonus)*10)/10);
      if (final > 0) {
        def.hp -= final;
        log.push(`⚔️ ${atk.name}→${def.name}：${sk.name} ${final}伤害（${Math.max(0,def.hp)}血）`);
      } else {
        log.push(`🛡️ ${atk.name}的${sk.name}被${def.name}完全防御`);
      }
      markDead(def);
    }
  }

  // Phase 3: 判定技能
  for (const atk of participants) {
    if (!atk.alive) continue;
    const sk = SKILLS[atk.skill]; if (!sk || sk.type!=='judge') continue;
    const jCount = sk.judgeCount || 1;
    if (sk.group) {
      for (const def of participants) {
        if (def.id===atk.id || !def.alive) continue;
        if (sk.judgeTargets.includes(def.skill)) {
          const d = sk.judgeDmg===Infinity ? 9999 : sk.judgeDmg;
          def.hp -= d*jCount;
          log.push(`⚖️ ${atk.name}的${sk.name}对${def.name}造成${d>100?'∞':d*jCount}判定伤害`);
          if (sk.breakBagua && def.bagua>0) { def.bagua=Math.max(0,def.bagua-sk.breakBagua); log.push(`🔮 ${atk.name}的${sk.name}破除了${def.name}的八卦`); }
          markDead(def);
        }
      }
    } else {
      const tgt = room.players[atk.target];
      if (tgt && tgt.alive && tgt.id!==atk.id && sk.judgeTargets.includes(tgt.skill)) {
        tgt.hp -= sk.judgeDmg*jCount;
        log.push(`⚖️ ${atk.name}的${sk.name}对${tgt.name}造成${sk.judgeDmg*jCount}判定伤害`);
        markDead(tgt);
      }
      if (jCount >= 2 && atk.secondTarget) {
        const tgt2 = room.players[atk.secondTarget];
        if (tgt2 && tgt2.alive && tgt2.id!==atk.id && sk.judgeTargets.includes(tgt2.skill)) {
          tgt2.hp -= sk.judgeDmg;
          log.push(`⚖️ ${atk.name}的${sk.name}对${tgt2.name}造成${sk.judgeDmg}判定伤害`);
          markDead(tgt2);
        }
      }
    }
  }

    // Phase 4: 狙击结算（破武装防 + bird冲反弹）
  for (const p of participants) {
    if (!p.alive || !p.sniperTarget) continue;
    if (p.sniperTarget === p.id) {
      p.snipeHeaven = true;
      log.push(`🎯 ${p.name} 选择"狙天"，下回合受1点伤害`);
    } else {
      const tgt = room.players[p.sniperTarget];
      if (tgt && tgt.alive) {
        if (tgt.immuneMelee) {
          // bird冲反弹狙击
          log.push(`🎯 ${p.name}的狙击被${tgt.name}的bird冲反弹！`);
          p.hp -= 1;
          log.push(`↩️ ${p.name}受到反弹伤害（${Math.max(0,p.hp)}血）`);
          markDead(p);
        } else {
          // 正常远程伤害计算：破武装防，但其他防御正常生效
          let dmg = 1;
          const typeBonus = 0.5;
          let effDef = tgt.def;
          if (tgt.skill === 'wuzhuang') effDef = 0;

          // 八卦抵挡
          if (tgt.bagua > 0 && dmg <= 30) {
            tgt.bagua--;
            log.push(`🔮 ${tgt.name}的八卦抵御了${p.name}的狙击`);
          } else {
            const final = Math.max(0, Math.round((dmg - effDef + typeBonus)*10)/10);
            if (final > 0) {
              tgt.hp -= final;
              log.push(`🎯 ${p.name} 狙击${tgt.name}，${final}伤害（${Math.max(0,tgt.hp)}血）`);
            } else {
              log.push(`🛡️ ${p.name}的狙击被${tgt.name}完全防御`);
            }
            markDead(tgt);
          }
        }
      }
    }
    p.sniperTarget = null;
  }


  // ★ 统一处理所有死亡
  for (const pid of deathsThisRound) {
    room.players[pid].alive = false;
  }

  // 同时死亡公告
  if (deathsThisRound.length >= 2) {
    const names = deathsThisRound.map(id => room.players[id]?.name || '?');
    log.push(`☠️ 同时阵亡：${names.join('、')}`);
  }

  room.log = log;
  io.to(rid).emit('roundResult', { log, players:pubState(room) });

  const survivors = Object.values(room.players).filter(p => p.alive);
  if (survivors.length <= 1) {
    room.phase = 'ended';
    const msg = survivors.length === 1 ? `🏆 ${survivors[0].name} 获胜！` : '☠️ 全员阵亡，平局！';
    io.to(rid).emit('gameOver', { message: msg, players:pubState(room) });
    return;
  }
  setTimeout(() => beginSelect(rid), 4000);
}

// ===================== Socket =====================
io.on('connection', socket => {
  socket.on('createRoom', ({name}, cb) => {
    const rid = createRoom(socket.id, name);
    socket.join(rid);
    cb({ roomId:rid, playerId:socket.id });
    io.to(rid).emit('playerUpdate', { players:pubState(rooms[rid]) });
  });

  socket.on('joinRoom', ({roomId, name}, cb) => {
    const rid = roomId?.toUpperCase();
    const room = rooms[rid];
    if (!room) return cb({ error:'房间不存在' });
    if (room.phase !== 'waiting' && room.phase !== 'ended') return cb({ error:'游戏进行中' });
    if (Object.keys(room.players).length >= 8) return cb({ error:'房间已满' });
    joinRoom(rid, socket.id, name);
    socket.join(rid);
    cb({ roomId:rid, playerId:socket.id });
    io.to(rid).emit('playerUpdate', { players:pubState(room) });
  });

  socket.on('startGame', () => {
    const room = findRoom(socket.id);
    if (room && room.hostId===socket.id && Object.keys(room.players).length>=2) startGame(room.id);
  });

  socket.on('selectSkill', ({skillId, targetId, secondTargetId, stackCount}) => {
    const room = findRoom(socket.id);
    if (!room || room.phase!=='selecting') return;
    const p = room.players[socket.id];
    if (!p || !p.alive || p.hasChosen) return;
    p.skill = skillId;
    p.target = targetId || null;
    p.secondTarget = secondTargetId || null;
    p.stackCount = stackCount || 1;
    p.hasChosen = true;
    io.to(room.id).emit('playerReady', { playerId:socket.id, players:pubState(room) });
    tryLock(room.id);
  });

  socket.on('selectSniperTarget', ({targetId}) => {
    const room = findRoom(socket.id);
    if (!room || room.phase!=='sniperPhase' || !room.pendingSnipers) return;
    const p = room.players[socket.id];
    if (!p || !p.alive || !room.pendingSnipers.has(socket.id)) return;
    p.sniperTarget = targetId;
    room.pendingSnipers.delete(socket.id);
    io.to(socket.id).emit('sniperConfirmed');
    if (room.pendingSnipers.size === 0) resolveRound(room.id);
  });

  socket.on('sendEmoji', ({emojiId}) => {
    const room = findRoom(socket.id);
    if (!room) return;
    const p = room.players[socket.id];
    if (!p || !p.alive) return;
    io.to(room.id).emit('showEmoji', { playerId:socket.id, playerName:p.name, emojiId });
  });

  socket.on('restartGame', () => {
    const room = findRoom(socket.id);
    if (!room || room.hostId !== socket.id) return;
    Object.values(room.players).forEach(p => {
      p.hp=1; p.fee=0; p.def=0; p.knives=0; p.bagua=0;
      p.immuneMelee=false; p.reflectPool=0; p.hasBaidong=false;
      p.skillsUsed={}; p.alive=true; p.hasChosen=false;
      p.skill=null; p.target=null; p.secondTarget=null; p.stackCount=1;
      p.isSniper=false; p.sniperTarget=null; p.snipeHeaven=false;
    });
    room.phase = 'waiting'; room.round = 0; room.log = []; room.pendingSnipers = null;
    io.to(room.id).emit('gameReset', { players:pubState(room) });
  });

  socket.on('disconnect', () => {
    const room = findRoom(socket.id);
    if (!room) return;
    if (room.players[socket.id]) room.players[socket.id].alive = false;
    delete room.players[socket.id];
    if (Object.keys(room.players).length === 0) { delete rooms[room.id]; }
    else io.to(room.id).emit('playerUpdate', { players:pubState(room) });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`拊掌游戏运行在 http://localhost:${PORT}`));
