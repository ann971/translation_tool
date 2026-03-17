# DeepL Select-to-Translate

一款 Chrome 瀏覽器擴充功能，選取網頁文字即可透過 DeepL API 即時翻譯為指定目標語言，支援 34 種語言。

## 功能特色

- **選取即翻譯** — 選取文字後，右上角出現藍色小圓點，滑入或點擊即觸發翻譯
- **單字模式** — 選取單字時自動查詢字典，顯示詞性與多條釋義（透過 Free Dictionary API + DeepL 批次翻譯）
- **句子模式** — 選取句子或段落時直接翻譯為目標語言
- **多語言支援** — 可在設定頁選擇目標語言，支援繁體中文、英文、日文、韓文等 34 種 DeepL 語言
- **智慧過濾** — 選取文字與目標語言同語系時不顯示翻譯按鈕（客戶端 Unicode 偵測 + API 端雙重檢查）
- **浮動面板** — 翻譯結果以可拖曳面板顯示，支援釘選（拖曳後不再自動跟隨滾動）
- **Shadow DOM 隔離** — 樣式與節點完全隔離，不影響原始網頁
- **自動重試** — 遇到 429/5xx 錯誤時指數退避重試（最多 2 次）
- **支援 Free / Pro** — 可在設定頁以 toggle 切換 DeepL Free 或 Pro API

## 專案結構

```
extensions/
├── manifest.json      # Manifest V3 設定
├── background.js      # Service Worker：單字/句子翻譯、字典查詢、DeepL API 呼叫
├── content.js         # Content Script：選字偵測、語系過濾、UI 按鈕與面板邏輯
├── content.css        # Content Script 樣式
├── options.html       # 設定頁面（API Key、目標語言、Free/Pro 切換）
├── options.js         # 設定頁面邏輯
└── icons/             # 擴充功能圖示（16/32/48/128px）

webstore_page/
├── spec.md            # 下載頁面產品需求規格書
└── README.md          # 子目錄說明
```

## 安裝方式

1. 下載或 clone 本專案
2. 開啟 Chrome，前往 `chrome://extensions/`
3. 開啟右上角「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選取 `extensions/` 資料夾
6. 完成安裝

## 設定

安裝後進入擴充功能設定頁（右鍵擴充功能圖示 → 選項）：

1. 輸入你的 **DeepL API Key**（可從 [DeepL 帳戶頁](https://www.deepl.com/your-account/keys) 取得）
2. 選擇 **目標語言**（預設繁體中文）
3. 若持有 Pro 方案，開啟 **DeepL Pro** 開關
4. 點擊「儲存設定」

> 免費版使用 `api-free.deepl.com`，Pro 版使用 `api.deepl.com`。

## 使用方式

1. 在任意網頁選取想翻譯的文字
2. 選取文字右上方出現藍色小點（若文字與目標語言同語系則不出現）
3. 滑入小點或點擊 → 面板顯示翻譯結果
   - **單字**：顯示翻譯、音標、各詞性及條列釋義
   - **句子/段落**：顯示完整翻譯
4. 可拖曳面板標題列移動位置；按 `Esc` 或點擊空白處關閉

## 技術細節

- **Manifest V3** — 使用 Service Worker 作為背景程式
- **權限** — `storage`、`activeTab`、`scripting`
- **Host Permissions** — `api-free.deepl.com`、`api.deepl.com`、`api.dictionaryapi.dev`
- **單字字典** — Free Dictionary API，依字元特徵自動判斷語言（支援 en/es/fr/de/it/ja/ko/ru/ar 等）
- **簡→繁轉換** — 目標語言為 ZH-HANT 時，內建輕量字元對應表（如需高品質可替換為 opencc-js）
- **語系過濾** — 客戶端以 Unicode 範圍判斷 CJK/假名/韓文/西里爾/阿拉伯/希臘文等書寫系統，API 端以 `detected_source_language` 主語言碼比對作為二次確認

## 授權

MIT
