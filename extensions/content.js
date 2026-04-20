// content.js — Tooltran 選字翻譯（依設定目標語言）
// 功能：選字→顯示 12×12 #49b4e9 圓形按鈕→滑入/點擊開啟翻譯面板
// 特色：按鈕/面板以 absolute 跟隨頁面滾動；面板可拖曳（拖後視為釘住，不再自動跟隨）
// 規則：若偵測到選取文字與目標語言相同則不翻譯
(() => {
  const state = {
    selectionText: "",
    anchorRange: null,      // 目前選取的錨點 range（即時取座標）
    hoverTimer: null,
    panelPinned: false,     // 被拖曳後設 true；下次開啟恢復 false
    targetLang: "ZH-HANT", // 快取目標語言，用於客戶端語系過濾
    // --- 漫畫框選 ---
    croppingActive: false,
    cropStart: null,        // {x, y} viewport 座標
    cropNodes: null,        // { dim, rect, hint }
    translationOverlays: [],// 已顯示的翻譯覆蓋 DOM 陣列
    scrollAccumSinceOverlay: 0,
    lastScrollY: 0,
    toastTimer: null
  };

  // ---- 載入目標語言設定
  function loadTargetLang(){
    if (!(window.chrome && chrome.runtime && chrome.runtime.id)) return;
    chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (resp) => {
      if (resp?.ok && resp.result?.targetLang) state.targetLang = resp.result.targetLang;
    });
  }
  loadTargetLang();
  // 設定變更時重新載入
  if (window.chrome && chrome.storage) {
    chrome.storage.onChanged.addListener(() => loadTargetLang());
  }

  // ---- 客戶端語系偵測：依文字 Unicode 特徵判斷主語言碼
  // 目標語言碼 → 對應的 Unicode 正則（僅能辨識書寫系統明確不同的語系）
  const SCRIPT_PATTERNS = {
    ZH: /[\u4e00-\u9fff\u3400-\u4dbf]/,          // CJK 統一漢字
    JA: /[\u3040-\u309f\u30a0-\u30ff]/,           // 平假名/片假名
    KO: /[\uac00-\ud7af\u1100-\u11ff]/,           // 韓文
    AR: /[\u0600-\u06ff\u0750-\u077f]/,           // 阿拉伯文
    HI: /[\u0900-\u097f]/,                         // 天城文（印地語）
    // 西里爾字母語系（RU, UK, BG）
    RU: /[\u0400-\u04ff]/, UK: /[\u0400-\u04ff]/, BG: /[\u0400-\u04ff]/,
    EL: /[\u0370-\u03ff]/,                         // 希臘文
  };

  function looksLikeTargetLang(text) {
    const base = state.targetLang.split("-")[0].toUpperCase();
    const pattern = SCRIPT_PATTERNS[base];
    if (!pattern) return false; // 拉丁語系無法僅靠字元判斷，交由 API 處理

    // 去除空白與標點後，計算符合字元佔比
    const chars = [...text.replace(/[\s\p{P}\p{S}\d]/gu, "")];
    if (!chars.length) return false;

    // 中文特殊處理：含日文假名則視為日文，不算中文
    if (base === "ZH") {
      if (SCRIPT_PATTERNS.JA.test(text)) return false;
      const cjkCount = chars.filter(ch => SCRIPT_PATTERNS.ZH.test(ch)).length;
      return cjkCount / chars.length > 0.5;
    }

    const matchCount = chars.filter(ch => pattern.test(ch)).length;
    return matchCount / chars.length > 0.5;
  }

  // ---- Shadow DOM（隔離樣式與節點）
  const host = document.createElement("div");
  host.id = "tooltran-shadow-host";
  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);

  // ---- 樣式
  const style = document.createElement("style");
  style.textContent = `
    .ai-btn{
      position:absolute; z-index:2147483647; display:none;
      width:12px; height:12px; background:#49b4e9; border-radius:50%;
      border:0; padding:0; margin:0; cursor:pointer;
    }
    .ai-panel{
      position:absolute; z-index:2147483647; display:none;
      width:min(520px,calc(100vw - 24px)); max-height:min(60vh,480px);
      overflow:auto; background:#fff; color:#111;
      border-radius:14px; border:1px solid rgba(0,0,0,.08);
      box-shadow:0 10px 30px rgba(0,0,0,.25);
    }
    .ai-panel-header{
      display:flex; align-items:center; justify-content:space-between;
      padding:10px 12px; border-bottom:1px solid rgba(0,0,0,.06);
      position:sticky; top:0; background:#fff; user-select:none; cursor:move;
    }
    .ai-title{font-weight:600; font-size:13px;}
    .ai-body{padding:12px; white-space:pre-wrap; word-break:break-word; font-size:14px; line-height:1.6;}
    .ai-word-header{margin-bottom:8px;}
    .ai-word-translated{font-size:16px; font-weight:600;}
    .ai-word-phonetic{margin-left:8px; color:#888; font-size:13px; font-weight:400;}
    .ai-pos{margin-top:10px; font-weight:600; font-size:12px; color:#49b4e9; text-transform:capitalize;}
    .ai-def-list{margin:4px 0 0 20px; padding:0;}
    .ai-def-list li{margin:2px 0; font-size:14px; line-height:1.5;}
    .ai-tools{display:flex; align-items:center; gap:8px;}
    .ai-icon{cursor:pointer; opacity:.85;} .ai-icon:hover{opacity:1;}
    .ai-deepl-link{
      display:inline-flex; align-items:center; gap:3px;
      font-size:11px; color:#0f2b46; text-decoration:none;
      background:#f0f6fa; border-radius:6px; padding:2px 8px;
      font-weight:600; line-height:1; transition:background .15s;
    }
    .ai-deepl-link:hover{background:#daeaf4;}
    .ai-deepl-logo{width:14px;height:14px;}
    .ai-spinner{display:flex;align-items:center;justify-content:center;padding:8px 0;}
    .ai-spinner svg{width:24px;height:24px;animation:ai-spin .8s linear infinite;color:#49b4e9;}
    @keyframes ai-spin{to{transform:rotate(360deg);}}

    /* ---- 漫畫框選 UI ---- */
    .tt-crop-dim{
      position:fixed; inset:0; background:rgba(0,0,0,.4);
      cursor:crosshair; z-index:2147483647;
    }
    .tt-crop-rect{
      position:fixed; border:2px dashed #49b4e9;
      background:rgba(73,180,233,.12); pointer-events:none;
      z-index:2147483647; display:none;
    }
    .tt-crop-hint{
      position:fixed; top:12px; left:50%; transform:translateX(-50%);
      background:rgba(0,0,0,.75); color:#fff; padding:6px 14px;
      border-radius:999px; font-size:13px; font-weight:500;
      pointer-events:none; z-index:2147483647; user-select:none;
    }
    .tt-trans-overlay{
      position:absolute; background:#fff; color:#111;
      border:1px solid rgba(0,0,0,.15); border-radius:8px;
      box-shadow:0 4px 12px rgba(0,0,0,.18);
      padding:6px 8px;
      display:flex; align-items:center; justify-content:center;
      text-align:center; line-height:1.25; overflow:hidden;
      font-weight:600; z-index:2147483646;
      animation:tt-fade-in .15s ease-out;
    }
    .tt-trans-overlay .tt-trans-text{ width:100%; }
    .tt-trans-close{
      position:absolute; top:-8px; right:-8px;
      width:18px; height:18px; background:#e53935; color:#fff;
      border-radius:50%; display:flex; align-items:center;
      justify-content:center; font-size:11px; line-height:1;
      cursor:pointer; opacity:0; transition:opacity .15s;
      z-index:2147483647;
    }
    .tt-trans-overlay:hover .tt-trans-close{ opacity:1; }
    .tt-trans-floating{
      position:fixed; top:50%; left:50%;
      transform:translate(-50%,-50%);
      max-width:min(560px,calc(100vw - 48px));
      padding:14px 18px; font-size:15px;
    }
    @keyframes tt-fade-in{ from{opacity:0; transform:scale(.96);} to{opacity:1; transform:scale(1);} }

    /* ---- Toast（通用提示） ---- */
    .tt-toast{
      position:fixed; bottom:32px; left:50%;
      transform:translateX(-50%) translateY(80px);
      background:#1a1a1a; color:#fff;
      padding:10px 20px; border-radius:10px;
      font-size:13px; font-weight:500;
      pointer-events:none; opacity:0;
      transition:transform .3s cubic-bezier(.22,1,.36,1), opacity .3s;
      z-index:2147483647; max-width:80vw; text-align:center;
    }
    .tt-toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
  `;
  shadow.appendChild(style);

  // ---- 介面節點
  const btn = document.createElement("button");
  btn.className = "ai-btn";
  shadow.appendChild(btn);

  const panel = document.createElement("div");
  panel.className = "ai-panel";
  panel.innerHTML = `
    <div class="ai-panel-header" id="ai-header">
      <div class="ai-title">Tooltran</div>
      <div class="ai-tools">
        <a class="ai-deepl-link" id="ai-deepl" href="#" target="_blank" rel="noopener" title="用 DeepL 翻譯">
          <img class="ai-deepl-logo" src="${chrome.runtime.getURL("deepl.svg")}" alt="DeepL">DeepL
        </a>
        <span class="ai-icon" id="ai-close" title="關閉">✖</span>
      </div>
    </div>
    <div class="ai-body" id="ai-body"></div>
  `;
  shadow.appendChild(panel);

  const SPINNER_HTML = '<div class="ai-spinner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a10 10 0 0 1 10 10" /></svg></div>';

  // ---- 工具：安全設定面板文字
  function setBody(text){
    const el = shadow.getElementById("ai-body");
    if (el) el.textContent = (text == null) ? "" : String(text);
  }
  function setBodyLoading(){
    const el = shadow.getElementById("ai-body");
    if (el) el.innerHTML = SPINNER_HTML;
  }

  // ---- 工具：渲染單字結果（詞性 + 條列釋義）
  function renderWordResult(result){
    const el = shadow.getElementById("ai-body");
    if (!el) return;
    el.textContent = "";
    el.style.whiteSpace = "normal";

    // 翻譯 + 音標
    const hdr = document.createElement("div");
    hdr.className = "ai-word-header";
    const wordSpan = document.createElement("span");
    wordSpan.className = "ai-word-translated";
    wordSpan.textContent = result.translated;
    hdr.appendChild(wordSpan);
    if (result.phonetic) {
      const ph = document.createElement("span");
      ph.className = "ai-word-phonetic";
      ph.textContent = result.phonetic;
      hdr.appendChild(ph);
    }
    el.appendChild(hdr);

    // 各詞性 + 釋義
    for (const group of result.definitions) {
      const posEl = document.createElement("div");
      posEl.className = "ai-pos";
      posEl.textContent = group.partOfSpeech;
      el.appendChild(posEl);

      const ol = document.createElement("ol");
      ol.className = "ai-def-list";
      for (const meaning of group.meanings) {
        const li = document.createElement("li");
        li.textContent = meaning;
        ol.appendChild(li);
      }
      el.appendChild(ol);
    }
  }

  // ---- 共用
  function hideAll(){
    btn.style.display = "none";
    panel.style.display = "none";
    state.panelPinned = false;
  }
  function debounce(fn, wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), wait); }; }

  // ---- 事件：選取/鍵盤/視口變化
  document.addEventListener("mouseup", updateSelection, true);
  document.addEventListener("selectionchange", debounce(updateSelection, 50), true);
  document.addEventListener("keyup", (e)=>{ if(e.key==="Escape") hideAll(); }, true);
  window.addEventListener("scroll", onViewportChange, true);
  window.addEventListener("resize", onViewportChange, true);

  // ---- 事件：按鈕 hover/點擊
  btn.addEventListener("mouseenter", () => {
    clearTimeout(state.hoverTimer);
    state.hoverTimer = setTimeout(triggerTranslate, 180);
  });
  btn.addEventListener("mouseleave", () => clearTimeout(state.hoverTimer));
  btn.addEventListener("click", triggerTranslate);

  // ---- 事件：關閉面板
  shadow.getElementById("ai-close").addEventListener("click", hideAll);

  // ---- 事件：DeepL 翻譯連結（動態更新 href，靠原生 <a target="_blank"> 開新分頁）
  const deeplLink = shadow.getElementById("ai-deepl");
  deeplLink.addEventListener("mousedown", () => {
    const text = state.selectionText || "";
    deeplLink.href = `https://www.deepl.com/translator#auto/auto/${encodeURIComponent(text)}`;
  });

  // ---- 面板拖曳（拖 header）
  const header = shadow.getElementById("ai-header");
  let dragStart = null; // {x,y,left,top}
  header.addEventListener("mousedown", (e)=>{
    state.panelPinned = true; // 一拖就釘住
    dragStart = {
      x:e.clientX, y:e.clientY,
      left:parseFloat(panel.style.left||"0"),
      top: parseFloat(panel.style.top ||"0")
    };
    document.addEventListener("mousemove", onDragMove, true);
    document.addEventListener("mouseup", onDragEnd, true);
    e.preventDefault();
  });
  function onDragMove(e){
    if(!dragStart) return;
    panel.style.left = `${dragStart.left + (e.clientX - dragStart.x)}px`;
    panel.style.top  = `${dragStart.top  + (e.clientY - dragStart.y)}px`;
  }
  function onDragEnd(){
    document.removeEventListener("mousemove", onDragMove, true);
    document.removeEventListener("mouseup", onDragEnd, true);
    dragStart = null;
  }

  // =================== 核心邏輯 ===================
  function updateSelection(){
    if (state.croppingActive) return; // 框選中禁用選字 UI
    const sel = window.getSelection();
    if(!sel || sel.isCollapsed){ hideAll(); return; }

    const text = sel.toString().trim();
    if(!text){ hideAll(); return; }

    // 客戶端過濾：選取文字看起來與目標語言同語系 → 不顯示藍點
    if (looksLikeTargetLang(text)) { hideAll(); return; }

    state.selectionText = text;
    state.anchorRange = sel.getRangeAt(0).cloneRange();

    const rect = getAnchorRect();
    placeBtn(rect);
    if (panel.style.display === "block" && !state.panelPinned) placePanel(rect);
  }

  function triggerTranslate(){
    if(!state.selectionText) return;

    openPanel();
    setBodyLoading();

    if(!(window.chrome && chrome.runtime && chrome.runtime.id)){
      setBody("❌ 無法連線到擴充功能環境。請在一般網頁使用或重新整理。");
      return;
    }

    let done = false;
    const timeout = setTimeout(()=>{
      if(!done) setBody("❌ 逾時：背景程式未回應，請檢查 API Key 或重新整理分頁。");
    }, 8000);

    chrome.runtime.sendMessage(
      { type:"TRANSLATE_REQUEST", text: state.selectionText },
      (resp) => {
        done = true; clearTimeout(timeout);

        if (chrome.runtime.lastError) {
          setBody(`❌ 傳訊失敗：${chrome.runtime.lastError.message}`);
          return;
        }
        if (!resp || !resp.ok) {
          setBody(`❌ 翻譯失敗：${resp?.error?.message || "未知錯誤"}`);
          return;
        }

        if (resp.result?.skipped) {
          hideAll();
          return;
        }

        if (resp.result?.type === "word") {
          renderWordResult(resp.result);
        } else {
          const { translated } = resp.result || {};
          setBody(translated || "（空白結果）");
        }
      }
    );
  }

  // ---- 定位：按鈕貼選取右上角；面板在下方
  function placeBtn(rect){
    const OFFSET_X = 6, OFFSET_Y = -6, BTN_H = 12;
    btn.style.left = `${rect.right + OFFSET_X}px`;
    btn.style.top  = `${rect.top + OFFSET_Y - BTN_H}px`;
    btn.style.display = "block";
  }
  function placePanel(rect){
    const PANEL_W_MAX = 560;
    const x = Math.min(rect.left, window.scrollX + window.innerWidth - PANEL_W_MAX);
    const y = rect.bottom + 8;
    panel.style.left = `${x}px`;
    panel.style.top  = `${y}px`;
  }
  function openPanel(){
    const rect = getAnchorRect();
    placePanel(rect);
    panel.style.display = "block";
    state.panelPinned = false; // 每次開啟先恢復跟隨
  }

  // ---- 以錨點 range 取得「含滾動位移」的最新座標
  function getAnchorRect(){
    if(!state.anchorRange) return new DOMRect(0,0,0,0);
    const rects = state.anchorRange.getClientRects();
    const r = rects && rects.length ? rects[0] : state.anchorRange.getBoundingClientRect();
    return new DOMRect(r.left + window.scrollX, r.top + window.scrollY, r.width, r.height);
  }

  // ---- 視口變化（滾動/縮放）時：未釘住則跟隨
  function onViewportChange(){
    const rect = getAnchorRect();
    if (btn.style.display === "block") placeBtn(rect);
    if (panel.style.display === "block" && !state.panelPinned) placePanel(rect);
  }

  // （可選）點空白關閉（框選中不處理）
  document.addEventListener("mousedown", (e)=>{
    if (state.croppingActive) return;
    if(!shadow.contains(e.target)) hideAll();
  }, true);

  // =================== 漫畫框選 + OCR 翻譯 ===================

  // 背景傳訊：啟動框選
  if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === "START_CROPPING") {
        beginCropping();
      }
    });
  }

  // 累計滾動距離：覆蓋存在時超過 500px 自動清除，避免跟圖片脫離位置
  window.addEventListener("scroll", () => {
    if (state.translationOverlays.length === 0) return;
    const dy = Math.abs(window.scrollY - state.lastScrollY);
    state.lastScrollY = window.scrollY;
    state.scrollAccumSinceOverlay += dy;
    if (state.scrollAccumSinceOverlay > 500) clearTranslationOverlays();
  }, true);

  function beginCropping(){
    if (state.croppingActive) return;
    hideAll(); // 先關掉選字面板
    clearTranslationOverlays();

    const dim  = document.createElement("div"); dim.className  = "tt-crop-dim";
    const rect = document.createElement("div"); rect.className = "tt-crop-rect";
    const hint = document.createElement("div"); hint.className = "tt-crop-hint";
    hint.textContent = "拖曳以框選對話框 — 按 ESC 取消";
    shadow.appendChild(dim);
    shadow.appendChild(rect);
    shadow.appendChild(hint);

    state.cropNodes = { dim, rect, hint };
    state.cropStart = null;
    state.croppingActive = true;

    dim.addEventListener("mousedown", onCropMouseDown, true);
    window.addEventListener("mousemove", onCropMouseMove, true);
    window.addEventListener("mouseup",   onCropMouseUp,   true);
    window.addEventListener("keydown",   onCropKeyDown,   true);
  }

  function exitCropping(){
    if (!state.croppingActive) return;
    const { dim, rect, hint } = state.cropNodes || {};
    if (dim)  dim.remove();
    if (rect) rect.remove();
    if (hint) hint.remove();
    window.removeEventListener("mousemove", onCropMouseMove, true);
    window.removeEventListener("mouseup",   onCropMouseUp,   true);
    window.removeEventListener("keydown",   onCropKeyDown,   true);
    state.croppingActive = false;
    state.cropNodes = null;
    state.cropStart = null;
  }

  function onCropMouseDown(e){
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    state.cropStart = { x: e.clientX, y: e.clientY };
    const r = state.cropNodes.rect;
    r.style.left = `${e.clientX}px`;
    r.style.top  = `${e.clientY}px`;
    r.style.width = "0px";
    r.style.height = "0px";
    r.style.display = "block";
  }

  function onCropMouseMove(e){
    if (!state.cropStart) return;
    const r = state.cropNodes.rect;
    const left = Math.min(state.cropStart.x, e.clientX);
    const top  = Math.min(state.cropStart.y, e.clientY);
    const w = Math.abs(e.clientX - state.cropStart.x);
    const h = Math.abs(e.clientY - state.cropStart.y);
    r.style.left = `${left}px`;
    r.style.top  = `${top}px`;
    r.style.width  = `${w}px`;
    r.style.height = `${h}px`;
  }

  function onCropMouseUp(e){
    if (!state.cropStart) { exitCropping(); return; }
    const start = state.cropStart;
    const end   = { x: e.clientX, y: e.clientY };
    const rect = {
      left:   Math.min(start.x, end.x),
      top:    Math.min(start.y, end.y),
      width:  Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    };
    exitCropping();
    if (rect.width < 8 || rect.height < 8) return; // 太小視為取消
    finishCrop(rect);
  }

  function onCropKeyDown(e){
    if (e.key === "Escape") { e.preventDefault(); exitCropping(); }
  }

  async function finishCrop(viewportRect){
    // 記錄框選視窗座標 + 當下 scroll，讓翻譯氣泡能定位到頁面絕對座標
    const cropOrigin = {
      pageX: viewportRect.left + window.scrollX,
      pageY: viewportRect.top  + window.scrollY
    };

    if (!(window.chrome && chrome.runtime && chrome.runtime.id)) {
      showToast("❌ 無法連線到擴充功能環境");
      return;
    }

    // 讀直書模式設定（每次框選即時讀取，讓使用者可隨時在側邊欄切換）
    let verticalMode = false;
    try {
      const cfg = await chrome.storage.sync.get({ ocrVerticalMode: false });
      verticalMode = !!cfg.ocrVerticalMode;
    } catch { /* 讀不到就當 false */ }

    showFloatingOverlay("🔍 擷取畫面中…");

    let captureResp;
    try {
      captureResp = await sendMessage({ type: "CAPTURE_VISIBLE_TAB" });
    } catch (err) {
      replaceFloatingOverlay(`❌ 擷取失敗：${err.message}`);
      return;
    }
    if (!captureResp?.ok) {
      replaceFloatingOverlay(`❌ ${captureResp?.error?.message || "此頁面無法擷取畫面"}`);
      return;
    }

    // 把 dataUrl 畫進 canvas，根據 DPR 裁切（含等比縮放以壓在 OCR.space 1MB 上限內）
    let cropResult;
    try {
      cropResult = await cropFromDataUrl(captureResp.dataUrl, viewportRect, verticalMode);
    } catch (err) {
      replaceFloatingOverlay(`❌ 裁切失敗：${err.message}`);
      return;
    }

    replaceFloatingOverlay("🌐 OCR 與翻譯中…");

    let ocrResp;
    try {
      ocrResp = await sendMessage({ type: "OCR_TRANSLATE", imageBase64: cropResult.dataUrl });
    } catch (err) {
      replaceFloatingOverlay(`❌ 傳訊失敗：${err.message}`);
      return;
    }
    if (!ocrResp?.ok) {
      replaceFloatingOverlay(`❌ ${ocrResp?.error?.message || "翻譯失敗"}`);
      return;
    }

    const groups = ocrResp.result?.groups || [];
    if (groups.length === 0) {
      replaceFloatingOverlay("（沒有辨識到文字）");
      return;
    }

    clearFloatingOverlay();

    // 直書模式：OCR 座標在「旋轉後圖像」空間，需反旋轉回原圖（pre-rotation canvas）空間
    const finalGroups = cropResult.vertical
      ? groups.map(g => unrotateGroup(g, cropResult.preRotHeight))
      : groups;

    renderTranslationOverlays(finalGroups, cropOrigin, viewportRect, cropResult.scale);
  }

  // 旋轉 90° CW 的反變換：(r_x, r_y) → (r_y, preRotHeight - 1 - r_x)
  // 對 bbox：src_left = ocr_top; src_top = preRotHeight - (ocr_left + ocr_w); 長寬互換
  function unrotateGroup(g, preRotHeight){
    if (g.left == null) return g; // fallback 整段情況沒座標
    return {
      ...g,
      left:   g.top,
      top:    preRotHeight - (g.left + g.width),
      width:  g.height,
      height: g.width
    };
  }

  function cropFromDataUrl(dataUrl, viewportRect, vertical){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const dpr = window.devicePixelRatio || 1;
          const sx = Math.max(0, Math.floor(viewportRect.left * dpr));
          const sy = Math.max(0, Math.floor(viewportRect.top  * dpr));
          const sw = Math.min(img.width  - sx, Math.floor(viewportRect.width  * dpr));
          const sh = Math.min(img.height - sy, Math.floor(viewportRect.height * dpr));
          if (sw <= 0 || sh <= 0) { reject(new Error("範圍無效")); return; }

          // 限制最長邊 1600px，避免 OCR.space 免費額度的 1MB 上限
          // （Retina 螢幕大範圍框選很容易爆）
          const MAX_SIDE = 1600;
          const scale = Math.min(1, MAX_SIDE / Math.max(sw, sh));
          const dw = Math.round(sw * scale);  // pre-rotation 寬
          const dh = Math.round(sh * scale);  // pre-rotation 高

          const canvas = document.createElement("canvas");
          const ctx2dOpts = { willReadFrequently: false };

          if (vertical) {
            // 旋轉 90° CW：輸出 canvas 尺寸 (dh, dw)，讓直書變橫書給 OCR 讀
            canvas.width  = dh;
            canvas.height = dw;
            const ctx = canvas.getContext("2d", ctx2dOpts);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.translate(canvas.width, 0);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
          } else {
            canvas.width  = dw;
            canvas.height = dh;
            const ctx = canvas.getContext("2d", ctx2dOpts);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
          }

          // OCR.space 要求完整 data URL 格式（data:image/jpeg;base64,...），不可只傳純 base64
          // 品質 0.75 壓 payload，OCR 對文字清晰度沒那麼敏感
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          resolve({
            dataUrl,
            scale,
            vertical: !!vertical,
            preRotWidth:  dw,   // pre-rotation 寬（座標反旋轉時要用）
            preRotHeight: dh    // pre-rotation 高
          });
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error("圖片載入失敗"));
      img.src = dataUrl;
    });
  }

  function renderTranslationOverlays(groups, cropOrigin, viewportRect, downscale){
    // OCR 座標以「送進 OCR 的圖片」pixel 為基準；該圖 = 擷取影像(CSS×DPR) × downscale
    // 所以反推 CSS px：OCR 座標 / (DPR × downscale)
    const dpr = window.devicePixelRatio || 1;
    const scale = dpr * (downscale || 1);

    for (const g of groups) {
      const overlay = document.createElement("div");
      overlay.className = "tt-trans-overlay";

      // 若 group 無座標（fallback 整段情況）→ 置中浮動
      if (g.left == null) {
        overlay.classList.add("tt-trans-floating");
        overlay.style.position = "fixed";
        overlay.style.top  = "50%";
        overlay.style.left = "50%";
      } else {
        const cssLeft = cropOrigin.pageX + (g.left   / scale);
        const cssTop  = cropOrigin.pageY + (g.top    / scale);
        const cssW    = Math.max(40, g.width  / scale);
        const cssH    = Math.max(24, g.height / scale);
        overlay.style.left   = `${cssLeft}px`;
        overlay.style.top    = `${cssTop}px`;
        overlay.style.width  = `${cssW}px`;
        overlay.style.height = `${cssH}px`;
      }

      const text = document.createElement("span");
      text.className = "tt-trans-text";
      text.textContent = g.translatedText || g.text || "";
      overlay.appendChild(text);

      const closeBtn = document.createElement("div");
      closeBtn.className = "tt-trans-close";
      closeBtn.textContent = "✕";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        overlay.remove();
        state.translationOverlays = state.translationOverlays.filter(n => n !== overlay);
      });
      overlay.appendChild(closeBtn);

      shadow.appendChild(overlay);
      state.translationOverlays.push(overlay);

      // 自動縮字：從 20px 往下縮到剛好塞進框（最小 10px）
      if (g.left != null) fitFontSize(text, overlay, 20, 10);
    }

    state.scrollAccumSinceOverlay = 0;
    state.lastScrollY = window.scrollY;
  }

  function fitFontSize(textEl, containerEl, startSize, minSize){
    let size = startSize;
    textEl.style.fontSize = `${size}px`;
    while (size > minSize &&
           (textEl.scrollHeight > containerEl.clientHeight ||
            textEl.scrollWidth  > containerEl.clientWidth)) {
      size -= 1;
      textEl.style.fontSize = `${size}px`;
    }
  }

  function clearTranslationOverlays(){
    for (const n of state.translationOverlays) n.remove();
    state.translationOverlays = [];
    state.scrollAccumSinceOverlay = 0;
  }

  // ---- 暫時性浮動覆蓋（用來顯示載入中/錯誤提示，成功時移除）
  function showFloatingOverlay(msg){
    clearFloatingOverlay();
    const overlay = document.createElement("div");
    overlay.className = "tt-trans-overlay tt-trans-floating tt-floating-status";
    overlay.textContent = msg;
    shadow.appendChild(overlay);
    state._floatingStatus = overlay;
  }
  function replaceFloatingOverlay(msg){
    if (state._floatingStatus) {
      state._floatingStatus.textContent = msg;
      // 3 秒後自動消失
      clearTimeout(state._floatingTimer);
      state._floatingTimer = setTimeout(clearFloatingOverlay, 3000);
    } else {
      showToast(msg);
    }
  }
  function clearFloatingOverlay(){
    if (state._floatingStatus) {
      state._floatingStatus.remove();
      state._floatingStatus = null;
    }
    clearTimeout(state._floatingTimer);
  }

  // ---- Toast（簡短提示）
  function showToast(msg){
    let el = shadow.querySelector(".tt-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "tt-toast";
      shadow.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
  }

  // ---- Promise 包裝 sendMessage
  function sendMessage(msg){
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(msg, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
  }
})();
