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
  it('uses curved, evenly spaced seal text and omits the removed issuer block',()=>{
    const shapes=certificateDesign({fullName:'Alex Morgan',subject:'English',level:'Starter',issuedDate:'On completion',credential:'Sample',verification:'Preview',preview:true});
    expect(shapes.filter(shape=>shape.type==='text').some(shape=>shape.type==='text'&&shape.text==='ISSUED BY WIZPIKO')).toBe(false);
    const arcs=shapes.filter(shape=>shape.type==='arcText');expect(arcs).toHaveLength(2);expect(arcs.every(shape=>shape.type==='arcText'&&shape.x>800&&shape.y===638&&shape.spacing>0)).toBe(true);
  });
});
