/* 截圖展示區 — 插件操作流程輪播 */
import { useState } from 'react'
import './Screenshots.css'

/* 使用佔位圖片，實際圖片可替換為真實截圖 */
const slides = [
  {
    id: 1,
    title: '選取文字',
    description: '在任意網頁上選取想翻譯的文字',
    color: '#E8F0FE',
  },
  {
    id: 2,
    title: '出現藍色小點',
    description: '選取文字的右上方會出現一個藍色小點',
    color: '#D2E3FC',
  },
  {
    id: 3,
    title: '游標移入',
    description: '將游標移入藍色小點',
    color: '#AECBFA',
  },
  {
    id: 4,
    title: '顯示翻譯結果',
    description: '翻譯結果立即顯示在彈窗中',
    color: '#8AB4F8',
  },
]

function Screenshots() {
  const [current, setCurrent] = useState(0)

  const goTo = (index) => {
    setCurrent(index)
  }

  const prev = () => {
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1))
  }

  const next = () => {
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1))
  }

  return (
    <section className="screenshots">
      <div className="screenshots-container">
        <h2 className="screenshots-title">使用流程</h2>

        {/* 輪播區域 */}
        <div className="carousel">
          <button className="carousel-btn carousel-btn-prev" onClick={prev} aria-label="上一張">
            &#8249;
          </button>

          <div className="carousel-slide">
            {/* 佔位截圖區塊 */}
            <div
              className="carousel-placeholder"
              style={{ backgroundColor: slides[current].color }}
            >
              <div className="carousel-placeholder-content">
                <span className="carousel-step">步驟 {current + 1}</span>
                <h3>{slides[current].title}</h3>
                <p>{slides[current].description}</p>
              </div>
            </div>
          </div>

          <button className="carousel-btn carousel-btn-next" onClick={next} aria-label="下一張">
            &#8250;
          </button>
        </div>

        {/* 指示點 */}
        <div className="carousel-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`carousel-dot ${index === current ? 'active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`第 ${index + 1} 張截圖`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Screenshots
