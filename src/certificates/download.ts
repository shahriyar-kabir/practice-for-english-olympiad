import { certificateDesign, CERTIFICATE_HEIGHT, CERTIFICATE_WIDTH } from './design';
import type { CertificateDesignData } from './design';

export function jpegToCertificatePDF(jpeg: Uint8Array, width: number, height: number): Uint8Array {
  const encode = (value: string) => new TextEncoder().encode(value);
  const chunks: Uint8Array[] = [], offsets = [0];
  let length = 0;
  const push = (bytes: Uint8Array) => { chunks.push(bytes); length += bytes.byteLength; };
  const object = (id: number, parts: (string | Uint8Array)[]) => {
    offsets[id] = length; push(encode(`${id} 0 obj\n`));
    parts.forEach(part => push(typeof part === 'string' ? encode(part) : part));
    push(encode('\nendobj\n'));
  };
  push(encode('%PDF-1.4\n%Wizpiko\n'));
  object(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
  object(2, ['<< /Type /Pages /Kids [3 0 R] /Count 1 >>']);
  object(3, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Certificate 4 0 R >> >> /Contents 5 0 R >>']);
  object(4, [`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, '\nendstream']);
  const commands = 'q\n841.89 0 0 595.28 0 0 cm\n/Certificate Do\nQ\n';
  object(5, [`<< /Length ${encode(commands).length} >>\nstream\n${commands}endstream`]);
  const xref = length;
  push(encode('xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(offset => `${String(offset).padStart(10,'0')} 00000 n \n`).join('')));
  push(encode(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
  const result = new Uint8Array(length);
  let position = 0; for (const chunk of chunks) { result.set(chunk, position); position += chunk.length; }
  return result;
}

async function certificateCanvas(data: CertificateDesignData): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const canvas = document.createElement('canvas'), scale = 2;
  canvas.width = CERTIFICATE_WIDTH * scale; canvas.height = CERTIFICATE_HEIGHT * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not prepare the download. Please try another browser.');
  ctx.scale(scale, scale);
  for (const shape of certificateDesign(data)) {
    if (shape.type === 'text') {
      ctx.fillStyle = shape.color; ctx.font = `${shape.weight || 400} ${shape.size}px ${shape.serif ? 'Fraunces, Georgia, serif' : 'Nunito, sans-serif'}`;
      ctx.textAlign = shape.align || 'center'; ctx.fillText(shape.text, shape.x, shape.y);
    } else if (shape.type === 'arcText') {
      ctx.save(); ctx.fillStyle = shape.color; ctx.font = `${shape.weight} ${shape.size}px Nunito, sans-serif`; ctx.textAlign = 'center';
      const letters = Array.from(shape.text), widths = letters.map(letter => ctx.measureText(letter).width + shape.spacing);
      const total = widths.reduce((sum, width) => sum + width, 0); let used = 0;
      letters.forEach((letter, index) => {
        const distance = used + widths[index] / 2 - total / 2;
        const angle = shape.side === 'top' ? -Math.PI / 2 + distance / shape.r : Math.PI / 2 - distance / shape.r;
        ctx.save(); ctx.translate(shape.x + Math.cos(angle) * shape.r, shape.y + Math.sin(angle) * shape.r);
        ctx.rotate(shape.side === 'top' ? angle + Math.PI / 2 : angle - Math.PI / 2); ctx.fillText(letter, 0, 0); ctx.restore();
        used += widths[index];
      });
      ctx.restore();
    } else {
      ctx.beginPath();
      if (shape.type === 'line') { ctx.moveTo(shape.x,shape.y); ctx.lineTo(shape.x2,shape.y2); ctx.strokeStyle = shape.color; ctx.lineWidth = shape.width; ctx.stroke(); continue; }
      if (shape.type === 'rect') ctx.roundRect(shape.x,shape.y,shape.w,shape.h,shape.radius);
      else if (shape.type === 'circle') ctx.arc(shape.x,shape.y,shape.r,0,Math.PI*2);
      else { shape.points.forEach(([x,y], index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); }
      ctx.fillStyle = shape.fill; ctx.fill();
      if (shape.stroke) { ctx.strokeStyle = shape.stroke; ctx.lineWidth = shape.width || 1; ctx.stroke(); }
    }
  }
  const logo = new Image(); logo.src = `${import.meta.env.BASE_URL}wizpiko-wordmark.webp`;
  await logo.decode(); ctx.drawImage(logo, 442, 82, 240, 80);
  return canvas;
}
export async function certificateBlob(data: CertificateDesignData, format: 'pdf' | 'png' = 'pdf'): Promise<Blob> {
  const canvas = await certificateCanvas(data);
  if (format === 'png') return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The image download could not be prepared.')), 'image/png'));
  const encoded = canvas.toDataURL('image/jpeg', .95).split(',')[1];
  const jpeg = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
  return new Blob([jpegToCertificatePDF(jpeg, canvas.width, canvas.height)], { type: 'application/pdf' });
}
export async function downloadCertificate(data: CertificateDesignData, format: 'pdf' | 'png' = 'pdf') {
  const blob = await certificateBlob(data, format);
  const filename = `Wizpiko-${data.subject}-${data.level}-certificate.${format}`.replace(/[^a-zA-Z0-9.\-]/g, '-');
  const native = (await import('../platform/integration')).platformIntegration();
  if (native) { await native.saveFile(blob, filename); return; }
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
