// content.js — DeepL 選字翻譯（依設定目標語言）
// 功能：選字→顯示 12×12 #49b4e9 圓形按鈕→滑入/點擊開啟翻譯面板
// 特色：按鈕/面板以 absolute 跟隨頁面滾動；面板可拖曳（拖後視為釘住，不再自動跟隨）
// 規則：若偵測到選取文字與目標語言相同則不翻譯
(() => {
  const state = {
    selectionText: "",
    anchorRange: null,      // 目前選取的錨點 range（即時取座標）
    hoverTimer: null,
    panelPinned: false,     // 被拖曳後設 true；下次開啟恢復 false
    targetLang: "ZH-HANT"  // 快取目標語言，用於客戶端語系過濾
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
  host.id = "deepl-translate-shadow-host";
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
    .ai-tools{display:flex; gap:8px;}
    .ai-icon{cursor:pointer; opacity:.85;} .ai-icon:hover{opacity:1;}
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
      <div class="ai-title">DeepL 翻譯</div>
      <div class="ai-tools"><span class="ai-icon" id="ai-close" title="關閉">✖</span></div>
    </div>
    <div class="ai-body" id="ai-body">載入中…</div>
  `;
  shadow.appendChild(panel);

  // ---- 工具：安全設定面板文字
  function setBody(text){
    const el = shadow.getElementById("ai-body");
    if (el) el.textContent = (text == null) ? "" : String(text);
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
    setBody("載入中…");

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

  // （可選）點空白關閉
  document.addEventListener("mousedown", (e)=>{ if(!shadow.contains(e.target)) hideAll(); }, true);
})();
