import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Ngăn triệt để Google Translate hoặc trình duyệt tự động dịch tên ligature của icon Material Symbols
if (typeof window !== 'undefined') {
  const markIconsNoTranslate = () => {
    document.querySelectorAll('.material-symbols-outlined').forEach((el) => {
      if (el.getAttribute('translate') !== 'no') {
        el.setAttribute('translate', 'no');
      }
      if (!el.classList.contains('notranslate')) {
        el.classList.add('notranslate');
      }
    });
  };

  const observer = new MutationObserver(() => {
    markIconsNoTranslate();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  document.addEventListener('DOMContentLoaded', markIconsNoTranslate);
  markIconsNoTranslate();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
