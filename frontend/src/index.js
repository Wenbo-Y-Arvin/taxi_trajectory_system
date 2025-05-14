import 'bootstrap/dist/css/bootstrap.min.css';   // Bootstrap 5 styles :contentReference[oaicite:4]{index=4}
import 'leaflet/dist/leaflet.css';                // Leaflet CSS :contentReference[oaicite:5]{index=5}
import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import App from './App';
import './index.css';
import 'rc-slider/assets/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
