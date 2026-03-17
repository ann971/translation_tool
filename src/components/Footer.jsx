/* 附加資訊區 — 版本、檔案大小、更新日期、語言支援 */
import './Footer.css'

const info = [
  { label: '版本號', value: '1.0.0' },
  { label: '檔案大小', value: '128 KB' },
  { label: '最後更新', value: '2026-03-17' },
  { label: '語言支援', value: '16 種語言' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-info-grid">
          {info.map((item) => (
            <div className="footer-info-item" key={item.label}>
              <span className="footer-info-label">{item.label}</span>
              <span className="footer-info-value">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="footer-copyright">
          © 2026 Smart Translate. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
