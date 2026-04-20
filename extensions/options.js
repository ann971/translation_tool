// ============ i18n 翻譯表 ============
const I18N = {
  "ZH-HANT": {
    title: "Tooltran 設定", subtitle: "選取文字即時翻譯為目標語言",
    apiSection: "API 連線", apiHint: '前往 <a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL 帳戶</a> 取得 API Key',
    proHint: "Pro 帳戶使用專屬線路",
    prefSection: "翻譯偏好", targetLabel: "目標語言", targetHint: "選取的文字若與目標語言相同則不會觸發翻譯",
    optCommon: "常用", optEurope: "歐洲語言", optOther: "其他",
    save: "儲存設定", clear: "清除金鑰", toastSaved: "設定已儲存", toastCleared: "API Key 已清除",
    guideLink: "如何取得 DeepL API Key？→",
    ocrSection: "漫畫翻譯 (OCR)", ocrKeyLabel: "OCR.space API Key", ocrKeyLink: "申請免費 OCR.space Key →",
    ocrLangLabel: "OCR 來源語言", ocrHint: "辨識後使用 DeepL 翻譯為上方目標語言。快捷鍵：Ctrl + Shift + A",
    startCrop: "開始框選漫畫翻譯", toastCropUnsupported: "此頁面不支援框選（如 chrome:// 內部頁）"
  },
  "ZH-HANS": {
    title: "Tooltran 设置", subtitle: "选取文字即时翻译为目标语言",
    apiSection: "API 连接", apiHint: '前往 <a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL 账户</a> 获取 API Key',
    proHint: "Pro 账户使用专属线路",
    prefSection: "翻译偏好", targetLabel: "目标语言", targetHint: "选取的文字若与目标语言相同则不会触发翻译",
    optCommon: "常用", optEurope: "欧洲语言", optOther: "其他",
    save: "保存设置", clear: "清除密钥", toastSaved: "设置已保存", toastCleared: "API Key 已清除",
    guideLink: "如何获取 DeepL API Key？→",
    ocrSection: "漫画翻译 (OCR)", ocrKeyLabel: "OCR.space API Key", ocrKeyLink: "申请免费 OCR.space Key →",
    ocrLangLabel: "OCR 源语言", ocrHint: "识别后使用 DeepL 翻译为上方目标语言。快捷键：Ctrl + Shift + A",
    startCrop: "开始框选漫画翻译", toastCropUnsupported: "此页面不支持框选（如 chrome:// 内部页）"
  },
  EN: {
    title: "Tooltran Settings", subtitle: "Select text to instantly translate",
    apiSection: "API CONNECTION", apiHint: 'Get your API Key from <a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL Account</a>',
    proHint: "Pro accounts use a dedicated endpoint",
    prefSection: "TRANSLATION", targetLabel: "Target Language", targetHint: "Translation won't trigger if text matches target language",
    optCommon: "Common", optEurope: "European", optOther: "Other",
    save: "Save", clear: "Clear Key", toastSaved: "Settings saved", toastCleared: "API Key cleared",
    guideLink: "How to find your DeepL API Key? →",
    ocrSection: "Manga Translation (OCR)", ocrKeyLabel: "OCR.space API Key", ocrKeyLink: "Get a free OCR.space Key →",
    ocrLangLabel: "OCR Source Language", ocrHint: "Recognised text is translated via DeepL to your target language. Shortcut: Ctrl + Shift + A",
    startCrop: "Start Manga Crop", toastCropUnsupported: "This page doesn't support cropping (e.g. chrome:// pages)"
  },
  JA: {
    title: "Tooltran 設定", subtitle: "テキストを選択して即座に翻訳",
    apiSection: "API 接続", apiHint: '<a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL アカウント</a>から API Key を取得',
    proHint: "Pro アカウントは専用エンドポイントを使用",
    prefSection: "翻訳設定", targetLabel: "ターゲット言語", targetHint: "選択テキストがターゲット言語と同じ場合は翻訳されません",
    optCommon: "よく使う", optEurope: "ヨーロッパ言語", optOther: "その他",
    save: "保存", clear: "キーを消去", toastSaved: "設定を保存しました", toastCleared: "API Key を消去しました",
    guideLink: "DeepL API Key の取得方法 →",
    ocrSection: "マンガ翻訳 (OCR)", ocrKeyLabel: "OCR.space API Key", ocrKeyLink: "無料の OCR.space Key を取得 →",
    ocrLangLabel: "OCR 元言語", ocrHint: "認識後に DeepL でターゲット言語へ翻訳。ショートカット：Ctrl + Shift + A",
    startCrop: "マンガ枠選択を開始", toastCropUnsupported: "このページでは枠選択できません（chrome:// など）"
  },
  KO: {
    title: "Tooltran 설정", subtitle: "텍스트를 선택하면 즉시 번역",
    apiSection: "API 연결", apiHint: '<a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL 계정</a>에서 API Key 발급',
    proHint: "Pro 계정은 전용 엔드포인트 사용",
    prefSection: "번역 설정", targetLabel: "대상 언어", targetHint: "선택한 텍스트가 대상 언어와 같으면 번역되지 않습니다",
    optCommon: "자주 사용", optEurope: "유럽어", optOther: "기타",
    save: "저장", clear: "키 삭제", toastSaved: "설정이 저장되었습니다", toastCleared: "API Key가 삭제되었습니다",
    guideLink: "DeepL API Key 찾는 방법 →"
  },
  FR: {
    title: "Paramètres Tooltran", subtitle: "Sélectionnez du texte pour traduire instantanément",
    apiSection: "CONNEXION API", apiHint: 'Obtenez votre clé API sur <a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL</a>',
    proHint: "Les comptes Pro utilisent un point d'accès dédié",
    prefSection: "TRADUCTION", targetLabel: "Langue cible", targetHint: "La traduction ne se déclenche pas si le texte correspond à la langue cible",
    optCommon: "Courant", optEurope: "Européen", optOther: "Autre",
    save: "Enregistrer", clear: "Effacer la clé", toastSaved: "Paramètres enregistrés", toastCleared: "Clé API effacée",
    guideLink: "Comment trouver votre clé API DeepL ? →"
  },
  DE: {
    title: "Tooltran Einstellungen", subtitle: "Text auswählen und sofort übersetzen",
    apiSection: "API-VERBINDUNG", apiHint: 'API-Schlüssel von <a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL-Konto</a> abrufen',
    proHint: "Pro-Konten nutzen einen dedizierten Endpunkt",
    prefSection: "ÜBERSETZUNG", targetLabel: "Zielsprache", targetHint: "Keine Übersetzung wenn Text der Zielsprache entspricht",
    optCommon: "Häufig", optEurope: "Europäisch", optOther: "Andere",
    save: "Speichern", clear: "Schlüssel löschen", toastSaved: "Einstellungen gespeichert", toastCleared: "API-Schlüssel gelöscht",
    guideLink: "Wie finde ich meinen DeepL API-Schlüssel? →"
  },
  ES: {
    title: "Configuración de Tooltran", subtitle: "Selecciona texto para traducir al instante",
    apiSection: "CONEXIÓN API", apiHint: 'Obtén tu clave API en <a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">DeepL</a>',
    proHint: "Las cuentas Pro usan un endpoint dedicado",
    prefSection: "TRADUCCIÓN", targetLabel: "Idioma destino", targetHint: "No se traduce si el texto coincide con el idioma destino",
    optCommon: "Comunes", optEurope: "Europeos", optOther: "Otros",
    save: "Guardar", clear: "Borrar clave", toastSaved: "Configuración guardada", toastCleared: "Clave API borrada",
    guideLink: "¿Cómo obtener tu clave API de DeepL? →"
  },
  RU: {
    title: "Настройки Tooltran", subtitle: "Выделите текст для мгновенного перевода",
    apiSection: "API ПОДКЛЮЧЕНИЕ", apiHint: 'Получите ключ API в <a href="https://www.deepl.com/your-account/keys" target="_blank" style="color:#49b4e9;text-decoration:none;">аккаунте DeepL</a>',
    proHint: "Pro-аккаунты используют выделенный эндпоинт",
    prefSection: "ПЕРЕВОД", targetLabel: "Целевой язык", targetHint: "Перевод не запускается, если текст совпадает с целевым языком",
    optCommon: "Часто используемые", optEurope: "Европейские", optOther: "Другие",
    save: "Сохранить", clear: "Удалить ключ", toastSaved: "Настройки сохранены", toastCleared: "API-ключ удалён",
    guideLink: "Как получить API-ключ DeepL? →"
  }
};

function getLangPack(langCode) {
  // 精確匹配 → 主語言碼匹配 → 英文 fallback
  if (I18N[langCode]) return I18N[langCode];
  const base = langCode.split("-")[0].toUpperCase();
  if (I18N[base]) return I18N[base];
  return I18N["EN"];
}

function applyI18n(langCode) {
  const t = getLangPack(langCode);
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key]) el.innerHTML = t[key];
  });
  document.querySelectorAll("[data-i18n-attr]").forEach(el => {
    const [attr, key] = el.dataset.i18nAttr.split(":");
    if (t[key]) el.setAttribute(attr, t[key]);
  });
  document.title = t.title || "Tooltran";
}

// 從瀏覽器語言偵測預設目標語言
function detectDefaultLang() {
  const browserLang = (navigator.language || "en").toUpperCase();
  // 精確匹配已知選項
  const KNOWN = ["ZH-HANT","ZH-HANS","EN-US","EN-GB","JA","KO","FR","DE","ES","PT-PT","PT-BR","IT","NL","PL","RU","UK","EL","BG","CS","DA","ET","FI","HU","LT","LV","NB","RO","SK","SL","SV","AR","ID","TR"];
  if (KNOWN.includes(browserLang)) return browserLang;
  // 主語言碼匹配
  const base = browserLang.split("-")[0];
  if (base === "ZH") {
    // zh-TW/zh-HK → 繁體，其餘 → 簡體
    return /TW|HK|MO/.test(browserLang) ? "ZH-HANT" : "ZH-HANS";
  }
  if (base === "EN") return "EN-US";
  if (base === "PT") return "PT-BR";
  const baseMatch = KNOWN.find(k => k.split("-")[0] === base);
  if (baseMatch) return baseMatch;
  return "EN-US";
}

// ============ 主程式 ============
(async function init() {
  const $ = (id) => document.getElementById(id);
  const defaultLang = detectDefaultLang();
  let currentLang = defaultLang;

  function toast(key) {
    const t = getLangPack(currentLang);
    const el = $("toast");
    el.textContent = t[key] || key;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2000);
  }

  function updateProStatus() {
    const on = $("useDeepLPro").checked;
    const status = $("proStatus");
    status.textContent = on ? "ON" : "OFF";
    status.className = "toggle-status " + (on ? "on" : "off");
  }

  // 不設預設值，讓 undefined 代表「從未儲存過」
  const saved = await chrome.storage.sync.get(["deeplApiKey", "useDeepLPro", "targetLang", "ocrApiKey", "ocrSourceLang"]);

  // 若從未設定過 targetLang，使用瀏覽器語言
  if (!saved.targetLang) {
    saved.targetLang = defaultLang;
    await chrome.storage.sync.set({ targetLang: defaultLang });
  }

  currentLang = saved.targetLang;
  $("deeplApiKey").value = saved.deeplApiKey || "";
  $("useDeepLPro").checked = saved.useDeepLPro || false;
  $("targetLang").value = saved.targetLang;
  $("ocrApiKey").value = saved.ocrApiKey || "";
  $("ocrSourceLang").value = saved.ocrSourceLang || "jpn";
  updateProStatus();
  applyI18n(currentLang);

  // 切換目標語言時即時更新 UI 語系
  $("targetLang").addEventListener("change", () => {
    currentLang = $("targetLang").value;
    applyI18n(currentLang);
  });

  // 點擊整列切換 Pro
  $("proRow").addEventListener("click", (e) => {
    if (e.target.closest("label")) return;
    $("useDeepLPro").checked = !$("useDeepLPro").checked;
    updateProStatus();
  });
  $("useDeepLPro").addEventListener("change", updateProStatus);

  $("save").addEventListener("click", async () => {
    const deeplApiKey = $("deeplApiKey").value.trim();
    const useDeepLPro = $("useDeepLPro").checked;
    const targetLang = $("targetLang").value;
    const ocrApiKey = $("ocrApiKey").value.trim();
    const ocrSourceLang = $("ocrSourceLang").value;
    currentLang = targetLang;
    await chrome.storage.sync.set({ deeplApiKey, useDeepLPro, targetLang, ocrApiKey, ocrSourceLang });
    toast("toastSaved");
  });

  $("clear").addEventListener("click", async () => {
    await chrome.storage.sync.set({ deeplApiKey: "" });
    $("deeplApiKey").value = "";
    toast("toastCleared");
  });

  // 開始框選漫畫翻譯：傳訊給當前分頁的 content.js
  $("startCropBtn").addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) { toast("toastCropUnsupported"); return; }
      if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://"))) {
        toast("toastCropUnsupported");
        return;
      }
      try {
        await chrome.tabs.sendMessage(tab.id, { type: "START_CROPPING" });
      } catch (err) {
        if (err?.message && err.message.includes("Receiving end does not exist")) {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
          await chrome.tabs.sendMessage(tab.id, { type: "START_CROPPING" });
        } else {
          throw err;
        }
      }
    } catch (e) {
      console.warn("[Tooltran] 啟動框選失敗：", e?.message);
      toast("toastCropUnsupported");
    }
  });
})();
