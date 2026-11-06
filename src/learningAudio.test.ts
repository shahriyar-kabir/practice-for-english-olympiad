import {describe,it,expect} from 'vitest';
import {voiceFor,spokenQuestion} from './learningAudio';
const voice=(name:string,lang:string)=>({name,lang,voiceURI:name,default:false,localService:true}) as SpeechSynthesisVoice;
describe('Question narration policy',()=>{
 it('prefers Martha en-GB and honours a saved alternative',()=>{const voices=[voice('English US','en-US'),voice('Martha','en-GB'),voice('Daniel','en-GB')];expect(voiceFor(voices)?.name).toBe('Martha');expect(voiceFor(voices,'Daniel')?.name).toBe('Daniel');});
 it('falls back to British English, then English when Martha is unavailable',()=>{expect(voiceFor([voice('French','fr-FR'),voice('British','en-GB')])?.name).toBe('British');expect(voiceFor([voice('French','fr-FR'),voice('English','en-US')])?.name).toBe('English');expect(voiceFor([])).toBeUndefined();});
 it('reads mathematical operators aloud without exposing URLs',()=>{expect(spokenQuestion('6 × 2 + 3 = _')).toBe('6 times 2 plus 3 equals blank');expect(spokenQuestion('25% and 1/2 https://example.com')).toBe('25 percent and 1 divided by 2');});
});
