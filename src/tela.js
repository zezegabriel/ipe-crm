// Tela do Ipê CRM. Dados vêm do processo principal por window.crm (preload.cjs); nada aqui toca o disco.
const STAGES=[["a_contatar","A contatar"],["contatado","Contatado"],["respondeu","Respondeu"],["reuniao","Reunião"],["proposta","Proposta"],["fechado","Fechado"],["perdido","Perdido"]];
const STAGE_NAME=Object.fromEntries(STAGES);
const STAGE_IDX=Object.fromEntries(STAGES.map((s,i)=>[s[0],i]));
// Etiqueta de cada etapa: [cor do texto, fundo]
const STAGE_TAG={a_contatar:["#B4B7BE","rgba(180,183,190,.12)"],contatado:["#7DA8FF","rgba(77,138,255,.16)"],respondeu:["#B79CFF","rgba(150,110,255,.16)"],reuniao:["#FFA463","rgba(255,140,60,.15)"],proposta:["#F5C451","rgba(245,190,60,.15)"],fechado:["#5FD48F","rgba(60,200,120,.15)"],perdido:["#FF7B7B","rgba(255,90,90,.14)"]};
// Ícones Lucide (MIT), embutidos para funcionar offline.
const ICONES={
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chats:'<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  kanban:'<path d="M6 5v11"/><path d="M12 5v6"/><path d="M18 5v14"/>',
  list:'<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  cal:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  sync:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  bot:'<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  note:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  money:'<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20"/>',
  dashed:'<path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  check:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xcircle:'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
};
function ic(n){return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n]||""}</svg>`;}
const AV_CORES=["#E5484D","#F76B15","#FFB224","#30A46C","#12A594","#0090FF","#3E63DD","#8E4EC6","#D6409F","#6F6D66"];
function tagVars(k){const [c,b]=STAGE_TAG[k]||STAGE_TAG.a_contatar;return `--tc:${c};--tb:${b}`;}
const STAGE_IC={a_contatar:"dashed",contatado:"send",respondeu:"msg",reuniao:"cal",proposta:"note",fechado:"check",perdido:"xcircle"};
const stageIc=k=>ic(STAGE_IC[k]||"dashed");
function tag(k){return `<span class="tag" style="${tagVars(k)}">${stageIc(k)}${esc(STAGE_NAME[k]||"A contatar")}</span>`;}
function avatar(nome){const n=String(nome||"?");let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;
  const letra=(n.match(/[A-Za-zÀ-ú0-9]/)||["?"])[0].toUpperCase();return `<span class="av" style="--av:${AV_CORES[h%AV_CORES.length]}">${esc(letra)}</span>`;}
const OPEN_STAGES=["contatado","respondeu","reuniao","proposta"];
const CLOSED=["fechado","perdido"];
const NICHOS=["Advocacia","Odontologia","Estética","Saúde / Terapias","Pilates","Contabilidade","Imobiliário","Automotivo","Pet / Veterinária","Barbearia"];
const PRIO_ORDER={"Alta":0,"Média":1,"Baixa":2};
const FRESCO_MS=15*60*1000; // card com borda amarela: mudou nos últimos 15 min
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});

let leads=[], status="loading";
const ui={view:"funil",q:"",nicho:"",prio:"",so:"",openId:null,mode:null}; // so: "" | "retorno" | "hoje"
try{const v=localStorage.getItem("crm-view"); if(v==="funil"||v==="lista") ui.view=v;}catch(e){}

const $=s=>document.querySelector(s);
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function todayStr(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
function addDays(n){const d=new Date();d.setDate(d.getDate()+n);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
function diffDays(a,b){return Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);}
function fmtDate(s){if(!s)return"";const p=s.split("-");return p[2]+"/"+p[1];}
function fmtStamp(iso){const d=new Date(iso);if(isNaN(d))return"";return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
function digits(t){return String(t||"").replace(/\D/g,"");}
function temWhats(t){return digits(t).length>=11;}
function money(v){return typeof v==="number"&&v>0?brl.format(v):"";}
function fresco(l){return l.atualizado&&Date.now()-new Date(l.atualizado)<FRESCO_MS;}
function ultimo(l){const e=(l.log||[]).find(x=>!x.sys);return e?e.t:"";}
// Última mensagem com ícone de quem falou (bot ou cliente) no lugar do prefixo de texto.
function ultimoHTML(l){
  const t=ultimo(l); if(!t) return "";
  const m=/^(WhatsApp automático|Cliente): ?/.exec(t);
  const quem=m?(m[1]==="Cliente"?"user":"bot"):"note";
  return `<span class="last">${ic(quem)}<span>${esc(m?t.slice(m[0].length):t)}</span></span>`;
}
function follow(l){
  if(!l.followup||CLOSED.includes(l.etapa)) return null;
  const n=diffDays(todayStr(),l.followup);
  if(n<0) return {cls:"late",txt:n===-1?"Atrasado 1 dia":`Atrasado ${-n} dias`};
  if(n===0) return {cls:"today",txt:"Retorno hoje"};
  return {cls:"",txt:"Retorno "+fmtDate(l.followup)};
}
function prioCls(p){return p==="Alta"?"alta":p==="Média"?"media":"";}
function porRecente(a,b){
  return String(b.atualizado||"").localeCompare(String(a.atualizado||""))
    || (PRIO_ORDER[a.prioridade]??3)-(PRIO_ORDER[b.prioridade]??3)
    || String(a.nome).localeCompare(String(b.nome),"pt-BR");
}
function filtered(){
  const q=ui.q.trim().toLowerCase();
  return leads.filter(l=>{
    if(ui.nicho&&l.nicho!==ui.nicho) return false;
    if(ui.prio&&l.prioridade!==ui.prio) return false;
    if(ui.so==="retorno"&&!pendente(l)) return false;
    if(ui.so==="hoje"&&!escreveuHoje(l)) return false;
    if(ui.so==="conversa"&&!OPEN_STAGES.includes(l.etapa)) return false;
    if(ui.so.startsWith("etapa:")&&(l.etapa||"a_contatar")!==ui.so.slice(6)) return false;
    if(q){const hay=[l.nome,l.bairro,l.nicho,l.notas,l.tel].join(" ").toLowerCase(); if(!hay.includes(q)) return false;}
    return true;
  });
}
let toastT;
function toast(msg){const t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600);}

/* ---------- render ---------- */
function pendente(l){const f=follow(l);return !!f&&(f.cls==="late"||f.cls==="today");}
function escreveuHoje(l){const hoje=todayStr();return (l.log||[]).some(e=>e.t.startsWith("Cliente:")&&fmtDia(e.d)===hoje);}
function fmtDia(iso){const d=new Date(iso);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}

function render(){renderStats();renderNichoFilter();renderMain();if(ui.mode==="lead")refreshSheet();}

function renderStats(){
  const item=(so,nome,n,cls="")=>`<button type="button" data-so="${so}" aria-pressed="${ui.so===so}"><span class="nl">${nome}</span><span class="n ${cls}">${n}</span></button>`;
  const ret=leads.filter(pendente).length;
  $("#stats").innerHTML=
    item("",ic("users")+"Todos os leads",leads.length)+
    item("hoje",ic("msg")+"Responderam hoje",leads.filter(escreveuHoje).length)+
    item("retorno",ic("clock")+"Retornos pendentes",ret,ret?"red":"")+
    item("conversa",ic("chats")+"Em conversa",leads.filter(l=>OPEN_STAGES.includes(l.etapa)).length)+
    `<div class="grp">${ic("layers")}Etapas</div>`+
    STAGES.map(([k])=>item("etapa:"+k,tag(k),leads.filter(l=>(l.etapa||"a_contatar")===k).length)).join("");
}

function renderNichoFilter(){
  const sel=$("#f-nicho");
  const set=new Set(NICHOS);leads.forEach(l=>l.nicho&&set.add(l.nicho));
  const opts=['<option value="">Todos os nichos</option>'].concat([...set].sort((a,b)=>a.localeCompare(b,"pt-BR")).map(n=>`<option${n===ui.nicho?" selected":""}>${esc(n)}</option>`)).join("");
  if(sel.innerHTML!==opts) sel.innerHTML=opts;
}

function cardHTML(l){
  const f=follow(l);
  const chips=[];
  if(l.prioridade==="Alta") chips.push(`<span class="chip alta">${ic("flag")}Alta</span>`);
  if(f) chips.push(`<span class="chip ${f.cls}">${ic("cal")}${esc(f.txt)}</span>`);
  if(money(l.valor)) chips.push(`<span class="chip val">${ic("money")}${money(l.valor)}</span>`);
  if(typeof l.nota==="number") chips.push(`<span class="rating">${ic("star")}${l.nota.toFixed(1).replace(".",",")} (${l.avaliacoes||0})</span>`);
  return `<button type="button" class="card${fresco(l)?" fresh":""}" draggable="true" data-open="${esc(l.id)}" data-id="${esc(l.id)}">
    <span class="hd">${avatar(l.nome)}<span class="nm">${esc(l.nome)}</span></span>
    <span class="sub">${esc(l.nicho||"")}${l.bairro?" · "+esc(l.bairro):""}</span>
    ${ultimoHTML(l)}
    <span class="chips">${chips.join("")}</span></button>`;
}

function renderMain(){
  const main=$("#main");
  $("#v-funil").setAttribute("aria-pressed",ui.view==="funil");
  $("#v-lista").setAttribute("aria-pressed",ui.view==="lista");
  if(status==="loading"){main.innerHTML=`<div class="state"><strong>Carregando seus leads…</strong></div>`;return;}
  if(status==="offline"){main.innerHTML=`<div class="state"><strong>Abra pelo app Ipê CRM.</strong><span>Esta tela precisa do app instalado para ler os leads do seu computador.</span></div>`;return;}
  if(!leads.length){main.innerHTML=`<div class="state"><strong>Nenhum lead ainda.</strong><span>Quando a ponte do WhatsApp mandar a primeira mensagem, o lead aparece aqui.</span><button class="btn btn-ipe" type="button" data-new>+ Novo lead</button></div>`;return;}
  const list=filtered().sort(porRecente);
  if(ui.view==="funil"){
    main.innerHTML=`<div class="board" id="board">`+STAGES.map(([k,n])=>{
      const items=list.filter(l=>(l.etapa||"a_contatar")===k);
      const sum=items.reduce((s,l)=>s+(+l.valor||0),0);
      return `<section class="col" data-stage="${k}" aria-label="${n}">
        <div class="col-h">${tag(k)}<span class="c">${items.length}${sum?" · "+brl.format(sum):""}</span></div>
        ${items.length?items.map(cardHTML).join(""):`<div class="empty-col">${k==="a_contatar"?"Nenhum lead aqui.":"Arraste um card pra cá ou mude a etapa na ficha."}</div>`}
      </section>`;}).join("")+`</div>`;
  } else {
    if(!list.length){main.innerHTML=`<div class="state"><strong>Nenhum lead com esses filtros.</strong></div>`;return;}
    const rows=list.sort((a,b)=>(STAGE_IDX[a.etapa]??0)-(STAGE_IDX[b.etapa]??0)||porRecente(a,b)).map(l=>{
      const f=follow(l);
      return `<tr data-open="${esc(l.id)}" tabindex="0">
        <td><span class="hd">${avatar(l.nome)}<strong>${esc(l.nome)}</strong></span></td>
        <td>${esc(l.nicho||"")}</td>
        <td>${tag(l.etapa)}</td>
        <td>${l.prioridade?`<span class="chip ${prioCls(l.prioridade)}">${esc(l.prioridade)}</span>`:""}</td>
        <td>${f?`<span class="chip ${f.cls}">${esc(f.txt)}</span>`:""}</td>
        <td>${esc(ultimo(l).slice(0,80))}</td>
        <td class="num">${fmtStamp(l.atualizado)}</td>
        <td class="num">${esc(l.tel||"")}</td></tr>`;}).join("");
    main.innerHTML=`<div class="tbl-wrap"><table><thead><tr><th>Empresa</th><th>Nicho</th><th>Etapa</th><th>Prioridade</th><th>Retorno</th><th>Último contato</th><th>Atualizado</th><th>Telefone</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
}

/* ---------- gravação ---------- */
function save(id,patch){
  const l=leads.find(x=>x.id===id); if(!l) return;
  patch.atualizado=new Date().toISOString();
  Object.assign(l,patch);
  render();
  window.crm.salvar(id,patch).catch(()=>toast("Não deu pra salvar. Tente de novo."));
}
function logEntry(t,sys){return {d:new Date().toISOString(),t,sys:!!sys};}
function withLog(l,entry){return [entry].concat(Array.isArray(l.log)?l.log:[]).slice(0,60);}
function moveStage(id,stage){
  const l=leads.find(x=>x.id===id); if(!l||l.etapa===stage) return;
  const patch={etapa:stage,log:withLog(l,logEntry(`Etapa: ${STAGE_NAME[l.etapa]||"A contatar"} → ${STAGE_NAME[stage]}`,true))};
  if(CLOSED.includes(stage)) patch.followup="";
  save(id,patch);
  toast("Movido para "+STAGE_NAME[stage]);
}

/* ---------- ficha ---------- */
const sheet=$("#sheet"), panel=$("#panel");
let lastFocus=null, notesT=null;
function openSheet(){lastFocus=document.activeElement;sheet.hidden=false;const c=panel.querySelector("[data-close]");c&&c.focus();}
function closeSheet(){flushNotes();sheet.hidden=true;ui.openId=null;ui.mode=null;panel.innerHTML="";lastFocus&&lastFocus.focus&&lastFocus.focus();}

function openLead(id){
  const l=leads.find(x=>x.id===id); if(!l) return;
  ui.openId=id;ui.mode="lead";
  const d=digits(l.tel);
  const maps="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([l.nome,l.bairro].filter(Boolean).join(" "));
  const rating=typeof l.nota==="number"?`★ ${l.nota.toFixed(1).replace(".",",")} · ${l.avaliacoes||0} avaliações no Google`:"Sem avaliações no Google";
  panel.innerHTML=`
    <header class="sh-head">
      <div class="hd">${avatar(l.nome)}<div><h2 id="sheet-title">${esc(l.nome)}</h2>
      <p class="eyebrow">${esc(l.nicho||"")}${l.bairro?" · "+esc(l.bairro):""} · ${rating}</p></div></div>
      <button type="button" class="icon-btn" data-close aria-label="Fechar">${ic("x")}</button>
    </header>
    <div class="contact">
      ${temWhats(l.tel)?`<button type="button" class="btn btn-wa" data-url="https://wa.me/${d}">${ic("msg")}WhatsApp</button>`:""}
      <button type="button" class="btn-ghost" data-url="${esc(maps)}">${ic("pin")}Maps</button>
      ${l.tel?`<span class="phone">${ic("phone")}<span class="mono">${esc(l.tel)}</span><button type="button" class="icon-btn" id="copy-tel" aria-label="Copiar número">${ic("copy")}</button></span>`:`<span class="meta">Sem telefone cadastrado</span>`}
    </div>
    <div class="field"><span class="lbl">${ic("layers")}Etapa</span><div class="stages" id="sh-stages"></div></div>
    <div class="grid2">
      <label class="field"><span class="lbl">${ic("flag")}Prioridade</span><select id="f-prio"><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
      <label class="field"><span class="lbl">${ic("globe")}Tem site?</span><select id="f-site"><option value="">Não verifiquei</option><option>Não</option><option>Só Instagram/Linktree</option><option>Sim, mas fraco</option><option>Sim, bom</option><option>Sim</option></select></label>
      <label class="field"><span class="lbl">${ic("money")}Valor da proposta (R$)</span><input id="f-valor" type="number" inputmode="numeric" min="0" step="50" placeholder="Ex.: 1500"></label>
      <label class="field"><span class="lbl">${ic("cal")}Próximo retorno</span><input id="f-follow" type="date"></label>
    </div>
    <div class="quick"><span class="lbl">${ic("clock")}Retornar em</span>
      <button type="button" class="btn-ghost btn-sm" data-fu="1">1 dia</button>
      <button type="button" class="btn-ghost btn-sm" data-fu="3">3 dias</button>
      <button type="button" class="btn-ghost btn-sm" data-fu="7">1 semana</button>
      <button type="button" class="btn-text" data-fu="0">Limpar</button>
    </div>
    ${l.motivo?`<div class="field"><span class="lbl">${ic("star")}Por que é bom lead</span><p>${esc(l.motivo)}</p></div>`:""}
    ${l.angulo?`<div class="field"><span class="lbl">${ic("bulb")}Ângulo de abordagem</span><p>${esc(l.angulo)}</p></div>`:""}
    <label class="field"><span class="lbl">${ic("note")}Anotações</span><textarea id="f-notas" rows="4" placeholder="Nome do dono, melhor horário, objeções…"></textarea></label>
    <div class="field"><span class="lbl">${ic("chats")}Histórico de contatos</span>
      <form class="log-form" id="log-form"><input id="f-log" placeholder="Ex.: Liguei e marquei visita" aria-label="Registrar contato"><button class="btn" type="submit">${ic("plus")}Registrar</button></form>
      <ol class="log" id="sh-log"></ol>
    </div>
    <div class="danger" id="danger"><button type="button" class="btn-text bad" id="del-btn">${ic("trash")}Excluir lead</button></div>`;
  $("#f-prio").value=l.prioridade||"Média";
  $("#f-site").value=l.temSite||"";
  $("#f-valor").value=typeof l.valor==="number"&&l.valor>0?l.valor:"";
  $("#f-follow").value=l.followup||"";
  $("#f-notas").value=l.notas||"";
  refreshSheet();
  bindLeadSheet(l.id);
  openSheet();
}
function refreshSheet(){
  const l=leads.find(x=>x.id===ui.openId);
  if(!l){closeSheet();return;}
  const st=$("#sh-stages"); if(!st) return;
  st.innerHTML=STAGES.map(([k,n])=>`<button type="button" data-stage="${k}" aria-pressed="${l.etapa===k}" style="${tagVars(k)}">${stageIc(k)}${n}</button>`).join("");
  const act=document.activeElement;
  const setIf=(id,v)=>{const el=$(id);if(el&&el!==act&&String(el.value)!==String(v))el.value=v;};
  setIf("#f-prio",l.prioridade||"Média");
  setIf("#f-site",l.temSite||"");
  setIf("#f-valor",typeof l.valor==="number"&&l.valor>0?l.valor:"");
  setIf("#f-follow",l.followup||"");
  if(!notesT) setIf("#f-notas",l.notas||"");
  const log=Array.isArray(l.log)?l.log:[];
  const quem=t=>t.startsWith("Cliente:")?"user":t.startsWith("WhatsApp automático:")?"bot":"note";
  $("#sh-log").innerHTML=log.length?log.map(e=>`<li class="${e.sys?"sys":""}"><time>${fmtStamp(e.d)}</time><span>${e.sys?ic("layers"):ic(quem(e.t))}${esc(e.t)}</span></li>`).join(""):`<li><span class="none">Nenhum contato registrado ainda.</span></li>`;
}
function flushNotes(){
  if(!notesT) return; clearTimeout(notesT); notesT=null;
  const el=$("#f-notas"); if(el&&ui.openId){const l=leads.find(x=>x.id===ui.openId); if(l&&(l.notas||"")!==el.value) save(ui.openId,{notas:el.value});}
}
function askDelete(id){
  const box=$("#danger");
  box.innerHTML=`<span>Excluir este lead de vez?</span><button type="button" class="btn-ghost btn-sm" id="del-no">Cancelar</button><button type="button" class="btn btn-bad btn-sm" id="del-yes">Excluir</button>`;
  $("#del-no").addEventListener("click",()=>{box.innerHTML=`<button type="button" class="btn-text bad" id="del-btn">Excluir lead</button>`;$("#del-btn").addEventListener("click",()=>askDelete(id));});
  $("#del-yes").addEventListener("click",()=>doDelete(id));
}
function bindLeadSheet(id){
  panel.querySelector("#sh-stages").addEventListener("click",e=>{const b=e.target.closest("[data-stage]");if(b)moveStage(id,b.dataset.stage);});
  $("#f-prio").addEventListener("change",e=>save(id,{prioridade:e.target.value}));
  $("#f-site").addEventListener("change",e=>save(id,{temSite:e.target.value}));
  $("#f-valor").addEventListener("change",e=>{const v=parseFloat(e.target.value);save(id,{valor:isFinite(v)&&v>0?v:null});});
  $("#f-follow").addEventListener("change",e=>save(id,{followup:e.target.value||""}));
  panel.querySelectorAll("[data-fu]").forEach(b=>b.addEventListener("click",()=>{const n=+b.dataset.fu;const v=n?addDays(n):"";$("#f-follow").value=v;save(id,{followup:v});toast(n?"Retorno marcado para "+fmtDate(v):"Retorno removido");}));
  const notas=$("#f-notas");
  notas.addEventListener("input",()=>{clearTimeout(notesT);notesT=setTimeout(()=>{notesT=1;flushNotes();},900);});
  notas.addEventListener("blur",flushNotes);
  $("#log-form").addEventListener("submit",e=>{
    e.preventDefault();
    const inp=$("#f-log"); const t=inp.value.trim(); if(!t){inp.focus();return;}
    const l=leads.find(x=>x.id===id); if(!l) return;
    let log=withLog(l,logEntry(t,false));
    const patch={ultimoContato:todayStr()};
    if(!l.etapa||l.etapa==="a_contatar"){patch.etapa="contatado";log=[logEntry("Etapa: A contatar → Contatado",true)].concat(log).slice(0,60);}
    patch.log=log;
    save(id,patch); inp.value=""; toast("Contato registrado");
  });
  const copy=$("#copy-tel");
  if(copy) copy.addEventListener("click",()=>{
    const l=leads.find(x=>x.id===id);
    navigator.clipboard.writeText(l?l.tel:"").then(()=>toast("Número copiado"),()=>toast("Não deu pra copiar."));
  });
  $("#del-btn").addEventListener("click",()=>askDelete(id));
}
function doDelete(id){
  notesT&&clearTimeout(notesT);notesT=null;
  const l=leads.find(x=>x.id===id);
  leads=leads.filter(x=>x.id!==id);
  closeSheet();render();
  window.crm.excluir(id).then(()=>toast(`"${l?l.nome:"Lead"}" excluído`),()=>toast("Não deu pra excluir."));
}

function openNew(){
  ui.mode="new";ui.openId=null;
  panel.innerHTML=`
    <header class="sh-head"><div><p class="eyebrow">Novo lead</p><h2 id="sheet-title">Cadastrar negócio</h2></div>
      <button type="button" class="icon-btn" data-close aria-label="Fechar">✕</button></header>
    <form class="form" id="new-form" novalidate>
      <label class="field"><span class="lbl">Nome da empresa</span><input id="n-nome" required placeholder="Ex.: Clínica Sorriso"></label>
      <div class="grid2">
        <label class="field"><span class="lbl">Nicho</span><select id="n-nicho">${NICHOS.map(n=>`<option>${esc(n)}</option>`).join("")}<option>Outro</option></select></label>
        <label class="field"><span class="lbl">Prioridade</span><select id="n-prio"><option>Alta</option><option selected>Média</option><option>Baixa</option></select></label>
        <label class="field"><span class="lbl">Bairro / cidade</span><input id="n-bairro" placeholder="Ex.: Centro"></label>
        <label class="field"><span class="lbl">Telefone / WhatsApp</span><input id="n-tel" inputmode="tel" placeholder="(62) 99999-9999"></label>
      </div>
      <label class="field"><span class="lbl">Por que é bom lead (opcional)</span><textarea id="n-motivo" rows="2"></textarea></label>
      <p class="bad" id="n-err" hidden>Preencha o nome da empresa.</p>
      <button class="btn" type="submit">Salvar lead</button>
    </form>`;
  $("#new-form").addEventListener("submit",async e=>{
    e.preventDefault();
    const nome=$("#n-nome").value.trim();
    if(!nome){$("#n-err").hidden=false;$("#n-nome").focus();return;}
    let tel=$("#n-tel").value.trim(); const d=digits(tel);
    if(d.length===11) tel=`+55 ${d.slice(0,2)} ${d.slice(2,7)}-${d.slice(7)}`;
    const now=new Date().toISOString();
    const slug=nome.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"lead";
    const id=slug+"-"+Date.now().toString(36);
    const doc={nome,nicho:$("#n-nicho").value,bairro:$("#n-bairro").value.trim(),tel,prioridade:$("#n-prio").value,etapa:"a_contatar",nota:null,avaliacoes:null,
      motivo:$("#n-motivo").value.trim(),angulo:"",temSite:"",valor:null,followup:"",notas:"",log:[],ultimoContato:"",criado:now,atualizado:now};
    try{await window.crm.criar(id,doc);}catch(err){toast("Não deu pra salvar.");return;}
    if(!leads.find(x=>x.id===id)) leads.push(Object.assign({id},doc));
    render(); toast("Lead cadastrado"); openLead(id);
  });
  openSheet();
}

/* ---------- eventos da tela ---------- */
document.addEventListener("click",e=>{
  if(e.target.closest("[data-close]")){closeSheet();return;}
  if(e.target.closest("[data-new]")){openNew();return;}
  const s=e.target.closest("[data-so]"); if(s){ui.so=ui.so===s.dataset.so?"":s.dataset.so;renderStats();renderMain();return;}
  const u=e.target.closest("[data-url]"); if(u){window.crm.abrir(u.dataset.url);return;}
  const o=e.target.closest("[data-open]"); if(o&&!panel.contains(o)){openLead(o.dataset.open);}
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!sheet.hidden){closeSheet();return;}
  if((e.key==="Enter"||e.key===" ")&&e.target.matches("tr[data-open]")){e.preventDefault();openLead(e.target.dataset.open);}
});
$("#new-btn").addEventListener("click",openNew);
$("#q").addEventListener("input",e=>{ui.q=e.target.value;renderMain();});
$("#f-nicho").addEventListener("change",e=>{ui.nicho=e.target.value;renderMain();});
$("#f-prio-filter").addEventListener("change",e=>{ui.prio=e.target.value;renderMain();});
function setView(v){ui.view=v;try{localStorage.setItem("crm-view",v);}catch(err){}renderMain();}
$("#v-funil").addEventListener("click",()=>setView("funil"));
$("#v-lista").addEventListener("click",()=>setView("lista"));

const main=$("#main");
main.addEventListener("dragstart",e=>{const c=e.target.closest(".card");if(!c)return;e.dataTransfer.setData("text/plain",c.dataset.id);e.dataTransfer.effectAllowed="move";c.classList.add("dragging");});
main.addEventListener("dragend",e=>{const c=e.target.closest(".card");c&&c.classList.remove("dragging");main.querySelectorAll(".col.over").forEach(x=>x.classList.remove("over"));});
main.addEventListener("dragover",e=>{const c=e.target.closest(".col");if(!c)return;e.preventDefault();main.querySelectorAll(".col.over").forEach(x=>x!==c&&x.classList.remove("over"));c.classList.add("over");});
main.addEventListener("dragleave",e=>{const c=e.target.closest(".col");if(c&&!c.contains(e.relatedTarget))c.classList.remove("over");});
main.addEventListener("drop",e=>{const c=e.target.closest(".col");if(!c)return;e.preventDefault();c.classList.remove("over");const id=e.dataTransfer.getData("text/plain");if(id)moveStage(id,c.dataset.stage);});

/* ---------- ícones dos elementos fixos do HTML ---------- */
document.querySelectorAll("[data-ic]").forEach(el=>el.insertAdjacentHTML("afterbegin",ic(el.dataset.ic)));

/* ---------- dados ---------- */
function receber(lista){
  leads=lista;
  status="ready";
  $("#live").innerHTML=ic("sync")+"Sincronizado às "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  render();
}
render();
if(!window.crm){status="offline";render();}
else{
  window.crm.listar().then(receber);
  window.crm.aoMudar(receber);
  window.crm.aoNovidade(n=>{
    const live=$("#live");live.classList.remove("pulse");void live.offsetWidth;live.classList.add("pulse");
    toast(n===1?"1 lead atualizado pelo WhatsApp":`${n} leads atualizados pelo WhatsApp`);
  });
  window.crm.aoAviso(t=>{const b=$("#banner");b.textContent=t;b.hidden=false;});
  setInterval(()=>{if(status==="ready"&&sheet.hidden)renderMain();},60*1000); // tira a borda amarela dos cards que ficaram velhos
}
