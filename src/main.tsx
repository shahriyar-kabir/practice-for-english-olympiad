import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/fraunces/600.css';
import App from './App';
import GuardianConsentPage, { consumeGuardianLink } from './GuardianConsentPage';
import './styles.css';
import './wizpiko-redesign.css';

const guardianLink = consumeGuardianLink();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{guardianLink ? <GuardianConsentPage token={guardianLink.token} /> : <App />}</React.StrictMode>,
);
