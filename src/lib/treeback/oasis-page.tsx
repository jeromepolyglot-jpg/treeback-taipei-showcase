import { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { TreePine, Leaf, Wind, Thermometer, Cloud, Heart, Scale, Users, Building2, Landmark, ArrowRight, CalendarDays, Award, Copy, RotateCcw, Hammer, Cpu, ShieldCheck, Sparkles, Info, MapPin, Check, HandHeart, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import cityImage from '@/assets/oasis-city.jpg';
import { useOasisProgress } from './use-oasis-progress';
import { OasisAccount } from './oasis-account';
import { usePlayer } from './player-auth';
import { defaultDisplayName } from './leaderboard-model';
import { supabase } from '@/integrations/supabase/client';
import { ROLES, AREAS, SPECIES, newGame, plant, unpave, eco, nextMonth, type Role, type Area, type Game } from './oasis-model';

const roleIcons = { citizen: Users, enterprise: Building2, official: Landmark };
const tileLabels = { well: '空樹穴', cement: '水泥填平處', sidewalk: '寬敞人行道', tree: '健康樹木' };
type EventKind = 'construction' | 'heat' | 'rain';
const EVENTS = {
  construction: { icon: '🚧', title: '老樹需要你的守護', text: '虛構工程擬移除街區的 3 棵 40 年老樹。你的選擇，將決定這次公民監督行動。' },
  heat: { icon: '☀️', title: '熱浪來襲', text: '這個月的遊戲熱浪，考驗街區的樹蔭韌性。' },
  rain: { icon: '🌧️', title: '梅雨季的綠色海綿', text: '樹木與可滲透土壤可協助調節雨水，但成效取決於土壤、降雨及設計；本遊戲不推估吸收噸數。' },
};
function Stat({ icon: Icon, label, value, unit, help }: { icon: typeof Leaf; label: string; value: number; unit: string; help: string }) {
  return <article className="oasis-stat" title={help}><div><Icon size={17}/><span>{label}</span><Info size={13}/></div><motion.strong key={value} initial={{ y: 8, opacity: .4 }} animate={{ y: 0, opacity: 1 }}>{Number(value.toFixed(1))}<small>{unit}</small></motion.strong><span className="oasis-stat-note">遊戲參數 · 非實測</span></article>;
}
export function OasisPage() {
  const { progress, setProgress, status, retrySave, blocked } = useOasisProgress();
  const { role, sessions, area, event } = progress;
  const setRole = (role: Role) => setProgress(p => ({ ...p, role }));
  const setArea = (area: Area) => setProgress(p => ({ ...p, area }));
  const setEvent = (event: EventKind | null) => setProgress(p => ({ ...p, event }));
  const [selected, setSelected] = useState<number | null>(null);
  const [certificate, setCertificate] = useState(false);
  const [burst, setBurst] = useState<number | null>(null);
  const game = sessions[role], current = ROLES[role];
  const metrics = eco(game, role), local = eco(game, role, area);
  const tile = selected === null ? undefined : game.boards[area][selected];
  const tree = SPECIES.find(s => s.id === tile?.species);
  function update(transform: (g: Game) => Game) { if (blocked) return; setProgress(p => ({ ...p, sessions: { ...p.sessions, [p.role]: transform(p.sessions[p.role]) } })); }
  function switchRole(next: Role) { if (blocked || event) return; setRole(next); setSelected(null); }
  function doPlant(id: string) {
    if (selected === null) return;
    const next = plant(game, role, area, selected, id);
    if (next === game) return;
    update(() => next); setBurst(selected); setSelected(null); toast.success('新樹入住，街區多了一片綠！');
  }
  function ability(kind: 'wish' | 'sensor' | 'offset' | 'zone' | 'alerts') {
    const cost = { wish: 0, sensor: 500, offset: 1000, zone: 2000, alerts: 0 }[kind];
    if ((kind === 'wish' && role !== 'citizen') || ((kind === 'sensor' || kind === 'offset') && role !== 'enterprise') || ((kind === 'zone' || kind === 'alerts') && role !== 'official')) return;
    if (game.budget < cost) { toast.error('基金不足'); return; }
    if (kind === 'sensor' || kind === 'wish') {
      const index = selected ?? game.boards[area].findIndex(t => kind === 'sensor' ? t.kind === 'tree' && !t.sensor : t.kind !== 'tree' && !t.wished);
      const target = game.boards[area][index];
      if (!target || (kind === 'sensor' ? target.kind !== 'tree' || target.sensor : target.kind === 'tree' || target.wished)) { toast.info('這個地塊無法使用此能力'); return; }
      update(g => ({ ...g, budget: g.budget-cost, boards: { ...g.boards, [area]: g.boards[area].map((t,i) => i === index ? { ...t, ...(kind === 'sensor' ? { sensor: true } : { wished: true }) } : t) }, logs: [kind === 'sensor' ? '智慧土壤感測器已安裝（示範，無即時讀值）。' : `${area}新增一處社群許願（本局遊戲）。`, ...g.logs] }));
    } else {
      if (game[kind]) return;
      update(g => ({ ...g, [kind]: true, budget: g.budget-cost, logs: [`${kind === 'offset' ? '企業碳抵換計畫' : kind === 'zone' ? '綠化專區' : '施工監督預警'}已啟用（遊戲設定，非真實執行）。`, ...g.logs] }));
    }
    toast.success('角色行動完成');
  }
  function advance() { if (blocked) return; const event = (['construction','heat','rain'] as const)[Math.floor(Math.random()*3)] ?? 'construction'; setProgress(p => ({ ...p, sessions: { ...p.sessions, [p.role]: nextMonth(p.sessions[p.role]) }, event })); }
  function resolveEvent(action: 'guard' | 'negotiate' | 'ignore' | 'continue') {
    if (!event) return;
    update(g => {
      let satisfaction = g.satisfaction, budget=g.budget;
      let log = '';
      if (event === 'construction') {
        if (action === 'guard') { satisfaction = Math.max(0, satisfaction-5); log = '投入 5 滿意度點數，召集公民監督並保留老樹（虛構事件）。'; }
        else if (action === 'negotiate') { satisfaction += 5; log = '協商成功，工程調整以保留老樹（虛構事件）。'; }
        else { satisfaction -= 10; log='未參與監督，居民滿意度下降 10（虛構事件）。'; }
      } else if (event === 'heat') {
        if (local.tes < 50) { satisfaction -= 10; log='熱浪事件：遊戲樹蔭分數低於50，滿意度 −10。'; }
        else if (local.tes > 80) { budget += 1000; log='熱浪事件：遊戲樹蔭分數超過80，獲得 $1,000 韌性獎勵。'; }
        else { log='熱浪事件：街區撐過本月熱浪。'; }
      } else { satisfaction += 3; log='梅雨事件：可滲透土壤與樹木的雨水調節知識，滿意度 +3。'; }
      return { ...g, budget, satisfaction: Math.max(0,Math.min(100,satisfaction)), logs: [log,...g.logs] };
    }); setEvent(null);
  }
  const resultText = `TreeBack 把樹還給日常！我是台北綠洲守護者。\n${current.name}｜種植 ${metrics.trees} 棵｜遊戲降溫值 ${metrics.cooling.toFixed(1)}°C｜遊戲年增氧 ${metrics.oxygen}kg｜遊戲 TES 改善 ${metrics.improvement} 點\n所有效益均為虛構遊戲參數，非臺北實測或官方評分。`;
  async function copy() { try { await navigator.clipboard.writeText(resultText); toast.success('成果已複製'); } catch { toast.error('瀏覽器未允許複製，請選取證書文字。'); } }
  const { user } = usePlayer();
  const [publishing, setPublishing] = useState(false);
  async function publishScore() {
    if (!user) { toast.error('請先登入，再發佈成績'); return; }
    setPublishing(true);
    const { error } = await supabase.rpc('publish_oasis_score', { _display_name: defaultDisplayName(user.email), _role: role, _trees: metrics.trees, _improvement: metrics.improvement, _month: game.month });
    setPublishing(false);
    if (error) toast.error('發佈失敗，請稍後重試');
    else toast.success('已發佈到排行榜！');
  }
  return <MotionConfig reducedMotion="user"><div className="oasis">
    <section className="oasis-cover"><img src={cityImage} alt="台北街區與茂盛行道樹的城市綠洲遊戲插畫" width={1536} height={512}/><div className="oasis-cover-copy"><span className="oasis-kicker">TREEBACK · TAIPEI TREE OASIS</span><h1>模擬城市綠洲</h1><p>台北見縫插樹</p><span className="oasis-badge"><Leaf size={13}/> 公民科技 × 綠色行動</span></div><span className="oasis-image-label">遊戲場景插畫 · 非現地影像</span></section>
    <div className="oasis-boundary"><Info size={16}/><p><b>這是一場遊戲，不是城市實測。</b> 地塊、預算、生態加成、事件與 TES 都是虛構設定；每棵樹的降溫與增氧不能直接相加推算現實效益。</p></div>
    <OasisAccount status={status} retry={retrySave}/>
    <fieldset disabled={blocked} className="m-0 min-w-0 border-0 p-0">
    <section className="oasis-rolebar"><div className="oasis-role-tabs" aria-label="身分切換">{(Object.keys(ROLES) as Role[]).map(r => { const Icon=roleIcons[r];return <Button variant="ghost" key={r} aria-pressed={r===role} className={r===role?'oasis-role active':'oasis-role'} onClick={()=>switchRole(r)}><Icon/><span>{ROLES[r].name}<small>{ROLES[r].english}</small></span></Button>; })}</div><div className="oasis-wallet"><span>可用綠化基金 <small>遊戲幣</small></span><motion.strong key={game.budget} initial={{opacity:.5}} animate={{opacity:1}}>${game.budget.toLocaleString()}</motion.strong></div></section>
    <div className="oasis-mission"><Sparkles size={16}/><p>{current.mission}</p><span>{current.perk}</span></div>
    <section className="oasis-stats" aria-label="即時生態看板">
      <Stat icon={Wind} label="年總釋氧量" value={metrics.oxygen} unit="kg/年" help="指定樹種的虛構遊戲加成，不是樹木實測釋氧量。未指定值為0，不代表真實樹木沒有貢獻。"/>
      <Stat icon={Thermometer} label="降溫效益" value={-metrics.cooling} unit="°C" help="僅為遊戲累積值，不可把單株降溫相加套用至街區。"/>
      <Stat icon={Cloud} label="年固碳量" value={metrics.carbon} unit="kg CO₂" help="虛構遊戲加成，非碳權或科學估算。科企角色收益1.5倍。"/>
      <Stat icon={Heart} label="美觀宜居度" value={metrics.beauty} unit="/100" help="遊戲美觀進度，非居民調查。"/>
      <Stat icon={Scale} label="遊戲樹蔭分數" value={local.tes} unit="TES" help="目前街區的虛構進度分數，非官方TES，亦不同於實驗室情境公式。"/>
    </section>
    <div className="oasis-play-layout"><section className="oasis-board-section"><div className="oasis-section-heading"><div><span className="oasis-kicker">YOUR NEIGHBORHOOD</span><h2><MapPin size={20}/>{area}的綠洲計畫</h2></div><span className="oasis-month"><CalendarDays size={15}/> 第 {game.month} 個月</span></div>
      <div className="oasis-area-tabs" aria-label="街區切換">{AREAS.map(a=><Button key={a} variant="ghost" aria-pressed={area===a} onClick={()=>{setArea(a);setSelected(null);setBurst(null);}} className={area===a?'active':''}>{a}</Button>)}</div>
      <div className="oasis-map-caption"><span>虛構街區 · 非地理定位</span><span>{local.tes <50 ? '樹蔭不足（遊戲）' : local.tes>80?'綠洲街區（遊戲）':'綠化進行中'}</span></div>
      <div className="oasis-board" aria-label={`${area}遊戲地塊`}>{game.boards[area].map((t,i)=>{ const s=SPECIES.find(s=>s.id===t.species);return <motion.div className="oasis-tile-wrap" key={`${area}-${i}`} whileHover={{ y:-3 }}><Button variant="ghost" className={`oasis-tile ${t.kind}${t.planted?' planted':''}`} aria-label={`${i+1}號${tileLabels[t.kind]}${s?` ${s.name}`:''}`} title={`${tileLabels[t.kind]}${t.wished?' · 社群許願':''}`} onClick={()=>setSelected(i)}><span className="oasis-tile-art">{t.kind==='tree'?<span className="oasis-tree-art">{s?.icon??'🌳'}</span>:t.kind==='well'?<span className="oasis-well-art"><Leaf size={18}/></span>:t.kind==='cement'?<span className="oasis-cement-art"><Hammer size={22}/></span>:<span className="oasis-sidewalk-art"><TreePine size={23}/></span>}</span><small>{t.kind==='tree'?s?.name:tileLabels[t.kind]}</small>{t.wished&&<HandHeart className="oasis-tile-marker"/>}{t.sensor&&<Cpu className="oasis-tile-marker"/>}</Button><AnimatePresence>{burst===i&&<motion.span className="oasis-burst" initial={{y:0,opacity:1}} animate={{y:-55,opacity:0}} transition={{duration:2}} onAnimationComplete={()=>setBurst(null)}>✦ + 綠意</motion.span>}</AnimatePresence></motion.div>;})}</div>
      <div className="oasis-legend"><span><i className="well"/>空樹穴</span><span><i className="cement"/>待拆水泥</span><span><i className="sidewalk"/>寬人行道</span><span><i className="tree"/>健康樹木</span></div>
      <div className="oasis-board-footer"><span><Heart size={15}/> 市民滿意度 <b>{game.satisfaction.toFixed(0)} / 100</b></span><Button onClick={advance}><CalendarDays/>下一個月<ArrowRight/></Button></div>
    </section><aside className="oasis-sidebar"><section className="oasis-actions"><span className="oasis-kicker">ROLE ABILITIES</span><h2>你的專屬行動</h2>{role==='citizen'?<Button variant="outline" onClick={()=>ability('wish')}><HandHeart/>社群許願樹穴 <small>免費</small></Button>:role==='enterprise'?<><Button variant="outline" onClick={()=>ability('sensor')}><Cpu/>智慧土壤感測器 <small>$500</small></Button><Button variant="outline" disabled={game.offset} onClick={()=>ability('offset')}><Cloud/>{game.offset?'碳抵換計畫已啟用':'企業碳抵換計畫'}<small>$1,000</small></Button></>:<><Button variant="outline" disabled={game.zone} onClick={()=>ability('zone')}><MapPin/>{game.zone?'綠化專區已劃設':'劃設綠化專區'}<small>$2,000</small></Button><Button variant="outline" disabled={!game.boards[area].some(t=>t.kind==='cement') || game.budget<game.boards[area].filter(t=>t.kind==='cement').length*300} onClick={()=>update(g=>unpave(g,area))}><Hammer/>批次拆除鋪面 <small>$300/格</small></Button><Button variant="outline" disabled={game.alerts} onClick={()=>ability('alerts')}><ShieldCheck/>{game.alerts?'監督預警已開啟':'施工監督預警'}<small>免費</small></Button></>}<p>能力只作用於本局遊戲；不會發出真實通報、感測讀值或碳權。</p></section>
      <section className="oasis-log"><div className="oasis-section-heading"><h2>街區動態</h2><span className="oasis-live">本局紀錄</span></div><ol aria-live="polite">{game.logs.slice(0,5).map((log,i)=><li key={`${game.logs.length}-${i}`}><span/><p>{log}</p></li>)}</ol></section><div className="oasis-achievement"><Award size={28}/><h3>每一棵樹，都算數。</h3><p>已種下 <b>{metrics.trees}</b> 棵新樹</p><Button onClick={()=>setCertificate(true)} variant="outline"><Award/>生成我的綠洲貢獻證書</Button></div>
    </aside></div>
    </fieldset>
    <section className="oasis-science"><div><span className="oasis-kicker">EVIDENCE, NOT MAGIC NUMBERS</span><h2>把遊戲裡的綠意，帶回真實世界</h2><p>現實的降溫取決於樹冠、季節、氣候與量測方法。幼苗也不會立即擁有成樹的效益；本遊戲的數字只用來呈現行動回饋。</p></div><div><a href="https://doi.org/10.1038/s41467-021-26768-w" target="_blank" rel="noreferrer">Nature Communications · 2021 ↗<small>歐洲城市樹木與地表溫度研究；不是臺北單株降溫公式。</small></a><a href="https://doi.org/10.1073/pnas.1817561116" target="_blank" rel="noreferrer">PNAS · 2019 ↗<small>樹冠與鋪面對城市氣溫的交互影響；地表溫度不等於氣溫。</small></a><a href="https://tai2.ntu.edu.tw/" target="_blank" rel="noreferrer">臺灣植物資訊整合查詢系統 ↗<small>樹種識別參考；遊戲成本、加成與成長年數不出自此來源。</small></a></div></section>
    <Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="oasis-dialog"><DialogTitle>{tile?.kind==='cement'?'還原土壤':tile?.kind==='tree'?`${tree?.name??'樹木'}的健康檔案`:'苗圃選樹'}</DialogTitle><DialogDescription>{tile?.kind==='cement'?'移除鋪面，讓一個新的樹穴重新呼吸。遊戲拆除費 $300。':tile?.kind==='tree'?'本局遊戲樹木資料，非真實樹木監測。':'成本與效益為遊戲設定；未列出的加成不計入，並非真實零效益。'}</DialogDescription>
      {tile?.kind==='cement'?<><div className="oasis-modal-art">🧱 → 🌱</div><Button disabled={game.budget<300} onClick={()=>{if(selected!==null)update(g=>unpave(g,area,selected));}}><Hammer/>{game.budget<300?'基金不足':'拆除水泥 · $300'}</Button></>:tile?.kind==='tree'?<><div className="oasis-modal-art">{tree?.icon}</div><dl className="oasis-tree-detail"><dt>健康狀態</dt><dd>良好（遊戲設定）</dd><dt>遊戲樹齡</dt><dd>{(tile.age??0).toFixed(1)} 年</dd><dt>遊戲成樹期</dt><dd>{tree?.years} 年（虛構）</dd><dt>樹冠</dt><dd>{tree?.canopy}</dd><dt>遊戲增氧加成</dt><dd>{tile.planted?tree?.oxygen:0} kg/年</dd><dt>感測器</dt><dd>{tile.sensor?'已安裝（無真實讀值）':'未安裝'}</dd></dl><p>{tree?.note}</p>{role==='enterprise'&&<Button disabled={tile.sensor||game.budget<500} onClick={()=>ability('sensor')}><Cpu/>安裝感測器 · $500</Button>}</>:<div className="oasis-nursery">{SPECIES.map(s=><article key={s.id}><div className="oasis-species-heading"><span>{s.icon}</span><div><h3>{s.name}</h3><small>{s.latin}</small></div><b>${s.cost.toLocaleString()}</b></div><p>{s.note}</p><div className="oasis-species-meta"><span>樹冠 {s.canopy}</span><span>遊戲成樹 {s.years} 年</span><span>美觀 +{s.beauty}</span>{s.oxygen>0&&<span>O₂ +{s.oxygen}kg</span>}{s.carbon>0&&<span>CO₂ +{s.carbon}kg</span>}{s.cooling>0&&<span>降溫 +{s.cooling}°C</span>}</div><Button disabled={game.budget<s.cost} onClick={()=>doPlant(s.id)}><TreePine/>{game.budget<s.cost?'基金不足':`種下${s.name}`}</Button></article>)}</div>}
    </DialogContent></Dialog>
    <Dialog open={event!==null && !blocked} onOpenChange={open=>{if(!open)resolveEvent(event==='construction'?'ignore':'continue');}}><DialogContent className="oasis-dialog"><DialogTitle>{event?EVENTS[event].title:''}</DialogTitle><DialogDescription>第 {game.month} 個月 · 虛構遊戲事件</DialogDescription><div className="oasis-modal-art">{event?EVENTS[event].icon:''}</div><p>{event?EVENTS[event].text:''}</p>{event==='construction'?<div className="oasis-event-actions"><Button disabled={game.satisfaction<5} onClick={()=>resolveEvent('guard')}><ShieldCheck/>發起守護通報 · 5點</Button><Button variant="outline" onClick={()=>resolveEvent('negotiate')}>協商原地保留</Button><Button variant="ghost" onClick={()=>resolveEvent('ignore')}>不參與監督</Button></div>:<><p>{event==='heat'?(local.tes<50?'遊戲 TES 低於50：滿意度 −10。':local.tes>80?'遊戲 TES 超過80：韌性獎勵 $1,000。':'街區穩定度過熱浪，沒有額外扣分。'):'完成這次生態觀察，遊戲滿意度 +3。'}</p><Button onClick={()=>resolveEvent('continue')}><Check/>繼續綠洲計畫</Button></>}</DialogContent></Dialog>
    <Dialog open={certificate} onOpenChange={setCertificate}><DialogContent className="oasis-dialog"><DialogTitle>我的綠洲貢獻證書</DialogTitle><DialogDescription>本局遊戲成果，非環境效益認證。</DialogDescription><div className="oasis-certificate"><Award size={46}/><span className="oasis-kicker">TAIPEI OASIS GUARDIAN</span><h2>台北綠洲守護者</h2><p>{current.name} · 第 {game.month} 個月</p><strong>{metrics.trees}<small> 棵新樹</small></strong><div><span>遊戲降溫 <b>{metrics.cooling.toFixed(1)}°C</b></span><span>遊戲增氧 <b>{metrics.oxygen} kg/年</b></span><span>遊戲 TES 改善 <b>{metrics.improvement} 點</b></span></div><p>TreeBack 把樹還給日常！<br/>我是台北綠洲守護者。</p><small>所有數值均為虛構遊戲參數，非實測、非官方評分。</small></div><div className="oasis-event-actions"><Button onClick={copy}><Copy/>複製成果卡片</Button>{user&&<Button variant="outline" disabled={publishing} onClick={publishScore}><Trophy/>{publishing?'發佈中…':'發佈到排行榜'}</Button>}<Button variant="outline" onClick={()=>{update(()=>newGame(role));setCertificate(false);setBurst(null);}}><RotateCcw/>此角色再玩一次</Button></div></DialogContent></Dialog>
  </div></MotionConfig>;
}