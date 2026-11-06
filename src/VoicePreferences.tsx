import {useEffect,useId,useState} from 'react';
import type {AudioPreferences} from './learningAudio';
import {readQuestion,stopQuestion} from './learningAudio';
import './question-audio.css';
export default function VoicePreferences({value,onChange}:{value:AudioPreferences;onChange:(patch:AudioPreferences)=>void}){
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[notice,setNotice]=useState('');
 const voiceId=useId(),speedId=useId();
 useEffect(()=>{if(!('speechSynthesis'in window))return;const load=()=>setVoices(window.speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)));load();window.speechSynthesis.addEventListener('voiceschanged',load);return()=>{window.speechSynthesis.removeEventListener('voiceschanged',load);stopQuestion();};},[]);
 return <div className="wd-audio-settings">
  <h3>Question read-aloud</h3>
  <p>Martha (en-GB) at 0.9× is the default. If Martha is unavailable, an English voice on this device is used. A Listen button stays beside each question.</p>
  <label className="wd-audio-auto"><input type="checkbox" checked={value.read_aloud===true} onChange={e=>onChange({read_aloud:e.target.checked})}/><span>Automatically read new questions</span></label>
  <div className="wd-audio-field">
   <label htmlFor={voiceId}>Reading voice</label>
   <select id={voiceId} value={value.speech_voice||'Martha'} onChange={e=>onChange({speech_voice:e.target.value})}><option value="Martha">Default · Martha (en-GB, when available)</option>{voices.map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}</option>)}</select>
  </div>
  <div className="wd-audio-field">
   <label htmlFor={speedId}>Reading speed · {(value.speech_rate||.9).toFixed(1)}×</label>
   <input id={speedId} type="range" min=".7" max="1.2" step=".1" value={value.speech_rate||.9} onChange={e=>onChange({speech_rate:Number(e.target.value)})}/>
  </div>
  <div className="wd-audio-actions">
   <button type="button" className="wd-text-button" onClick={()=>{setNotice('');readQuestion('Welcome to Wizpiko. Take your time and enjoy learning something new today.',error=>{if(error)setNotice(error);},value);}}>Listen to this voice</button>
   <button type="button" className="wd-text-button" onClick={stopQuestion}>Stop</button>
  </div>
  {notice&&<p role="status">{notice}</p>}
  <p className="wd-muted">No microphone is used. Browser voices vary by device. Save preferences to keep your choices.</p>
 </div>;
}
