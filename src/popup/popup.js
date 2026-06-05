const SHORTCUT_MARKUP_PATTERN = /<b>(F|Esc)<\/b>/gi;

const getMessage = (key) => chrome.i18n.getMessage(key) || "";

const getElement = (id) => document.getElementById(id);

const setLocalizedText = (id, messageKey) => {
  const element = getElement(id);
  if (element) element.textContent = getMessage(messageKey);
};

const renderShortcutDescription = (element, message) => {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const match of message.matchAll(SHORTCUT_MARKUP_PATTERN)) {
    if (match.index > lastIndex) {
      fragment.append(
        document.createTextNode(message.slice(lastIndex, match.index))
      );
    }

    const shortcut = document.createElement("b");
    shortcut.textContent = match[1];
    fragment.append(shortcut);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < message.length) {
    fragment.append(document.createTextNode(message.slice(lastIndex)));
  }

  element.replaceChildren(fragment);
};

const createStatusDot = (isActive) => {
  const dot = document.createElement("span");
  dot.className = `status-dot ${isActive ? "active" : "inactive"}`;
  dot.setAttribute("aria-hidden", "true");
  return dot;
};

const setStatus = (isActive) => {
  const statusValue = getElement("statusValue");
  if (!statusValue) return;

  const messageKey = isActive ? "popupActive" : "popupInactive";
  statusValue.className = `value ${isActive ? "active" : "inactive"}`;
  statusValue.replaceChildren(
    createStatusDot(isActive),
    document.createTextNode(getMessage(messageKey))
  );
};

const isIqiyiUrl = (url) => {
  if (!url) return false;

  try {
    const { hostname } = new URL(url);
    return /(?:^|\.)iq(?:iyi)?\.com$/i.test(hostname);
  } catch (_) {
    return false;
  }
};

const updateCurrentTabStatus = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs = []) => {
    if (chrome.runtime.lastError) {
      setStatus(false);
      return;
    }

    setStatus(isIqiyiUrl(tabs[0]?.url || ""));
  });
};

setLocalizedText("title", "popupTitle");

const description = getElement("desc");
if (description) {
  renderShortcutDescription(description, getMessage("popupDesc"));
}

updateCurrentTabStatus();
