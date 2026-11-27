// Aplica os eventos da ponte do WhatsApp (crm-eventos.jsonl) nos leads do CRM.
// Funções puras: recebem os leads e devolvem uma cópia nova, sem tocar em disco.

const MAX_LOG = 60;
const ETAPA_NOME = {
  a_contatar: "A contatar", contatado: "Contatado", respondeu: "Respondeu", reuniao: "Reunião",
  proposta: "Proposta", fechado: "Fechado", perdido: "Perdido",
};

/** Data AAAA-MM-DD no fuso de Brasília. */
export const diaBR = (iso) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

/** Soma dias úteis (seg–sex) a uma data AAAA-MM-DD. */
export function somarDiasUteis(dia, n) {
  const d = new Date(`${dia}T12:00:00Z`);
  let faltam = n;
  while (faltam > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const semana = d.getUTCDay();
    if (semana !== 0 && semana !== 6) faltam--;
  }
  return d.toISOString().slice(0, 10);
}

const soDigitos = (t) => String(t ?? "").replace(/\D/g, "");

/** Lead novo vindo de uma fila da prospecção ({ id, nome, nicho, bairro|cidade, tel, ... }). */
export function leadDaFila(item, agora) {
  const europa = String(item.id).startsWith("eu-");
  const notas = europa ? `Europa (${item.fuso === "Europe/Malta" ? "Malta" : "Irlanda"}), conversa em inglês` : (item.notas ?? "");
  return {
    nome: item.nome ?? item.id, nicho: item.nicho ?? "", bairro: item.bairro || item.cidade || "",
    tel: item.tel ? `+${soDigitos(item.tel)}` : "", etapa: "a_contatar", prioridade: "Média",
    nota: typeof item.nota === "number" ? item.nota : null, avaliacoes: item.avaliacoes ?? null,
    motivo: item.motivo ?? "", angulo: item.angulo ?? "", temSite: item.temSite ?? "", valor: null,
    notas, log: [], ultimoContato: "", followup: "", criado: agora, atualizado: agora,
  };
}

/** Lead para quem escreveu sem estar em fila nenhuma (entrou pelo site ou pelo WhatsApp). */
export function leadDoWhatsapp(numero, agora, nome) {
  return {
    nome: nome || `Contato ${numero}`, nicho: "Entrou pelo WhatsApp", bairro: "", tel: numero ? `+${numero}` : "",
    etapa: "respondeu", prioridade: "Alta", nota: null, avaliacoes: null, motivo: "", angulo: "", temSite: "",
    valor: null, notas: "", log: [], ultimoContato: "", followup: "", criado: agora, atualizado: agora,
  };
}

const comLog = (lead, em, t, sys = false) => ({ ...lead, log: [{ d: em, t, sys }, ...(lead.log ?? [])].slice(0, MAX_LOG) });

function mudarEtapa(lead, para, em) {
  if (lead.etapa === para) return lead;
  return { ...comLog(lead, em, `Etapa: ${ETAPA_NOME[lead.etapa] ?? "A contatar"} → ${ETAPA_NOME[para]}`, true), etapa: para };
}

const curto = (t, n) => String(t ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const somarNota = (notas, frase) => [notas, frase].filter(Boolean).join("\n");

/** Aplica um evento num lead e devolve o lead novo. */
export function aplicarEvento(lead, ev) {
  const dia = diaBR(ev.em);
  let l = { ...lead, atualizado: ev.em };
  switch (ev.tipo) {
    case "enviado":
      if (l.etapa === "a_contatar") l = mudarEtapa(l, "contatado", ev.em);
      l = comLog(l, ev.em, `WhatsApp automático: ${curto(ev.mensagem, 160)}`);
      return { ...l, ultimoContato: dia, followup: somarDiasUteis(dia, 2) };
    case "sem_whatsapp":
      l = comLog(l, ev.em, "Número sem WhatsApp (envio pulado)");
      return { ...l, notas: somarNota(l.notas, "Número sem WhatsApp (envio pulado)") };
    case "mensagem_cliente":
      if (l.etapa === "a_contatar" || l.etapa === "contatado") l = mudarEtapa(l, "respondeu", ev.em);
      return { ...comLog(l, ev.em, `Cliente: ${curto(ev.texto, 200)}`), ultimoContato: dia, followup: dia };
    case "orcamento":
      return { ...comLog(l, ev.em, `Pediu orçamento: ${curto(JSON.stringify(ev.orcamento ?? {}), 200)}`), prioridade: "Alta", followup: dia };
    case "humano":
      return { ...comLog(l, ev.em, `Bot passou a conversa para você${ev.motivo ? ` (${ev.motivo})` : ""}`), followup: dia };
    case "qualificacao": {
      const q = ev.qualificacao ?? {};
      const frase = `Qualificado: precisa ${q.necessidade ?? "?"} | prazo ${q.prazo ?? "não disse"} | orçamento ${q.orcamento || "não disse"}`;
      l = comLog(l, ev.em, frase);
      return { ...l, notas: somarNota(l.notas, frase), prioridade: "Alta", followup: dia };
    }
    case "previa_pedida":
      return { ...comLog(l, ev.em, "Pediu a prévia (aguardando sua aprovação)"), prioridade: "Alta", followup: dia };
    case "reuniao": {
      const [data, hora] = String(ev.horario ?? "").split("T");
      l = mudarEtapa(l, "reuniao", ev.em);
      const rotulo = data ? `${data.slice(8, 10)}/${data.slice(5, 7)} às ${Number(hora?.slice(0, 2))}h` : "horário não informado";
      return { ...comLog(l, ev.em, `Conversa marcada: ${rotulo}`), prioridade: "Alta", followup: data || dia };
    }
    case "sem_interesse":
    case "optout":
      l = mudarEtapa(l, "perdido", ev.em);
      return { ...comLog(l, ev.em, ev.tipo === "optout" ? "Pediu para sair (SAIR)" : "Sem interesse"), followup: "" };
    default:
      return lead;
  }
}

/** Nome que a pessoa usa no WhatsApp, quando vem no texto ("*Fulano*:\n..."). */
const nomeNoTexto = (texto) => /^\*([^*\n]{2,60})\*:/.exec(String(texto ?? ""))?.[1]?.trim() ?? "";

/**
 * Aplica uma lista de eventos. `filas` mapeia leadId → item da fila, para criar leads que ainda não existem.
 * @returns {{ leads: Record<string, object>, mudados: string[] }}
 */
export function aplicarEventos(leads, eventos, filas = {}) {
  const novo = { ...leads };
  const mudados = new Set();
  for (const ev of eventos) {
    if (!ev?.tipo || !ev.em) continue;
    const numero = soDigitos(ev.numero);
    let id = ev.leadId;
    if (!id) {
      if (!numero || ev.tipo === "enviado") continue;
      id = `whatsapp-${numero}`;
      if (!novo[id]) novo[id] = leadDoWhatsapp(numero, ev.em, nomeNoTexto(ev.texto));
    } else if (!novo[id]) {
      novo[id] = filas[id] ? leadDaFila(filas[id], ev.em) : { ...leadDoWhatsapp(numero, ev.em, id), etapa: "a_contatar", prioridade: "Média", nicho: "" };
    }
    novo[id] = aplicarEvento(novo[id], ev);
    mudados.add(id);
  }
  return { leads: novo, mudados: [...mudados] };
}

/** Lê as linhas do .jsonl a partir de `desde` (linhas já processadas). Linha cortada no meio da escrita é pulada. */
export function lerEventos(conteudo, desde) {
  // Só conta linhas terminadas em "\n": a última pode estar sendo escrita agora e fica para a próxima leitura.
  const completas = conteudo.slice(0, conteudo.lastIndexOf("\n") + 1).split("\n").filter((l) => l.trim());
  const eventos = [];
  for (const linha of completas.slice(desde)) {
    try { eventos.push(JSON.parse(linha)); } catch { /* linha corrompida: pula */ }
  }
  return { eventos, total: completas.length };
}
