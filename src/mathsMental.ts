import { compareGameLevels, gameLevel, SUBJECT_ROUND_SIZE } from './subjectGameProgress';
import type { SubjectGameQuestion } from './subjectGameProgress';

export type MentalKind = 'add' | 'subtract' | 'multiply' | 'divide' | 'missing' | 'square' | 'order' | 'signed' | 'fraction' | 'percent' | 'decimal' | 'equation' | 'ratio' | 'pattern';
export type MentalQuestion = SubjectGameQuestion & { kind: MentalKind; operands: number[]; value: { n: number; d: number } };
export const mentalBands = [
  { through: '5', name: 'Number sparks', description: 'Number bonds, counting on and taking away.', kinds: ['add','subtract','missing','pattern'] },
  { through: '15', name: 'Everyday numbers', description: 'Bigger sums and friendly times tables.', kinds: ['add','subtract','multiply','divide','missing','pattern'] },
  { through: '30', name: 'Table explorer', description: 'Times tables, exact division and squares.', kinds: ['add','subtract','multiply','divide','square','missing'] },
  { through: '50', name: 'Mental connections', description: 'Two-step calculations, signed numbers and patterns.', kinds: ['multiply','divide','square','order','signed','equation','pattern'] },
  { through: '75', name: 'Fraction finder', description: 'Friendly fractions, percentages and tenths.', kinds: ['fraction','percent','decimal','multiply','divide','equation'] },
  { through: '100', name: 'Number navigator', description: 'Ratios, percentages and useful mental shortcuts.', kinds: ['fraction','percent','decimal','ratio','equation','order','pattern'] },
  { through: null, name: 'Mental mix', description: 'More varied rounds with no final level. Numbers stay manageable.', kinds: ['add','subtract','multiply','divide','square','order','signed','fraction','percent','decimal','equation','ratio','pattern'] },
] as const;
export function mentalBand(level: string) { return mentalBands.find(band => band.through === null || compareGameLevels(level, band.through) <= 0)!; }
function random(seed: string) {
  let n = 2166136261;
  for (const c of seed) { n ^= c.charCodeAt(0); n = Math.imul(n, 16777619); }
  return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
function rational(n: number, d = 1) { const g = gcd(n, d); return { n: n / g, d: d / g }; }
function label(n: number, d: number, decimal: boolean) {
  if (decimal) return (n / d).toFixed(1).replace(/\.0$/, '').replace('-', '−');
  const value = rational(n, d);
  return (value.d === 1 ? String(value.n) : `${value.n}/${value.d}`).replace('-', '−');
}
export function makeMentalRound(rawLevel: string, seed: string): MentalQuestion[] {
  const level = gameLevel(rawLevel), band = mentalBand(level), rng = random(`${level}:${seed}:mental-v1`);
  const int = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1));
  const pick = <T,>(items: readonly T[]): T => items[int(0, items.length - 1)];
  const shuffle = <T,>(items: readonly T[]): T[] => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = int(0, i); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  };
  const early = compareGameLevels(level, '5') <= 0, small = compareGameLevels(level, '15') <= 0;
  const kinds = shuffle(band.kinds), seen = new Set<string>();
  const round: MentalQuestion[] = [];
  for (let index = 0; index < SUBJECT_ROUND_SIZE; index++) {
    const kind = kinds[index % kinds.length] as MentalKind;
    let question: MentalQuestion;
    let tries = 0;
    do {
      let prompt = '', hint = '', explanation = '', n = 0, d = 1;
      let operands: number[] = [];
      const a = int(early ? 1 : 10, early ? 10 : 70), b = int(1, early ? 10 : 25);
      switch (kind) {
        case 'add': {
          n = a + b; operands = [a,b]; prompt = `${a} + ${b} = ?`;
          const bridge = (10 - a % 10) % 10;
          hint = early ? `Start at ${a} and count on ${b}.` : 'Add the tens first, then the ones. You can also make a ten.';
          explanation = bridge > 0 && b >= bridge ? `Add ${bridge} to ${a} to make ${a+bridge}. Then add the remaining ${b-bridge}: ${a+bridge} + ${b-bridge} = ${n}.`
            : early ? `Start at ${a} and count on ${b} more to reach ${n}.`
            : `${a} + ${Math.floor(b/10)*10} + ${b%10} = ${n}. Add the tens, then the ones.`;
          break;
        }
        case 'subtract': {
          const top = Math.max(a,b), bottom = Math.min(a,b); n = top - bottom; operands = [top,bottom]; prompt = `${top} − ${bottom} = ?`;
          hint = 'Count up from the smaller number, or subtract in small parts.';
          explanation = `${bottom} + ${n} = ${top}, so ${top} − ${bottom} = ${n}.`; break;
        }
        case 'multiply': {
          const x = small ? pick([2,5,10]) : int(2,12), y = int(2,12); n = x*y; operands = [x,y]; prompt = `${x} × ${y} = ?`;
          hint = 'Break one factor into smaller parts you know.';
          explanation = `${x} × ${y} = (${x} × ${y-1}) + ${x} = ${x*(y-1)} + ${x} = ${n}.`; break;
        }
        case 'divide': {
          const divisor = small ? pick([2,5,10]) : int(2,12), answer = int(2,12); n = answer; operands = [divisor*answer,divisor]; prompt = `${divisor*answer} ÷ ${divisor} = ?`;
          hint = 'Use the matching multiplication fact.';
          explanation = `${divisor} × ${answer} = ${divisor*answer}, so the answer is ${answer}.`; break;
        }
        case 'missing':
          n = b; operands = [a,a+b]; prompt = `${a} + ? = ${a+b}`;
          hint = 'Find the difference between the total and the number you know.';
          explanation = `${a+b} − ${a} = ${b}. The missing number is ${b}.`; break;
        case 'square': {
          const x = int(2,15); n = x*x; operands = [x]; prompt = `What is ${x}²?`;
          hint = 'A square means multiplying a number by itself.';
          explanation = `${x}² = ${x} × ${x} = ${n}.`; break;
        }
        case 'order': {
          const x = int(2,9), y = int(2,9), z = int(2,20); n = z+x*y; operands = [z,x,y]; prompt = `${z} + ${x} × ${y} = ?`;
          hint = 'Do the multiplication before the addition.';
          explanation = `First ${x} × ${y} = ${x*y}; then ${z} + ${x*y} = ${n}.`; break;
        }
        case 'signed': {
          const x = -int(2,20), y = int(2,30); n = x+y; operands = [x,y]; prompt = `(${x}) + ${y} = ?`;
          hint = 'Start below zero and move right when adding a positive number.';
          explanation = `${x} + ${y} = ${n}. Adding ${y} moves ${y} places to the right on the number line.`; break;
        }
        case 'fraction': {
          d = pick([2,3,4,5,6,8]); const x = int(1,d-1), y = int(1,d-1); n = x+y; operands = [x,y,d]; prompt = `${x}/${d} + ${y}/${d} = ?`;
          hint = 'The denominators are the same, so add the numerators.';
          explanation = `${x}/${d} + ${y}/${d} = ${n}/${d} = ${label(n,d,false)}. Simplifying does not change the value.`; break;
        }
        case 'percent': {
          const percent = pick([5,10,20,25,50,75]), base = pick([20,40,60,80,100,120,160,200]); n = percent*base/100; operands = [percent,base]; prompt = `What is ${percent}% of ${base}?`;
          hint = percent===25 ? '25% means one quarter.' : percent===50 ? '50% means one half.' : percent===75 ? '75% means three quarters.' : 'Find 10% or a simple fraction, then scale it.';
          explanation = percent === 25 ? `25% means one quarter: ${base} ÷ 4 = ${n}.`
            : percent === 50 ? `50% means one half: ${base} ÷ 2 = ${n}.`
            : percent === 75 ? `75% means three quarters: ${base} ÷ 4 = ${base/4}, then ${base/4} × 3 = ${n}.`
            : percent === 5 ? `10% of ${base} is ${base/10}. Halve it to find 5%: ${base/10} ÷ 2 = ${n}.`
            : percent === 20 ? `20% means one fifth: ${base} ÷ 5 = ${n}.`
            : `To find 10%, divide by 10: ${base} ÷ 10 = ${n}.`; break;
        }
        case 'decimal': {
          const x = int(1,45), y = int(1,45); n = x+y; d = 10; operands = [x,y]; prompt = `${label(x,10,true)} + ${label(y,10,true)} = ?`;
          hint = 'Add whole parts and tenths, keeping the decimal point in place.';
          explanation = `${x} tenths + ${y} tenths = ${n} tenths = ${label(n,d,true)}.`; break;
        }
        case 'equation': {
          const x = int(2,9), answer = int(2,12), z = int(1,12); n = answer; operands = [x,z,x*answer+z]; prompt = `If ${x}x + ${z} = ${x*answer+z}, what is x?`;
          hint = 'Undo the addition, then undo the multiplication.';
          explanation = `Subtract ${z}: ${x}x = ${x*answer}. Divide by ${x}: x = ${answer}.`; break;
        }
        case 'ratio': {
          const left = int(1,4), right = int(2,5), each = int(2,10); n = left*each; operands = [left,right,(left+right)*each]; prompt = `${(left+right)*each} counters are shared in the ratio ${left}:${right}. How many are in the first share?`;
          hint = 'Add the ratio parts, find the value of one part, then multiply.';
          explanation = `${left}+${right} = ${left+right} parts. Each part is worth ${each}, so the first share is ${left} × ${each} = ${n}.`; break;
        }
        case 'pattern': {
          const start = int(0,early?5:15), step = int(1,early?3:9); n = start+3*step; operands = [start,step]; prompt = `Add ${step} each time: ${start}, ${start+step}, ${start+2*step}, ?`;
          hint = `Add ${step} once more to the last number.`;
          explanation = `${start+2*step} + ${step} = ${n}. The rule is to add ${step} each time.`; break;
        }
      }
      const values = [n];
      for (const offset of shuffle([-1,1,-2,2,-3,3,-4,4])) {
        if (values.length===4) break;
        if (kind === 'signed' || n+offset>=0) values.push(n+offset);
      }
      const decimal = kind==='decimal';
      const choices = shuffle(values).map(value=>label(value,d,decimal));
      question = { id: `mental-${index}-${kind}`, kind, operands, value: rational(n,d), prompt, choices,
        answer: label(n,d,decimal), hint, explanation, topic: ({ add:'Addition',subtract:'Subtraction',multiply:'Times tables',divide:'Division',missing:'Missing numbers',square:'Squares',order:'Order of operations',signed:'Signed numbers',fraction:'Fractions',percent:'Percentages',decimal:'Decimals',equation:'Simple equations',ratio:'Ratio',pattern:'Patterns' } as const)[kind] };
      tries++;
    } while(seen.has(question.prompt) && tries<30);
    seen.add(question.prompt); round.push(question);
  }
  return round;
}
