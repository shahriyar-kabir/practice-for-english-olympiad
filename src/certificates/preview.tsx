import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import '@fontsource/fraunces/500.css';
import CertificateDesign from './CertificateDesign';
import './certificates.css';

function Preview() {
  const [name, setName] = useState('Your full name');
  const [subject, setSubject] = useState('English');
  const [level, setLevel] = useState('Starter');
  return <main className="wc-review-page"><header><span className="wc-eyebrow">WIZPIKO · DESIGN REVIEW</span><h1>A little learning. A lasting achievement.</h1><p>Sample design only. Before issuing a certificate, we will ask for the learner’s full name and show it here for checking.</p></header><div className="wc-preview-options"><label>Full name on certificate<input value={name} maxLength={100} onChange={event => setName(event.target.value)} /></label><label>Subject<select aria-label="Subject" value={subject} onChange={event => setSubject(event.target.value)}><option>English</option><option>Mathematics</option></select></label><label>Level<select aria-label="Level" value={level} onChange={event => setLevel(event.target.value)}>{['Starter','Beginner','Intermediate','Advanced'].map(item => <option key={item}>{item}</option>)}</select></label></div><CertificateDesign data={{ fullName: name || 'Your full name', subject, level, issuedDate: 'On completion', credential: 'Certificate ID assigned when issued', verification: 'Sample design · Not an issued certificate', preview: true }} /><p className="wc-review-note">Certificates stay private in the learner profile. Public sharing is optional and shows the certificate name, subject, level and issue date.</p></main>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
