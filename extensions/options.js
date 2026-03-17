(async function init() {
  const $ = (id) => document.getElementById(id);

  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2000);
  }

  function updateProStatus() {
    const on = $("useDeepLPro").checked;
    const status = $("proStatus");
    status.textContent = on ? "ON" : "OFF";
    status.className = "toggle-status " + (on ? "on" : "off");
  }

  const saved = await chrome.storage.sync.get({
    deeplApiKey: "",
    useDeepLPro: false,
    targetLang: "ZH-HANT"
  });

  $("deeplApiKey").value = saved.deeplApiKey;
  $("useDeepLPro").checked = saved.useDeepLPro;
  $("targetLang").value = saved.targetLang;
  updateProStatus();

  // 點擊整列切換 Pro
  $("proRow").addEventListener("click", (e) => {
    if (e.target.closest("label")) return; // 避免 label 內重複觸發
    $("useDeepLPro").checked = !$("useDeepLPro").checked;
    updateProStatus();
  });
  $("useDeepLPro").addEventListener("change", updateProStatus);

  $("save").addEventListener("click", async () => {
    const deeplApiKey = $("deeplApiKey").value.trim();
    const useDeepLPro = $("useDeepLPro").checked;
    const targetLang = $("targetLang").value;
    await chrome.storage.sync.set({ deeplApiKey, useDeepLPro, targetLang });
    toast("設定已儲存");
  });

  $("clear").addEventListener("click", async () => {
    await chrome.storage.sync.set({ deeplApiKey: "" });
    $("deeplApiKey").value = "";
    toast("API Key 已清除");
  });
})();
