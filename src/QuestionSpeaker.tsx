import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { canAutoRead, readQuestion, stopQuestion } from './learningAudio';
import './question-audio.css';
export default function QuestionSpeaker({text}:{text:string}){
 const [speaking,setSpeaking]=useState(false),[notice,setNotice]=useState('');
 function listen(){if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){setNotice('Read-aloud is unavailable in this browser.');return;}setNotice('');readQuestion(text,error=>{setSpeaking(false);if(error)setNotice(error);});setSpeaking(true);}
 useEffect(()=>{const stopped=()=>setSpeaking(false);window.addEventListener('wizpiko-speech-stop',stopped);if(canAutoRead())listen();return()=>{window.removeEventListener('wizpiko-speech-stop',stopped);stopQuestion();};},[text]);
 return <span className="wz-question-audio"><button type="button" className="wz-read-question" aria-label={speaking?'Stop reading question':'Read question aloud'} aria-pressed={speaking} onClick={()=>{if(speaking){stopQuestion();setSpeaking(false);}else listen();}}>{speaking?<Square size={16}/>:<Volume2 size={17}/>}<span>{speaking?'Stop':'Listen'}</span></button>{notice&&<small role="status">{notice}</small>}</span>;
}
