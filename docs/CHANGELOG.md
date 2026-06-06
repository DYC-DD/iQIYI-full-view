# CHANGELOG

This changelog follows the [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) format to track version updates.

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
