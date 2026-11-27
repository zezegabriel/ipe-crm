import { test } from "node:test";
import assert from "node:assert/strict";
import { aplicarEventos, lerEventos, somarDiasUteis, diaBR } from "../src/sync.js";

const base = { nome: "Clínica X", etapa: "a_contatar", prioridade: "Média", log: [], notas: "", followup: "" };

test("enviado: a_contatar vira contatado e retorno em 2 dias úteis", () => {
  const { leads } = aplicarEventos({ x: base }, [{ em: "2026-11-27T13:00:00Z", leadId: "x", tipo: "enviado", mensagem: "Oi" }]);
  assert.equal(leads.x.etapa, "contatado");
  assert.equal(leads.x.followup, "2026-12-01"); // sexta + 2 úteis = terça
  assert.equal(leads.x.log[0].t, "WhatsApp automático: Oi");
  assert.equal(leads.x.log[1].sys, true);
});

test("resposta do cliente vira respondeu; não volta etapa de quem já está em reunião", () => {
  const ev = { em: "2026-11-26T15:00:00Z", leadId: "x", tipo: "mensagem_cliente", texto: "quanto custa?" };
  assert.equal(aplicarEventos({ x: { ...base, etapa: "contatado" } }, [ev]).leads.x.etapa, "respondeu");
  assert.equal(aplicarEventos({ x: { ...base, etapa: "reuniao" } }, [ev]).leads.x.etapa, "reuniao");
});

test("optout fecha como perdido e limpa retorno", () => {
  const { leads } = aplicarEventos({ x: { ...base, followup: "2026-12-01" } }, [{ em: "2026-11-26T15:00:00Z", leadId: "x", tipo: "optout" }]);
  assert.equal(leads.x.etapa, "perdido");
  assert.equal(leads.x.followup, "");
});

test("lead que não existe é criado da fila; sem leadId vira whatsapp-<número>", () => {
  const filas = { "sdr-1": { id: "sdr-1", nome: "Dra. Ana", nicho: "Estética", cidade: "Goiânia", tel: "5562999990000" } };
  const { leads, mudados } = aplicarEventos({}, [
    { em: "2026-11-26T12:00:00Z", leadId: "sdr-1", tipo: "enviado", mensagem: "Oi" },
    { em: "2026-11-26T12:05:00Z", leadId: null, numero: "556211112222", tipo: "mensagem_cliente", texto: "*João*:\noi" },
    { em: "2026-11-26T12:06:00Z", leadId: null, numero: "556233334444", tipo: "enviado", mensagem: "x" },
  ], filas);
  assert.equal(leads["sdr-1"].nome, "Dra. Ana");
  assert.equal(leads["sdr-1"].tel, "+5562999990000");
  assert.equal(leads["whatsapp-556211112222"].nome, "João");
  assert.equal(leads["whatsapp-556233334444"], undefined);
  assert.deepEqual(mudados.sort(), ["sdr-1", "whatsapp-556211112222"]);
});

test("não muda o objeto original", () => {
  const leads = { x: base };
  aplicarEventos(leads, [{ em: "2026-11-26T12:00:00Z", leadId: "x", tipo: "humano" }]);
  assert.equal(leads.x.log.length, 0);
});

test("lerEventos deixa para depois a linha que ainda está sendo escrita", () => {
  const r = lerEventos('{"a":1}\n{"b":2}\n{"c":', 1);
  assert.deepEqual(r.eventos, [{ b: 2 }]);
  assert.equal(r.total, 2);
});

test("datas: fuso de Brasília e fim de semana", () => {
  assert.equal(diaBR("2026-11-27T02:00:00Z"), "2026-11-26");
  assert.equal(somarDiasUteis("2026-11-26", 2), "2026-11-30");
});
