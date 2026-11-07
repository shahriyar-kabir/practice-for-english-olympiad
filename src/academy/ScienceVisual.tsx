/** Small self-contained scientific illustrations. No network images, auto-animation or colour-only information. */
const descriptions:Record<string,string>={
 plant:'Plant with roots, stem, two leaves and sunlight',
 molecule:'A group of three connected particles with a water droplet',
 forces:'A toy car moving on a ramp with an arrow showing motion',
 space:'Sun, Earth and Moon with orbital path',
 lab:'Magnifying glass, sample jar and simple bar chart',
 'earth-care':'Planet Earth with a leaf, protected by a circular arrow',
};
export default function ScienceVisual({scene='plant'}:{scene?:string}) {
 const label=descriptions[scene]||descriptions.plant;
 return <figure className="sci-visual"><svg viewBox="0 0 420 190" role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="sci-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#eaf9ff"/><stop offset="1" stopColor="#fff6e6"/></linearGradient></defs>
 <rect x="0" y="0" width="420" height="190" rx="22" fill="url(#sci-sky)"/>
 {scene==='plant'?<>
  <circle cx="340" cy="45" r="24" fill="#ffd25d" stroke="#eabf46" strokeWidth="3"/>
  <path d="M0 147 Q210 125 420 145 V190 H0Z" fill="#bfe9c7"/><path d="M185 152 L178 178 M185 152 L200 181 M185 152 L186 185" stroke="#996547" strokeWidth="5" strokeLinecap="round"/>
  <path d="M185 154 Q183 107 185 65" stroke="#458f62" strokeWidth="8" fill="none" strokeLinecap="round"/>
  <path d="M185 116 Q118 115 132 79 Q166 76 185 116Z" fill="#48b679"/>
  <path d="M185 97 Q250 95 240 63 Q197 62 185 97Z" fill="#62c98f"/>
  <circle cx="185" cy="63" r="12" fill="#ffb554"/><circle cx="185" cy="63" r="6" fill="#d88732"/>
  <path d="M54 59 Q81 32 107 59 Q80 92 54 59Z" fill="#9c8cdb"/><path d="M80 59 Q60 101 44 77 Q54 48 80 59Z" fill="#db9bcf"/><path d="M81 56 L86 76" stroke="#6e5f7f" strokeWidth="3"/>
 </>:scene==='molecule'?<>
  <path d="M154 90 L209 52 L270 100 L210 144Z" fill="none" stroke="#8ca4bc" strokeWidth="11" strokeLinecap="round"/>
  <circle cx="154" cy="90" r="29" fill="#ff908d" stroke="#df6872" strokeWidth="4"/>
  <circle cx="209" cy="52" r="22" fill="#96bbf0" stroke="#759bd6" strokeWidth="4"/>
  <circle cx="270" cy="100" r="25" fill="#96bbf0" stroke="#759bd6" strokeWidth="4"/>
  <circle cx="210" cy="144" r="18" fill="#86d2be" stroke="#5ead9c" strokeWidth="4"/>
  <path d="M70 118 Q45 94 64 73 Q84 96 70 118Z" fill="#73cdea"/>
  <path d="M348 121 Q322 94 344 71 Q368 95 348 121Z" fill="#73cdea"/>
 </>:scene==='forces'?<>
  <path d="M57 160 L356 160 L295 78Z" fill="#d9c4a8" stroke="#a99b8d" strokeWidth="4"/>
  <path d="M120 142 L221 107" stroke="#638bc1" strokeWidth="8" strokeLinecap="round"/>
  <path d="M167 115 L214 101 L228 119 L156 138Z" fill="#f8b85d" stroke="#d28e43" strokeWidth="3"/>
  <circle cx="168" cy="141" r="13" fill="#354d69"/><circle cx="219" cy="125" r="12" fill="#354d69"/>
  <path d="M230 94 L300 70 M282 61 L300 70 L290 87" stroke="#4aa88a" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
 </>:scene==='space'?<>
  <circle cx="71" cy="70" r="35" fill="#ffc764" stroke="#e7a94e" strokeWidth="5"/>
  <ellipse cx="245" cy="101" rx="122" ry="61" fill="none" stroke="#a1b9d7" strokeWidth="3" strokeDasharray="8 7"/>
  <circle cx="244" cy="99" r="40" fill="#6bbef0" stroke="#3f96cb" strokeWidth="3"/>
  <path d="M220 73 Q250 65 250 90 L275 90 Q268 114 244 132 Q210 118 212 100Z" fill="#6eca96"/>
  <circle cx="339" cy="117" r="15" fill="#d6dfe6" stroke="#9faeb9" strokeWidth="3"/>
  <circle cx="335" cy="115" r="4" fill="#afbcc6"/>
 </>:scene==='lab'?<>
  <path d="M88 42 L129 42 L129 106 Q159 145 115 154 Q64 156 89 105Z" fill="#fff" stroke="#557fa6" strokeWidth="5"/>
  <path d="M81 117 Q108 125 140 115 Q145 139 114 143 Q91 141 81 117Z" fill="#81d7cb"/>
  <circle cx="108" cy="108" r="6" fill="#6eb4a5"/>
  <rect x="185" y="63" width="145" height="91" rx="8" fill="#fff" stroke="#84a8c8" strokeWidth="4"/>
  <path d="M209 132 V102 M246 132 V86 M285 132 V75" stroke="#638bd8" strokeWidth="18" strokeLinecap="square"/>
  <path d="M199 143 H310" stroke="#3c607d" strokeWidth="4"/>
  <path d="M90 43 L129 43" stroke="#52799a" strokeWidth="6"/>
 </>:<>
  <circle cx="212" cy="97" r="63" fill="#78c2ef" stroke="#4e9ccf" strokeWidth="5"/>
  <path d="M179 47 Q194 57 190 82 L217 80 L229 101 Q211 128 188 128 Q156 100 162 76Z" fill="#79d1a5"/>
  <path d="M247 75 Q282 86 271 109 L234 117 Q230 92 247 75Z" fill="#71cfa0"/>
  <path d="M124 62 Q159 6 242 16 Q317 30 310 89" fill="none" stroke="#ffc46b" strokeWidth="9" strokeLinecap="round"/>
  <path d="M297 74 L309 91 L324 76" fill="none" stroke="#ffc46b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M246 138 Q237 103 261 91 Q286 116 246 138Z" fill="#4aa66a"/>
 </>}
 </svg><figcaption>{label}</figcaption></figure>;
}