export type CertificateDesignData={fullName:string;subject:string;level:string;issuedDate:string;credential:string;verification:string;achievement?:number|null;preview?:boolean};
export type DesignShape={type:'text';x:number;y:number;text:string;size:number;color:string;weight:number;font:string};
export const CERTIFICATE_WIDTH=1123,CERTIFICATE_HEIGHT=794;
export const certificateBackground=()=>`${import.meta.env.BASE_URL}certificates/achievement-background.webp`;
export function certificateDesign(data:CertificateDesignData):DesignShape[]{
 const shapes:DesignShape[]=[];
 const text=(x:number,y:number,value:string,size:number,color='#000000',weight=400,font='Wizpiko Certificate Sans')=>shapes.push({type:'text',x:x*4/3,y:y*4/3,text:value,size:size*4/3,color,weight,font});
 const name=data.fullName.trim(),characters=Array.from(name);let lines=[name];
 if(characters.length>34){const mid=Math.ceil(characters.length/2),spaces=characters.map((v,i)=>v===' '?i:-1).filter(i=>i>mid-12&&i<mid+12);const split=spaces.sort((a,b)=>Math.abs(a-mid)-Math.abs(b-mid))[0]??mid;lines=[characters.slice(0,split).join('').trim(),characters.slice(split).join('').trim()];}
 const widthUnits=(value:string)=>Array.from(value).reduce((sum,c)=>sum+(/[MW]/.test(c)?.95:/[ilI.,' ]/.test(c)?.24:/[A-Z]/.test(c)?.8:/[a-z]/.test(c)?.5:1),0);
 const size=Math.min(lines.length===1?50.94:29,370/Math.max(1,...lines.map(widthUnits)));
 lines.forEach((line,i)=>text(561.24,lines.length===1?307.217:292+i*23,line,size,'#c39348',400,'Wizpiko Alex Brush'));
 const course=`${data.level} - ${data.subject}`;text(559.38,385.658,course,Math.min(24,365/(course.length*.62)),'#ef6e2d',700);
 text(559.58,443.61,typeof data.achievement==='number'&&Number.isFinite(data.achievement)?`Achieved ${Number(data.achievement.toFixed(2))}%`:data.preview?'Achievement calculated from verified results':'Achievement confirmed',14.99);
 text(558.05,480.865,data.issuedDate,14.99);
 text(558.445,551.54,data.credential,Math.min(12,370/(data.credential.length*.6)),'#2e5cd3');
 return shapes;
}
