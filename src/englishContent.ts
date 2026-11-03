/** Curated age-banded vocabulary for age-appropriate, deterministic practice. */
export const categories = [
  { id: 'beginners', name: 'Beginners', range: 'Ages 3–5', color: '#ff875d', minutes: 60 },
  { id: 'kids', name: 'Kids', range: 'Ages 6–8', color: '#f2b500', minutes: 60 },
  { id: 'small-starts', name: 'Small Starts', range: 'Grades 3–5', color: '#42b77d', minutes: 50 },
  { id: 'juniors', name: 'Juniors', range: 'Grades 6–8', color: '#1eb3ab', minutes: 40 },
  { id: 'high-flyers', name: 'High Flyers', range: 'Grades 9–10', color: '#4d7dec', minutes: 40 },
  { id: 'trailblazers', name: 'Trailblazers', range: 'Grades 11–12', color: '#9450d7', minutes: 40 },
  { id: 'seniors', name: 'Seniors', range: 'Undergraduate+', color: '#e24f81', minutes: 40 },
] as const;
export type CategoryId = (typeof categories)[number]['id'];
export type WordClue = { word: string; clue: string };
function parse(lines: string): WordClue[] {
  return lines.trim().split('\n').map(line => {
    const [word, clue] = line.split('|');
    return { word: word.trim().toUpperCase(), clue: clue.trim() };
  });
}
const RAW: Record<CategoryId, string> = {
  "beginners": "CAT|A small pet that says meow.\nDOG|A friendly pet that barks.\nSUN|The bright star in our sky.\nMOON|You can see it in the night sky.\nBOOK|Something you read with pages.\nBALL|A round toy you can throw.\nTREE|A tall plant with a trunk.\nFISH|An animal that swims in water.\nBIRD|An animal with feathers and wings.\nMILK|A white drink that comes from cows.\nAPPLE|A round fruit that may be red or green.\nRAIN|Water that falls from clouds.\nSTAR|A tiny-looking light in the night sky.\nHAND|The part of your body with five fingers.\nFOOT|You wear a shoe on this.\nCAKE|A sweet food for birthdays.\nHOUSE|A place where people live.\nCHAIR|Something you sit on.\nWATER|A drink that helps us stay healthy.\nHAPPY|How you feel when something makes you smile.\nGREEN|The colour of grass.\nBLUE|The colour of a clear daytime sky.\nRED|The colour of a ripe tomato.\nDUCK|A bird that quacks.\nLION|A big wild cat with a mane.\nBEAR|A large furry animal.\nCLOUD|A white or grey shape in the sky.\nJUMP|To push yourself up off the ground.\nSMILE|What you do when you are happy.\nSLEEP|To rest with your eyes closed.",
  "kids": "PLANET|A large round body that travels around a star.\nRIVER|A natural stream of flowing water.\nFOREST|A large area covered with trees.\nISLAND|Land surrounded by water.\nPENCIL|A tool for writing that can be sharpened.\nLIBRARY|A place where you can borrow books.\nJOURNEY|A trip from one place to another.\nINSECT|A small animal with six legs.\nOCEAN|A huge body of salt water.\nBRIDGE|A structure built over a river or road.\nSHADOW|A dark shape made when light is blocked.\nWHISPER|To speak very softly.\nDISCOVER|To find something you did not know before.\nVILLAGE|A small community of houses.\nSEASON|One of the parts of the year such as winter.\nFARMER|A person who grows crops or raises animals.\nBUTTON|A small fastener on clothing.\nGARDEN|A place where plants and flowers grow.\nHONEST|Telling the truth.\nBRAVE|Showing courage when something is scary.\nGENTLE|Kind and not rough.\nCURIOUS|Wanting to learn more.\nSUDDEN|Happening without warning.\nFRIEND|Someone you like and trust.\nPUZZLE|A game that makes you think.\nTHUNDER|A loud sound heard during a storm.\nRAINBOW|Coloured bands sometimes seen after rain.\nMIRROR|A shiny surface that shows your reflection.\nNEIGHBOR|A person who lives nearby.\nHABIT|Something you do regularly.",
  "small-starts": "ANALYZE|To examine something carefully.\nPREDICT|To say what you think will happen.\nCONCLUDE|To reach a decision after thinking.\nEVIDENCE|Facts that support an idea.\nCONTRAST|To show how two things are different.\nCOMPARE|To identify similarities and differences.\nPARAGRAPH|A group of sentences about one idea.\nSYNONYM|A word with a similar meaning.\nANTONYM|A word with the opposite meaning.\nMETAPHOR|A comparison that does not use like or as.\nSIMILE|A comparison using like or as.\nPREFIX|Letters added to the start of a word.\nSUFFIX|Letters added to the end of a word.\nNARRATOR|The voice telling a story.\nSETTING|The place and time of a story.\nTHEME|The central idea in a story.\nCONFLICT|A problem or struggle in a story.\nRESOLVE|To find a solution to a problem.\nEXPLORE|To investigate something new.\nDESCRIBE|To tell what something is like.\nPERSUADE|To try to make someone agree.\nINFER|To reach an idea using clues and evidence.\nSUMMARIZE|To state the main points briefly.\nSEQUENCE|The order in which events happen.\nACCURATE|Correct and free from errors.\nSPECIFIC|Clear and exact rather than general.\nIMAGERY|Language that creates pictures in the mind.\nDIALOGUE|Words spoken by characters in a story.\nOPINION|A personal belief or viewpoint.\nFACT|A statement that can be checked.",
  "juniors": "AMBIGUOUS|Able to have more than one meaning.\nALLUSION|An indirect reference to a known work or event.\nIRONY|A contrast between expectation and reality.\nALLEGORY|A story with an underlying symbolic meaning.\nHYPERBOLE|A deliberate exaggeration for effect.\nFORESHADOW|To hint at something that happens later.\nCONNOTATION|A feeling or idea associated with a word.\nDENOTATION|The literal or dictionary meaning.\nTONE|The writer's attitude toward a subject.\nMOOD|The feeling created for a reader.\nCLAUSE|A group of words with a subject and verb.\nMODIFIER|A word or phrase that adds description.\nCOHERENCE|Clear and logical connection of ideas.\nTHESIS|The central claim of an argument or essay.\nEVALUATE|To judge using evidence or criteria.\nIMPLICIT|Suggested without being directly stated.\nEXPLICIT|Clearly and directly expressed.\nNUANCE|A subtle difference in meaning.\nBIASED|Unfairly favouring one side.\nREBUTTAL|A response to an opposing argument.\nPARADOX|A seemingly contradictory statement that may be true.\nSATIRE|Writing that uses humour to criticize.\nEMPHASIS|Special importance given to something.\nMOTIF|A recurring image or idea in a work.\nANALOGY|A comparison that helps explain an idea.\nSUSPENSE|Uncertainty that makes readers eager to know more.\nSTRUCTURE|The way parts of a text are arranged.\nRHETORIC|The art of effective persuasion.\nCONTEXT|The circumstances surrounding a statement.\nOBJECTIVE|Not influenced by personal feelings.",
  "high-flyers": "JUXTAPOSE|To place side by side for comparison.\nDICHOTOMY|A division into two contrasting parts.\nSUBTEXT|An underlying meaning not directly stated.\nPERSPECTIVE|A particular way of viewing something.\nINTERTEXT|Connections between separate written works.\nASSUMPTION|An idea accepted without proof.\nPREMISE|A proposition supporting a conclusion.\nARGUMENT|A reasoned claim backed by evidence.\nCOUNTERCLAIM|A position opposing another claim.\nCREDIBILITY|The quality of being trustworthy.\nSYNTHESIS|Combining ideas into a new whole.\nINFERENCE|A conclusion drawn from evidence.\nEMPATHY|Understanding another person's feelings.\nIDEOLOGY|A system of ideas or beliefs.\nARCHETYPE|A recurring character pattern or model.\nSOLILOQUY|A speech revealing a character's thoughts alone.\nMONOLOGUE|A long speech by one person.\nPROTAGONIST|The central character in a narrative.\nANTAGONIST|A character or force opposing the protagonist.\nCATHARSIS|An emotional release experienced through drama.\nPARODY|An imitation that uses humour to comment.\nPATHOS|An appeal that aims to stir emotion.\nETHOS|An appeal based on credibility or character.\nLOGOS|An appeal that relies on logic or reasons.\nDICTION|A writer's choice of words.\nSYNTAX|The arrangement of words in sentences.\nAMBIVALENT|Having mixed or conflicting feelings.\nOBSCURE|Not easily understood or little known.\nCOHESION|The linking of parts into a unified whole.\nINTEGRITY|Honesty and strong moral principles.",
  "trailblazers": "EPISTEMIC|Relating to knowledge or its justification.\nHEGEMONY|Dominance exercised by a group or state.\nDIALECTIC|Reasoning through opposing ideas.\nHERMENEUTIC|Relating to the interpretation of texts.\nPARADIGM|A typical model or framework.\nINTERROGATE|To question or examine critically.\nDECONSTRUCT|To analyze hidden assumptions in a text.\nINTERPRET|To explain the meaning of something.\nNARRATIVE|An account of connected events.\nDISCOURSE|Written or spoken communication in context.\nSUBVERSIVE|Seeking to undermine an established system.\nAMBIGUITY|The possibility of multiple meanings.\nINTERPLAY|The way two things affect each other.\nCONTRADICTION|An inconsistency between claims.\nHYPOTHESIS|A proposed explanation to be tested.\nTREATISE|A formal written work about a subject.\nCRITIQUE|A detailed evaluation or analysis.\nPOLEMIC|A forceful written or spoken argument.\nEMPIRICAL|Based on observation or experience.\nNORMATIVE|Relating to what ought to be.\nCAUSALITY|The relationship between cause and effect.\nFALLACY|A flaw in reasoning.\nPRECEDENT|An earlier case guiding later decisions.\nSPECTRUM|A range between two extremes.\nLIMINAL|At a boundary or transitional stage.\nRHETORICAL|Concerned with effective communication.\nANTITHESIS|A direct contrast between ideas.\nMETONYMY|Using an associated word to represent something.\nSYNECDOCHE|Using a part to stand for the whole.\nIMPLICATION|A possible result or unstated meaning.",
  "seniors": "ONTOLOGY|The philosophical study of being and existence.\nEPISTEMOLOGY|The philosophical study of knowledge.\nMETHODOLOGY|A systematic approach to investigation.\nHISTORIOGRAPHY|The study of how history is written.\nINTERLOCUTOR|A participant in a discussion.\nINTERLOCUTION|An exchange in a conversation.\nPHENOMENOLOGY|The study of lived conscious experience.\nPOSTCOLONIAL|Relating to the effects of colonial rule.\nINTERDISCIPLINARY|Combining multiple fields of study.\nDETERMINISM|The view that events are caused by prior conditions.\nPRAGMATISM|A philosophy emphasizing practical consequences.\nPOSITIVISM|A view privileging observable evidence.\nEMPIRICISM|The view that experience is a source of knowledge.\nDIALECTICS|Analysis through conflicting concepts.\nHEURISTIC|A practical method of discovery.\nTELEOLOGY|Explanation in terms of goals or purposes.\nSEMIOTICS|The study of signs and their meanings.\nPARATEXT|Material surrounding a main written text.\nINTERTEXTUALITY|The relationship among texts.\nSOCIOLINGUISTICS|The study of language in society.\nETHNOGRAPHY|Detailed study of a culture or community.\nVALIDITY|How well evidence supports a conclusion.\nRELIABILITY|Consistency of a method or measurement.\nREFLEXIVITY|Examining one's influence on research.\nTRIANGULATION|Using multiple sources to investigate a claim.\nGENERALIZATION|Applying findings beyond observed cases.\nFALSIFIABLE|Capable of being disproved by evidence.\nCITATION|A reference identifying a source.\nBIBLIOGRAPHY|A list of sources used for research.\nABSTRACT|A concise summary of an academic work."
};
const wordLists: Record<CategoryId, WordClue[]> = Object.fromEntries(
  Object.entries(RAW).map(([id, lines]) => [id, parse(lines)])
) as Record<CategoryId, WordClue[]>;

export function wordsFor(id: CategoryId): WordClue[] { return wordLists[id]; }
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items]; let value = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const j = value % (i + 1); [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export type MCQuestion = { id: string; prompt: string; options: string[]; correct: string; explanation: string };
export function makeQuestions(id: CategoryId, level: number, count = 50): MCQuestion[] {
  const entries = wordLists[id];
  const expanded = seededShuffle(entries.flatMap((entry, index) => [
    { entry, index, type: 0 },
    { entry, index, type: 1 },
  ]), level * 9397 + categories.findIndex(c => c.id === id) * 307 + 71);
  const questions: MCQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const candidate = expanded[i % expanded.length];
    const { entry, index, type } = candidate;
    const distractors = seededShuffle(entries.filter((_, j) => j !== index), level * 101 + i * 17).slice(0, 3);
    const correct = type === 0 ? entry.word : entry.clue;
    const options = seededShuffle([correct, ...distractors.map(d => type === 0 ? d.word : d.clue)], level * 903 + i * 31);
    questions.push({
      id: id + '-' + level + '-' + i,
      prompt: type === 0 ? 'Which word matches this meaning?\n“' + entry.clue + '”' : 'What does “' + entry.word + '” mean?',
      options, correct,
      explanation: entry.word + ': ' + entry.clue,
    });
  }
  return questions;
}
export type PlacedWord = WordClue & { row: number; col: number; direction: 'across' | 'down'; number: number; id: string };
export type GeneratedCrossword = { rows: number; cols: number; entries: PlacedWord[]; bank: string[] };
export function makeCrossword(id: CategoryId, level: number): GeneratedCrossword {
  const source = seededShuffle(wordLists[id], level * 1039 + 337).filter(x => /^[A-Z]+$/.test(x.word) && x.word.length < 17);
  const size = 25;
  const grid = new Map<string, { letter: string; directions: ('across' | 'down')[] }>();
  const placed: Omit<PlacedWord, 'number' | 'id'>[] = [];
  const at = (r: number, c: number) => grid.get(r + ':' + c);
  function canPlace(word: string, row: number, col: number, dir: 'across' | 'down', requireCross: boolean) {
    const dr = dir === 'down' ? 1 : 0, dc = dir === 'across' ? 1 : 0;
    if (row < 1 || col < 1 || row + dr * (word.length - 1) >= size - 1 || col + dc * (word.length - 1) >= size - 1) return -1;
    if (at(row - dr, col - dc) || at(row + dr * word.length, col + dc * word.length)) return -1;
    let crosses = 0;
    for (let k = 0; k < word.length; k++) {
      const r = row + dr * k, c = col + dc * k, cell = at(r, c);
      if (cell) {
        if (cell.letter !== word[k] || cell.directions.includes(dir)) return -1;
        crosses++;
      } else if (dir === 'across' ? at(r - 1, c) || at(r + 1, c) : at(r, c - 1) || at(r, c + 1)) return -1;
    }
    return requireCross && !crosses ? -1 : crosses;
  }
  function add(entry: WordClue, r: number, c: number, dir: 'across' | 'down') {
    placed.push({ ...entry, row: r, col: c, direction: dir });
    for (let i = 0; i < entry.word.length; i++) {
      const rr = r + (dir === 'down' ? i : 0), cc = c + (dir === 'across' ? i : 0);
      const key = rr + ':' + cc, cell = grid.get(key);
      grid.set(key, { letter: entry.word[i], directions: cell ? [...cell.directions, dir] : [dir] });
    }
  }
  const first = source[0];
  add(first, 12, Math.floor((size - first.word.length) / 2), 'across');
  for (const entry of source.slice(1)) {
    if (placed.length >= 7) break;
    const candidates: { r: number; c: number; dir: 'across' | 'down'; score: number }[] = [];
    for (const prior of placed) {
      const dir = prior.direction === 'across' ? 'down' : 'across';
      for (let i = 0; i < entry.word.length; i++) for (let j = 0; j < prior.word.length; j++) {
        if (entry.word[i] !== prior.word[j]) continue;
        const r = prior.row + (prior.direction === 'down' ? j : 0) - (dir === 'down' ? i : 0);
        const c = prior.col + (prior.direction === 'across' ? j : 0) - (dir === 'across' ? i : 0);
        const score = canPlace(entry.word, r, c, dir, true);
        if (score >= 1) candidates.push({ r, c, dir, score });
      }
    }
    candidates.sort((a, b) => b.score - a.score || (Math.abs(a.r - 12) + Math.abs(a.c - 12)) - (Math.abs(b.r - 12) + Math.abs(b.c - 12)));
    if (candidates.length) add(entry, candidates[0].r, candidates[0].c, candidates[0].dir);
  }
  const positions = [...grid.keys()].map(x => x.split(':').map(Number));
  const minR = Math.max(0, Math.min(...positions.map(p => p[0])) - 1), minC = Math.max(0, Math.min(...positions.map(p => p[1])) - 1);
  const maxR = Math.max(...positions.map(p => p[0])) + 1, maxC = Math.max(...positions.map(p => p[1])) + 1;
  const entries = placed.map((p, index) => ({ ...p, row: p.row - minR, col: p.col - minC, number: index + 1, id: level + '-' + index }));
  return { rows: maxR - minR + 1, cols: maxC - minC + 1, entries, bank: seededShuffle(entries.map(e => e.word), level * 456 + 83) };
}
