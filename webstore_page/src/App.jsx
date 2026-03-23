import { useRef, useState, useEffect } from 'react'
import './App.css'

const SHOTS = [
  { img: 'img/img-1.png' },
  { img: 'img/img-2.png' },
  { img: 'img/img-3.png' },
  { img: 'img/img-4.png' },
]

export default function App() {
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [hoverStar, setHoverStar] = useState(0)
  const [apiKeyOpen, setApiKeyOpen] = useState(false)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [lightbox, setLightbox] = useState(-1)
  const [activeSlide, setActiveSlide] = useState(0)
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (reviewStars < 5) {
      const timer = setTimeout(() => setReviewStars(5), 3000)
      return () => clearTimeout(timer)
    }
  }, [reviewStars])
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const trackRef = useRef(null)
  const [transitioning, setTransitioning] = useState(false)
  // Slides: [last_clone, ...real, first_clone]
  const extSlides = [SHOTS[SHOTS.length - 1], ...SHOTS, SHOTS[0]]
  const [trackIdx, setTrackIdx] = useState(1) // start at first real slide

  const getSlideWidth = () => {
    const el = trackRef.current
    if (!el) return 400
    return el.querySelector('.carousel-slide')?.offsetWidth + 16 || 400
  }

  const goTo = (idx) => {
    setActiveSlide(idx)
    setTrackIdx(idx + 1) // +1 for prepended clone
  }

  const scroll = d => {
    if (transitioning) return
    const newTrackIdx = trackIdx + d
    setTransitioning(true)
    setTrackIdx(newTrackIdx)
    const next = (activeSlide + d + SHOTS.length) % SHOTS.length
    setActiveSlide(next)
  }

  // After transition ends, if we're on a clone, jump to real slide instantly
  const handleTransitionEnd = () => {
    setTransitioning(false)
    if (trackIdx === 0) {
      // On last_clone → jump to real last
      trackRef.current.style.transition = 'none'
      setTrackIdx(SHOTS.length)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          trackRef.current.style.transition = ''
        })
      })
    } else if (trackIdx === extSlides.length - 1) {
      // On first_clone → jump to real first
      trackRef.current.style.transition = 'none'
      setTrackIdx(1)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          trackRef.current.style.transition = ''
        })
      })
    }
  }

  return <>
    {/* HEADER */}
    <header className="header">
      <div className="header-inner">
        <a className="header-logo" href="https://chromewebstore.google.com/?utm_source=ext_sidebar" target="_blank" rel="noreferrer">
          <img src={`${import.meta.env.BASE_URL}cws-logo.svg`} alt="" style={{width:32,height:32,flexShrink:0}} />
          <span className="header-logo-text">chrome 線上應用程式商店</span>
        </a>
        <div className={`header-search${searchActive ? ' active' : ''}`} onClick={()=>{setSearchActive(true);setTimeout(()=>searchInputRef.current?.focus(),0)}}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          {searchActive ? (
            <input
              ref={searchInputRef}
              className="header-search-input"
              value={searchText}
              onChange={e=>setSearchText(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&searchText.trim()){window.open(`https://chromewebstore.google.com/search/${encodeURIComponent(searchText.trim())}?utm_source=ext_sidebar`,'_blank')}}}
              onBlur={()=>{if(!searchText){setSearchActive(false)}}}
              placeholder="搜尋擴充功能和主題"
            />
          ) : (
            <span>搜尋擴充功能和主題</span>
          )}
          {searchActive && searchText && (
            <button className="header-search-clear" onClick={e=>{e.stopPropagation();setSearchText('');searchInputRef.current?.focus()}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          )}
        </div>
        <div className="header-right">
          <div style={{position:'relative'}}>
            <button className="hbtn" onClick={()=>setApiKeyOpen(!apiKeyOpen)}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
            {apiKeyOpen && <><div className="overlay" onClick={()=>{setApiKeyOpen(false);setApiKeyCopied(false)}}></div>
            <div className="apikey-popup">
              <div style={{fontWeight:600,marginBottom:8}}>DeepL API Key :</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <code style={{background:'#f5f5f5',padding:'6px 10px',borderRadius:6,fontSize:13,wordBreak:'break-all',flex:1}}>d90b9909-ba23-4d52-9a55-e144f321756e:fx</code>
                <button style={{background:apiKeyCopied?'#4caf50':'var(--primary)',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:13,whiteSpace:'nowrap'}} onClick={()=>{navigator.clipboard.writeText('d90b9909-ba23-4d52-9a55-e144f321756e:fx');setApiKeyCopied(true);setTimeout(()=>setApiKeyCopied(false),2000)}}>{apiKeyCopied?'已複製':'複製'}</button>
              </div>
              <div style={{color:'#999',fontSize:12,marginTop:8}}>Demo 用 API Key，請求量過高的話會停用</div>
            </div></>}
          </div>
          <div className="hbtn static"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg></div>
          <div className="avatar">A</div>
        </div>
      </div>
    </header>

    {/* SUB NAV */}
    <nav className="subnav">
      <a className="subnav-i" href="https://chromewebstore.google.com/?utm_source=ext_sidebar" target="_blank" rel="noreferrer">探索</a>
      <button className="subnav-i on">擴充功能</button>
      <a className="subnav-i" href="https://chromewebstore.google.com/category/themes?utm_source=ext_sidebar" target="_blank" rel="noreferrer">主題</a>
    </nav>

    <div className="page">
      {/* EXT HEADER */}
      <div className="ext">
        <div className="ext-top">
          <div className="ext-icon"><img src={`${import.meta.env.BASE_URL}icon-128.png`} alt=""/></div>
          <div className="ext-title">
            <h1 className="ext-name">Tooltran</h1>
          </div>
          <a className="ext-cta" href={`${import.meta.env.BASE_URL}tooltran.zip`} download>加到 Chrome</a>
        </div>
        <div className="ext-meta">
          <span className="ext-dev tooltip-wrap">
            <svg viewBox="0 0 24 24" fill="#0b57d0"><path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/></svg>
            <span>tooltran</span>
            <div className="tooltip">這位發布者記錄良好，沒有任何違規事項。<a href="https://support.google.com/chrome_webstore?source=404&sjid=5012819729931096164-NC#topic=6243095" target="_blank" rel="noreferrer">瞭解詳情</a>。</div>
          </span>
          <span className="ext-featured tooltip-wrap">
            <svg viewBox="0 0 24 24" fill="#137333"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            精選商品
            <div className="tooltip">參考 Chrome 擴充功能適用的建議做法。<a href="https://support.google.com/chrome_webstore?source=404&sjid=5012819729931096164-NC#topic=6243095" target="_blank" rel="noreferrer">瞭解詳情</a>。</div>
          </span>
          <span className="ext-rating tooltip-wrap">
            5 <span className="ext-star">★</span> <span className="ext-rc">(100 個評分)</span>
            <div className="tooltip">評分每天更新，可能無法即時顯示最新評論。</div>
          </span>
          <button className="ext-share" onClick={()=>{setShareOpen(true);setCopied(false)}}>
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
        <div className="carousel-viewport">
          <div className="carousel-track" ref={trackRef} style={{transform:`translateX(-${trackIdx * getSlideWidth()}px)`}} onTransitionEnd={handleTransitionEnd}>
            {extSlides.map((s,i)=>(
              <div className="carousel-slide" key={i} onClick={()=>{const real=(i-1+SHOTS.length)%SHOTS.length;setLightbox(real)}} style={{cursor:'pointer'}}>
                <img className="carousel-img" src={`${import.meta.env.BASE_URL}${s.img}`} alt="" />
              </div>
            ))}
          </div>
        </div>
        <button className="carousel-arrow r" onClick={()=>scroll(1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      <div className="thumbs">
        {SHOTS.map((s,i)=>(
          <div key={i} className={`thumb${i===activeSlide?' on':''}`} onClick={()=>goTo(i)}>
            <img src={`${import.meta.env.BASE_URL}${s.img}`} alt="" />
          </div>
        ))}
      </div>

      {/* 總覽 */}
      <div className="section">
        <h2 className="section-title">總覽</h2>
        <div className="overview">
          <div className="overview-fade" id="overviewBody">
            <p>Tooltran 是一款輕量快速的瀏覽器翻譯擴充功能。只需在網頁上選取文字，將游標移入右上角出現的藍色小點，即可立即獲得翻譯結果。</p>
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
              5. 在擴充功能圖示上按右鍵 → 選項，輸入 API Key 並儲存<br/>
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
              <span className="ext-ibtn tooltip-wrap" style={{marginLeft:4}}>
                <svg viewBox="0 0 24 24" fill="#5f6368"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <div className="tooltip">參考 Chrome 擴充功能適用的建議做法。<a href="https://support.google.com/chrome_webstore?source=404&sjid=5012819729931096164-NC#topic=6243095" target="_blank" rel="noreferrer">瞭解詳情</a>。</div>
              </span>
            </div>
            <p className="rating-count">100 個評分 · <a href="https://support.google.com/chrome_webstore/answer/12225786?p=cws_reviews_results" target="_blank" rel="noreferrer">進一步瞭解結果與評論。</a></p>
          </div>
        </div>
        <button className="report-link" style={{fontWeight:700}} onClick={()=>{setReviewOpen(true);setReviewStars(5);setReviewText('');setHoverStar(0)}}>撰寫評論</button>
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
            <div className="detail-value">tooltran</div>
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
        <button className="report-link" style={{fontWeight:700}} onClick={()=>{setReportOpen(true);setReportText('')}}>回報疑慮</button>
      </div>

      {/* 隱私權 */}
      <div className="section">
        <h2 className="section-title">隱私權</h2>
        <div className="privacy-box">
          「Tooltran」已揭露下列關於收集及使用資料的資訊。如需更多詳細資訊，請參閱開發人員的 <a href="https://myaccount.google.com/privacypolicy" target="_blank" rel="noreferrer">privacy policy</a>。
        </div>
        <p style={{fontSize:14,color:'var(--text2)',marginBottom:12}}>Tooltran 不會處理下列資料：</p>
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
      </div>
    </div>

    {/* FOOTER */}
    <footer className="footer">
      <div className="footer-inner">
        關於 Chrome 線上應用程式商店 ·
        <a href="https://chrome.google.com/webstore/devconsole/" target="_blank" rel="noreferrer">開發人員資訊主頁</a>·
        <a href="https://myaccount.google.com/privacypolicy" target="_blank" rel="noreferrer">隱私權政策</a>·
        <a href="https://ssl.gstatic.com/chrome/webstore/intl/gallery_tos.html" target="_blank" rel="noreferrer">服務條款</a>·
        <a href="https://support.google.com/chrome_webstore" target="_blank" rel="noreferrer">說明</a>
      </div>
    </footer>

    {/* SHARE MODAL */}
    {shareOpen && <>
      <div className="share-overlay" onClick={()=>setShareOpen(false)}/>
      <div className="share-modal">
        <button className="share-close" onClick={()=>setShareOpen(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <h3 className="share-title">Tooltran</h3>
        <p className="share-subtitle">分享這個項目</p>
        <div className="share-icons">
          <a className="share-icon" style={{background:'#0077B5'}} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a className="share-icon" style={{background:'#1877F2'}} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" title="Facebook">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a className="share-icon" style={{background:'#FF4500'}} href={`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Tooltran')}`} target="_blank" rel="noreferrer" title="Reddit">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.462.342.342 0 00-.461 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.206-.095z"/></svg>
          </a>
          <a className="share-icon" style={{background:'#000'}} href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Tooltran')}`} target="_blank" rel="noreferrer" title="X">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a className="share-icon" style={{background:'#25D366'}} href={`https://wa.me/?text=${encodeURIComponent('Tooltran ' + shareUrl)}`} target="_blank" rel="noreferrer" title="WhatsApp">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
        <div className="share-url-row">
          <input className="share-url-input" value={shareUrl} readOnly onClick={e=>e.target.select()} />
          <button className="share-copy-btn" onClick={()=>{navigator.clipboard.writeText(shareUrl);setCopied(true)}}>
            {copied ? '已複製' : '複製'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
        </div>
      </div>
    </>}

    {/* REVIEW MODAL */}
    {reviewOpen && <>
      <div className="share-overlay" onClick={()=>setReviewOpen(false)}/>
      <div className="share-modal review-modal">
        <button className="share-close" onClick={()=>setReviewOpen(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <h3 className="share-title">撰寫評論</h3>
        <p className="share-subtitle">為 Tooltran 評分</p>
        <div className="review-stars">
          {[1,2,3,4,5].map(n=>(
            <span
              key={n}
              className={`review-star ${n <= (hoverStar || reviewStars) ? 'active' : ''}`}
              onClick={()=>setReviewStars(n)}
              onMouseEnter={()=>setHoverStar(n)}
              onMouseLeave={()=>setHoverStar(0)}
            >★</span>
          ))}
        </div>
        <textarea
          className="report-textarea"
          placeholder="分享您的使用體驗..."
          value={reviewText}
          onChange={e=>setReviewText(e.target.value)}
          rows={4}
        />
        <a
          className="report-submit"
          href={`https://t.me/annnmnnn?text=${encodeURIComponent('⭐'.repeat(reviewStars) + '\n' + reviewText)}`}
          target="_blank"
          rel="noreferrer"
          onClick={()=>setReviewOpen(false)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.281c-.146.658-.537.818-1.084.508l-3-2.211-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.832.942z"/></svg>
          透過 Telegram 送出評論
        </a>
      </div>
    </>}

    {/* REPORT MODAL */}
    {reportOpen && <>
      <div className="share-overlay" onClick={()=>setReportOpen(false)}/>
      <div className="share-modal report-modal">
        <button className="share-close" onClick={()=>setReportOpen(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <h3 className="share-title">回報疑慮</h3>
        <p className="share-subtitle">請描述您遇到的問題</p>
        <textarea
          className="report-textarea"
          placeholder="請輸入您想回報的內容..."
          value={reportText}
          onChange={e=>setReportText(e.target.value)}
          rows={5}
        />
        <a
          className="report-submit"
          href={`https://t.me/annnmnnn?text=${encodeURIComponent(reportText)}`}
          target="_blank"
          rel="noreferrer"
          onClick={()=>setReportOpen(false)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.281c-.146.658-.537.818-1.084.508l-3-2.211-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.832.942z"/></svg>
          透過 Telegram 送出
        </a>
      </div>
    </>}

    {/* LIGHTBOX */}
    {lightbox >= 0 && <>
      <div className="lightbox-overlay" onClick={()=>setLightbox(-1)}>
        <button className="lightbox-close" onClick={()=>setLightbox(-1)}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <button className="lightbox-arrow lightbox-prev" onClick={e=>{e.stopPropagation();setLightbox((lightbox - 1 + SHOTS.length) % SHOTS.length)}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <img className="lightbox-img" src={`${import.meta.env.BASE_URL}${SHOTS[lightbox].img}`} alt="" onClick={e=>e.stopPropagation()} />
        <button className="lightbox-arrow lightbox-next" onClick={e=>{e.stopPropagation();setLightbox((lightbox + 1) % SHOTS.length)}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
        <div className="lightbox-counter" onClick={e=>e.stopPropagation()}>{lightbox + 1} / {SHOTS.length}</div>
      </div>
    </>}
  </>
}
