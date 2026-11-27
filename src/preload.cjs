// Única porta entre a tela e o disco: a página não tem acesso ao Node.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("crm", {
  listar: () => ipcRenderer.invoke("crm:listar"),
  salvar: (id, patch) => ipcRenderer.invoke("crm:salvar", id, patch),
  criar: (id, doc) => ipcRenderer.invoke("crm:criar", id, doc),
  excluir: (id) => ipcRenderer.invoke("crm:excluir", id),
  abrir: (url) => ipcRenderer.invoke("crm:abrir", url),
  aoMudar: (fn) => ipcRenderer.on("crm:leads", (_e, leads) => fn(leads)),
  aoNovidade: (fn) => ipcRenderer.on("crm:novidade", (_e, n) => fn(n)),
  aoAviso: (fn) => ipcRenderer.on("crm:aviso", (_e, t) => fn(t)),
});
