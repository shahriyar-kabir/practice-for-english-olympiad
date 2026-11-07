import type { AcademyTask } from './types';
import { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { playLearningSound } from '../learningAudio';

function orderedIndices(task: AcademyTask, answer: string) {
  if (task.type !== 'order') return [];
  const used = new Set<number>();
  return answer.split(' ').map(word => { const index = task.tokens.findIndex((token,index) => token === word && !used.has(index)); if (index >= 0) used.add(index); return index; }).filter(index => index >= 0);
}
export function displayTaskAnswer(task:AcademyTask,value?:string):string {
 if(task.type!=='match')return value||'Not answered';
 try {
  const selections=JSON.parse(value||'[]');
  if(!Array.isArray(selections))return 'Not answered';
  return task.pairs.map((pair,index)=>pair.left+' → '+(selections[index]||'Not matched')).join(' · ');
 }catch{return 'Not answered';}
}
export function taskAnswerComplete(task:AcademyTask,value:string):boolean {
 if(task.type!=='match')return value.trim().length>0;
 try {const choices=JSON.parse(value);return Array.isArray(choices)&&choices.length===task.pairs.length&&choices.every((item)=>typeof item==='string'&&task.options.includes(item))&&new Set(choices).size===choices.length;}catch{return false;}
}
export function PracticeTask({ task, answer, onAnswer, disabled }: { task: AcademyTask; answer: string; onAnswer: (value: string) => void; disabled: boolean }) {
  const [selected, setSelected] = useState(() => orderedIndices(task, answer));
  if (task.type === 'choice') return <fieldset className="ea-choices" disabled={disabled}><legend className="ea-sr-only">{task.prompt}</legend>{task.choices.map((value,index) => <label className={`ea-choice ${answer === value ? 'selected' : ''}`} key={value}><input type="radio" name={task.id} value={value} checked={answer === value} onChange={() => {playLearningSound('select');onAnswer(value);}} /><span className="ea-choice-letter" aria-hidden="true">{String.fromCharCode(65+index)}</span><span>{value}</span></label>)}</fieldset>;
  if (task.type === 'fill') return <div className="ea-answer-label"><label htmlFor={`answer-${task.id}`}>Your answer</label><input id={`answer-${task.id}`} aria-describedby={`answer-help-${task.id}`} className="ea-answer-input" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={400} value={answer} disabled={disabled} placeholder={task.placeholder || 'Type your answer'} onChange={event => onAnswer(event.target.value)} /><small id={`answer-help-${task.id}`}>{task.caseSensitive ? 'Use the correct capital letters.' : 'Take your time. Extra spaces and letter case do not affect this answer.'}</small></div>;
  if(task.type==='match') {
   let selections:string[]=[];
   try { const parsed=JSON.parse(answer);if(Array.isArray(parsed))selections=parsed.filter(value=>typeof value==='string'); }catch{ /* no selection yet */ }
   function pair(index:number, value:string) {const next=task.pairs.map((_,at)=>at===index?value:(selections[at]||''));playLearningSound('select');onAnswer(JSON.stringify(next));}
   return <fieldset className="sci-match" disabled={disabled}><legend>Match each idea to its clue</legend><p className="ea-small">Choose a clue for each idea. Complete all three pairs, then check your answers. All pairs can be selected by keyboard or touch.</p><div className="sci-match-list">{task.pairs.map((entry,index)=><label key={entry.left} className="sci-match-row"><span className="sci-match-term"><span aria-hidden="true">✦</span>{entry.left}</span><span className="sci-match-arrow" aria-hidden="true">↔</span><select aria-label={`Clue for ${entry.left}`} value={selections[index]||''} onChange={event=>pair(index,event.target.value)}><option value="">Choose a matching clue…</option>{task.options.map(option=><option key={option} value={option} disabled={selections.some((selected,at)=>at!==index&&selected===option)}>{option}</option>)}</select></label>)}</div></fieldset>;
  }
  function choose(next: number[]) {playLearningSound('select');setSelected(next);if(task.type==='order')onAnswer(next.map(index=>task.tokens[index]).join(' '));}
  return <div className="ea-order"><p className="ea-small">Choose each tile in order. Select a tile in your answer to remove it.</p><div className="ea-order-answer" aria-label="Your ordered answer">{selected.length ? selected.map((index,position) => <button key={index} disabled={disabled} type="button" onClick={() => choose(selected.filter((_,at) => at !== position))} aria-label={`Remove ${task.tokens[index]} from position ${position+1}`}>{task.tokens[index]} <X size={12} aria-hidden="true" /></button>) : <span>Your sentence or word will appear here</span>}</div><div className="ea-token-bank" aria-label="Available tiles">{task.tokens.map((token,index) => <button type="button" key={index} disabled={disabled || selected.includes(index)} onClick={() => choose([...selected,index])} aria-label={`Add ${token}`}>{token}</button>)}</div>{!disabled&&<button className="ea-text-button" type="button" disabled={!selected.length} onClick={() => choose([])}><RotateCcw size={14} /> Clear answer</button>}</div>;
}
