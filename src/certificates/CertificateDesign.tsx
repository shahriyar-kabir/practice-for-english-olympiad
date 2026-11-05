import { certificateDesign, CERTIFICATE_HEIGHT, CERTIFICATE_WIDTH } from './design';
import type { CertificateDesignData } from './design';
import { useId } from 'react';

export default function CertificateDesign({ data }: { data: CertificateDesignData }) {
  const prefix = useId();
  return <svg className="wc-certificate" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${CERTIFICATE_WIDTH} ${CERTIFICATE_HEIGHT}`} role="img" aria-label={`${data.preview ? 'Sample ' : ''}${data.level} ${data.subject} certificate for ${data.fullName}`}>
    {certificateDesign(data).map((shape, index) => {
      if (shape.type === 'rect') return <rect key={index} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.radius} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.width} />;
      if (shape.type === 'circle') return <circle key={index} cx={shape.x} cy={shape.y} r={shape.r} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.width} />;
      if (shape.type === 'polygon') return <polygon key={index} points={shape.points.map(point => point.join(',')).join(' ')} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.width} />;
      if (shape.type === 'arcText') {
        const id = `${prefix}-arc-${index}`;
        const path = `M ${shape.x - shape.r} ${shape.y} A ${shape.r} ${shape.r} 0 0 ${shape.side === 'top' ? 1 : 0} ${shape.x + shape.r} ${shape.y}`;
        return <g key={index}><defs><path id={id} d={path} /></defs><text fill={shape.color} fontSize={shape.size} fontWeight={shape.weight} fontFamily="Nunito, sans-serif" letterSpacing={shape.spacing} textAnchor="middle"><textPath href={`#${id}`} startOffset="50%" method="align" spacing="exact">{shape.text}</textPath></text></g>;
      }
      if (shape.type === 'line') return <line key={index} x1={shape.x} y1={shape.y} x2={shape.x2} y2={shape.y2} stroke={shape.color} strokeWidth={shape.width} />;
      return <text key={index} x={shape.x} y={shape.y} fill={shape.color} fontSize={shape.size} fontWeight={shape.weight} fontFamily={shape.serif ? 'Fraunces, Georgia, serif' : 'Nunito, sans-serif'} textAnchor={shape.align === 'left' ? 'start' : shape.align === 'right' ? 'end' : 'middle'}>{shape.text}</text>;
    })}
    <image href={`${import.meta.env.BASE_URL}wizpiko-wordmark.webp`} x="442" y="82" width="240" height="80" />
  </svg>;
}
