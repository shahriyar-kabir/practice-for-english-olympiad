import { useState } from 'react';
import { Download, Image, Share2 } from 'lucide-react';
import { downloadCertificate } from './download';
import type { Certificate } from './types';
import { certificatePresentation, publicCertificateURL } from './presentation';
import { platformIntegration } from '../platform/integration';

export default function CertificateActions({ certificate }: { certificate: Certificate }) {
  const [pending,setPending]=useState(false),[status,setStatus]=useState('');
  async function download(format:'pdf'|'png'){
    if(pending)return;setPending(true);setStatus('');
    try{await downloadCertificate(certificatePresentation(certificate),format);}catch(error){setStatus(error instanceof Error?error.message:'The download could not be prepared.');}finally{setPending(false);}
  }
  async function share(){
    if(!certificate.public_token)return;
    const url=publicCertificateURL(certificate.public_token);
    try{const native=platformIntegration();if(native)await native.shareURL(url,`My Wizpiko ${certificate.subject} certificate`,'A little learning. A lasting achievement.');else if(navigator.share)await navigator.share({title:`My Wizpiko ${certificate.subject} certificate`,text:'A little learning. A lasting achievement.',url});else{await navigator.clipboard.writeText(url);setStatus('Certificate link copied.');}}catch(error){if(!(error instanceof Error&&error.name==='AbortError'))setStatus('Use Copy link or one of the sharing buttons below.');}
  }
  return <><div className="wc-actions"><button type="button" className="wc-primary" disabled={pending} onClick={()=>{void download('pdf');}}><Download size={17}/>{pending?'Preparing download…':'Download PDF'}</button><button type="button" className="wc-secondary" disabled={pending} onClick={()=>{void download('png');}}><Image size={17}/>Download image</button>{certificate.public_token&&<button type="button" className="wc-secondary" onClick={()=>{void share();}}><Share2 size={17}/>Share certificate</button>}</div>{status&&<p className="wc-message" role="status">{status}</p>}</>;
}
