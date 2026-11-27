// Processo principal do Ipê CRM: guarda os leads em disco e acompanha os eventos da ponte do WhatsApp.
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { existsSync, watchFile } from "node:fs";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { aplicarEventos, lerEventos } from "./sync.js";

const AQUI = dirname(fileURLToPath(import.meta.url));
const INTERVALO_MS = 2000;
const PASTA_PADRAO = join(homedir(), "Documents", "Websites Claude", "atendimento-whatsapp", "dados");

let janela = null;
let pastaDados = "";
let leads = {};
let fila = Promise.resolve(); // grava uma coisa de cada vez

const caminho = {
  config: () => join(app.getPath("userData"), "config.json"),
  leads: () => join(pastaDados, "crm", "leads.json"),
  cursor: () => join(pastaDados, "crm", "cursor.txt"),
  eventos: () => join(pastaDados, "crm-eventos.jsonl"),
  importar: () => join(pastaDados, "crm-import", "leads"),
  cursorAntigo: () => join(pastaDados, "crm-sync-cursor.txt"),
};

const lerJson = async (arquivo, padrao) => (existsSync(arquivo) ? JSON.parse(await readFile(arquivo, "utf8")) : padrao);

async function gravarAtomico(arquivo, texto) {
  await mkdir(dirname(arquivo), { recursive: true });
  const tmp = `${arquivo}.tmp`;
  await writeFile(tmp, texto, "utf8");
  await rename(tmp, arquivo);
}

const enfileirar = (tarefa) => (fila = fila.then(tarefa).catch((erro) => avisar(`Erro ao salvar: ${erro.message}`)));
const salvarLeads = () => gravarAtomico(caminho.leads(), JSON.stringify(leads, null, 1));
const avisar = (texto) => janela?.webContents.send("crm:aviso", texto);
const lista = () => Object.entries(leads).map(([id, l]) => ({ id, ...l }));
const publicar = () => janela?.webContents.send("crm:leads", lista());

/** Pasta "dados" da ponte do WhatsApp: a salva, a padrão, ou a que o usuário escolher. */
async function escolherPasta() {
  const config = await lerJson(caminho.config(), {});
  if (config.dados && existsSync(config.dados)) return config.dados;
  let pasta = PASTA_PADRAO;
  if (!existsSync(join(pasta, "crm-eventos.jsonl"))) {
    const r = await dialog.showOpenDialog({ title: "Onde fica a pasta \"dados\" da ponte do WhatsApp?", properties: ["openDirectory"] });
    if (r.canceled || !r.filePaths[0]) return "";
    pasta = r.filePaths[0];
  }
  await gravarAtomico(caminho.config(), JSON.stringify({ ...config, dados: pasta }, null, 2));
  return pasta;
}

/** Primeira vez: traz os leads exportados do CRM antigo e continua do ponto em que ele parou. */
async function importarSeVazio() {
  if (existsSync(caminho.leads())) return;
  const pasta = caminho.importar();
  if (existsSync(pasta)) {
    for (const nome of await readdir(pasta)) {
      if (!nome.endsWith(".json")) continue;
      const { id, version, ...dados } = await lerJson(join(pasta, nome), {});
      leads[nome.slice(0, -5)] = dados;
    }
  }
  const cursor = existsSync(caminho.cursorAntigo()) ? (await readFile(caminho.cursorAntigo(), "utf8")).trim() : "0";
  await salvarLeads();
  await gravarAtomico(caminho.cursor(), cursor);
}

/** Todas as filas da prospecção (fila*.json), indexadas pelo id do lead. */
async function lerFilas() {
  const pasta = join(pastaDados, "prospeccao");
  const filas = {};
  if (!existsSync(pasta)) return filas;
  for (const nome of await readdir(pasta)) {
    if (!/^fila.*\.json$/.test(nome)) continue;
    try {
      for (const item of await lerJson(join(pasta, nome), [])) if (item?.id) filas[item.id] = item;
    } catch { /* fila sendo reescrita pela ponte: tenta de novo no próximo evento */ }
  }
  return filas;
}

/** Aplica o que chegou de novo no crm-eventos.jsonl desde a última leitura. */
function sincronizar() {
  return enfileirar(async () => {
    if (!existsSync(caminho.eventos())) return;
    const desde = Number((await readFile(caminho.cursor(), "utf8").catch(() => "0")).trim()) || 0;
    const { eventos, total } = lerEventos(await readFile(caminho.eventos(), "utf8"), desde);
    if (total <= desde) return;
    const r = aplicarEventos(leads, eventos, await lerFilas());
    leads = r.leads;
    await salvarLeads();
    await gravarAtomico(caminho.cursor(), String(total));
    publicar();
    if (r.mudados.length) janela?.webContents.send("crm:novidade", r.mudados.length);
  });
}

ipcMain.handle("crm:listar", () => lista());
ipcMain.handle("crm:salvar", (_e, id, patch) => enfileirar(async () => {
  if (!leads[id] || typeof patch !== "object") return;
  leads = { ...leads, [id]: { ...leads[id], ...patch } };
  await salvarLeads();
}));
ipcMain.handle("crm:criar", (_e, id, doc) => enfileirar(async () => {
  if (typeof id !== "string" || !id || leads[id]) return;
  leads = { ...leads, [id]: doc };
  await salvarLeads();
}));
ipcMain.handle("crm:excluir", (_e, id) => enfileirar(async () => {
  const { [id]: _fora, ...resto } = leads;
  leads = resto;
  await salvarLeads();
}));
ipcMain.handle("crm:abrir", (_e, url) => {
  if (/^https:\/\/(wa\.me|www\.google\.com\/maps)\//.test(String(url))) return shell.openExternal(url);
});

async function iniciar() {
  pastaDados = await escolherPasta();
  if (!pastaDados) return app.quit();
  await importarSeVazio();
  leads = await lerJson(caminho.leads(), {});

  janela = new BrowserWindow({
    width: 1360, height: 860, minWidth: 380, title: "Ipê CRM", backgroundColor: "#00000000", backgroundMaterial: "acrylic", // vidro nativo do Windows 11
    darkTheme: true, titleBarStyle: "hidden", titleBarOverlay: { color: "#00000000", symbolColor: "#E6E7EA", height: 40 },
    icon: join(AQUI, "..", "build", "icon.png"), autoHideMenuBar: true,
    webPreferences: { preload: join(AQUI, "preload.cjs"), contextIsolation: true, sandbox: true },
  });
  janela.maximize();
  janela.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  await janela.loadFile(join(AQUI, "index.html"));
  sincronizar();
  watchFile(caminho.eventos(), { interval: INTERVALO_MS }, () => sincronizar());
}

app.commandLine.appendSwitch("lang", "pt-BR"); // datas em DD/MM/AAAA
app.whenReady().then(iniciar);
app.on("window-all-closed", () => app.quit());
