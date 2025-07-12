import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store'
import Modal from 'react-modal'
import { ThemeModeProvider } from './ThemeContext'

Modal.setAppElement('#root')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeModeProvider>
          <App />
        </ThemeModeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
