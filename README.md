<div align="center">

![](./assets/icons/icon128.png)

# iQIYI Full View

</div>

這是一個 Chrome 瀏覽器擴充工具，讓使用者在 [iQIYI](https://www.iq.com/) 影片頁面快速切換「頁內全視窗」播放模式。

iQIYI 預設播放器尺寸較小，而放大觀看只能切換至全螢幕模式。為了解決這個問題，本擴充功能可將播放器放大至整個瀏覽器視窗大小，充分利用螢幕空間，適合想獲得更大觀看畫面，但不希望進入系統全螢幕模式的使用者。

## 安裝方式

1. 下載或 clone 此專案。

   ```bash
   git clone git@github.com:DYC-DD/iQIYI-full-view.git
   ```

2. 開啟 Chrome 或其他 Chromium 系瀏覽器。
3. 前往 `chrome://extensions/`。
4. 開啟右上角的「開發人員模式」。
5. 點選「載入未封裝項目」。
6. 選取此專案資料夾。

安裝後，進入 [iQIYI](https://www.iq.com/) 影片頁面即可使用。

## 使用方式

| 快捷鍵               | 功能               |
| -------------------- | ------------------ |
| `F` / `右鍵`         | 切換頁內全視窗模式 |
| `F` / `右鍵` / `Esc` | 退出頁內全視窗模式 |

> [!TIP]
>
> 若焦點在輸入框、文字區塊或可編輯內容中，擴充功能不會攔截 `F` 快捷鍵。

## 權限說明

此擴充功能使用以下權限：

- `scripting`：用於註冊並執行頁面內容腳本。
- `contextMenus`：用於在 iQIYI 影片頁面提供右鍵切換 Full View 的選項。
- `host_permissions`：限制在 [iQIYI](https://www.iq.com/) 相關網域上運作。

> [!IMPORTANT]
>
> 此擴充功能不會蒐集、傳送或儲存個人資料。
