import { scienceFacts, scienceSkills, scienceSkillLabels } from '../supabase/functions/_shared/curriculum/science.ts';
import type { AcademyLevel } from '../supabase/functions/_shared/curriculum/tasks.ts';
import { compareGameLevels, gameLevel, SUBJECT_ROUND_SIZE } from './subjectGameProgress';
import type { SubjectGameQuestion } from './subjectGameProgress';
const bands=[
 {through:'10',name:'Little Explorers',stage:'starter',description:'Living things, everyday objects and Earth.'},
 {through:'30',name:'Curious Investigators',stage:'beginner',description:'Ecosystems, energy, weather and fair tests.'},
 {through:'60',name:'Science Connectors',stage:'intermediate',description:'Cells, reactions, waves and evidence.'},
 {through:null,name:'Big Ideas',stage:'advanced',description:'Scientific models, change and research.'},
] as const;
export function scienceBand(level:string){return bands.find(item=>item.through===null||compareGameLevels(level,item.through)<=0)!;}
function random(seed:string){let n=2166136261;for(const c of seed){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function shuffle<T>(items:readonly T[],rng:()=>number):T[]{const array=[...items];for(let i=array.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[array[i],array[j]]=[array[j],array[i]];}return array;}
export function makeScienceRound(rawLevel:string,seed:string):SubjectGameQuestion[]{
 const level=gameLevel(rawLevel), band=scienceBand(level),rng=random(level+':'+seed+':science-v1');
 const stage=band.stage as AcademyLevel,topics=shuffle(scienceSkills,rng),questions:SubjectGameQuestion[]=[];
 for(let i=0;i<SUBJECT_ROUND_SIZE;i++){
  const skill=topics[i],facts=scienceFacts(stage,skill);
  const fact=facts[Math.floor(rng()*facts.length)];
  const options=shuffle([fact.answer,...shuffle(facts.filter(item=>item.answer!==fact.answer).map(item=>item.answer),rng).slice(0,3)],rng);
  if(options.length!==4||new Set(options).size!==4)throw new Error('Science round choices are not distinct.');
  const topic=scienceSkillLabels[skill];
  const hint=({living:'Think about how organisms grow, work and interact.',matter:'Focus on a material’s particles, composition or changes.',forces:'Think about forces, motion, waves and energy.',earth:'Consider Earth systems, seasons and space observations.',inquiry:'Ask what was measured and what evidence supports the claim.',everyday:'Connect the explanation to safe everyday science.'} as const)[skill];
  questions.push({id:'science-'+i+'-'+skill,prompt:fact.question,choices:options,answer:fact.answer,explanation:fact.explanation,topic,hint});
 }
 return questions;
}