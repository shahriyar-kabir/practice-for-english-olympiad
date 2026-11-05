import { choice, fill } from './tasks.ts';
import type { AcademyLevel, AcademyTask, LessonBody } from './tasks.ts';

export const mathsSkills = ['numbers', 'fractions', 'algebra', 'geometry', 'data', 'reasoning'] as const;
export type MathsSkill = typeof mathsSkills[number];
export const mathsSkillLabels: Record<MathsSkill, string> = {
  numbers: 'Numbers & operations', fractions: 'Fractions, ratios & rates', algebra: 'Patterns & algebra',
  geometry: 'Shape, measure & space', data: 'Data & probability', reasoning: 'Reasoning & applications',
};
type Problem = { prompt: string; answer: string; wrong: string[]; explanation: string; aliases?: string[] };
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
function fraction(n: number, d: number) { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `${n/g}/${d/g}`; }
function numberProblem(prompt: string, answer: number, explanation: string): Problem {
  return { prompt, answer: String(answer), wrong: [String(answer + 1), String(answer >= 1 ? answer - 1 : answer + 3), String(answer + 2)], explanation };
}
function rationalProblem(prompt: string, n: number, d: number, explanation: string): Problem {
  const answer = fraction(n, d);
  const aliases = Number.isInteger(n / d) || [2,4,5,8,10,20,25,40,50,100].includes(d / gcd(n,d)) ? [String(n/d)] : [];
  return { prompt, answer, wrong: [fraction(n+1,d), fraction(n+2,d), fraction(n+3,d)], explanation, aliases };
}
function wordProblem(prompt: string, answer: string, wrong: string[], explanation: string): Problem { return { prompt, answer, wrong, explanation }; }
function problem(level: AcademyLevel, skill: MathsSkill, i: number): Problem {
  const group = Math.floor(i / 5), kind = i % 5, a = group + 2, b = group + 3;
  if (level === 'starter') {
    if (skill === 'numbers') {
      if (kind === 0) return numberProblem(`What is ${a} + ${b}?`, a+b, `Count on ${b} from ${a}: ${a+b}.`);
      if (kind === 1) return numberProblem(`What is ${a+6} − ${a}?`, 6, `Subtracting ${a} from ${a+6} leaves 6.`);
      if (kind === 2) return numberProblem(`What comes immediately after ${11+group}?`, 12+group, 'The next whole number is one more.');
      if (kind === 3) return numberProblem(`In ${20+group*10}, how many tens are there?`, group+2, 'Each group of ten counts as one ten.');
      return numberProblem(`What number makes ${a} + ? = ${a+7}?`, 7, `The difference between ${a+7} and ${a} is 7.`);
    }
    if (skill === 'fractions') {
      if (kind === 0) return numberProblem(`Share ${a*2} counters equally between two people. How many does each get?`, a, `${a*2} ÷ 2 = ${a}.`);
      if (kind === 1) return numberProblem(`What is half of ${b*2}?`, b, `Half means one of two equal parts: ${b*2} ÷ 2 = ${b}.`);
      if (kind === 2) return numberProblem(`A shape has 4 equal parts. ${group+1} parts are coloured. How many parts are not coloured?`, 3-group, `4 − ${group+1} = ${3-group}.`);
      if (kind === 3) return numberProblem(`Share ${a*4} beads into four equal groups. How many are in each group?`, a, `${a*4} ÷ 4 = ${a}.`);
      return rationalProblem(`A strip has ${a+2} equal parts. One part is shaded. What fraction is shaded? Give a fraction.`, 1, a+2, `One of ${a+2} equal parts is 1/${a+2}.`);
    }
    if (skill === 'algebra') {
      if (kind === 0) return numberProblem(`Add ${a} each time: ${a}, ${a*2}, ${a*3}, ?`, a*4, `Add ${a} to ${a*3} to get ${a*4}.`);
      if (kind === 1) return numberProblem(`What number is hidden: ? + ${b} = ${b+4}?`, 4, `Undo addition: ${b+4} − ${b} = 4.`);
      if (kind === 2) return numberProblem(`Continue by adding 2: ${a}, ${a+2}, ${a+4}, ?`, a+6, `The next term is ${a+4} + 2 = ${a+6}.`);
      if (kind === 3) return wordProblem(`The repeating pattern is red, blue, red, blue. Which colour is in position ${6+group*2}?`, 'blue', ['red','green','yellow'], 'The even-numbered positions are blue.');
      return numberProblem(`A machine adds 1. What comes out when ${10+group} goes in?`, 11+group, 'The output is one more than the input.');
    }
    if (skill === 'geometry') {
      if (kind === 0) return numberProblem(`You draw ${a} separate triangles. How many sides do they have altogether?`, a*3, `Each triangle has 3 sides; ${a} × 3 = ${a*3}.`);
      if (kind === 1) return numberProblem(`You draw ${a} separate squares. How many corners are there altogether?`, a*4, `Each square has 4 corners; ${a} × 4 = ${a*4}.`);
      if (kind === 2) return wordProblem(`A clock shows ${group+1}:00. Which hand points to 12: the minute hand or the hour hand?`, 'minute hand', ['hour hand','neither hand','both hands'], 'At an exact hour, the minute hand points to 12.');
      if (kind === 3) return numberProblem(`A row has ${a} unit squares. Another row has ${a} unit squares. How many squares in total?`, a*2, `Two rows of ${a} make ${a*2} squares.`);
      return numberProblem(`A ribbon is ${a} centimetres long. Another is ${b} centimetres long. What is their total length in centimetres?`, a+b, 'Add the two lengths measured in the same unit.');
    }
    if (skill === 'data') {
      if (kind === 0) return numberProblem(`A tally shows ${a} cats and ${b} dogs. How many animals are counted?`, a+b, 'Add the two counts.');
      if (kind === 1) return wordProblem(`A chart shows ${a} apples, ${a+3} bananas and ${a+1} pears. Which fruit has the largest count?`, 'bananas', ['apples','pears','all equal'], `${a+3} is the largest count.`);
      if (kind === 2) return numberProblem(`There are ${a+5} votes for blue and ${a} votes for red. How many more votes are for blue?`, 5, `Subtract the counts: ${a+5} − ${a} = 5.`);
      if (kind === 3) return wordProblem(`A bag holds only ${a} red counters. What colour will a counter taken from the bag be?`, 'red', ['blue','green','unknown'], 'Every counter in the bag is red.');
      return numberProblem(`Monday has ${a} visitors and Tuesday has ${b} visitors. How many visitors are recorded altogether?`, a+b, 'The total combines both days.');
    }
    if (kind === 0) return numberProblem(`Mina has ${a} pencils and gets ${b} more. How many pencils does she have?`, a+b, 'Getting more is addition.');
    if (kind === 1) return numberProblem(`A box holds ${a+7} apples. ${a} are eaten. How many remain?`, 7, 'Subtract the apples eaten from the starting number.');
    if (kind === 2) return numberProblem(`${a} pairs of socks are on a shelf. How many socks is that?`, a*2, 'Each pair has two socks.');
    if (kind === 3) return numberProblem(`A bus has ${a} people. ${b} people get on and one gets off. How many are now on the bus?`, a+b-1, 'Add the people who get on, then subtract one.');
    return numberProblem(`A book costs ${a} coins. You pay ${a+3} coins. How many coins should you get back?`, 3, 'Change is the amount paid minus the cost.');
  }
  if (level === 'beginner') {
    if (skill === 'numbers') {
      if (kind === 0) return numberProblem(`Calculate ${a+3} × ${b+4}.`, (a+3)*(b+4), 'Multiply the two whole numbers.');
      if (kind === 1) return numberProblem(`Calculate ${(a+4)*b} ÷ ${b}.`, a+4, `Use the matching multiplication fact: ${b} × ${a+4} = ${(a+4)*b}.`);
      if (kind === 2) return numberProblem(`What is the greatest common factor of ${a*2} and ${a*3}?`, a, `The common factor is ${a}; the remaining factors 2 and 3 are coprime.`);
      if (kind === 3) return numberProblem(`Calculate ${a}².`, a*a, 'A square multiplies a number by itself.');
      return numberProblem(`Calculate ${a*10+7} − ${b}.`, a*10+7-b, 'Subtract carefully, regrouping a ten if needed.');
    }
    if (skill === 'fractions') {
      if (kind === 0) return rationalProblem(`Calculate 1/${a+2} + 2/${a+2}. Give a simplified fraction.`,3,a+2,'Add the numerators when the denominators match, then simplify.');
      if (kind === 1) return numberProblem(`Find 25% of ${a*20}.`, a*5, '25% is one quarter, so divide by 4.');
      if (kind === 2) return numberProblem(`Share ${a*5} in the ratio 2:3. What is the first share?`, a*2, 'There are five ratio parts. Find one part, then multiply by two.');
      if (kind === 3) return numberProblem(`Write ${a}/10 as a decimal.`,a/10,'Tenths have one digit after the decimal point.');
      return numberProblem(`A unit costs ${a} coins. What do ${b} units cost?`,a*b,'Multiply the unit price by the number of units.');
    }
    if (skill === 'algebra') {
      if (kind === 0) return numberProblem(`Solve x + ${b} = ${b+a*3}. What is x?`,a*3,'Subtract the known addend from both sides.');
      if (kind === 1) return numberProblem(`Solve ${a}x = ${a*b}. What is x?`,b,'Divide both sides by the coefficient of x.');
      if (kind === 2) return numberProblem(`Find the next term: ${a}, ${a+5}, ${a+10}, ? Add 5 each time.`,a+15,'Continue the stated arithmetic pattern.');
      if (kind === 3) return numberProblem(`If x = ${a}, what is 3x + 2?`,3*a+2,'Substitute the value of x, multiply, then add.');
      return wordProblem(`Simplify ${a}x + ${b}x.`,`${a+b}x`,[`${a*b}x`,`${a+b}`,`${a+b}x²`],'Combine like terms by adding their coefficients.');
    }
    if (skill === 'geometry') {
      if (kind === 0) return numberProblem(`A rectangle is ${a} cm by ${b} cm. What is its perimeter in cm?`,2*(a+b),'Perimeter is twice the sum of length and width.');
      if (kind === 1) return numberProblem(`A rectangle is ${a+2} cm by ${b} cm. What is its area in square cm?`,(a+2)*b,'Area of a rectangle is length times width.');
      if (kind === 2) return numberProblem(`Two angles of a triangle are ${40+group*5}° and 60°. Find the third angle in degrees.`,80-group*5,'The interior angles of a triangle total 180°.');
      if (kind === 3) return numberProblem(`Convert ${a} metres to centimetres.`,a*100,'There are 100 centimetres in one metre.');
      return numberProblem(`A square has side length ${a+3} cm. What is its area in square cm?`,(a+3)**2,'Square the side length.');
    }
    if (skill === 'data') {
      if (kind === 0) return numberProblem(`Find the mean of ${a}, ${a+2} and ${a+4}.`,a+2,'Add the three values and divide by three.');
      if (kind === 1) return numberProblem(`Find the median of ${a}, ${a+3}, ${a+8}.`,a+3,'The median is the middle value in this ordered list.');
      if (kind === 2) return numberProblem(`Find the range of ${a}, ${a+4}, ${a+9}.`,9,'Range is the largest value minus the smallest.');
      if (kind === 3) return rationalProblem(`A bag has ${a} red counters and ${a} blue counters. What is the probability of red? Give a simplified fraction.`,a,a*2,'Probability is favourable outcomes divided by all equally likely outcomes.');
      return numberProblem(`Find the mode of ${a}, ${b}, ${b}, ${b+2}.`,b,'The mode is the most frequent value.');
    }
    if (kind === 0) return numberProblem(`${a} books cost ${a*4} coins. What is the cost of one book?`,4,'Divide total cost by the number of books.');
    if (kind === 1) return numberProblem(`A shop sells packs of ${b} pencils. How many pencils are in ${a} packs?`,a*b,'Multiply the pack size by the number of packs.');
    if (kind === 2) return numberProblem(`You have ${a*10} coins and spend ${b*3}. How many remain?`,a*10-b*3,'Subtract spending from the starting amount.');
    if (kind === 3) return numberProblem(`A train leaves at ${8+group}:10 and arrives at ${8+group}:45. How many minutes is the journey?`,35,'The difference between :10 and :45 is 35 minutes.');
    return numberProblem(`A recipe for two people needs ${a*2} grams of oats. How many grams are needed for four people?`,a*4,'Doubling the people doubles each ingredient.');
  }
  if (level === 'intermediate') {
    if (skill === 'numbers') {
      if (kind === 0) return numberProblem(`Calculate ${a}³.`,a**3,'A cube multiplies a number by itself three times.');
      if (kind === 1) return numberProblem(`Find the positive square root of ${(a+4)**2}.`,a+4,'The positive square root is the nonnegative number whose square gives the value.');
      if (kind === 2) return numberProblem(`Calculate (−${a}) × (−${b}).`,a*b,'Multiplying two negative numbers gives a positive product.');
      if (kind === 3) return numberProblem(`Calculate 2^${a} × 2².`,2**(a+2),'Multiply powers of the same base by adding exponents.');
      return numberProblem(`Find the least common multiple of ${a*2} and ${a*3}.`,a*6,'Since 2 and 3 are coprime, the common scale factor times six gives the LCM.');
    }
    if (skill === 'fractions') {
      if (kind === 0) return rationalProblem(`Calculate 1/${a} + 1/${a*2}. Give a simplified fraction.`,3,a*2,'Use the common denominator twice the smaller denominator.');
      if (kind === 1) return numberProblem(`Increase ${a*100} by 15%.`,a*115,'An increase of 15% multiplies the amount by 1.15.');
      if (kind === 2) return numberProblem(`A journey covers ${a*60} km in ${a} hours. What is the average speed in km/h?`,60,'Average speed is distance divided by time.');
      if (kind === 3) return numberProblem(`Share ${a*12} in the ratio 5:7. What is the larger share?`,a*7,'There are twelve parts, and the larger share has seven.');
      return numberProblem(`A price of ${a*100} is reduced by 20%, then increased by 20%. What is the final price?`,a*96,'The two multipliers give 0.8 × 1.2 = 0.96, not 1.');
    }
    if (skill === 'algebra') {
      if (kind === 0) return numberProblem(`Solve ${a}x + ${b} = ${a*(b+2)+b}. What is x?`,b+2,'Subtract the constant, then divide by the coefficient.');
      if (kind === 1) return numberProblem(`If y = 2x + ${a}, find y when x = ${b}.`,2*b+a,'Substitute the value of x into the linear rule.');
      if (kind === 2) return numberProblem(`The equations are x + y = ${a+b} and x − y = ${a-b}. Find x.`,a,'Add the equations to eliminate y, then divide by two.');
      if (kind === 3) return numberProblem(`What is the positive solution of x² = ${(a+3)**2}?`,a+3,'Take the positive square root as requested.');
      return numberProblem(`An arithmetic sequence starts at ${a} with common difference ${b}. Find its tenth term.`,a+9*b,'The tenth term is the first term plus nine common differences.');
    }
    if (skill === 'geometry') {
      if (kind === 0) return numberProblem(`A right triangle has legs ${3*a} and ${4*a}. Find the hypotenuse.`,5*a,'Use Pythagoras: these scaled 3–4–5 lengths form a right triangle.');
      if (kind === 1) return numberProblem(`A circle has radius ${a}. Its area is kπ. Find k.`,a*a,'Circle area is πr², so k is the square of the radius.');
      if (kind === 2) return numberProblem(`A cuboid measures ${a} by ${b} by 4. Find its volume.`,a*b*4,'Volume is length times width times height.');
      if (kind === 3) return numberProblem(`A straight line is split into angles ${a*10}° and x°. Find x.`,180-a*10,'Angles on a straight line total 180°.');
      return numberProblem(`The points are (0, 0) and (${3*a}, ${4*a}). Find the distance between them.`,5*a,'Apply the distance formula, equivalent to Pythagoras.');
    }
    if (skill === 'data') {
      if (kind === 0) return rationalProblem(`A fair six-sided die is rolled. What is the probability of a result greater than ${a}? Give a simplified fraction.`,6-a,6,'Count favourable faces and divide by six.');
      if (kind === 1) return rationalProblem(`A bag contains ${a} red and ${b} blue counters. What is the probability of blue? Give a simplified fraction.`,b,a+b,'Divide the number of blue counters by the total.');
      if (kind === 2) return numberProblem(`Find the median of ${a}, ${a+2}, ${a+6}, ${a+8}.`,a+4,'For four ordered values, average the two middle ones.');
      if (kind === 3) return numberProblem(`Values ${a}, ${a+5}, ${a+10} each occur twice. Find their mean.`,a+5,'Equal frequencies make the mean the average of the three values.');
      const events=[['both show heads',1,4],['at least one shows heads',3,4],['exactly one shows heads',1,2],['the first shows heads and the second shows tails',1,4]] as const;
      const [event,numerator,denominator]=events[group];
      return rationalProblem(`Two fair coins are tossed. What is the probability that ${event}?`,numerator,denominator,'List the equally likely outcomes HH, HT, TH and TT, then count those matching the event.');
    }
    if (kind === 0) return numberProblem(`A rectangular floor is ${a} m by ${b} m. Tiles cost 8 coins per square metre. What is the total tile cost?`,a*b*8,'Find the area, then multiply by the unit cost.');
    if (kind === 1) return numberProblem(`A bill of ${a*220} includes a 10% service charge added to the original amount. What was the original amount?`,a*200,'Divide the final bill by 1.10 to undo the service charge.');
    if (kind === 2) return numberProblem(`A worker makes ${a*12} items in ${a*3} hours at a constant rate. How many items per hour?`,4,'Divide the number of items by hours worked.');
    if (kind === 3) return numberProblem(`A model uses a scale of 1:${a*100}. A length is 3 cm on the model. What is the real length in cm?`,a*300,'Multiply the model length by the scale factor.');
    return numberProblem(`An amount of ${a*100} earns simple interest at 5% per year for 2 years. What is the interest?`,a*10,'Simple interest is principal times rate times time.');
  }
  if (skill === 'numbers') {
    if (kind === 0) return numberProblem(`Find the remainder when ${a*7+3} is divided by 7.`,3,'The number is a multiple of seven plus three.');
    if (kind === 1) return numberProblem(`Evaluate log₂(${2**(a+1)}).`,a+1,'A logarithm asks for the exponent producing the argument.');
    if (kind === 2) return numberProblem(`How many distinct subsets does a set with ${a} elements have?`,2**a,'Each element is either included or excluded, giving 2^n subsets.');
    if (kind === 3) return numberProblem(`Evaluate ${a}! (factorial).`,Array.from({length:a},(_,j)=>j+1).reduce((x,y)=>x*y,1),'Factorial is the product of the positive integers up to the number.');
    return numberProblem(`If n = ${a}, what is n(n + 1)?`,a*(a+1),'Multiply the two consecutive integers; their product is always even.');
  }
  if (skill === 'fractions') {
    if (kind === 0) return numberProblem(`For f(x) = x², find f′(${a}).`,2*a,'The derivative of x² is 2x; substitute the given input.');
    if (kind === 1) return numberProblem(`Evaluate the definite integral of 2x from 0 to ${a}.`,a*a,'An antiderivative is x²; subtract the endpoint values.');
    if (kind === 2) return numberProblem(`For f(x) = 3x + ${a}, find f⁻¹(${3*b+a}).`,b,'Undo the addition and then divide by three.');
    if (kind === 3) return numberProblem(`A quantity follows q(t) = ${a}t². Find its rate of change at t = 2.`,a*4,'Differentiate to get 2at, then set t equal to two.');
    return numberProblem(`Find the limit of (x² − ${a*a})/(x − ${a}) as x approaches ${a}.`,a*2,'Factor the numerator, cancel the common factor for x unequal to a, then evaluate x + a.');
  }
  if (skill === 'algebra') {
    if (kind === 0) return numberProblem(`The matrix is [[${a}, 1], [2, ${b}]]. Find its determinant.`,a*b-2,'For a 2×2 matrix, determinant is ad − bc.');
    if (kind === 1) return numberProblem(`For roots ${a} and ${b}, what is the sum of the roots of (x − ${a})(x − ${b}) = 0?`,a+b,'The roots are the values that make either factor zero.');
    if (kind === 2) return numberProblem(`Solve 2x + y = ${2*a+b} and x − y = ${a-b}. Find x.`,a,'Add the equations to eliminate y, obtaining 3x.');
    if (kind === 3) return numberProblem(`For the arithmetic sequence with first term ${a} and difference 2, find the sum of its first 10 terms.`,10*a+90,'Use Sₙ = n/2 × [2a + (n−1)d].');
    return numberProblem(`For the geometric sequence 1, ${a}, ${a*a}, …, find the fourth term.`,a**3,'Multiply by the common ratio once more.');
  }
  if (skill === 'geometry') {
    if (kind === 0) return numberProblem(`Find the dot product of (${a}, 2) and (3, ${b}).`,a*3+2*b,'Multiply corresponding components, then add.');
    if (kind === 1) return numberProblem(`Find the squared magnitude of the vector (${a}, ${b}).`,a*a+b*b,'The squared magnitude is the sum of the squared components.');
    if (kind === 2) return numberProblem(`A line has direction vector (${a}, ${a*2}). What is its gradient?`,2,'Gradient is change in y divided by change in x.');
    if (kind === 3) return numberProblem(`A right triangle has hypotenuse ${a*10} and sin θ = 3/5. Find the opposite side.`,a*6,'Multiply the hypotenuse by sin θ.');
    return numberProblem(`A circle has equation x² + y² = ${(a+2)**2}. Find its radius.`,a+2,'The right side is r², so take its positive square root.');
  }
  if (skill === 'data') {
    if (kind === 0) return rationalProblem(`Independent events have probabilities 1/${a} and 1/2. What is the probability both occur?`,1,a*2,'Multiply independent-event probabilities.');
    if (kind === 1) return numberProblem(`A random variable equals 0 with probability 1/2 and ${a*2} with probability 1/2. Find its expected value.`,a,'Expected value is the sum of each outcome times its probability.');
    if (kind === 2) return rationalProblem(`Among ${a*10} people, ${a*4} use a bus, and ${a*2} of those bus users also cycle. Given a bus user, what is the probability they cycle?`,1,2,'Condition on the bus users: divide those who also cycle by the number of bus users.');
    if (kind === 3) return numberProblem(`Find the population variance of ${a}, ${a+2}, ${a+4}. Give the exact fraction.`,8/3,'The mean is a + 2. The squared deviations total 8; divide by 3.');
    return numberProblem(`A standardised score is z = (x − μ)/σ. With x = ${a*3+6}, μ = 6 and σ = ${a}, find z.`,3,'Subtract the mean and divide by the standard deviation.');
  }
  if (kind === 0) return numberProblem(`A cost model is C(n) = ${a}n + 30. Find C(${b}).`,a*b+30,'Substitute the input into the linear cost model.');
  if (kind === 1) return numberProblem(`The area function is A(x) = ${a*2}x − x². At what x is this quadratic maximised?`,a,'Differentiate and set 2a − 2x = 0; the negative x² coefficient gives a maximum.');
  if (kind === 2) return numberProblem(`A project earns ${a*20} with probability 1/2 and loses ${a*4} with probability 1/2. What is the expected net gain?`,a*8,'Use the signed weighted average of gain and loss.');
  if (kind === 3) return numberProblem(`A balance starts at 100 and is multiplied by 1.${a} after one period. What is the new balance?`,100+a*10,'Multiply the starting balance by the growth factor.');
  return wordProblem(`A sample of ${a*10} volunteers reports improvement. Which conclusion is justified without a comparison group?`, 'The sample reported improvement; causation is not established.', ['The intervention certainly caused the improvement.','Every person will improve.','The sample proves no one improved.'], 'A report of change alone does not isolate the cause.');
}

const teaching: Record<MathsSkill, string[]> = {
  numbers: ['Use place value and known facts to make a calculation clearer. Addition and subtraction undo each other; multiplication and division also form inverse pairs. As you progress, connect these ideas with powers, roots and number properties.', 'Check signs, order of operations and what the question actually asks. Work at your own pace and use a different method to check an answer. Advanced questions introduce logarithms, sets and factorials.'],
  fractions: ['A fraction describes equal parts. Ratios compare quantities; rates compare quantities with units. Use a common denominator for fraction addition, and convert percentages into fractions or multipliers when useful.', 'Follow the level you have chosen: early tasks use sharing and halves, then ratios, rates and percentage change. Advanced tasks connect changing quantities with functions, derivatives, limits and simple integrals.'],
  algebra: ['A pattern follows a rule. Algebra uses letters to describe unknown values and relationships. Substitute known values carefully, and keep an equation balanced when undoing operations.', 'Begin with a clear rule, then show each step. Higher levels introduce simultaneous equations and sequences. Advanced questions use basic matrices, determinants and arithmetic or geometric series.'],
  geometry: ['Name a shape by its properties. Distinguish a length, an area and a volume, and keep track of units. A diagram or a written list of dimensions can help you reason about a spatial problem.', 'Use formulas only when their conditions fit: triangle angles total 180°, Pythagoras applies to right triangles, and circle area is πr². Higher levels connect coordinates, vectors and trigonometric ratios.'],
  data: ['Read each count or value before calculating. The mean is a total divided by a count, the median is the middle of an ordered list, the mode is the most frequent value and the range measures spread.', 'For probability, identify the relevant equally likely outcomes. Independent probabilities multiply; conditional probabilities use the restricted group. Advanced tasks introduce expectation, variance and standardisation.'],
  reasoning: ['Identify the information you know, what you need to find and the units involved. Choose an operation because it fits the situation, rather than because of a single keyword.', 'Multi-step questions may combine several ideas. Show a calculation for each stage, check whether the result is reasonable and distinguish an assumption or model from a guaranteed real-world outcome.'],
};
const methods:Record<AcademyLevel,Record<MathsSkill,string>>={
  starter:{
    numbers:'Count on for addition and count back or find the difference for subtraction. The number after a whole number is one more. In 30 there are three tens; in 40 there are four tens. To find a missing addend, subtract the known addend from the total.',
    fractions:'Sharing equally means each group gets the same amount. Half means one of two equal parts; a quarter means one of four equal parts. If one of six equal parts is shaded, its fraction is 1/6. Count the parts that are left as well as the shaded parts.',
    algebra:'A repeating colour pattern follows the same order each time. Red, blue, red, blue has red in the odd positions and blue in the even positions. A number pattern may add a fixed amount each time. A machine rule describes exactly what happens to an input.',
    geometry:'A triangle has three sides and three corners. A square has four sides and four corners. At an exact hour such as 3:00, the minute hand points to 12. Count unit squares to describe a surface, and add lengths only after checking that their units match.',
    data:'A tally or chart records how many. Add categories to find a total, compare their counts to find the largest, and subtract to find how many more. If every counter in a bag is red, drawing a counter from it must give red.',
    reasoning:'Getting more objects increases a count; taking objects away reduces it. A pair has two objects. For a changing group, add arrivals and subtract departures. When paying for something, change is the amount paid minus the price.',
  },
  beginner:{
    numbers:'Multiplication counts equal groups and division shares a total equally. A factor divides a number without a remainder. The greatest common factor is the largest factor shared by two numbers. A square such as 5² means 5 × 5.',
    fractions:'For fractions with equal denominators, add their numerators and then simplify. One tenth is 0.1 and three tenths is 0.3. To find 25%, divide by four. Sharing in the ratio 2:3 uses five equal parts, of which the first share receives two.',
    algebra:'Undo addition by subtracting and undo multiplication by dividing. In 3x, the 3 multiplies x. Combine like terms by adding coefficients: 2x + 5x = 7x. Substitute a value in a formula before doing multiplication or addition.',
    geometry:'A rectangle’s perimeter is 2 × (length + width), and its area is length × width. A square’s area is side². A triangle’s interior angles total 180°. Convert metres to centimetres by multiplying by 100, keeping area units separate from length units.',
    data:'Order data before finding the median. For three values, select the middle one. Add the values and divide by the count to find the mean. The range is largest minus smallest. A simple probability is the favourable count divided by the total count.',
    reasoning:'Use division to find a unit cost and multiplication to scale a pack or a recipe. Track money spent and money remaining separately. For times within the same hour, subtract the minute readings to find elapsed minutes.',
  },
  intermediate:{
    numbers:'A cube is a number multiplied by itself three times. The positive square root is nonnegative. A negative times a negative is positive. Multiplying equal-base powers adds their exponents. The least common multiple is the smallest positive number divisible by both inputs.',
    fractions:'Use a common denominator to add unlike fractions. A 15% increase uses the multiplier 1.15. A 20% reduction followed by a 20% increase uses 0.8 × 1.2 = 0.96, so the original is not recovered. Average speed is distance divided by time. Ratio shares must add to the original total.',
    algebra:'For ax + b = c, subtract b and then divide by a. To solve simultaneous equations, add or subtract them to eliminate a variable. An arithmetic sequence has nth term a + (n−1)d. When asked for a positive solution of x² = k, take the positive root only.',
    geometry:'For a right triangle, a² + b² = c², where c is the hypotenuse. A 3–4–5 triangle remains right-angled when all lengths use the same scale factor. Circle area is πr². Cuboid volume is length × width × height. Coordinate distance follows Pythagoras.',
    data:'For an even number of ordered values, average the two middle values to find the median. Use frequencies when finding a mean. A fair six-sided die has six equally likely results. Two independent fair coin tosses have four equally likely ordered outcomes.',
    reasoning:'A unit-area cost multiplies the area. To undo a 10% added charge, divide the final amount by 1.10. Scale 1:n means a model length is multiplied by n in reality. Simple interest is principal × annual rate × years; use the rate as a decimal.',
  },
  advanced:{
    numbers:'The remainder of 7k + 3 on division by 7 is 3. A logarithm asks for an exponent: log₂(8) = 3 because 2³ = 8. A set of n distinct elements has 2^n subsets. Factorial n! multiplies all integers from 1 to n. Consecutive integers always include an even integer.',
    fractions:'For f(x) = x², the derivative is f′(x) = 2x. An antiderivative of 2x is x², so a definite integral uses the difference of endpoint values. To invert f(x) = ax + b, undo b and divide by a. For limits involving x² − a², factor it as (x − a)(x + a) before evaluating the limiting expression.',
    algebra:'A 2×2 matrix [[a,b],[c,d]] has determinant ad − bc. Roots can be read from a factored polynomial. Eliminate a variable to solve a linear system. An arithmetic series has sum n[2a + (n−1)d]/2, while a geometric sequence multiplies by a fixed common ratio.',
    geometry:'A vector dot product multiplies corresponding components and adds them. Squared magnitude is the sum of squared components. Gradient is vertical change divided by horizontal change. In a right triangle, sin θ = opposite/hypotenuse. The circle x² + y² = r² has centre at the origin.',
    data:'Independent-event probabilities multiply. Expected value is the sum of each outcome times its probability, including negative outcomes. Conditional probability uses the restricted group. Population variance averages squared deviations from the mean. A z-score is (value − mean)/standard deviation.',
    reasoning:'Substitute inputs into a mathematical model and state its assumptions. The quadratic A(x) = 2ax − x² has a maximum at x = a. A growth multiplier of 1.2 means a 20% increase. Use signed weighted averages for uncertain gains and losses. Observing improvement without a comparison does not establish what caused it.',
  },
};
export function makeMathsLesson(level: AcademyLevel, skill: MathsSkill): LessonBody {
  const tasks: AcademyTask[] = Array.from({ length: 20 }, (_, index) => {
    let q = problem(level, skill, index);
    // Keep exact fractions exact rather than asking learners to type an infinite decimal.
    if (level === 'advanced' && skill === 'data' && index % 5 === 3) q = rationalProblem(`Find the population variance of ${Math.floor(index/5)+2}, ${Math.floor(index/5)+4}, ${Math.floor(index/5)+6}. Give an exact fraction.`,8,3,'The mean is the middle value. Squared deviations are 4, 0 and 4; population variance is 8/3.');
    const id = `maths-${level}-${skill}-${index+1}`;
    if (index % 4 === 3 && q.answer.length < 40) return fill(id, q.prompt + ' Type your answer without units.', [q.answer, ...(q.aliases || [])], q.explanation);
    const options = [q.answer, ...q.wrong].filter((value, at, list) => list.indexOf(value) === at);
    const rotate = index % options.length;
    return choice(id,q.prompt,[...options.slice(rotate),...options.slice(0,rotate)],q.answer,q.explanation);
  });
  const examples=[problem(level,skill,0),problem(level,skill,1)].map(item=>({before:item.prompt,after:`${item.answer}. ${item.explanation}`}));
  return { objective: `Build confidence in ${mathsSkillLabels[skill].toLowerCase()} through twenty untimed questions.`, teaching: [...teaching[skill],methods[level][skill]], examples, tasks, recap: 'Keep the method as well as the answer. Retry a skill whenever you want to strengthen your understanding. A level certificate needs at least 16 correct answers in each of its six skills.' };
}
