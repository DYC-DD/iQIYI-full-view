const IQ_MATCHES = [
  "*://iq.com/*",
  "*://*.iq.com/*",
  "*://iqiyi.com/*",
  "*://*.iqiyi.com/*",
];

const MAIN_SCRIPT_ID = "iqiyi-inline-fs-main";
const MAIN_SCRIPT_PATH = "src/content/content-script.js";
const CONTENT_STYLE_PATH = "src/content/content.css";
const CONTENT_COMMAND_EVENT = "iqiyi-inline-fs:command";
const CONTENT_STYLE_MARKER_ATTR = "data-iq-inline-style-injected";
const CONTEXT_MENU_TOGGLE_ID = "iqiyi-inline-fs-toggle";
const CONTEXT_MENU_CONTEXTS = ["all"];
const CONTEXT_MENU_COMMANDS = {
  [CONTEXT_MENU_TOGGLE_ID]: "toggle",
};

function getMessage(key, fallback) {
  return chrome.i18n.getMessage(key) || fallback;
}

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

function createContextMenu(item) {
  chrome.contextMenus.create(item, () => {
    if (!chrome.runtime.lastError) return;

    console.warn(
      "[iqiyi-inline-fs] failed to create context menu",
      item.id,
      chrome.runtime.lastError
    );
  });
}

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.warn(
        "[iqiyi-inline-fs] failed to reset context menus",
        chrome.runtime.lastError
      );
      return;
    }

    const baseContext = {
      contexts: CONTEXT_MENU_CONTEXTS,
      documentUrlPatterns: IQ_MATCHES,
    };

    createContextMenu({
      ...baseContext,
      id: CONTEXT_MENU_TOGGLE_ID,
      title: getMessage("contextMenuToggle", "iQIYI Full View"),
    });
  });
}

async function sendInlineFullscreenCommand(tabId, command) {
  const [{ result: hasInjectedStyle } = {}] =
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      args: [CONTENT_STYLE_MARKER_ATTR],
      func: (styleMarkerAttr) =>
        document.documentElement.hasAttribute(styleMarkerAttr),
    });

  if (!hasInjectedStyle) {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: [CONTENT_STYLE_PATH],
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      args: [CONTENT_STYLE_MARKER_ATTR],
      func: (styleMarkerAttr) => {
        document.documentElement.setAttribute(styleMarkerAttr, "");
      },
    });
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [MAIN_SCRIPT_PATH],
    world: "MAIN",
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [CONTENT_COMMAND_EVENT, command],
    func: (eventName, nextCommand) => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { command: nextCommand },
        })
      );
    },
  });
}

ensureMainWorldScript().catch((error) => {
  console.error("[iqiyi-inline-fs] failed to register content script", error);
});

chrome.runtime.onInstalled.addListener(setupContextMenus);
chrome.runtime.onStartup.addListener(setupContextMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const command = CONTEXT_MENU_COMMANDS[info.menuItemId];
  if (!command || !tab?.id) return;

  sendInlineFullscreenCommand(tab.id, command).catch((error) => {
    console.error("[iqiyi-inline-fs] failed to run context menu command", error);
  });
});
