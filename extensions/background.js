// Tooltran：依使用者設定的目標語言輸出
// 單字模式：透過 Free Dictionary API 取得詞性與釋義，再以 DeepL 批次翻譯
// 句子模式：直接以 DeepL 翻譯；若目標為 ZH-HANT 額外做簡→繁轉換

const DEEPL_FREE_ENDPOINT = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO_ENDPOINT  = "https://api.deepl.com/v2/translate";
const DICT_ENDPOINT        = "https://api.dictionaryapi.dev/api/v2/entries";

// 點擊工具列圖示 → 開啟側邊欄
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

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
