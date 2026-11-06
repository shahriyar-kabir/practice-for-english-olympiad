import type { LearnerProfile } from './learnerData';
export type AudioPreferences = LearnerProfile['preferences'];
let preferences:AudioPreferences={}, activated=false, audio:AudioContext|null=null, speechToken=0;
export function audioPreferences(){return preferences;}
export function configureLearningAudio(value:AudioPreferences={}){preferences=value;window.dispatchEvent(new Event('wizpiko-audio-preferences'));if(value.sound===false&&audio)void audio.suspend();}
export function activateLearningAudio(){activated=true;}
export function voiceFor(voices:SpeechSynthesisVoice[], preferred='Martha'){
 return voices.find(v=>v.voiceURI===preferred)||voices.find(v=>v.name===preferred&&v.lang.toLowerCase()==='en-gb')||voices.find(v=>v.name===preferred)||voices.find(v=>v.name.toLowerCase().includes('martha')&&v.lang.toLowerCase()==='en-gb')||voices.find(v=>v.lang.toLowerCase()==='en-gb')||voices.find(v=>/^en/i.test(v.lang))||voices.find(v=>v.default)||voices[0];
}
export function spokenQuestion(value:string){return value.replace(/https?:\/\/\S+/g,'').replace(/(\d+)\/(\d+)/g,'$1 divided by $2').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/\+/g,' plus ').replace(/=/g,' equals ').replace(/%/g,' percent ').replace(/_/g,' blank ').replace(/\s+/g,' ').trim();}
export function stopQuestion(){speechToken++;if('speechSynthesis' in window)window.speechSynthesis.cancel();window.dispatchEvent(new Event('wizpiko-speech-stop'));}
export function readQuestion(text:string,finished:(error?:string)=>void=()=>{},settings:AudioPreferences=preferences){
 if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){finished('Read-aloud is unavailable in this browser.');return;}
 stopQuestion();const token=++speechToken,synth=window.speechSynthesis,speech=new SpeechSynthesisUtterance(spokenQuestion(text));
 const voice=voiceFor(synth.getVoices(),settings.speech_voice||'Martha');if(voice)speech.voice=voice;
 speech.lang=voice?.lang||'en-GB';speech.rate=Math.max(.7,Math.min(1.2,settings.speech_rate||.9));speech.pitch=1;speech.volume=1;
 speech.onend=()=>{if(token===speechToken)finished();};speech.onerror=e=>{if(token===speechToken)finished(e.error==='canceled'||e.error==='interrupted'?undefined:'This voice could not play. Try another voice in Learning Preferences.');};
 synth.speak(speech);
}
export function canAutoRead(){return activated&&preferences.read_aloud===true;}
export type LearningSound='select'|'correct'|'retry'|'complete'|'achievement'|'certificate'|'streak';
const melodies:Record<LearningSound,number[]>={select:[740],correct:[659,880],retry:[392,349],complete:[523,659,784],achievement:[659,784,988,1319],certificate:[523,659,784,1047,1319],streak:[784,988,1175]};
export function playLearningSound(kind:LearningSound){
 if(preferences.sound===false||!activated)return;
 try{audio??=new AudioContext();if(audio.state==='suspended')void audio.resume();const ctx=audio;
 if(kind==='complete'){
  // User-selected Sparkling Discovery: original, ascending five-note celebration.
  const notes:[[number,number,number,number],[number,number,number,number],[number,number,number,number],[number,number,number,number],[number,number,number,number]]=[
   [523.251,.06,.43,.075],[659.255,.31,.44,.075],[783.991,.56,.49,.079],[880,.83,.54,.073],[1046.502,1.13,1.07,.107]];
  for(const [frequency,start,length,volume] of notes){
   for(const [ratio,level] of [[1,1],[2.01,.35],[3.96,.12]]){
    const osc=ctx.createOscillator(),env=ctx.createGain(),at=ctx.currentTime+start;
    osc.type='sine';osc.frequency.value=frequency*ratio;osc.connect(env);env.connect(ctx.destination);
    env.gain.setValueAtTime(.0001,at);env.gain.linearRampToValueAtTime(volume*level,at+.007);
    env.gain.exponentialRampToValueAtTime(.0001,at+length);
    osc.start(at);osc.stop(at+length+.01);
   }
  }
  for(const [frequency,at] of [[1567.982,1.60],[2093.005,1.78]]){
   const osc=ctx.createOscillator(),gain=ctx.createGain(),when=ctx.currentTime+at;
   osc.type='sine';osc.frequency.value=frequency;osc.connect(gain);gain.connect(ctx.destination);
   gain.gain.setValueAtTime(.0001,when);gain.gain.linearRampToValueAtTime(.02,when+.009);
   gain.gain.exponentialRampToValueAtTime(.0001,when+.38);
   osc.start(when);osc.stop(when+.39);
  }
  return;
 }
 melodies[kind].forEach((frequency,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);oscillator.type=kind==='retry'||kind==='select'?'sine':'triangle';oscillator.frequency.value=frequency;const at=ctx.currentTime+i*.115;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(kind==='select'?.016:kind==='retry'?.025:.045,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+(kind==='select'?.095:.25));oscillator.start(at);oscillator.stop(at+(kind==='select'?.11:.28));});
 }catch{/* Practice continues when device audio is unavailable. */}
}
