const IQ_MATCHES = [
  "*://iq.com/*",
  "*://*.iq.com/*",
  "*://iqiyi.com/*",
  "*://*.iqiyi.com/*",
];

const MAIN_SCRIPT_ID = "iqiyi-inline-fs-main";
const MAIN_SCRIPT_PATH = "src/content/content-script.js";

function hasSameItems(actual = [], expected = []) {
  if (actual.length !== expected.length) return false;

  const actualSet = new Set(actual);
  return expected.every((item) => actualSet.has(item));
}

function isMainWorldScriptCurrent(script) {
  return (
    script?.js?.length === 1 &&
    script.js[0] === MAIN_SCRIPT_PATH &&
    script.runAt === "document_idle" &&
    script.world === "MAIN" &&
    hasSameItems(script.matches, IQ_MATCHES)
  );
}

async function ensureMainWorldScript() {
  const existing = await chrome.scripting.getRegisteredContentScripts({
    ids: [MAIN_SCRIPT_ID],
  });
  if (existing.length > 0) {
    const [script] = existing;
    if (isMainWorldScriptCurrent(script)) return;

    await chrome.scripting.unregisterContentScripts({
      ids: [MAIN_SCRIPT_ID],
    });
  }

  await chrome.scripting.registerContentScripts([
    {
      id: MAIN_SCRIPT_ID,
      matches: IQ_MATCHES,
      js: [MAIN_SCRIPT_PATH],
      runAt: "document_idle",
      world: "MAIN",
    },
  ]);
}

ensureMainWorldScript().catch((error) => {
  console.error("[iqiyi-inline-fs] failed to register content script", error);
});
