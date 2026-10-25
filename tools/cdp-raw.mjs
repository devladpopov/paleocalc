// Сырой CDP к RU-браузеру 9224 (playwright connectOverCDP там зависает).
// node cdp-raw.mjs step.mjs; step: default async ({ send, ev, waitEvent, sleep }) => result
const ver = await (await fetch("http://127.0.0.1:9224/json/version")).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map(); const listeners = [];
ws.onmessage = m => {
  const d = JSON.parse(String(m.data));
  if (d.id && pend.has(d.id)) { const [r, j] = pend.get(d.id); pend.delete(d.id); d.error ? j(new Error(JSON.stringify(d.error))) : r(d.result); }
  else if (d.method) for (const l of [...listeners]) l(d);
};
let sessionId;
const raw = (method, params = {}, sid) => new Promise((r, j) => { const i = ++id; pend.set(i, [r, j]); ws.send(JSON.stringify({ id: i, method, params, ...(sid ? { sessionId: sid } : {}) })); });
const { targetInfos } = await raw("Target.getTargets");
const t = targetInfos.find(x => x.type === "page" && x.url.includes("habr.com")) || targetInfos.find(x => x.type === "page");
({ sessionId } = await raw("Target.attachToTarget", { targetId: t.targetId, flatten: true }));
const send = (m, p) => raw(m, p, sessionId);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const waitEvent = (name, ms = 15000) => new Promise((r, j) => { const l = d => { if (d.method === name) { listeners.splice(listeners.indexOf(l), 1); r(d.params); } }; listeners.push(l); setTimeout(() => j(new Error("timeout " + name)), ms); });
const ev = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; };
await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable");
const step = (await import("file:///" + process.argv[2])).default;
try { console.log(JSON.stringify(await step({ send, ev, waitEvent, sleep }), null, 1)); } catch (e) { console.log("ERR", e.message); }
try { const s = await send("Page.captureScreenshot", { format: "png" }); (await import("fs")).writeFileSync("C:/Users/Vlad/Projects/sci-paleokal-kulyator/.habr.png", Buffer.from(s.data, "base64")); } catch {}
await raw("Target.detachFromTarget", { sessionId }).catch(() => {});
ws.close(); process.exit(0);
