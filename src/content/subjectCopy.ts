import type { SubjectId } from '../subjects';

type SubjectCopy = { heading: string; introduction: string; topics: [string, string][]; takeaway: string; activities: string };
export const subjectCopy: Record<SubjectId, SubjectCopy> = {
  english: {
    heading: 'Words open up a world of ideas.',
    introduction: 'English helps us share stories, understand each other and express what we think. Explore the small building blocks of language and grow towards confident communication.',
    topics: [['Sounds & words', 'Connect letters, sounds and meanings.'], ['Reading', 'Follow a story, find a detail and read between the lines.'], ['Grammar & writing', 'Build sentences that say what you mean.'], ['Listening & communication', 'Understand everyday language and discover useful expressions.']],
    takeaway: 'A familiar word can have a new meaning in a different sentence. Context is one of your best clues.',
    activities: 'English lessons, word puzzles and short quizzes are available now. Choose a starting point that fits your confidence.',
  },
  maths: {
    heading: 'Spot a pattern. Find a new way to think.',
    introduction: 'Mathematics gives us tools for counting, comparing, measuring and making sense of patterns. Start with everyday numbers and build towards more connected mathematical ideas.',
    topics: [['Numbers & operations', 'Number bonds, arithmetic and mental shortcuts.'], ['Fractions & percentages', 'Parts, proportions and useful everyday comparisons.'], ['Patterns & algebra', 'Find a rule, describe a relationship and solve an equation.'], ['Shape, measure & data', 'Explore space, quantities and the stories numbers can tell.']],
    takeaway: 'There is often more than one route to an answer. For 19 + 6, you can make 20 first, then add the remaining 5.',
    activities: 'Explore four Maths learning levels, with twenty questions per skill and a certificate after achieving at least 80% in every skill. Mental Maths Trail is also available in Games, with five-question rounds and no final level.',
  },
  physics: {
    heading: 'Discover the ideas behind how things move.',
    introduction: 'Why does a ball roll? How does a rainbow appear? Physics explores motion, forces, light, sound and energy, connecting everyday observations with the rules of the universe.',
    topics: [['Motion & forces', 'From a gentle push to the paths of planets.'], ['Energy & heat', 'How energy moves, changes form and helps things happen.'], ['Light & sound', 'Waves, reflections, colours and vibrations.'], ['Electricity & matter', 'Charges, circuits and the tiny building blocks around us.']],
    takeaway: 'Sound starts with a vibration. A plucked string, a speaker and your voice all set something moving.',
    activities: 'We are planning visual explanations, observation challenges and short practice questions. These Physics activities are still in development.',
  },
  science: {
    heading: 'Turn a curious question into a discovery.',
    introduction: 'Science starts with noticing, asking and looking for evidence. It helps us explore living things, the Earth, space and the materials we meet every day.',
    topics: [['Living things', 'Plants, animals, habitats and the human body.'], ['Earth & space', 'Weather, rocks, our planet and the sky above it.'], ['Materials & change', 'Observe properties and investigate what changes.'], ['Thinking like a scientist', 'Ask a question, compare observations and explain your evidence.']],
    takeaway: 'A useful investigation changes one thing at a time. That helps us tell what might have caused a difference.',
    activities: 'We are planning picture-based questions, nature investigations and guided discoveries. Science lessons and games will open once they are ready.',
  },
  chemistry: {
    heading: 'Explore what the world is made of.',
    introduction: 'Chemistry investigates substances, their properties and the ways they change. It connects the atoms we cannot see with familiar things such as water, food and everyday materials.',
    topics: [['Atoms & elements', 'Meet the building blocks and patterns of the periodic table.'], ['Mixtures & solutions', 'Explore what happens when substances come together.'], ['Reactions & change', 'Look for evidence that a new substance has formed.'], ['Chemistry in daily life', 'Connect materials and their properties with the jobs they do.']],
    takeaway: 'Melting ice changes the state of water, but it is still water. A change in appearance does not always mean a new substance has formed.',
    activities: 'We are planning particle models, material-sorting activities and short concept quizzes. The Chemistry collection is being developed.',
  },
  informatics: {
    heading: 'Break a big idea into small, clear steps.',
    introduction: 'Informatics explores how information is represented, processed and used. Build logical thinking, discover algorithms and learn how clear instructions can bring an idea to life.',
    topics: [['Logic & patterns', 'Compare possibilities and explain a rule.'], ['Algorithms', 'Describe a solution as a sequence of steps.'], ['Coding foundations', 'Explore instructions, conditions, repetition and variables.'], ['Data & digital systems', 'Discover how computers organise and work with information.']],
    takeaway: 'An algorithm is a set of steps for solving a problem. Giving directions or following a recipe uses a similar kind of thinking.',
    activities: 'We are planning sequencing puzzles, code-tracing questions and small coding challenges. Informatics activities are still being prepared.',
  },
  ai: {
    heading: 'Get curious about how machines learn.',
    introduction: 'Artificial intelligence explores systems that recognise patterns, make predictions and generate new outputs. Learn the ideas behind the tools and practise asking thoughtful questions about their results.',
    topics: [['Patterns & examples', 'Explore how examples can help a system learn a pattern.'], ['Data & predictions', 'Connect the information a system receives with the answers it gives.'], ['Creative tools', 'Discover ways people use AI to explore and make things.'], ['Checking results', 'Compare evidence, notice mistakes and think about limitations.']],
    takeaway: 'A confident answer can still be wrong. Checking the evidence matters when using AI, just as it does in other kinds of learning.',
    activities: 'We are planning accessible demonstrations, pattern games and everyday AI scenarios. This subject is in development.',
  },
  more: {
    heading: 'There is always another question to explore.',
    introduction: 'Wizpiko is growing into a place for many interests. New subjects will bring more ways to understand the world, think creatively and build useful skills.',
    topics: [['Discover', 'Connect a new topic with something you already enjoy.'], ['Create', 'Explore ideas through making and imagining.'], ['Connect', 'Notice where different subjects help explain the same question.'], ['Keep learning', 'Choose a fresh starting point whenever you feel ready.']],
    takeaway: 'Curiosity crosses subject boundaries. One good question can lead to numbers, language, science and creative ideas.',
    activities: 'Future subject collections are being planned. Have an idea you would love to explore? Share it through Contact Us.',
  },
};
