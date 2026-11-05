export type CertificateDesignData = { fullName: string; subject: string; level: string; issuedDate: string; credential: string; verification: string; preview?: boolean };
export type DesignShape =
  { type: 'rect'; x: number; y: number; w: number; h: number; radius: number; fill: string; stroke?: string; width?: number }
  | { type: 'line'; x: number; y: number; x2: number; y2: number; color: string; width: number }
  | { type: 'circle'; x: number; y: number; r: number; fill: string; stroke?: string; width?: number }
  | { type: 'polygon'; points: [number, number][]; fill: string; stroke?: string; width?: number }
  | { type: 'arcText'; x: number; y: number; r: number; text: string; size: number; color: string; side: 'top' | 'bottom'; weight: number; spacing: number }
  | { type: 'text'; x: number; y: number; text: string; size: number; color: string; weight?: number; serif?: boolean; align?: 'left' | 'center' | 'right' };

export const CERTIFICATE_WIDTH = 1123, CERTIFICATE_HEIGHT = 794;
/** The SVG preview and downloadable PDF use the same layout instructions. */
export function certificateDesign(data: CertificateDesignData): DesignShape[] {
  const shapes: DesignShape[] = [];
  const rect = (x: number, y: number, w: number, h: number, radius: number, fill: string, stroke?: string, width = 1) => shapes.push({ type: 'rect', x, y, w, h, radius, fill, stroke, width });
  const line = (x: number, y: number, x2: number, y2: number, color: string, width = 1) => shapes.push({ type: 'line', x, y, x2, y2, color, width });
  const circle = (x: number, y: number, r: number, fill: string, stroke?: string, width = 1) => shapes.push({ type: 'circle', x, y, r, fill, stroke, width });
  const text = (x: number, y: number, value: string, size: number, color: string, weight = 400, serif = false, align: 'left' | 'center' | 'right' = 'center') => shapes.push({ type: 'text', x, y, text: value, size, color, weight, serif, align });
  const navy = '#17335c', muted = '#65738d', gold = '#b28c42';
  rect(0, 0, 1123, 794, 0, '#ffffff');
  rect(19, 19, 1085, 756, 10, '#fcfcff', '#d5ddeb');
  rect(32, 32, 1059, 730, 6, '#ffffff', gold, 1.5);
  rect(43, 43, 1037, 708, 3, '#ffffff', '#e8e0ce');
  for (const [x, y, dx, dy] of [[33,33,1,1],[1090,33,-1,1],[33,761,1,-1],[1090,761,-1,-1]]) {
    line(x,y,x+dx*73,y,navy,3); line(x,y,x,y+dy*73,navy,3);
    circle(x+dx*15,y+dy*15,3,gold);
  }
  circle(562, 179, 3, '#d3ad61');
  line(453,179,542,179,'#d8c398'); line(582,179,671,179,'#d8c398');
  text(562, 232, 'Certificate of Achievement', 43, navy, 500, true);
  text(562, 269, 'A LITTLE LEARNING. A LASTING ACHIEVEMENT.', 12, muted, 800);
  text(562, 318, 'THIS CERTIFICATE IS PRESENTED TO', 12, muted, 700);
  const nameCharacters = Array.from(data.fullName.trim());
  let nameLines = [data.fullName];
  if (nameCharacters.length > 42) {
    const middle = Math.ceil(nameCharacters.length/2);
    const nearbySpaces = nameCharacters.map((character,index)=>character===' '?index:-1).filter(index=>index>=middle-10&&index<=middle+10);
    const split = nearbySpaces.sort((a,b)=>Math.abs(a-middle)-Math.abs(b-middle))[0]??middle;
    nameLines = [nameCharacters.slice(0,split).join('').trim(),nameCharacters.slice(split).join('').trim()];
  }
  const units=(name:string)=>Array.from(name).reduce((sum,c)=>sum+(/[MWmw]/.test(c)?1.1:/[ilI.,' ]/.test(c)?.35:/[A-Z]/.test(c)?.8:/[a-z]/.test(c)?.6:1),0);
  const nameSize = Math.max(13,Math.min(nameLines.length>1?37:48,740/Math.max(...nameLines.map(units))));
  nameLines.forEach((name, index) => text(562, nameLines.length > 1 ? 359 + index * 40 : 374, name, nameSize, navy, 500, true));
  line(246,408,877,408,'#e2d7c0');
  text(562, 444, 'for successfully completing', 16, muted);
  text(562, 488, `${data.level} · ${data.subject}`, 29, '#5350a0', 900);
  text(562, 522, 'the Wizpiko skill practice programme', 16, muted);
  text(562, 555, '20 questions in every skill · At least 80% in each skill', 14, '#526b87', 700);
  const sealX = 923, sealY = 638;
  shapes.push({ type: 'polygon', points: [[884,671],[875,724],[900,711],[915,727],[923,678]], fill: '#213c65', stroke: '#d0ad60', width: 1.5 });
  shapes.push({ type: 'polygon', points: [[923,678],[935,727],[950,711],[974,724],[961,671]], fill: '#213c65', stroke: '#d0ad60', width: 1.5 });
  const rosette: [number, number][] = Array.from({ length: 64 }, (_, index) => {
    const angle = index * Math.PI / 32 - Math.PI / 2, radius = index % 2 ? 61 : 66;
    return [sealX + Math.cos(angle) * radius, sealY + Math.sin(angle) * radius];
  });
  shapes.push({ type: 'polygon', points: rosette, fill: '#dfbd70', stroke: '#ad8536', width: 1.2 });
  circle(sealX, sealY, 56, '#fbf0cd', '#fff8e1', 2);
  circle(sealX, sealY, 50, navy, '#b8913e', 1.2);
  circle(sealX, sealY, 44, '#fffaf0', '#e3c985', 1.5);
  shapes.push({ type: 'arcText', x: sealX, y: sealY, r: 34, text: 'WIZPIKO', size: 9, color: '#987535', side: 'top', weight: 800, spacing: .7 });
  text(sealX, 651, 'W', 33, navy, 900, true);
  shapes.push({ type: 'arcText', x: sealX, y: sealY, r: 38, text: 'ACHIEVEMENT', size: 7.8, color: '#987535', side: 'bottom', weight: 800, spacing: 1.15 });
  for (const dx of [-33, 33]) text(sealX + dx, 645, '★', 8, '#bd9746', 900);
  line(909,659,937,659,'#d4b466');
  text(150, 632, data.issuedDate, 14, navy, 800, false, 'left');
  line(150,647,382,647,'#dbe1eb');
  text(150, 670, 'DATE OF ISSUE', 10, muted, 800, false, 'left');
  text(562, 711, data.credential, 10, '#76839a');
  text(562, 730, data.verification, 9, '#76839a');
  if (data.preview) {
    rect(849, 64, 191, 30, 15, '#f1f3fc', '#e1e6f5');
    text(944, 84, 'DESIGN PREVIEW', 10, '#737e9c', 900);
  }
  return shapes;
}
