/* Hero 區塊 — 插件名稱、描述、下載按鈕、基本資訊 */
import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        {/* 插件圖示 */}
        <div className="hero-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" rx="16" fill="#4285F4" />
            <text
              x="40"
              y="50"
              textAnchor="middle"
              fill="white"
              fontSize="36"
              fontWeight="bold"
              fontFamily="-apple-system, sans-serif"
            >
              ST
            </text>
          </svg>
        </div>

        {/* 插件資訊 */}
        <div className="hero-info">
          <h1 className="hero-title">Smart Translate</h1>
          <p className="hero-description">
            輕鬆選取、即時翻譯 — 讓閱讀外語網頁不再是障礙
          </p>

          {/* 下載按鈕 */}
          <a href="/smart-translate.zip" download className="hero-download-btn">
            免費下載
          </a>

          {/* 基本資訊標籤 */}
          <div className="hero-meta">
            <span className="hero-meta-item">版本 1.0.0</span>
            <span className="hero-meta-divider">·</span>
            <span className="hero-meta-item">128 KB</span>
            <span className="hero-meta-divider">·</span>
            <span className="hero-meta-item">更新日期：2026-03-17</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
