(() => {
  const LOADED_FLAG = "__iqiyiInlineFsLoaded";

  if (window[LOADED_FLAG]) return;
  window[LOADED_FLAG] = true;

  const ROOT_CLASS = "iqiyi-inline-fullscreen";
  const ROOT_ATTR = "data-iq-inline-root";
  const CLEARED_ATTR = "data-iq-inline-cleared";
  const HIDDEN_CHROME_ATTR = "data-iq-inline-hidden-chrome";
  const TOP_OFFSET_VAR = "--iq-inline-top-offset";
  const COMMAND_EVENT = "iqiyi-inline-fs:command";
  const DEFAULT_TOP_OFFSET = 0;
  const MAX_TOP_OFFSET = 120;
  const MAX_TOP_OFFSET_RATIO = 0.35;

  const PRIMARY_PLAYER_SELECTOR =
    ".iqp-player-g, [data-player-hook='container'], .iqp-player-pc";
  const FALLBACK_PLAYER_SELECTORS = [
    "#flashbox",
    "#intl-video-wrap",
    ".intl-video-wrap",
    ".intl-video-area",
    "video",
  ];
  const HIDDEN_PAGE_CHROME_SELECTORS = [".header-container"];
  const TOP_BAR_SELECTORS = [
    "header",
    "nav",
    "[role='banner']",
    "[class*='header']",
    "[class*='Header']",
    "[class*='nav']",
    "[class*='Nav']",
    "[class*='top']",
    "[class*='Top']",
  ];
  const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

  const state = {
    activeRoot: null,
    clearedAncestors: [],
    hiddenPageChrome: [],
    viewportOffsetHandler: null,
  };

  const isInlineFullscreenEnabled = () =>
    document.documentElement.classList.contains(ROOT_CLASS);

  const isEditableTarget = (target) => {
    if (!(target instanceof Element)) return false;
    return target.isContentEditable || EDITABLE_TAGS.has(target.tagName);
  };

  const queryFirst = (selectors) => {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  };

  const findPlayerRoot = () =>
    document.querySelector(PRIMARY_PLAYER_SELECTOR) ||
    queryFirst(FALLBACK_PLAYER_SELECTORS);

  const shouldClearAncestor = (styles) => {
    const willChange = styles.willChange || "";

    return (
      styles.transform !== "none" ||
      styles.filter !== "none" ||
      styles.perspective !== "none" ||
      styles.contain !== "none" ||
      willChange.includes("transform") ||
      willChange.includes("width") ||
      willChange.includes("height")
    );
  };

  const clearAncestorViewportBoundaries = (element) => {
    const cleared = [];

    for (
      let parent = element.parentElement;
      parent && parent !== document.documentElement;
      parent = parent.parentElement
    ) {
      if (!shouldClearAncestor(getComputedStyle(parent))) continue;

      parent.setAttribute(CLEARED_ATTR, "");
      cleared.push(parent);
    }

    return cleared;
  };

  const restoreClearedAncestors = () => {
    for (const element of state.clearedAncestors) {
      element.removeAttribute(CLEARED_ATTR);
    }
    state.clearedAncestors = [];
  };

  const hidePageChrome = (root) => {
    const hidden = [];

    for (const element of document.querySelectorAll(
      HIDDEN_PAGE_CHROME_SELECTORS.join(",")
    )) {
      if (root === element || root.contains(element)) continue;

      element.setAttribute(HIDDEN_CHROME_ATTR, "");
      hidden.push(element);
    }

    return hidden;
  };

  const restoreHiddenPageChrome = () => {
    for (const element of state.hiddenPageChrome) {
      element.removeAttribute(HIDDEN_CHROME_ATTR);
    }
    state.hiddenPageChrome = [];
  };

  const isVisibleElement = (element) => {
    const styles = getComputedStyle(element);
    const opacity = Number.parseFloat(styles.opacity || "1");

    return (
      styles.display !== "none" &&
      styles.visibility !== "hidden" &&
      Number.isFinite(opacity) &&
      opacity > 0
    );
  };

  const getViewportSize = () => ({
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  });

  const isTopBarCandidate = (element, viewportWidth) => {
    if (state.activeRoot === element || state.activeRoot?.contains(element)) {
      return false;
    }
    if (!isVisibleElement(element)) return false;

    const rect = element.getBoundingClientRect();
    const coversPageWidth = rect.width >= viewportWidth * 0.45;
    const sitsAtTop = rect.top <= 8 && rect.bottom >= 40 && rect.bottom <= 160;

    return coversPageWidth && sitsAtTop;
  };

  const detectTopOffset = () => {
    const viewport = getViewportSize();
    const maxOffset = Math.max(
      0,
      Math.min(
        MAX_TOP_OFFSET,
        Math.floor(viewport.height * MAX_TOP_OFFSET_RATIO)
      )
    );
    let offset = 0;

    for (const element of document.querySelectorAll(
      TOP_BAR_SELECTORS.join(",")
    )) {
      if (!isTopBarCandidate(element, viewport.width)) continue;
      offset = Math.max(offset, element.getBoundingClientRect().bottom);
    }

    return Math.round(Math.min(maxOffset, offset || DEFAULT_TOP_OFFSET));
  };

  const applyTopOffset = () => {
    document.documentElement.style.setProperty(
      TOP_OFFSET_VAR,
      `${detectTopOffset()}px`
    );
  };

  const startTopOffsetUpdates = () => {
    if (state.viewportOffsetHandler) return;

    state.viewportOffsetHandler = () => {
      if (isInlineFullscreenEnabled()) applyTopOffset();
    };
    window.addEventListener("resize", state.viewportOffsetHandler);
    window.visualViewport?.addEventListener(
      "resize",
      state.viewportOffsetHandler
    );
  };

  const stopTopOffsetUpdates = () => {
    if (!state.viewportOffsetHandler) return;

    window.removeEventListener("resize", state.viewportOffsetHandler);
    window.visualViewport?.removeEventListener(
      "resize",
      state.viewportOffsetHandler
    );
    state.viewportOffsetHandler = null;
  };

  const describeElement = (element) => {
    const className =
      typeof element.className === "string" ? element.className : "";
    return `${element.tagName}${className ? `.${className}` : ""}`;
  };

  const enableInlineFullscreen = () => {
    if (isInlineFullscreenEnabled()) return;

    const root = findPlayerRoot();
    if (!root) {
      console.warn("[iqiyi-inline-fs] no player root found");
      return;
    }

    state.activeRoot = root;
    root.setAttribute(ROOT_ATTR, "");
    state.hiddenPageChrome = hidePageChrome(root);
    state.clearedAncestors = clearAncestorViewportBoundaries(root);
    document.documentElement.style.setProperty(TOP_OFFSET_VAR, "0px");
    document.documentElement.classList.add(ROOT_CLASS);
    applyTopOffset();
    startTopOffsetUpdates();
    console.log("[iqiyi-inline-fs] enabled on", describeElement(root));
  };

  const disableInlineFullscreen = () => {
    if (!isInlineFullscreenEnabled()) return;

    document.documentElement.classList.remove(ROOT_CLASS);
    state.activeRoot?.removeAttribute(ROOT_ATTR);
    state.activeRoot = null;
    restoreHiddenPageChrome();
    restoreClearedAncestors();
    stopTopOffsetUpdates();
    document.documentElement.style.removeProperty(TOP_OFFSET_VAR);
  };

  const toggleInlineFullscreen = () => {
    if (isInlineFullscreenEnabled()) {
      disableInlineFullscreen();
      return;
    }

    enableInlineFullscreen();
  };

  const runCommand = (command) => {
    if (command === "enable") {
      enableInlineFullscreen();
      return;
    }

    if (command === "disable") {
      disableInlineFullscreen();
      return;
    }

    if (command === "toggle") {
      toggleInlineFullscreen();
    }
  };

  const handleCommand = (event) => {
    runCommand(event.detail?.command);
  };

  const shouldToggleFromKeyboard = (event) =>
    event.code === "KeyF" && !event.ctrlKey && !event.metaKey && !event.altKey;

  const handleKeydown = (event) => {
    if (isEditableTarget(event.target)) return;

    if (event.code === "Escape") {
      disableInlineFullscreen();
      return;
    }

    if (!shouldToggleFromKeyboard(event)) return;

    event.preventDefault();
    event.stopPropagation();
    toggleInlineFullscreen();
  };

  window.addEventListener(COMMAND_EVENT, handleCommand);
  document.addEventListener("keydown", handleKeydown, true);
  console.log("[iqiyi-inline-fs] content script loaded v4");
})();
