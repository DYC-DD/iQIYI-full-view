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
const AUTO_CLOSE_CENTER_AD_STORAGE_KEY = "autoCloseCenterAdEnabled";
const AUTO_CLOSE_CENTER_AD_COMMAND = "setAutoCloseAd";
const LEGACY_AUTO_CLOSE_CENTER_AD_COMMAND = "setAutoCloseCenterAd";
const AUTO_CLOSE_CENTER_AD_MESSAGE = "iqiyi-inline-fs:auto-close-center-ad";
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

function isIqiyiUrl(url) {
  if (!url) return false;

  try {
    const { hostname } = new URL(url);
    return /(?:^|\.)iq(?:iyi)?\.com$/i.test(hostname);
  } catch (_) {
    return false;
  }
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

async function ensureContentStyle(tabId) {
  const [{ result: hasInjectedStyle } = {}] =
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      args: [CONTENT_STYLE_MARKER_ATTR],
      func: (styleMarkerAttr) =>
        document.documentElement.hasAttribute(styleMarkerAttr),
    });

  if (hasInjectedStyle) return;

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

async function sendContentCommand(tabId, command, detail = {}) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [MAIN_SCRIPT_PATH],
    world: "MAIN",
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [CONTENT_COMMAND_EVENT, { command, ...detail }],
    func: (eventName, nextDetail) => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: nextDetail,
        })
      );
    },
  });
}

async function sendInlineFullscreenCommand(tabId, command) {
  await ensureContentStyle(tabId);
  await sendContentCommand(tabId, command);
}

async function getAutoCloseCenterAdEnabled() {
  const items = await chrome.storage.local.get({
    [AUTO_CLOSE_CENTER_AD_STORAGE_KEY]: false,
  });
  return Boolean(items[AUTO_CLOSE_CENTER_AD_STORAGE_KEY]);
}

async function sendAutoCloseCenterAdState(tabId, enabled) {
  await sendContentCommand(tabId, LEGACY_AUTO_CLOSE_CENTER_AD_COMMAND, {
    enabled: false,
  });
  await sendContentCommand(tabId, AUTO_CLOSE_CENTER_AD_COMMAND, { enabled });
}

async function syncAutoCloseCenterAdToTab(tabId) {
  const enabled = await getAutoCloseCenterAdEnabled();
  await sendAutoCloseCenterAdState(tabId, enabled);
}

async function syncAutoCloseCenterAdToIqiyiTabs(enabled) {
  const nextEnabled =
    typeof enabled === "boolean"
      ? enabled
      : await getAutoCloseCenterAdEnabled();
  const tabs = await chrome.tabs.query({ url: IQ_MATCHES });

  await Promise.allSettled(
    tabs
      .filter((tab) => tab.id)
      .map((tab) => sendAutoCloseCenterAdState(tab.id, nextEnabled))
  );
}

ensureMainWorldScript().catch((error) => {
  console.error("[iqiyi-inline-fs] failed to register content script", error);
});

syncAutoCloseCenterAdToIqiyiTabs().catch((error) => {
  console.warn("[iqiyi-inline-fs] failed to sync auto close ad setting", error);
});

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
  syncAutoCloseCenterAdToIqiyiTabs().catch((error) => {
    console.warn(
      "[iqiyi-inline-fs] failed to sync auto close ad setting",
      error
    );
  });
});
chrome.runtime.onStartup.addListener(() => {
  setupContextMenus();
  syncAutoCloseCenterAdToIqiyiTabs().catch((error) => {
    console.warn(
      "[iqiyi-inline-fs] failed to sync auto close ad setting",
      error
    );
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const command = CONTEXT_MENU_COMMANDS[info.menuItemId];
  if (!command || !tab?.id) return;

  sendInlineFullscreenCommand(tab.id, command).catch((error) => {
    console.error(
      "[iqiyi-inline-fs] failed to run context menu command",
      error
    );
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!isIqiyiUrl(tab.url || changeInfo.url)) return;

  syncAutoCloseCenterAdToTab(tabId).catch((error) => {
    console.warn(
      "[iqiyi-inline-fs] failed to sync auto close ad setting",
      error
    );
  });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (!changes[AUTO_CLOSE_CENTER_AD_STORAGE_KEY]) return;

  syncAutoCloseCenterAdToIqiyiTabs(
    Boolean(changes[AUTO_CLOSE_CENTER_AD_STORAGE_KEY].newValue)
  ).catch((error) => {
    console.warn(
      "[iqiyi-inline-fs] failed to sync auto close ad setting",
      error
    );
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== AUTO_CLOSE_CENTER_AD_MESSAGE) return false;

  syncAutoCloseCenterAdToIqiyiTabs(Boolean(message.enabled))
    .then(() => {
      sendResponse({ ok: true });
    })
    .catch((error) => {
      console.warn(
        "[iqiyi-inline-fs] failed to sync auto close ad setting",
        error
      );
      sendResponse({ ok: false });
    });

  return true;
});
