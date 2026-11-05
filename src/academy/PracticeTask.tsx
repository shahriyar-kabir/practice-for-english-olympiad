import { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { AcademyTask } from './types';

function orderedIndices(task: AcademyTask, answer: string) {
  if (task.type !== 'order') return [];
  const used = new Set<number>();
  return answer.split(' ').map(word => { const index = task.tokens.findIndex((token,index) => token === word && !used.has(index)); if (index >= 0) used.add(index); return index; }).filter(index => index >= 0);
}
export function PracticeTask({ task, answer, onAnswer, disabled }: { task: AcademyTask; answer: string; onAnswer: (value: string) => void; disabled: boolean }) {
  const [selected, setSelected] = useState(() => orderedIndices(task, answer));
  if (task.type === 'choice') return <fieldset className="ea-choices" disabled={disabled}><legend className="ea-sr-only">{task.prompt}</legend>{task.choices.map((value,index) => <label className={`ea-choice ${answer === value ? 'selected' : ''}`} key={value}><input type="radio" name={task.id} value={value} checked={answer === value} onChange={() => onAnswer(value)} /><span className="ea-choice-letter" aria-hidden="true">{String.fromCharCode(65+index)}</span><span>{value}</span></label>)}</fieldset>;
  if (task.type === 'fill') return <div className="ea-answer-label"><label htmlFor={`answer-${task.id}`}>Your answer</label><input id={`answer-${task.id}`} aria-describedby={`answer-help-${task.id}`} className="ea-answer-input" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={400} value={answer} disabled={disabled} placeholder={task.placeholder || 'Type your answer'} onChange={event => onAnswer(event.target.value)} /><small id={`answer-help-${task.id}`}>{task.caseSensitive ? 'Use the correct capital letters.' : 'Take your time. Extra spaces and letter case do not affect this answer.'}</small></div>;
  function choose(next: number[]) { setSelected(next); if (task.type === 'order') onAnswer(next.map(index => task.tokens[index]).join(' ')); }
  return <div className="ea-order"><p className="ea-small">Choose each tile in order. Select a tile in your answer to remove it.</p><div className="ea-order-answer" aria-label="Your ordered answer">{selected.length ? selected.map((index,position) => <button key={index} disabled={disabled} type="button" onClick={() => choose(selected.filter((_,at) => at !== position))} aria-label={`Remove ${task.tokens[index]} from position ${position+1}`}>{task.tokens[index]} <X size={12} aria-hidden="true" /></button>) : <span>Your sentence or word will appear here</span>}</div><div className="ea-token-bank" aria-label="Available tiles">{task.tokens.map((token,index) => <button type="button" key={index} disabled={disabled || selected.includes(index)} onClick={() => choose([...selected,index])} aria-label={`Add ${token}`}>{token}</button>)}</div><button className="ea-text-button" type="button" disabled={disabled || !selected.length} onClick={() => choose([])}><RotateCcw size={14} /> Clear answer</button></div>;
}
