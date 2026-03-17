/* 詳細描述區 — 功能介紹、特色亮點、支援語言 */
import './Description.css'

/* 支援語言列表 */
const languages = [
  '中文（繁體）', '中文（簡體）', '英文', '日文',
  '韓文', '法文', '德文', '西班牙文',
  '葡萄牙文', '俄文', '義大利文', '泰文',
  '越南文', '印尼文', '阿拉伯文', '荷蘭文',
]

/* 特色亮點 */
const features = [
  {
    icon: '⚡',
    title: '選取即翻譯',
    text: '操作直覺不打斷閱讀，選取文字即可觸發翻譯',
  },
  {
    icon: '🌐',
    title: '多國語言支援',
    text: '支援多國語言自動偵測，智慧辨識來源語言',
  },
  {
    icon: '🎯',
    title: '自訂目標語言',
    text: '可在設定中選擇您慣用的目標翻譯語言',
  },
  {
    icon: '🪶',
    title: '輕量設計',
    text: '不影響瀏覽速度，簡潔彈窗不遮擋頁面內容',
  },
]

function Description() {
  return (
    <section className="description">
      <div className="description-container">
        {/* 功能介紹 */}
        <div className="description-intro">
          <h2>關於 Smart Translate</h2>
          <p>
            Smart Translate 是一款輕量快速的瀏覽器翻譯插件。只需在網頁上選取文字，
            將游標移入右上角出現的藍色小點，即可立即獲得翻譯結果。
          </p>
        </div>

        {/* 特色亮點 */}
        <h2 className="section-heading">特色亮點</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>

        {/* 支援語言 */}
        <h2 className="section-heading">支援語言</h2>
        <div className="languages-grid">
          {languages.map((lang) => (
            <span className="language-tag" key={lang}>
              {lang}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Description
