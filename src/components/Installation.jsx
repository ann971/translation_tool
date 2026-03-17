/* 安裝教學區 — 六步驟圖文說明 */
import './Installation.css'

const steps = [
  {
    number: 1,
    title: '下載檔案',
    description: '點擊上方「免費下載」按鈕，下載 .zip 檔案並解壓縮',
  },
  {
    number: 2,
    title: '開啟擴充功能頁面',
    description: '開啟 Chrome 瀏覽器，在網址列輸入 chrome://extensions/',
  },
  {
    number: 3,
    title: '開啟開發人員模式',
    description: '在擴充功能頁面右上角，開啟「開發人員模式」開關',
  },
  {
    number: 4,
    title: '載入未封裝項目',
    description: '點擊左上角「載入未封裝項目」按鈕',
  },
  {
    number: 5,
    title: '選取資料夾',
    description: '在檔案選擇器中，選取剛才解壓縮後的資料夾',
  },
  {
    number: 6,
    title: '完成安裝',
    description: '安裝完成！在任意網頁選取文字即可開始使用翻譯功能',
  },
]

function Installation() {
  return (
    <section className="installation">
      <div className="installation-container">
        <h2 className="installation-title">安裝教學</h2>
        <p className="installation-subtitle">
          只需簡單幾個步驟，即可完成安裝
        </p>

        <div className="steps-list">
          {steps.map((step) => (
            <div className="step-item" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Installation
