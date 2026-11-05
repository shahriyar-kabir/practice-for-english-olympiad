import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, Lock } from 'lucide-react';
import { verifyPublicCertificate } from './api';
import type { Certificate } from './types';
import CertificateDesign from './CertificateDesign';
import CertificateActions from './CertificateActions';
import { certificatePresentation } from './presentation';
import './certificates.css';

export default function PublicCertificatePage({token,onHome}:{token:string;onHome:()=>void}){
  const [certificate,setCertificate]=useState<Certificate|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{let cancelled=false;setCertificate(null);setError('');verifyPublicCertificate(token).then(value=>{if(!cancelled)setCertificate(value);}).catch(cause=>{if(!cancelled)setError(cause instanceof Error?cause.message:'This certificate could not be verified.');});return()=>{cancelled=true;};},[token,retry]);
  useEffect(()=>{if(!certificate)return;const title=document.title;document.title=`${certificate.full_name} · Wizpiko ${certificate.level} certificate`;return()=>{document.title=title;};},[certificate]);
  return <article className="wc-public-page"><button className="wc-back" type="button" onClick={onHome}><ArrowLeft size={17}/>Wizpiko home</button>{certificate?<><header className="wc-public-heading"><span><BadgeCheck size={21}/>Verified Wizpiko achievement</span><h1>A little learning. A lasting achievement.</h1><p>{certificate.full_name} completed the {certificatePresentation(certificate).level} {certificatePresentation(certificate).subject} skill practice programme.</p></header><CertificateDesign data={certificatePresentation(certificate)}/><CertificateActions certificate={certificate}/><p className="wc-public-note">This certificate was made public by its owner. It records completion of {certificate.question_count} practice questions across {certificate.skill_count} skills, with at least {certificate.pass_mark}% in each skill.</p></>:<section className="wc-unavailable" role={error?'alert':'status'}>{error?<><Lock size={34}/><h1>Certificate unavailable</h1><p>{error}</p><button type="button" className="wc-secondary" onClick={()=>setRetry(value=>value+1)}>Try again</button></>:<><BadgeCheck size={34}/><h1>Checking this certificate…</h1></>}</section>}</article>;
}
