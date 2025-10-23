
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import{BrouerRouter} from `react-router-dom`

createRoot(document.getElementById('root')).render(
  <BrouerRouter>
    <App />
  </BrouerRouter>,
)
