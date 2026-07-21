# CHANGELOG

This changelog follows the [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) format to track version updates.

## [1.1.1] - 2026-07-19

### Changed

- 將「自動關閉廣告」偵測範圍調整為較嚴格的白名單，只自動點擊 `.ad-close` 與原本置中暫停廣告的 `.ad-close-center[data-player-hook="centerclose"]` 關閉鈕。

### Fixed

- 收斂自動關閉廣告的判斷與監聽範圍，避免誤點擊 `download-close`、`load-close` 等非廣告關閉元素，並降低播放中播放器 DOM 變動造成的干擾。

## [1.1.0] - 2026-06-24

### Added

- 新增 popup「自動關閉暫停廣告」開關，開啟後會在 iQIYI 影片暫停時自動關閉隨機出現的置中彈出廣告。
- 自動偵測並點擊 `data-player-hook="centerclose"` 的暫停廣告關閉鈕，關閉開關後則維持原本功能行為。
- 新增越南語與俄語介面文案支援。

## [1.0.1] - 2026-06-06

### Added

- 新增右鍵選單的 `iQIYI Full View` 切換項目，可點擊一次開啟，再點擊一次關閉頁內全視窗模式。
- 新增簡體中文、泰文與印尼文介面文案。

### Changed

- 優化頁內全視窗模式，進入 full view 時會隱藏網站的 `header-container`，讓播放器可使用完整瀏覽器視窗高度。
- 調整頁內全視窗的頂部偏移預設值，避免隱藏網站 header 後仍保留空白區域。

## [1.0.0] - 2026-06-05

### Added

- 建立第一個可正式使用的版本。
- 支援在 iQIYI 影片頁面按 `F` 切換「頁內全視窗」播放模式。
- 支援按 `Esc` 退出頁內全視窗模式。
- 進入頁內全視窗時會自動放大播放器至瀏覽器視窗範圍，保留瀏覽器介面並避免進入系統全螢幕。
- 自動偵測頁面頂部導覽列高度，避免播放器覆蓋主要導覽區域。
- 在輸入框、文字區塊或可編輯內容取得焦點時，不攔截 `F` 快捷鍵。
- 提供 Chrome 擴充功能彈出視窗，顯示使用提示與目前分頁啟用狀態。
- 支援英文與繁體中文介面文案。
- 限定擴充功能在 iQIYI 相關網域運作。
