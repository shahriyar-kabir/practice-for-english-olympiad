import {certificateBackground,certificateDesign,CERTIFICATE_HEIGHT,CERTIFICATE_WIDTH} from './design';
import type {CertificateDesignData} from './design';
export default function CertificateDesign({data}:{data:CertificateDesignData}){
 return <svg className="wc-certificate" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${CERTIFICATE_WIDTH} ${CERTIFICATE_HEIGHT}`} role="img" aria-label={`${data.preview?'Sample ':''}${data.level} ${data.subject} certificate for ${data.fullName}`}><image href={certificateBackground()} x="0" y="0" width={CERTIFICATE_WIDTH} height={CERTIFICATE_HEIGHT}/>{certificateDesign(data).map((s,i)=><text key={i} x={s.x} y={s.y} fill={s.color} fontSize={s.size} fontWeight={s.weight} fontFamily={`"${s.font}", Georgia, serif`} textAnchor="middle">{s.text}</text>)}</svg>;
}
