import { useRef } from 'react'
import './App.css'

const SHOTS = [
  { icon: '🔵', t: '選取文字觸發翻譯' },
  { icon: '📖', t: '單字模式：詞性與釋義' },
  { icon: '📝', t: '句子模式：即時翻譯' },
  { icon: '⚙️', t: '擴充功能設定頁面' },
  { icon: '🌐', t: '多語言支援' },
]

export default function App() {
  const trackRef = useRef(null)
  const scroll = d => {
    const el = trackRef.current
    if (!el) return
    const w = el.querySelector('.carousel-slide')?.offsetWidth + 16 || 400
    el.scrollBy({ left: d * w, behavior: 'smooth' })
  }

  return <>
    {/* HEADER */}
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <img src="/cws-logo.svg" alt="" style={{width:32,height:32,flexShrink:0}} />
          <span className="header-logo-text">chrome 線上應用程式商店</span>
        </div>
        <div className="header-search">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <span>搜尋擴充功能和主題</span>
        </div>
        <div className="header-right">
          <button className="hbtn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
          <button className="hbtn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg></button>
          <div className="avatar">A</div>
        </div>
      </div>
    </header>

    {/* SUB NAV */}
    <nav className="subnav">
      <button className="subnav-i">探索</button>
      <button className="subnav-i on">擴充功能</button>
      <button className="subnav-i">主題</button>
    </nav>

    <div className="page">
      {/* EXT HEADER */}
      <div className="ext">
        <div className="ext-top">
          <div className="ext-icon"><img src="/icon-128.png" alt=""/></div>
          <div className="ext-title">
            <h1 className="ext-name">DeepL Select-to-Translate</h1>
          </div>
          <a className="ext-cta" href="/deepl-select-to-translate.zip" download>加到 Chrome</a>
        </div>
        <div className="ext-meta">
          <span className="ext-dev">
            <svg viewBox="0 0 24 24" fill="#0b57d0"><path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/></svg>
            <a href="#">deepl-translate-tool</a>
          </span>
          <span className="ext-featured">
            <svg viewBox="0 0 24 24" fill="#137333"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            精選商品
          </span>
          <span className="ext-rating">
            5 <span className="ext-star">★</span> <span className="ext-rc">(100 個評分)</span>
          </span>
          <button className="ext-ibtn"><svg viewBox="0 0 24 24" fill="#5f6368"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></button>
          <button className="ext-share">
            <svg viewBox="0 0 24 24" fill="#0b57d0"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
            分享
          </button>
        </div>
        <div className="ext-chips">
          <span className="chip">擴充功能</span>
          <span className="chip">翻譯工具</span>
          <span className="ext-users">10,000 使用者</span>
        </div>
      </div>

      {/* CAROUSEL */}
      <div className="carousel">
        <button className="carousel-arrow l" onClick={()=>scroll(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <div className="carousel-track" ref={trackRef}>
          {SHOTS.map((s,i)=>(
            <div className="carousel-slide" key={i}>
              <div className="carousel-ph">
                <div className="i">{s.icon}</div>
                <div className="t">{s.t}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-arrow r" onClick={()=>scroll(1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      <div className="thumbs">
        {SHOTS.map((s,i)=>(
          <div key={i} className={`thumb${i===0?' on':''}`}>{s.icon}</div>
        ))}
      </div>

      {/* 總覽 */}
      <div className="section">
        <h2 className="section-title">總覽</h2>
        <div className="overview">
          <div className="overview-fade" id="overviewBody">
            <p>DeepL Select-to-Translate 是一款輕量快速的瀏覽器翻譯擴充功能。只需在網頁上選取文字，將游標移入右上角出現的藍色小點，即可立即獲得翻譯結果。</p>
            <h3>✦ 主要特色</h3>
            <ul>
              <li><strong>選取即翻譯</strong> — 選取文字後出現藍色小點，滑入或點擊即觸發翻譯</li>
              <li><strong>單字模式</strong> — 選取單字時自動顯示詞性、音標與多條釋義</li>
              <li><strong>句子模式</strong> — 選取句子或段落直接翻譯為目標語言</li>
              <li><strong>34 種語言</strong> — 支援繁體中文、英文、日文、韓文等多國語言</li>
              <li><strong>智慧過濾</strong> — 自動偵測語系，同語言文字不觸發翻譯</li>
              <li><strong>輕量設計</strong> — Shadow DOM 隔離，不影響網頁樣式與速度</li>
            </ul>
            <h3>✦ 使用方式</h3>
            <p>1. 在任意網頁上選取想翻譯的文字<br/>2. 選取文字的右上方會出現一個藍色小點<br/>3. 將游標移入藍色小點或直接點擊<br/>4. 翻譯結果立即顯示於浮動面板</p>
            <h3>✦ 語言設定</h3>
            <p>在擴充功能選項中選擇您的目標語言。當選取的文字與目標語言屬於不同語系時，將自動翻譯為您設定的語言。</p>
            <h3>✦ 安裝教學</h3>
            <p>
              1. 點擊上方「加到 Chrome」按鈕，下載 .zip 檔案並解壓縮<br/>
              2. 開啟 Chrome，在網址列輸入 chrome://extensions/<br/>
              3. 開啟右上角「開發人員模式」開關<br/>
              4. 點擊「載入未封裝項目」，選取解壓縮後的 extensions 資料夾<br/>
              5. 在擴充功能圖示上按右鍵 → 選項，輸入 DeepL API Key 並儲存<br/>
              6. 在任意網頁選取文字，開始使用
            </p>
          </div>
          <button className="show-toggle" onClick={e=>{
            const el = document.getElementById('overviewBody')
            const expanded = el.classList.toggle('overview-fade')
            e.target.textContent = expanded ? '顯示更多' : '顯示較少'
          }}>顯示更多</button>
        </div>
      </div>

      {/* 評分 */}
      <div className="section">
        <div className="rating-row">
          <div className="rating-left">
            <div className="rating-display">
              <span className="rating-score">5 分 (滿分 5 分)</span>
              <span className="rating-stars">★★★★★</span>
            </div>
            <p className="rating-count">100 個評分 · <a href="#">進一步瞭解結果與評論。</a></p>
            <button className="rating-link">查看所有評論</button>
          </div>
          <button className="rating-write">撰寫評論</button>
        </div>
      </div>

      {/* 詳細資料 */}
      <div className="section">
        <h2 className="section-title">詳細資料</h2>
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-label">版本</div>
            <div className="detail-value">1.0.0</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">大小</div>
            <div className="detail-value">25 KB</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">開發人員</div>
            <div className="detail-value">deepl-translate-tool</div>
            <div className="detail-links">
              <a href="https://www.deepl.com" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                網站
              </a>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">交易商</div>
            <div className="detail-value" style={{fontSize:13,color:'var(--text2)'}}>
              此位開發人員表明自己是交易商（依歐盟的定義），並承諾只提供符合歐盟法律的產品或服務。
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">已更新</div>
            <div className="detail-value">2025年3月17日</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">語言</div>
            <div className="detail-value">34 種語言</div>
          </div>
        </div>
        <a href="#" className="report-link">回報疑慮</a>
      </div>

      {/* 隱私權 */}
      <div className="section">
        <h2 className="section-title">隱私權</h2>
        <div className="privacy-box">
          「DeepL Select-to-Translate」已揭露下列關於收集及使用資料的資訊。如需更多詳細資訊，請參閱開發人員的 <a href="#">privacy policy</a>。
        </div>
        <p style={{fontSize:14,color:'var(--text2)',marginBottom:12}}>DeepL Select-to-Translate 會處理下列資料：</p>
        <div className="privacy-cols">
          <div className="privacy-left">
            <div className="privacy-badges">
              <span className="privacy-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                網頁記錄
              </span>
              <span className="privacy-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                使用者活動
              </span>
            </div>
            <div className="privacy-badges" style={{marginTop:8}}>
              <span className="privacy-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                網站內容
              </span>
            </div>
          </div>
          <div className="privacy-right">
            <ul>
              <li>除經核准的用途外，不會將你的資料販售給第三方</li>
              <li>不會基於與商品核心功能無關的目的，使用或轉移資料</li>
              <li>不會為了確認信用度或基於貸款目的，使用或轉移資料</li>
            </ul>
          </div>
        </div>
        <button className="show-toggle" style={{marginTop:12}}>瞭解詳情</button>
      </div>
    </div>

    {/* FOOTER */}
    <footer className="footer">
      <div className="footer-inner">
        關於 Chrome 線上應用程式商店 ·
        <a href="#">開發人員資訊主頁</a>·
        <a href="#">隱私權政策</a>·
        <a href="#">服務條款</a>·
        <a href="#">說明</a>
      </div>
    </footer>
  </>
}
