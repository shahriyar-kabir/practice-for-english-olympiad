import { describe,expect,it } from 'vitest';
import { jpegToCertificatePDF } from './download';
import { certificateDesign } from './design';
describe('Downloadable certificate document',()=>{
  it('writes byte-accurate PDF cross references around binary image bytes',()=>{
    const jpeg=Uint8Array.from([255,216,0,128,254,255,217]);const pdf=jpegToCertificatePDF(jpeg,2246,1588),text=new TextDecoder('latin1').decode(pdf);
    expect(text.startsWith('%PDF-1.4')).toBe(true);expect(text).toContain('/MediaBox [0 0 841.89 595.28]');expect(text).toContain('/Width 2246 /Height 1588');
    const xref=Number(text.match(/startxref\n(\d+)/)![1]);expect(text.slice(xref,xref+4)).toBe('xref');
    const entries=text.slice(xref).split('\n').slice(3,8);for(let index=0;index<5;index++){const offset=Number(entries[index].slice(0,10));expect(text.slice(offset,offset+7)).toBe(`${index+1} 0 obj`);}
  });
  it('includes the verified percentage and uses Alex Brush in the approved layout',()=>{
    const shapes=certificateDesign({fullName:'Alex Morgan',subject:'Mathematics',level:'Beginner',issuedDate:'6 November 2026',credential:'WZ-MAT-BEG-2026-AB12CD34',verification:'Private',achievement:95});
    expect(shapes.some(s=>s.text==='Achieved 95%')).toBe(true);
    expect(shapes.find(s=>s.text==='Alex Morgan')?.font).toBe('Wizpiko Alex Brush');
    expect(shapes.some(s=>s.text==='Beginner - Mathematics')).toBe(true);
    const legacy=certificateDesign({fullName:'Alex',subject:'English',level:'Starter',issuedDate:'6 November 2026',credential:'Original ID',verification:'Private'});
    expect(legacy.some(s=>s.text.includes('%'))).toBe(false);
    expect(legacy.some(s=>s.text==='Achievement confirmed')).toBe(true);
  });
});
