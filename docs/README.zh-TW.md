<div align="center">

[![](../assets/icons/icon128.png)](https://chromewebstore.google.com/detail/akgblinimdheojahjonfijjmfdclcili?utm_source=item-share-cb)

# [iQIYI Full View](https://chromewebstore.google.com/detail/akgblinimdheojahjonfijjmfdclcili?utm_source=item-share-cb)

**"當官方播放器對螢幕空間有點太小氣時"**

![GitHub release](https://img.shields.io/github/v/release/DYC-DD/iQIYI-full-view) ![License](https://img.shields.io/github/license/DYC-DD/iQIYI-full-view) ![Last commit](https://img.shields.io/github/last-commit/DYC-DD/iQIYI-full-view) [![Download](https://img.shields.io/badge/Download-Chrome%20Web%20Store-4285F4?style=flat)](https://chromewebstore.google.com/detail/akgblinimdheojahjonfijjmfdclcili?utm_source=item-share-cb) [![English](https://img.shields.io/badge/README-English-4285F4?style=flat)](../README.md)

</div>

這是一個 Chrome 瀏覽器擴充工具，讓使用者在 [iQIYI](https://www.iq.com/) 影片頁面快速切換「頁內全視窗」播放模式。

iQIYI 預設播放器尺寸較小，而放大觀看只能切換至全螢幕模式。為了解決這個問題，本擴充功能可將播放器放大至整個瀏覽器視窗大小，充分利用螢幕空間，適合想獲得更大觀看畫面，但不希望進入系統全螢幕模式的使用者。

## Demo

iQIYI 預設播放器：

![iQIYI 預設播放器](./images/demo-1.png)

Full View 模式：

![Full View 模式](./images/demo-2.png)

## 安裝方式

- **官方安裝方式（推薦）：**

  - 直接從 Chrome 線上應用程式商店安裝：[📥 點此安裝 iQIYI Full View](https://chromewebstore.google.com/detail/akgblinimdheojahjonfijjmfdclcili?utm_source=item-share-cb)

- **開發人員安裝方式：**

  1. 下載或 clone 此專案。

     ```bash
     git clone git@github.com:DYC-DD/iQIYI-full-view.git
     ```

  2. 打開 Chrome 瀏覽器，輸入：`chrome://extensions`
  3. 開啟右上角的「開發人員模式」。
  4. 點選「載入未封裝項目」。
  5. 選取此專案資料夾。

安裝後，進入 [iQIYI](https://www.iq.com/) 影片頁面即可使用。

## 功能特色

- 不進入系統全螢幕，也能切換頁內全視窗播放模式。
- Full View 啟用時會隱藏指定頁面介面，讓播放器使用更多瀏覽器視窗空間。
- 可在 popup 開啟「自動關閉暫停廣告」，當 iQIYI 影片頁面出現置中暫停廣告時自動關閉。

## 使用方式

| 快捷鍵               | 功能               |
| -------------------- | ------------------ |
| `F` / `右鍵`         | 切換頁內全視窗模式 |
| `F` / `右鍵` / `Esc` | 退出頁內全視窗模式 |

若要使用自動關閉暫停廣告，請打開擴充功能 popup，開啟「自動關閉暫停廣告」開關。此設定預設關閉，變更後會儲存在本機。

> [!TIP]
>
> 若焦點在輸入框、文字區塊或可編輯內容中，擴充功能不會攔截 `F` 快捷鍵。

## 權限說明

此擴充功能使用以下權限：

- `scripting`：用於註冊並執行頁面內容腳本。
- `contextMenus`：用於在 iQIYI 影片頁面提供右鍵切換 Full View 的選項。
- `storage`：用於在本機儲存擴充功能設定，例如「自動關閉暫停廣告」開關狀態。
- `host_permissions`：限制在 [iQIYI](https://www.iq.com/) 相關網域上運作。

> [!IMPORTANT]
>
> 本擴充功能不會：
>
> - 收集個人資料
> - 儲存瀏覽紀錄
> - 將任何資料傳送到伺服器
> - 存取 iQIYI 以外的網站
> - 修改你的帳號、訂閱或付款資訊

## 更新紀錄

查看完整更新紀錄：[CHANGELOG](./CHANGELOG.md)

## License

[MIT License](../LICENSE)
