import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 注意：点击星火（ClickSpark）已经由 App.jsx 自己渲染（见其顶部动效层 import），
// 这里不要再包一层 —— 否则每次点击会画两组粒子。
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
