// Tooltran：依使用者設定的目標語言輸出
// 單字模式：透過 Free Dictionary API 取得詞性與釋義，再以 DeepL 批次翻譯
// 句子模式：直接以 DeepL 翻譯；若目標為 ZH-HANT 額外做簡→繁轉換

const DEEPL_FREE_ENDPOINT = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO_ENDPOINT  = "https://api.deepl.com/v2/translate";
const DICT_ENDPOINT        = "https://api.dictionaryapi.dev/api/v2/entries";
const OCR_ENDPOINT         = "https://api.ocr.space/parse/image";

// 點擊工具列圖示 → 開啟側邊欄
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// 快捷鍵 Alt+A → 通知 content.js 啟動框選模式
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "start-cropping") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://"))) return;
  dispatchStartCropping(tab.id);
});

async function dispatchStartCropping(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "START_CROPPING" });
  } catch (err) {
    // content script 尚未注入（例如 extension 剛安裝／更新）→ 嘗試動態注入後重送
    if (err?.message && err.message.includes("Receiving end does not exist")) {
      try {
        await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
        await chrome.tabs.sendMessage(tabId, { type: "START_CROPPING" });
      } catch (e) {
        console.warn("[Tooltran] 無法啟動框選：", e.message);
      }
    }
  }
}

// content 要設定值時，統一由 background 讀 storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_SETTINGS") {
    (async () => {
      const cfg = await chrome.storage.sync.get({
        deeplApiKey: "",
        useDeepLPro: false,
        targetLang: "ZH-HANT",
      });
      return cfg;
    })()
      .then(cfg => sendResponse({ ok: true, result: cfg }))
      .catch(err => sendResponse({ ok: false, error: { message: err.message }}));
    return true;
  }

  if (message?.type === "TRANSLATE_REQUEST") {
    handleTranslate(message.text)
      .then(result => sendResponse({ ok: true, result }))
      .catch(err => sendResponse({ ok: false, error: { message: err.message }}));
    return true;
  }

  // 漫畫框選：要求 background 擷取當前可見分頁為 PNG dataUrl
  if (message?.type === "CAPTURE_VISIBLE_TAB") {
    const windowId = sender?.tab?.windowId;
    chrome.tabs.captureVisibleTab(windowId ?? null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: { message: chrome.runtime.lastError.message }});
      } else {
        sendResponse({ ok: true, dataUrl });
      }
    });
    return true;
  }

  // 漫畫框選：base64 JPEG → OCR → DeepL → 回傳含座標的翻譯群組
  if (message?.type === "OCR_TRANSLATE") {
    ocrAndTranslateGroups(message.imageBase64)
      .then(result => sendResponse({ ok: true, result }))
      .catch(err => sendResponse({ ok: false, error: { message: err.message }}));
    return true;
  }
});

// =================== 主要入口 ===================

async function handleTranslate(text) {
  const { deeplApiKey = "", useDeepLPro = false, targetLang = "ZH-HANT" } = await chrome.storage.sync.get({
    deeplApiKey: "",
    useDeepLPro: false,
    targetLang: "ZH-HANT"
  });
  if (!deeplApiKey) throw new Error("尚未設定 DeepL API Key。");

  if (isSingleWord(text)) {
    return handleWordTranslate(text, deeplApiKey, useDeepLPro, targetLang);
  }
  return handleSentenceTranslate(text, deeplApiKey, useDeepLPro, targetLang);
}

// =================== 單字判斷 ===================

function isSingleWord(text) {
  return /^\S+$/.test(text) && text.length <= 50;
}

// =================== 單字翻譯 ===================

async function handleWordTranslate(word, apiKey, isPro, targetLang) {
  // 1. 查字典（取得詞性 + 原文釋義）
  const dict = await fetchDictionary(word);

  // 字典查無資料 → 回退為句子翻譯
  if (!dict) {
    return handleSentenceTranslate(word, apiKey, isPro, targetLang);
  }

  // 2. 收集所有釋義文字（限制數量避免 API 過載）
  const MAX_DEFS = 15;
  const entries = []; // { partOfSpeech, original }
  for (const meaning of dict.meanings) {
    for (const def of meaning.definitions) {
      if (entries.length >= MAX_DEFS) break;
      entries.push({ partOfSpeech: meaning.partOfSpeech, original: def.definition });
    }
  }

  // 3. 批次翻譯：[單字本身, ...所有釋義] 一次送 DeepL
  const textsToTranslate = [word, ...entries.map(e => e.original)];
  const { texts: translatedTexts, detectedLang } = await batchTranslateDeepL(
    textsToTranslate, apiKey, isPro, targetLang
  );

  // 來源語言與目標語言相同 → 不翻譯
  if (detectedLang && isSameLang(detectedLang, targetLang)) {
    return { skipped: true };
  }

  const translatedWord = translatedTexts[0];
  const translatedDefs = translatedTexts.slice(1);

  // 4. 按詞性分組
  const groups = {};
  entries.forEach((e, i) => {
    if (!groups[e.partOfSpeech]) groups[e.partOfSpeech] = [];
    groups[e.partOfSpeech].push(translatedDefs[i]);
  });

  return {
    type: "word",
    translated: translatedWord,
    phonetic: dict.phonetic,
    definitions: Object.entries(groups).map(([pos, meanings]) => ({ partOfSpeech: pos, meanings })),
    model: isPro ? "DeepL Pro" : "DeepL Free"
  };
}

// =================== 句子翻譯 ===================

async function handleSentenceTranslate(text, apiKey, isPro, targetLang) {
  const endpoint = isPro ? DEEPL_PRO_ENDPOINT : DEEPL_FREE_ENDPOINT;

  const body = new URLSearchParams({ text, target_lang: targetLang });

  const res = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
    body
  });

  const data = await res.json();
  const translated = data?.translations?.[0]?.text || "";
  const detectedLang = data?.translations?.[0]?.detected_source_language || "";

  if (detectedLang && isSameLang(detectedLang, targetLang)) {
    return { skipped: true };
  }

  const finalText = targetLang === "ZH-HANT" ? toTraditionalFallback(translated) : translated;
  return { type: "sentence", translated: finalText, model: isPro ? "DeepL Pro" : "DeepL Free" };
}

// =================== 字典查詢 ===================

// 語言代碼 → dictionaryapi.dev 支援的語言路徑
const DICT_LANG_MAP = {
  EN: "en", ES: "es", FR: "fr", DE: "de", IT: "it",
  PT: "pt-BR", RU: "ru", JA: "ja", KO: "ko",
  AR: "ar", TR: "tr", HI: "hi"
};

async function fetchDictionary(word) {
  // 依序嘗試：英文 → 其他可能語言（根據字元特徵）
  const langsToTry = guessDictLangs(word);

  for (const lang of langsToTry) {
    try {
      const res = await fetch(`${DICT_ENDPOINT}/${lang}/${encodeURIComponent(word)}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) continue;

      const meanings = [];
      const phonetic = data[0]?.phonetic || data[0]?.phonetics?.find(p => p.text)?.text || "";
      for (const entry of data) {
        for (const m of entry.meanings || []) meanings.push(m);
      }
      if (!meanings.length) continue;
      return { phonetic, meanings };
    } catch { /* 略過，繼續下一語言 */ }
  }
  return null;
}

function guessDictLangs(word) {
  // 日文假名/漢字混合
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(word)) return ["ja"];
  // 韓文
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(word)) return ["ko"];
  // 阿拉伯文
  if (/[\u0600-\u06FF]/.test(word)) return ["ar"];
  // 西里爾字母
  if (/[\u0400-\u04FF]/.test(word)) return ["ru"];
  // 天城文
  if (/[\u0900-\u097F]/.test(word)) return ["hi"];
  // 拉丁字母 → 先試英文，再試其他拉丁語系
  return ["en", "es", "fr", "de", "it", "pt-BR", "tr"];
}

// =================== DeepL 批次翻譯 ===================

async function batchTranslateDeepL(texts, apiKey, isPro, targetLang) {
  const endpoint = isPro ? DEEPL_PRO_ENDPOINT : DEEPL_FREE_ENDPOINT;
  const body = new URLSearchParams();
  for (const t of texts) body.append("text", t);
  body.append("target_lang", targetLang);

  const res = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
    body
  });

  const data = await res.json();
  const detectedLang = data?.translations?.[0]?.detected_source_language || "";
  const translatedTexts = (data?.translations || []).map(t => {
    const text = t.text || "";
    return targetLang === "ZH-HANT" ? toTraditionalFallback(text) : text;
  });

  return { texts: translatedTexts, detectedLang };
}

// =================== 工具函式 ===================

function isSameLang(detected, target) {
  const d = detected.toUpperCase();
  const t = target.toUpperCase();
  if (d === t) return true;
  // 取主語言碼比對（ZH-HANT / ZH-HANS → ZH，EN-US / EN-GB → EN）
  const dBase = d.split("-")[0];
  const tBase = t.split("-")[0];
  return dBase === tBase;
}

function toTraditionalFallback(s) {
  const map = {
    体:"體", 后:"後", 发:"發", 台:"臺", 里:"裡", 汉:"漢", 识:"識", 复:"復", 历:"歷",
    这:"這", 为:"為", 国:"國", 与:"與", 从:"從", 众:"眾", 云:"雲", 属:"屬", 产:"產",
    车:"車", 广:"廣", 见:"見", 马:"馬", 门:"門", 当:"當", 会:"會", 于:"於", 用:"用",
    东:"東", 罗:"羅", 面:"麵", 处:"處", 强:"強", 条:"條", 实:"實", 备:"備", 证:"證",
    币:"幣", 帐:"帳", 价:"價", 级:"級", 艺:"藝", 医:"醫", 杀:"殺", 杂:"雜", 极:"極",
    数:"數", 压:"壓", 线:"線", 网:"網", 订:"訂", 户:"戶", 览:"覽", 讯:"訊", 软:"軟",
    灯:"燈", 经:"經", 领:"領", 颜:"顏", 盘:"盤", 画:"畫", 规:"規"
  };
  return s.replace(/./g, ch => map[ch] || ch);
}

async function fetchWithRetry(url, init, retries = 2) {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        if ([429, 456, 500, 502, 503, 504].includes(res.status) && attempt < retries) {
          await delay(500 * Math.pow(2, attempt));
          attempt++; continue;
        }
        const text = await res.text();
        throw new Error(`DeepL 回應錯誤（${res.status}）: ${text}`);
      }
      return res;
    } catch (err) {
      if (attempt < retries) {
        await delay(500 * Math.pow(2, attempt));
        attempt++; continue;
      }
      throw err;
    }
  }
}
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// =================== 漫畫 OCR + 翻譯 ===================

async function callOcrSpace(base64Image, apiKey, language, engine) {
  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("apikey", apiKey);
  formData.append("language", language);
  formData.append("scale", "true");
  formData.append("OCREngine", engine);
  formData.append("isOverlayRequired", "true");

  const resp = await fetch(OCR_ENDPOINT, { method: "POST", body: formData });
  if (!resp.ok) throw new Error(`OCR.space 回應錯誤（${resp.status}）`);
  return await resp.json();
}

async function ocrAndTranslateGroups(base64Image) {
  const {
    ocrApiKey = "",
    ocrSourceLang = "jpn",
    deeplApiKey = "",
    useDeepLPro = false,
    targetLang = "ZH-HANT"
  } = await chrome.storage.sync.get({
    ocrApiKey: "",
    ocrSourceLang: "jpn",
    deeplApiKey: "",
    useDeepLPro: false,
    targetLang: "ZH-HANT"
  });

  if (!deeplApiKey) throw new Error("尚未設定 DeepL API Key。");

  const effectiveOcrKey = ocrApiKey.trim() || "helloworld";

  // 1. OCR.space 辨識：先試 Engine 2（較準），遇 E500/資源耗盡自動降級到 Engine 1
  let ocrData = await callOcrSpace(base64Image, effectiveOcrKey, ocrSourceLang, "2");

  if (ocrData.IsErroredOnProcessing) {
    const firstErr = Array.isArray(ocrData.ErrorMessage) ? ocrData.ErrorMessage[0] : (ocrData.ErrorMessage || "");
    // E500 / System Resource Exhaustion / OCR Binary Failed → 改用 Engine 1 再試一次
    if (/E500|Resource Exhaustion|Binary Failed|timed out/i.test(firstErr)) {
      ocrData = await callOcrSpace(base64Image, effectiveOcrKey, ocrSourceLang, "1");
    }
  }

  if (ocrData.IsErroredOnProcessing) {
    const errMsg = Array.isArray(ocrData.ErrorMessage) ? ocrData.ErrorMessage[0] : (ocrData.ErrorMessage || "未知錯誤");
    throw new Error(`OCR 辨識失敗：${errMsg}`);
  }

  const parsed = ocrData.ParsedResults?.[0];
  if (!parsed) {
    throw new Error("OCR 無結果，請確認 API Key 或框選範圍。");
  }

  // 2. 分群
  let groups = [];
  if (parsed.TextOverlay?.Lines?.length) {
    groups = groupLines(parsed.TextOverlay.Lines);
  }

  // 沒有座標資訊 → 退回整段文字 + 無座標
  if (groups.length === 0) {
    const fullText = (parsed.ParsedText || "").replace(/\r?\n|\r/g, " ").trim();
    if (!fullText) throw new Error("無法辨識出有效文字。");
    groups = [{ text: fullText, left: null, top: null, width: null, height: null }];
  }

  // 3. 批次 DeepL 翻譯（一次請求，省額度）
  const texts = groups.map(g => g.text);
  const { texts: translated } = await batchTranslateDeepL(texts, deeplApiKey, useDeepLPro, targetLang);

  groups.forEach((g, i) => {
    g.translatedText = translated[i] ?? g.text;
  });

  return { groups };
}

// 簡易兩階段叢集：先以 2.5× 行高合併相鄰行，再以 3.5× 行高合併鄰近群組
function groupLines(lines) {
  const groups = [];

  for (const line of lines) {
    if (!line.Words || line.Words.length === 0) continue;

    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    for (const w of line.Words) {
      if (w.Left < minL) minL = w.Left;
      if (w.Top  < minT) minT = w.Top;
      if (w.Left + w.Width  > maxR) maxR = w.Left + w.Width;
      if (w.Top  + w.Height > maxB) maxB = w.Top  + w.Height;
    }
    if (minL === Infinity) continue;

    const lineObj = {
      text: line.LineText,
      left: minL, top: minT, right: maxR, bottom: maxB,
      width: maxR - minL, height: maxB - minT
    };

    let added = false;
    for (const group of groups) {
      const threshold = lineObj.height * 2.5;
      const distLR = Math.max(0, Math.max(group.left - lineObj.right, lineObj.left - group.right));
      const distTB = Math.max(0, Math.max(group.top - lineObj.bottom, lineObj.top - group.bottom));
      if (distLR < threshold && distTB < threshold) {
        group.lines.push(lineObj);
        group.left   = Math.min(group.left,   lineObj.left);
        group.top    = Math.min(group.top,    lineObj.top);
        group.right  = Math.max(group.right,  lineObj.right);
        group.bottom = Math.max(group.bottom, lineObj.bottom);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push({
        lines: [lineObj],
        left: lineObj.left, top: lineObj.top,
        right: lineObj.right, bottom: lineObj.bottom
      });
    }
  }

  // 第二階段：合併靠太近的相鄰群組（大氣泡常被拆成多群）
  let merged = true;
  while (merged) {
    merged = false;
    outer:
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const g1 = groups[i], g2 = groups[j];
        const avgH = (g1.bottom - g1.top + g2.bottom - g2.top) / 2;
        const threshold = avgH * 3.5;
        const distLR = Math.max(0, Math.max(g1.left - g2.right, g2.left - g1.right));
        const distTB = Math.max(0, Math.max(g1.top - g2.bottom, g2.top - g1.bottom));
        if (distLR < threshold && distTB < threshold) {
          g1.lines.push(...g2.lines);
          g1.left   = Math.min(g1.left,   g2.left);
          g1.top    = Math.min(g1.top,    g2.top);
          g1.right  = Math.max(g1.right,  g2.right);
          g1.bottom = Math.max(g1.bottom, g2.bottom);
          groups.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }

  return groups.map(g => ({
    text: g.lines.map(l => l.text).join(" "),
    left: g.left, top: g.top,
    width: g.right - g.left, height: g.bottom - g.top
  }));
}
