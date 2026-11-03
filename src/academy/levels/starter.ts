import { choice, fill, order } from '../types';
import type { LessonBody } from '../types';

const lessons: Record<string, LessonBody> = {
  sounds: {
    objective: 'Match m, s, b and c to familiar words, then blend a short word.',
    teaching: [
      'A letter has a name and can represent a sound. The letter m begins moon. The letter s begins sun. Say the words slowly and notice the first sound.',
      'Blend sounds to read a short word: c–a–t makes cat. In cat, c has the /k/ sound. Some letters have other sounds in other words; we are learning these examples first.',
    ],
    examples: [{ before: 'm + oon', after: 'moon begins with m.' }, { before: 'c – a – t', after: 'Blend the sounds: cat.' }],
    tasks: [
      choice('st-s-1', 'Which letter begins moon?', ['s', 'm', 'b'], 'm', 'Moon begins with the /m/ sound, written m.'),
      choice('st-s-2', 'Match the letter s to a word that begins with it.', ['bag', 'cat', 'sun'], 'sun', 'Sun begins with s. Bag begins with b, and cat begins with c.'),
      fill('st-s-3', 'Write the missing first letter: _ag. The word is bag.', ['b'], 'Bag is spelled b–a–g, so the missing letter is b.'),
      choice('st-s-4', 'Blend c–a–t. Which word do you make?', ['cap', 'cat', 'bag'], 'cat', 'The three letters c, a and t make cat.'),
      order('st-s-5', 'Put these letters in order to spell sun.', ['n', 's', 'u'], 's u n', 'Sun is spelled s–u–n. Try saying the word as you point to each letter.'),
    ],
    recap: 'You matched beginning sounds and built cat and sun. Look for m, s, b and c in words around you.',
  },
  vocabulary: {
    objective: 'Recognise useful everyday words and spell a short word.',
    teaching: [
      'Words name things and actions. A book is something you read. A cup can hold a drink. A door lets you enter or leave a room.',
      'An action word tells what someone does. Read and sit are actions. Say a new word, picture its meaning, and use it in a short sentence.',
    ],
    examples: [{ before: 'book', after: 'I read a book.' }, { before: 'cup', after: 'My cup holds water.' }],
    tasks: [
      choice('st-v-1', 'Which thing do you read?', ['A cup', 'A book', 'A door'], 'A book', 'A book contains words or pictures to read.'),
      choice('st-v-2', 'Match cup to its use.', ['Holding a drink', 'Opening a room', 'Wearing on a foot'], 'Holding a drink', 'A cup is a container for a drink.'),
      fill('st-v-3', 'Complete the word for something you open to enter a room: d_ _r.', ['oo', 'door'], 'Door is spelled d–o–o–r. The two missing letters are oo.'),
      choice('st-v-4', 'Which word is an action?', ['table', 'bag', 'sit'], 'sit', 'Sit tells what a person does. Table and bag name things.'),
      order('st-v-5', 'Put these letters in order to spell pen.', ['e', 'n', 'p'], 'p e n', 'Pen is spelled p–e–n. You can use a pen to write.'),
    ],
    recap: 'You learned book, cup, door, sit and pen. Try naming three everyday things you can see.',
  },
  grammar: {
    objective: 'Make a complete sentence with a person or thing and a matching verb.',
    teaching: [
      'A sentence expresses a complete idea. Begin with a capital letter and finish a statement with a full stop. “I am ready.” is a sentence.',
      'Use am with I, are with you, and is with one person or thing: I am here. You are kind. The bag is blue.',
    ],
    examples: [{ before: 'I + am + ready', after: 'I am ready.' }, { before: 'The bag + is + blue', after: 'The bag is blue.' }],
    tasks: [
      choice('st-g-1', 'Choose the word: I ___ happy.', ['is', 'am', 'are'], 'am', 'Use am with I: I am happy.'),
      fill('st-g-2', 'Complete the sentence: You ___ kind.', ['are'], 'Use are with you: You are kind.'),
      choice('st-g-3', 'Choose the complete sentence.', ['The bag.', 'Is blue.', 'The bag is blue.'], 'The bag is blue.', 'This tells us what the bag is like. The other choices leave the idea unfinished.'),
      order('st-g-4', 'Build a sentence.', ['ready.', 'am', 'I'], 'I am ready.', 'The usual order is the person, the verb, then the rest: I am ready.'),
      choice('st-g-5', 'Which sentence uses a capital letter and a full stop?', ['i am here', 'I am here.', 'I am here'], 'I am here.', 'Start with a capital I and end the statement with a full stop.'),
    ],
    recap: 'I am, you are, and one thing is. A capital letter and a full stop help readers see a complete sentence.',
  },
  reading: {
    objective: 'Find who, what and where in a short everyday story.',
    teaching: [
      'Read a short text once for the main idea. Read it again to find a name, an object or a place. You can return to the text as often as you need.',
      'A detail is a small piece of information in the text. Choose what the text says, even if another answer could happen in a different story.',
    ],
    examples: [{ before: 'Mina has a red bag.', after: 'Who? Mina. What colour? Red.' }, { before: 'She sits by the door.', after: 'Where? By the door.' }],
    passage: 'Mina has a red bag. She puts a book and a pen in it. Mina walks to the park. She sits by a tree and reads her book. Then she walks home.',
    tasks: [
      choice('st-r-1', 'Who has the bag?', ['Mina', 'Sam', 'Ali'], 'Mina', 'The first sentence names Mina as the person with the bag.', 'Mina has a red bag.'),
      fill('st-r-2', 'What colour is the bag? Write one word.', ['red'], 'The text says Mina has a red bag.', 'red bag'),
      choice('st-r-3', 'What does Mina put in the bag?', ['A cup and a hat', 'A book and a pen', 'A toy and a ball'], 'A book and a pen', 'The second sentence names both objects.', 'a book and a pen'),
      choice('st-r-4', 'Where does Mina read?', ['By a tree', 'In a shop', 'On a bus'], 'By a tree', 'Mina sits by a tree and reads her book.', 'She sits by a tree and reads her book.'),
      choice('st-r-5', 'What happens last?', ['Mina puts a book in her bag.', 'Mina walks to the park.', 'Mina walks home.'], 'Mina walks home.', 'Then introduces the final action: she walks home.', 'Then she walks home.'),
    ],
    recap: 'You found the person, colour, objects, place and final action by checking the text.',
  },
  listening: {
    objective: 'Understand a greeting, a name and a polite request; practise speaking them.',
    teaching: [
      'Listen for a few useful words rather than trying to remember everything. Hello begins a conversation. Please makes a request polite. Thank you shows appreciation.',
      'Use Listen if your browser supports speech, or read the transcript. Listening answers are checked against the same words. Speaking practice is for you to try; this lesson does not record or grade your voice.',
    ],
    examples: [{ before: 'A greeting', after: 'Hello! My name is Leo.' }, { before: 'A polite request', after: 'Please pass the book. Thank you.' }],
    transcript: 'Hello! My name is Leo. Please pass the blue book. Thank you. Let us read together.',
    speakingPractice: 'Read aloud: “Hello! My name is … . Please pass the book. Thank you.” Use your own name. Take your time and repeat if you wish.',
    tasks: [
      choice('st-l-1', 'Which word begins the greeting?', ['Goodbye', 'Sorry', 'Hello'], 'Hello', 'The speaker begins with Hello.', 'Hello!'),
      fill('st-l-2', 'What is the speaker’s name?', ['Leo'], 'The speaker says, “My name is Leo.”', 'My name is Leo.'),
      choice('st-l-3', 'Which book does the speaker ask for?', ['The red book', 'The blue book', 'The green book'], 'The blue book', 'Listen or read for the colour blue.', 'the blue book'),
      choice('st-l-4', 'Which word makes the request polite?', ['book', 'blue', 'Please'], 'Please', 'Please makes “pass the blue book” a polite request.', 'Please pass the blue book.'),
      order('st-l-5', 'Build the final suggestion.', ['together.', 'read', 'Let', 'us'], 'Let us read together.', 'The speaker suggests reading together.', 'Let us read together.'),
    ],
    recap: 'You picked out a name and a request. Try a greeting, please and thank you in a real conversation.',
  },
  writing: {
    objective: 'Build a friendly short message with a name and clear punctuation.',
    teaching: [
      'A short message can start with Hello and a name. Say why you are writing in a simple sentence. Finish with your own name so the reader knows who wrote it.',
      'Use a capital letter for a person’s name and for I. Put a full stop at the end of a statement. These controlled tasks check specific words; your own extra writing is self-practice.',
    ],
    examples: [{ before: 'A friendly opening', after: 'Hello, Noor!' }, { before: 'A short message', after: 'I have your book. From, Alex.' }],
    tasks: [
      choice('st-w-1', 'Which opening uses the name correctly?', ['hello, noor', 'Hello, Noor!', 'hello Noor'], 'Hello, Noor!', 'Hello begins with a capital letter, and Noor is a name so it also begins with a capital.'),
      fill('st-w-2', 'Copy this name with a capital letter: alex', ['Alex'], 'Names begin with a capital letter: Alex. Letter case is checked in this task.', undefined, true),
      order('st-w-3', 'Build a clear message.', ['book.', 'your', 'have', 'I'], 'I have your book.', 'I have your book. tells the reader one complete idea.'),
      choice('st-w-4', 'Which mark ends this statement: I am here_', ['?', '.', ','], '.', 'A full stop ends this statement.'),
      fill('st-w-5', 'Finish the friendly closing: Thank ___!', ['you'], 'Thank you! is a friendly way to show appreciation.'),
    ],
    recap: 'Self-practice: write “Hello” to someone, add one useful sentence and sign your name. Compare your capitals and full stops with the examples; no automatic free-writing grade is given.',
  },
};
export default lessons;
