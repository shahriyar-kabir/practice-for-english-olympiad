/** Original Wizpiko practice prompts. Stable path IDs retain existing saved records. */
export type PracticePathId = 'beginners' | 'kids' | 'small-starts' | 'juniors' | 'high-flyers' | 'trailblazers' | 'seniors';
export type PracticeWord = { word: string; clue: string };
export type PracticeQuestion = { id: string; prompt: string; options: string[]; correct: string; explanation: string };
export type PracticePath = { id: PracticePathId; name: string; description: string; color: string; icon: string };

/** Starting points describe language skills, never age eligibility. */
export const practicePaths: readonly PracticePath[] = [
  {
    "id": "beginners",
    "name": "Word Sprouts",
    "description": "Connect small words to familiar objects and everyday messages.",
    "color": "#ff946b",
    "icon": "🌱"
  },
  {
    "id": "kids",
    "name": "Everyday Explorer",
    "description": "Read useful signs and make sense of daily tasks.",
    "color": "#edb92f",
    "icon": "🧭"
  },
  {
    "id": "small-starts",
    "name": "Story Sparks",
    "description": "Follow short stories, spot details and connect what happens.",
    "color": "#43b691",
    "icon": "📖"
  },
  {
    "id": "juniors",
    "name": "Conversation Corner",
    "description": "Practise clear requests, thoughtful replies and helpful updates.",
    "color": "#25aeb8",
    "icon": "💬"
  },
  {
    "id": "high-flyers",
    "name": "Meaning Makers",
    "description": "Read carefully, weigh word choices and check what evidence supports.",
    "color": "#5686e8",
    "icon": "🔎"
  },
  {
    "id": "trailblazers",
    "name": "Idea Builders",
    "description": "Organise reasons, compare proposals and shape useful ideas.",
    "color": "#9866d9",
    "icon": "🛠️"
  },
  {
    "id": "seniors",
    "name": "Clear Communicators",
    "description": "Write focused messages and communicate with clarity and care.",
    "color": "#de6aa0",
    "icon": "✉️"
  }
];

const practiceData: Record<PracticePathId, { words: PracticeWord[]; questions: PracticeQuestion[] }> = {
  "beginners": {
    "words": [
      {
        "word": "BAG",
        "clue": "I put my lunch inside this and carry it by its handles."
      },
      {
        "word": "CUP",
        "clue": "At breakfast, I pour my juice into this small drinking container."
      },
      {
        "word": "HAT",
        "clue": "Before going into the sunshine, I put this on my head."
      },
      {
        "word": "BED",
        "clue": "At the end of the day, I pull back its blanket and lie down."
      },
      {
        "word": "SOCK",
        "clue": "I put one on each foot before putting on my shoes."
      },
      {
        "word": "KEY",
        "clue": "I turn this small metal object to unlock the front door."
      },
      {
        "word": "PEN",
        "clue": "My writing tool leaves ink on the paper."
      },
      {
        "word": "MAP",
        "clue": "I look at this drawing to find the road to the park."
      },
      {
        "word": "DOOR",
        "clue": "I open this to move from the hall into a room."
      },
      {
        "word": "BOAT",
        "clue": "We climb aboard this small vessel to cross the lake."
      },
      {
        "word": "BUS",
        "clue": "At the stop, many passengers wait to board this road vehicle."
      },
      {
        "word": "SOAP",
        "clue": "I rub this with water to wash my hands."
      },
      {
        "word": "LAMP",
        "clue": "I switch this on beside my bed so I can read."
      },
      {
        "word": "COAT",
        "clue": "Before going out in cold weather, I wear this over my clothes."
      },
      {
        "word": "DESK",
        "clue": "I sit here to write, with my paper spread across its flat top."
      },
      {
        "word": "BELL",
        "clue": "When I press the bicycle button, this rings to warn people."
      },
      {
        "word": "TOWEL",
        "clue": "After washing my face, I use this cloth to dry it."
      },
      {
        "word": "PLATE",
        "clue": "At dinner, my rice and vegetables sit on this flat dish."
      },
      {
        "word": "GATE",
        "clue": "I push this open to walk through the garden fence."
      },
      {
        "word": "CORN",
        "clue": "The vegetable on my cob has rows of little yellow kernels."
      },
      {
        "word": "PEAR",
        "clue": "This fruit is narrow near its stalk and rounder at the bottom."
      },
      {
        "word": "BEAN",
        "clue": "I open a green pod and find this small seed inside."
      },
      {
        "word": "EGG",
        "clue": "I crack its shell before cooking it for breakfast."
      },
      {
        "word": "SPOON",
        "clue": "I use this utensil to scoop up my soup."
      },
      {
        "word": "FORK",
        "clue": "I pick up a piece of potato with this utensil's pointed prongs."
      },
      {
        "word": "NET",
        "clue": "At the beach, I hold this mesh tool to catch things in shallow water."
      },
      {
        "word": "TAP",
        "clue": "I turn this handle above the sink to make water flow."
      },
      {
        "word": "LID",
        "clue": "I lift this off the jar to reach what is inside."
      },
      {
        "word": "ROPE",
        "clue": "We use this thick, strong cord for a game of tug."
      },
      {
        "word": "ZIP",
        "clue": "I pull this fastener up to close my jacket."
      }
    ],
    "questions": [
      {
        "id": "beginners-01",
        "prompt": "I have a cup. I want water. What can I say?",
        "options": [
          "Good night.",
          "I would like a hat.",
          "Close the bag.",
          "Water, please."
        ],
        "correct": "Water, please.",
        "explanation": "“Water, please” asks politely for the drink you want."
      },
      {
        "id": "beginners-02",
        "prompt": "Read: “Put the pen in the bag.” Where does the pen go?",
        "options": [
          "By the tap",
          "Under the bed",
          "In the bag",
          "On the hat"
        ],
        "correct": "In the bag",
        "explanation": "The words “in the bag” tell you where to put the pen."
      },
      {
        "id": "beginners-03",
        "prompt": "Choose the word that completes the message: “My name ___ Nila.”",
        "options": [
          "be",
          "is",
          "are",
          "am"
        ],
        "correct": "is",
        "explanation": "Use “is” after “My name”: “My name is Nila.”"
      },
      {
        "id": "beginners-04",
        "prompt": "A sign says “OPEN”. You want to enter. What does the sign tell you?",
        "options": [
          "You may go in.",
          "The shop has moved.",
          "The shop is closed.",
          "You must go home."
        ],
        "correct": "You may go in.",
        "explanation": "“Open” tells you the place is ready for people to enter."
      },
      {
        "id": "beginners-05",
        "prompt": "Read: “I can see two hats.” How many hats are there?",
        "options": [
          "One",
          "Three",
          "Four",
          "Two"
        ],
        "correct": "Two",
        "explanation": "The sentence gives the number directly: two hats."
      },
      {
        "id": "beginners-06",
        "prompt": "Choose the sentence with a capital letter at the start and a full stop at the end.",
        "options": [
          "I have a bag",
          "i have a bag",
          "I have a bag.",
          "i have a bag."
        ],
        "correct": "I have a bag.",
        "explanation": "A complete written sentence starts with a capital letter and ends here with a full stop."
      },
      {
        "id": "beginners-07",
        "prompt": "Read: “The cup is on the desk.” Which thing is on the desk?",
        "options": [
          "The towel",
          "The cup",
          "The coat",
          "The key"
        ],
        "correct": "The cup",
        "explanation": "“The cup” is the thing placed on the desk."
      },
      {
        "id": "beginners-08",
        "prompt": "You finish using a pen that a friend lent you. What can you say when you give it back?",
        "options": [
          "Thank you.",
          "My name is a pen.",
          "Good morning, bed.",
          "I want to sleep."
        ],
        "correct": "Thank you.",
        "explanation": "“Thank you” shows that you appreciate your friend lending the pen."
      },
      {
        "id": "beginners-09",
        "prompt": "Choose the word that begins with the same letter as “bag”.",
        "options": [
          "cup",
          "hat",
          "pen",
          "bed"
        ],
        "correct": "bed",
        "explanation": "Both “bag” and “bed” begin with the letter b."
      },
      {
        "id": "beginners-10",
        "prompt": "Read: “Take a coat. It is cold outside.” What should you take?",
        "options": [
          "A fork",
          "A lid",
          "A coat",
          "A plate"
        ],
        "correct": "A coat",
        "explanation": "The instruction says “Take a coat” to help you stay warm."
      }
    ]
  },
  "kids": {
    "words": [
      {
        "word": "TICKET",
        "clue": "At the cinema entrance, I show the paper that proves I have paid."
      },
      {
        "word": "STATION",
        "clue": "I wait on its platform for the train to arrive."
      },
      {
        "word": "BAKERY",
        "clue": "I follow the smell of fresh bread into this shop."
      },
      {
        "word": "MARKET",
        "clue": "Different sellers display fruit and vegetables on stalls here."
      },
      {
        "word": "RECEIPT",
        "clue": "After I pay, the cashier gives me a record of what I bought."
      },
      {
        "word": "BASKET",
        "clue": "I carry a few groceries in this container with a handle."
      },
      {
        "word": "ENTRANCE",
        "clue": "The arrow points to the place where visitors should go in."
      },
      {
        "word": "EXIT",
        "clue": "This sign marks the way to leave the building."
      },
      {
        "word": "QUEUE",
        "clue": "We stand one behind another while waiting for our turn."
      },
      {
        "word": "CHANGE",
        "clue": "I pay with a larger note and the cashier returns the extra money as this."
      },
      {
        "word": "ADDRESS",
        "clue": "The envelope needs these details so the letter reaches the right home."
      },
      {
        "word": "POSTCARD",
        "clue": "On holiday, I send a short message on a card with a picture."
      },
      {
        "word": "STAMP",
        "clue": "I stick this on an envelope to pay for its journey by post."
      },
      {
        "word": "CORNER",
        "clue": "The directions tell me to turn where the two streets meet."
      },
      {
        "word": "PAVEMENT",
        "clue": "I walk along this raised part beside the road."
      },
      {
        "word": "CROSSING",
        "clue": "The marked place helps pedestrians move from one side of the road to the other."
      },
      {
        "word": "HELMET",
        "clue": "Before riding my bicycle, I fasten this protective cover on my head."
      },
      {
        "word": "POCKET",
        "clue": "I slip a small coin into this sewn part of my trousers."
      },
      {
        "word": "UMBRELLA",
        "clue": "When the rain starts, I open this cover above my head."
      },
      {
        "word": "SANDWICH",
        "clue": "For lunch, I put a filling between two slices of bread."
      },
      {
        "word": "CONTAINER",
        "clue": "I store yesterday's rice in this box with a lid."
      },
      {
        "word": "SHELF",
        "clue": "I place a jar on this flat board fixed above the counter."
      },
      {
        "word": "RECIPE",
        "clue": "This list of ingredients and steps helps me cook a new dish."
      },
      {
        "word": "CALENDAR",
        "clue": "I mark my appointment on the page that shows the month's dates."
      },
      {
        "word": "APPOINTMENT",
        "clue": "The dentist has reserved a particular time for my visit."
      },
      {
        "word": "ERRAND",
        "clue": "Picking up a parcel is the short practical trip I need to make."
      },
      {
        "word": "BORROW",
        "clue": "I take a friend's ruler, planning to give it back after using it."
      },
      {
        "word": "RETURN",
        "clue": "After reading a borrowed book, I take it back to its owner."
      },
      {
        "word": "PACKET",
        "clue": "I tear open this small sealed wrapping to reach the biscuits."
      },
      {
        "word": "PICNIC",
        "clue": "We carry lunch outside and eat it on a blanket in the park."
      }
    ],
    "questions": [
      {
        "id": "kids-01",
        "prompt": "A notice says: “Bread ready at 10. Please queue here.” What should a customer do while waiting?",
        "options": [
          "Walk straight into the kitchen.",
          "Wait at the railway platform.",
          "Leave money on the pavement.",
          "Stand in the line at the marked place."
        ],
        "correct": "Stand in the line at the marked place.",
        "explanation": "The instruction “Please queue here” asks customers to line up where indicated."
      },
      {
        "id": "kids-02",
        "prompt": "Yesterday I ___ a postcard to my friend. Choose the correct word.",
        "options": [
          "sending",
          "sends",
          "sent",
          "send"
        ],
        "correct": "sent",
        "explanation": "“Yesterday” places the action in the past, so use “sent”."
      },
      {
        "id": "kids-03",
        "prompt": "Lena borrows a basket from Amir. What does “borrows” tell us?",
        "options": [
          "She is selling the basket.",
          "She plans to give the basket back.",
          "She has bought the basket.",
          "She has thrown the basket away."
        ],
        "correct": "She plans to give the basket back.",
        "explanation": "Borrowing means using something that belongs to someone else and returning it."
      },
      {
        "id": "kids-04",
        "prompt": "Your bus stop is beside the bakery. Which direction is the clearest?",
        "options": [
          "Wait next to the bakery.",
          "Wait somewhere nice.",
          "Go very far.",
          "Find a thing outside."
        ],
        "correct": "Wait next to the bakery.",
        "explanation": "“Next to the bakery” gives a specific, useful location."
      },
      {
        "id": "kids-05",
        "prompt": "Read: “Bring a cup and a plate. Drinks are provided.” What do you need to bring?",
        "options": [
          "A bottle of juice only",
          "A cup and a recipe",
          "A plate and a stamp",
          "A cup and a plate"
        ],
        "correct": "A cup and a plate",
        "explanation": "The notice lists a cup and a plate; it says the drinks will be provided."
      },
      {
        "id": "kids-06",
        "prompt": "A recipe says: “Wash the beans before cooking them.” What does it tell you to do before cooking?",
        "options": [
          "Put the beans on a plate.",
          "Eat the beans.",
          "Wash the beans.",
          "Serve the cooked beans."
        ],
        "correct": "Wash the beans.",
        "explanation": "“Before” shows the order: wash first, then cook."
      },
      {
        "id": "kids-07",
        "prompt": "You cannot reach a packet on a high shelf. Which request fits?",
        "options": [
          "Where does this bus stop?",
          "Could you pass me that packet, please?",
          "Could you move the empty shelf, please?",
          "May I borrow your basket instead?"
        ],
        "correct": "Could you pass me that packet, please?",
        "explanation": "The request names the item and asks politely for the help needed."
      },
      {
        "id": "kids-08",
        "prompt": "Choose the complete sentence.",
        "options": [
          "The shop closes at six.",
          "The shop at six.",
          "Closes at the.",
          "At six the."
        ],
        "correct": "The shop closes at six.",
        "explanation": "“The shop closes at six” tells us who or what, the action, and when."
      },
      {
        "id": "kids-09",
        "prompt": "A calendar reminder reads: “Dentist, Tuesday, 3 pm.” What is the reminder about?",
        "options": [
          "A recipe",
          "A shop receipt",
          "A postcard picture",
          "An appointment"
        ],
        "correct": "An appointment",
        "explanation": "A dentist visit scheduled for a date and time is an appointment."
      },
      {
        "id": "kids-10",
        "prompt": "You want to keep a receipt because you may need to return a purchase. Which message explains that?",
        "options": [
          "Please put the bread in a bag.",
          "When does the shop open tomorrow?",
          "Please give me a receipt for this purchase.",
          "Could you tell me where the exit is?"
        ],
        "correct": "Please give me a receipt for this purchase.",
        "explanation": "A receipt records the purchase and may be needed when returning it."
      }
    ]
  },
  "small-starts": {
    "words": [
      {
        "word": "CHARACTER",
        "clue": "In the story, a gardener named Rafi speaks and makes choices; he is one of these."
      },
      {
        "word": "MESSAGE",
        "clue": "The note on the table tells Mei where to meet her friend."
      },
      {
        "word": "BEGINNING",
        "clue": "The first paragraph introduces a place before the adventure starts."
      },
      {
        "word": "ENDING",
        "clue": "The last lines reveal how the lost parcel finally reaches its owner."
      },
      {
        "word": "MIDDLE",
        "clue": "After the opening and before the final scene, this part develops the problem."
      },
      {
        "word": "DETAIL",
        "clue": "The writer mentions a red handle so readers can identify the right suitcase."
      },
      {
        "word": "TITLE",
        "clue": "The words above the story give its name."
      },
      {
        "word": "PAGE",
        "clue": "I turn this sheet of the book to keep reading."
      },
      {
        "word": "CHAPTER",
        "clue": "The novel's next numbered section begins after a short break."
      },
      {
        "word": "SCENE",
        "clue": "In this part of the story, everyone is gathered at the bus stop."
      },
      {
        "word": "ACTION",
        "clue": "The words “Mara lifted the lid” show something a person does."
      },
      {
        "word": "CLUE",
        "clue": "A muddy footprint gives the reader a hint about where the puppy went."
      },
      {
        "word": "EVENT",
        "clue": "The lights going out is one thing that happens during the story."
      },
      {
        "word": "REASON",
        "clue": "The words after “because” explain why the character stayed inside."
      },
      {
        "word": "RESULT",
        "clue": "The floor becomes wet after the character spills a glass of water."
      },
      {
        "word": "PROMISE",
        "clue": "The narrator says, “I will bring your scarf back tomorrow,” giving this assurance."
      },
      {
        "word": "CHOICE",
        "clue": "At a fork in the path, the walker must decide which route to take."
      },
      {
        "word": "MEMORY",
        "clue": "The smell of bread brings back the narrator's thoughts of an earlier visit."
      },
      {
        "word": "SURPRISE",
        "clue": "The missing painting is behind the door, a discovery nobody expected."
      },
      {
        "word": "RETELL",
        "clue": "After reading, I explain the story again in my own words."
      },
      {
        "word": "LISTEN",
        "clue": "I pay attention with my ears while someone reads the dialogue aloud."
      },
      {
        "word": "NOTICE",
        "clue": "The character spots a tiny arrow that everyone else has missed."
      },
      {
        "word": "FOLLOW",
        "clue": "As I read a recipe story, I track each step in the order it happens."
      },
      {
        "word": "PAIR",
        "clue": "Two matching gloves make one of these."
      },
      {
        "word": "ORDER",
        "clue": "First, next and finally help show how the events are arranged."
      },
      {
        "word": "POINT",
        "clue": "When a reader says what matters most, they explain the main one."
      },
      {
        "word": "VOICE",
        "clue": "The narrator sounds excited in the way the story is told."
      },
      {
        "word": "PAUSE",
        "clue": "A reader briefly stops at a full stop before continuing aloud."
      },
      {
        "word": "SEARCH",
        "clue": "The characters look through every cupboard to find the missing tin."
      },
      {
        "word": "FINISH",
        "clue": "I read the last line and complete the story."
      }
    ],
    "questions": [
      {
        "id": "small-starts-01",
        "prompt": "Read: “Mina put the seed tray beside the window. She wanted the young plants to get more light.” Why did she move the tray?",
        "options": [
          "To hide the tray from visitors.",
          "To keep the plants in darkness.",
          "To make space for a television.",
          "To give the plants more light."
        ],
        "correct": "To give the plants more light.",
        "explanation": "The second sentence states her reason: she wanted the plants to get more light."
      },
      {
        "id": "small-starts-02",
        "prompt": "Read: “The parcel felt light, but it made a soft rattle when Jo moved it.” Which detail describes a sound?",
        "options": [
          "It felt light.",
          "Jo moved it.",
          "It made a soft rattle.",
          "It was a parcel."
        ],
        "correct": "It made a soft rattle.",
        "explanation": "A rattle is a sound; the other details describe the object, its weight or an action."
      },
      {
        "id": "small-starts-03",
        "prompt": "A story begins at a busy station and ends in a quiet village. Which statement is supported?",
        "options": [
          "Every scene takes place in one room.",
          "The setting changes during the story.",
          "Every character lives at the station.",
          "The story gives no information about places."
        ],
        "correct": "The setting changes during the story.",
        "explanation": "The locations given at the beginning and end are different, so the setting changes."
      },
      {
        "id": "small-starts-04",
        "prompt": "Read: “First, Nuri drew the shape. Next, he cut it out. Finally, he painted it.” What did Nuri do immediately before painting?",
        "options": [
          "He cut out the shape.",
          "He drew a new shape.",
          "He put the paint away.",
          "He washed the window."
        ],
        "correct": "He cut out the shape.",
        "explanation": "“Next” introduces cutting, which comes directly before the final painting step."
      },
      {
        "id": "small-starts-05",
        "prompt": "Read: “Asha checked the clock and hurried towards the platform.” Which is a reasonable inference?",
        "options": [
          "She has definitely lost her ticket.",
          "She owns the station.",
          "She is searching for a beach.",
          "She may be concerned about missing a train."
        ],
        "correct": "She may be concerned about missing a train.",
        "explanation": "The clock, hurry and platform suggest a train deadline, but they do not prove that she lost a ticket."
      },
      {
        "id": "small-starts-06",
        "prompt": "Which title best fits a story about neighbours working together to repair a broken garden gate?",
        "options": [
          "A Guide to Cloud Shapes",
          "My Favourite Sandwich Filling",
          "A Gate We Fixed Together",
          "The Deepest Ocean"
        ],
        "correct": "A Gate We Fixed Together",
        "explanation": "The chosen title reflects both the gate repair and the neighbours working together."
      },
      {
        "id": "small-starts-07",
        "prompt": "Read: “Eli left a note: ‘I have taken the blue bag. The green one is yours.’” Which bag is available for the reader of the note?",
        "options": [
          "Both bags have been taken",
          "The green bag",
          "The blue bag",
          "A red bag"
        ],
        "correct": "The green bag",
        "explanation": "Eli says the green bag belongs to the person reading the note."
      },
      {
        "id": "small-starts-08",
        "prompt": "Read: “Tara felt worried before her first practice. After a friendly welcome, she relaxed.” What changes?",
        "options": [
          "Tara feels more comfortable.",
          "The practice moves to another city.",
          "The welcome becomes unfriendly.",
          "Tara becomes more worried."
        ],
        "correct": "Tara feels more comfortable.",
        "explanation": "The word “relaxed” shows that her earlier worry has eased."
      },
      {
        "id": "small-starts-09",
        "prompt": "Which sentence would clearly tell a reader that a story is moving to an earlier event?",
        "options": [
          "The door is beside the window.",
          "The door has a round handle.",
          "Someone opens the door now.",
          "The day before, the same door had been locked."
        ],
        "correct": "The day before, the same door had been locked.",
        "explanation": "“The day before” signals that the narration is looking back to an earlier time."
      },
      {
        "id": "small-starts-10",
        "prompt": "Read: “Rain stopped the outdoor show, so the musicians played inside the hall.” Which is the best short retelling?",
        "options": [
          "The outdoor show continued in the rain.",
          "The hall was too small to enter.",
          "The musicians moved inside because it rained.",
          "The musicians forgot every instrument."
        ],
        "correct": "The musicians moved inside because it rained.",
        "explanation": "This retelling keeps the cause, the rain, and the main action, moving the performance indoors."
      }
    ]
  },
  "juniors": {
    "words": [
      {
        "word": "GREETING",
        "clue": "At the start of a call, “Hello, Sam” welcomes the listener."
      },
      {
        "word": "REPLY",
        "clue": "After a message arrives, I write back with an answer."
      },
      {
        "word": "REQUEST",
        "clue": "“Could you open the window?” asks someone to do something."
      },
      {
        "word": "OFFER",
        "clue": "“I can carry that bag for you” volunteers some help."
      },
      {
        "word": "INVITE",
        "clue": "I ask a neighbour to join us for lunch."
      },
      {
        "word": "ACCEPT",
        "clue": "When I say “Yes, I would like to come,” I agree to an invitation."
      },
      {
        "word": "DECLINE",
        "clue": "I say “Thank you, but I cannot come” to turn down an invitation politely."
      },
      {
        "word": "REPEAT",
        "clue": "The line is noisy, so I ask the speaker to say the address again."
      },
      {
        "word": "CONFIRM",
        "clue": "Before booking, I check that the date we agreed on is correct."
      },
      {
        "word": "POLITE",
        "clue": "“Please” and a respectful tone can make a request sound this way."
      },
      {
        "word": "RESPECT",
        "clue": "I let a speaker finish, showing that I value their turn."
      },
      {
        "word": "VOLUME",
        "clue": "I lower this so my voice does not disturb other people."
      },
      {
        "word": "PRONOUN",
        "clue": "In “Ari brought a coat; he wore it,” he replaces Ari as this kind of word."
      },
      {
        "word": "VERB",
        "clue": "In “We repair bicycles,” repair is this type of action word."
      },
      {
        "word": "QUESTION",
        "clue": "“Where should we meet?” asks for information."
      },
      {
        "word": "STATEMENT",
        "clue": "“The room is ready” gives information without asking anything."
      },
      {
        "word": "APOLOGY",
        "clue": "“I am sorry I kept you waiting” expresses this after a delay."
      },
      {
        "word": "THANKS",
        "clue": "I express these after someone gives me useful help."
      },
      {
        "word": "BOUNDARY",
        "clue": "“Please do not share my number” sets a limit others should respect."
      },
      {
        "word": "TURN",
        "clue": "I wait for mine before adding a comment to the conversation."
      },
      {
        "word": "AGREE",
        "clue": "“That plan works for me too” shows that I share the view."
      },
      {
        "word": "DISAGREE",
        "clue": "“I see it differently” signals that my view is not the same."
      },
      {
        "word": "EXPLAIN",
        "clue": "When someone is unsure, I give reasons and details to make the idea clear."
      },
      {
        "word": "CLARIFY",
        "clue": "I ask whether “next Friday” means this week or the following week."
      },
      {
        "word": "SUGGEST",
        "clue": "“We could meet at the library” puts forward one possible plan."
      },
      {
        "word": "ARRANGE",
        "clue": "We decide the place and time for our meeting."
      },
      {
        "word": "REMIND",
        "clue": "I send a short note to help a friend remember an appointment."
      },
      {
        "word": "CHECK",
        "clue": "I read the address again to make sure I have written it correctly."
      },
      {
        "word": "UPDATE",
        "clue": "I send the new meeting time after the plan changes."
      },
      {
        "word": "INTRODUCE",
        "clue": "At a gathering, I tell two people each other's names."
      }
    ],
    "questions": [
      {
        "id": "juniors-01",
        "prompt": "A colleague says, “Let us meet next Friday.” You are unsure which date they mean. Which reply checks the meaning?",
        "options": [
          "Friday is a good day for me.",
          "I will bring the meeting notes.",
          "How many people are coming?",
          "Do you mean Friday the 12th or Friday the 19th?"
        ],
        "correct": "Do you mean Friday the 12th or Friday the 19th?",
        "explanation": "Giving the two possible dates asks the speaker to resolve the specific uncertainty."
      },
      {
        "id": "juniors-02",
        "prompt": "You borrowed a neighbour’s ladder and will be late returning it. Which message is most helpful?",
        "options": [
          "I will return it at some point.",
          "Your ladder is taller than mine.",
          "I am sorry for the delay. May I return the ladder tomorrow morning?",
          "I borrowed a ladder last week."
        ],
        "correct": "I am sorry for the delay. May I return the ladder tomorrow morning?",
        "explanation": "The message acknowledges the delay and asks permission for a clear new return time."
      },
      {
        "id": "juniors-03",
        "prompt": "Choose the sentence that correctly describes an activity happening now.",
        "options": [
          "They are set up the chairs now.",
          "They are setting up the chairs.",
          "They setting up the chairs.",
          "They is setting up the chairs."
        ],
        "correct": "They are setting up the chairs.",
        "explanation": "For an action in progress with “they”, use “are” plus the -ing form: “are setting”."
      },
      {
        "id": "juniors-04",
        "prompt": "A friend offers to carry your bag. You would like the help. Which response accepts the offer?",
        "options": [
          "Yes, please. Thank you for helping.",
          "No, thank you. I can manage.",
          "Where did you buy your shoes?",
          "I disagree with the timetable."
        ],
        "correct": "Yes, please. Thank you for helping.",
        "explanation": "“Yes, please” clearly accepts the help, and the thanks acknowledge the offer."
      },
      {
        "id": "juniors-05",
        "prompt": "Which message sets a clear, respectful privacy boundary?",
        "options": [
          "My phone number has changed.",
          "You can ring me in the afternoon.",
          "I spoke to you on the phone yesterday.",
          "Please ask me before sharing my phone number."
        ],
        "correct": "Please ask me before sharing my phone number.",
        "explanation": "The request names the private information and states that permission is needed before sharing it."
      },
      {
        "id": "juniors-06",
        "prompt": "Read: “The meeting has moved from Room 2 to Room 4. The time is unchanged.” What should you tell a participant?",
        "options": [
          "Go to Room 4 on a different day.",
          "The meeting has been cancelled.",
          "Go to Room 4 at the original time.",
          "Go to Room 2 an hour later."
        ],
        "correct": "Go to Room 4 at the original time.",
        "explanation": "Only the room changes; “the time is unchanged” keeps the original start time."
      },
      {
        "id": "juniors-07",
        "prompt": "You disagree with a proposed plan. Which reply makes room for discussion?",
        "options": [
          "I will change the subject without explaining.",
          "I have a concern about the cost. Could we compare another option?",
          "Your idea is silly, so stop talking.",
          "Every plan is always perfect."
        ],
        "correct": "I have a concern about the cost. Could we compare another option?",
        "explanation": "This reply identifies a specific concern and invites a useful next step without attacking the person."
      },
      {
        "id": "juniors-08",
        "prompt": "Read: “Please bring your notebook. You do not need a laptop.” Which reply confirms that you understood?",
        "options": [
          "I will bring my notebook and leave my laptop at home.",
          "I will bring only my laptop.",
          "I will bring neither item.",
          "I will ask everyone to bring a laptop."
        ],
        "correct": "I will bring my notebook and leave my laptop at home.",
        "explanation": "The reply follows both parts of the instruction: bring the notebook and no laptop is required."
      },
      {
        "id": "juniors-09",
        "prompt": "A caller speaks too quietly for you to hear an address. Which request fits?",
        "options": [
          "Could you change your address now?",
          "Why are all addresses incorrect?",
          "Please send a parcel before I know the address.",
          "Could you speak a little louder and repeat the address, please?"
        ],
        "correct": "Could you speak a little louder and repeat the address, please?",
        "explanation": "The request explains the practical need: a louder voice and another reading of the address."
      },
      {
        "id": "juniors-10",
        "prompt": "Choose the sentence in which “it” clearly refers to the umbrella.",
        "options": [
          "I saw the umbrella near the bench, but it was freshly painted.",
          "I left the umbrella beside the vase before it fell over.",
          "I found the umbrella and put it by the door.",
          "I placed the umbrella beside the suitcase, but it was too heavy."
        ],
        "correct": "I found the umbrella and put it by the door.",
        "explanation": "The umbrella is the clear object being found and then placed by the door."
      }
    ]
  },
  "high-flyers": {
    "words": [
      {
        "word": "QUALIFY",
        "clue": "Add “in this small trial” to limit a claim rather than state it absolutely."
      },
      {
        "word": "SIGNAL",
        "clue": "A falling water level can give this kind of warning that a tank needs checking."
      },
      {
        "word": "ESTIMATE",
        "clue": "A builder gives an approximate price before measuring every detail."
      },
      {
        "word": "SAMPLE",
        "clue": "Ten jars checked from a shipment of one thousand form this smaller group."
      },
      {
        "word": "TREND",
        "clue": "A line that rises over several months may show this general direction."
      },
      {
        "word": "EXCEPTION",
        "clue": "The shop opens daily; a public holiday is the one case outside that rule."
      },
      {
        "word": "MEASURE",
        "clue": "Use the same ruler each time to find the length of a growing plant."
      },
      {
        "word": "RELEVANT",
        "clue": "For a question about travel costs, ticket prices are this kind of information."
      },
      {
        "word": "SUPPORT",
        "clue": "Several independent records can do this for an explanation without proving it completely."
      },
      {
        "word": "CAUTION",
        "clue": "A reader shows this care before accepting a striking but poorly sourced claim."
      },
      {
        "word": "TENTATIVE",
        "clue": "A booking marked “not yet confirmed” has this provisional status."
      },
      {
        "word": "OMIT",
        "clue": "Leave a personal phone number out of a public version of a report."
      },
      {
        "word": "FOCUS",
        "clue": "Keep an answer centred on the question instead of adding unrelated stories."
      },
      {
        "word": "IMPLY",
        "clue": "“Even Priya finished” may suggest that finishing was unexpected, without saying so directly."
      },
      {
        "word": "SCOPE",
        "clue": "A survey of one street has a narrower one of these than a national survey."
      },
      {
        "word": "RELATIVE",
        "clue": "A desk can be large compared with one desk and small compared with another."
      },
      {
        "word": "PATTERN",
        "clue": "Three repeated sets of blue, green and yellow create one you can recognise."
      },
      {
        "word": "VARIABLE",
        "clue": "In a test of two recipes, the amount of sugar is a factor that can change."
      },
      {
        "word": "OBSERVE",
        "clue": "Watch what actually happens to the seeds and write it down."
      },
      {
        "word": "REVISE",
        "clue": "Change a conclusion when a newly checked record no longer fits it."
      },
      {
        "word": "LITERAL",
        "clue": "“The room has four walls” uses words in their direct, ordinary sense."
      },
      {
        "word": "FIGURATIVE",
        "clue": "Calling a busy station “a river of people” uses this kind of language."
      },
      {
        "word": "CERTAIN",
        "clue": "A statement presented with no doubt sounds this way, even if its evidence is weak."
      },
      {
        "word": "LIKELY",
        "clue": "A forecast may use this word when rain is probable but not guaranteed."
      },
      {
        "word": "SOURCE",
        "clue": "The named report behind a statistic is where a reader can trace it."
      },
      {
        "word": "VERIFY",
        "clue": "Check a quoted opening date against the organisation’s current notice."
      },
      {
        "word": "ATTRIBUTE",
        "clue": "Name the speaker when you report an opinion that belongs to them."
      },
      {
        "word": "CONSISTENT",
        "clue": "Results that agree across repeated checks can be described this way."
      },
      {
        "word": "UNRELATED",
        "clue": "A customer’s favourite colour has no connection to whether a parcel arrived."
      },
      {
        "word": "ALTERNATIVE",
        "clue": "A second explanation worth checking before you settle on the first."
      }
    ],
    "questions": [
      {
        "id": "high-flyers-01",
        "prompt": "A library survey asked 20 visitors on Tuesday. Sixteen wanted longer opening hours. Which statement matches the evidence?",
        "options": [
          "Sixteen of every twenty library members want longer hours.",
          "Four fifths of all town residents want longer library hours.",
          "Longer hours matter more to Tuesday visitors than to weekend visitors.",
          "Sixteen of the visitors surveyed wanted longer hours."
        ],
        "correct": "Sixteen of the visitors surveyed wanted longer hours.",
        "explanation": "The survey describes those 20 visitors. It does not establish what every member wants or what hours are practical."
      },
      {
        "id": "high-flyers-02",
        "prompt": "The notice says: “The new route may reduce journey times.” What does “may” communicate?",
        "options": [
          "A record of a benefit already measured.",
          "A rule that passengers must arrive early.",
          "A possible benefit that is not guaranteed.",
          "A promise that every journey will be shorter."
        ],
        "correct": "A possible benefit that is not guaranteed.",
        "explanation": "“May” marks possibility. The sentence does not report a completed measurement or guarantee a result."
      },
      {
        "id": "high-flyers-03",
        "prompt": "A café sold more soup on a cold day than on a warm day. Which conclusion needs more evidence?",
        "options": [
          "The two days alone cannot show what happens every day.",
          "Cold weather always makes every customer buy soup.",
          "The café sold different amounts on the two days.",
          "The cold day had higher soup sales in this comparison."
        ],
        "correct": "Cold weather always makes every customer buy soup.",
        "explanation": "Two daily totals cannot establish an “always” rule or the choice of every individual customer."
      },
      {
        "id": "high-flyers-04",
        "prompt": "A review says, “The tiny flat was a palace after the crowded train.” Which reading best fits the comparison?",
        "options": [
          "The flat felt spacious or comfortable compared with the train.",
          "The flat was owned by a royal family.",
          "The train travelled through a palace.",
          "The flat became physically larger during the journey."
        ],
        "correct": "The flat felt spacious or comfortable compared with the train.",
        "explanation": "“A palace” is a figurative comparison here. The phrase describes the traveller’s experience, not a literal change of building."
      },
      {
        "id": "high-flyers-05",
        "prompt": "You need tomorrow’s museum opening time. Which source is the most direct place to verify it?",
        "options": [
          "A visitor’s blog about a trip six months ago.",
          "An undated opening-hours poster shared in a group chat.",
          "A guidebook printed before the current year.",
          "The museum’s current visitor-information page."
        ],
        "correct": "The museum’s current visitor-information page.",
        "explanation": "Current information from the organisation responsible for the opening time is the most direct source among these choices."
      },
      {
        "id": "high-flyers-06",
        "prompt": "Two explanations fit a higher electricity bill: increased use or a higher tariff. What should a careful comparison check?",
        "options": [
          "Only the price per unit, without checking how much was used.",
          "Only the final total, without separating use from price.",
          "Both the usage figures and the price per unit.",
          "Only the number of units used, without checking the tariff."
        ],
        "correct": "Both the usage figures and the price per unit.",
        "explanation": "Either increased use or a higher price can affect the total. Checking both helps distinguish the explanations."
      },
      {
        "id": "high-flyers-07",
        "prompt": "Read: “Mina says the repair is urgent; the inspection report has not arrived.” Which summary preserves who made the judgement?",
        "options": [
          "The inspection has proved that Mina is wrong.",
          "Mina considers the repair urgent, while the report is still pending.",
          "The inspection report confirms that the repair is urgent.",
          "Everyone agrees that the repair can wait."
        ],
        "correct": "Mina considers the repair urgent, while the report is still pending.",
        "explanation": "This attributes the judgement to Mina and keeps the report’s status separate from her opinion."
      },
      {
        "id": "high-flyers-08",
        "prompt": "In three repeat measurements, a shelf is 80 cm, 80 cm and 81 cm wide. Which description fits these readings?",
        "options": [
          "They are close to one another.",
          "They prove the ruler is perfectly accurate.",
          "They prove the shelf grew by one centimetre during the checks.",
          "They are all exactly the same measurement."
        ],
        "correct": "They are close to one another.",
        "explanation": "The readings differ by only one centimetre. Agreement alone does not prove that the measuring tool is accurate."
      },
      {
        "id": "high-flyers-09",
        "prompt": "A report studies bus stops within one town. Which sentence keeps its conclusion within that scope?",
        "options": [
          "All transport systems everywhere need identical signs.",
          "No traveller outside the town can read a map.",
          "Every town has exactly the same bus-stop problem.",
          "Several stops in the town need clearer signs."
        ],
        "correct": "Several stops in the town need clearer signs.",
        "explanation": "The study concerns one town. Its findings cannot automatically describe every other place."
      },
      {
        "id": "high-flyers-10",
        "prompt": "A headline says, “New lamps caused the fall in accidents.” The article reports fewer accidents after installation but checks no other changes. Which revision is more careful?",
        "options": [
          "No change in accidents was recorded.",
          "The lamps must have had no effect at all.",
          "Accidents fell after the lamps were installed; other possible causes still need checking.",
          "The lamps have certainly prevented every accident."
        ],
        "correct": "Accidents fell after the lamps were installed; other possible causes still need checking.",
        "explanation": "The sequence is reported, but the evidence described does not isolate the lamps as the cause or rule out an effect."
      }
    ]
  },
  "trailblazers": {
    "words": [
      {
        "word": "OUTLINE",
        "clue": "Before writing the full proposal, list the main points in a simple plan."
      },
      {
        "word": "LINK",
        "clue": "Connect a proposed change to the reason it is needed."
      },
      {
        "word": "EXAMPLE",
        "clue": "A short description of one successful repair can make a general point concrete."
      },
      {
        "word": "PRIORITY",
        "clue": "A team marks the leaking roof as its first task rather than a later extra."
      },
      {
        "word": "FEEDBACK",
        "clue": "Comments from people who try a draft can guide the next version."
      },
      {
        "word": "DRAFT",
        "clue": "A first version of a message that is still open to changes."
      },
      {
        "word": "REASON",
        "clue": "Explain why you recommend a shaded waiting area."
      },
      {
        "word": "PROPOSAL",
        "clue": "A written suggestion asks the council to add seats near the bus stop."
      },
      {
        "word": "BENEFIT",
        "clue": "Less time spent carrying water is a helpful result of the new tap."
      },
      {
        "word": "DRAWBACK",
        "clue": "A useful machine may still have the disadvantage of a high repair bill."
      },
      {
        "word": "CONTRAST",
        "clue": "Set a quiet reading room beside a noisy hall to show their difference."
      },
      {
        "word": "BALANCE",
        "clue": "Give a proposal’s strengths and limitations fair attention in the same review."
      },
      {
        "word": "OUTCOME",
        "clue": "After a trial ends, describe what actually resulted from it."
      },
      {
        "word": "RESOURCE",
        "clue": "Staff time, tools and funds are things a project can use."
      },
      {
        "word": "PILOT",
        "clue": "Try a new collection service in one neighbourhood before expanding it."
      },
      {
        "word": "COST",
        "clue": "The money needed to install and maintain new equipment."
      },
      {
        "word": "DETAIL",
        "clue": "Add the exact collection point instead of writing only “meet nearby”."
      },
      {
        "word": "STANCE",
        "clue": "A writer’s clear position on whether the plan should go ahead."
      },
      {
        "word": "SUMMARY",
        "clue": "A short account collects the key points without repeating the whole discussion."
      },
      {
        "word": "TRANSITION",
        "clue": "A phrase such as “however” helps move between connected parts of a text."
      },
      {
        "word": "JUSTIFY",
        "clue": "Show how the expected benefit supports the money you ask to spend."
      },
      {
        "word": "REFINE",
        "clue": "Make a rough plan more precise after checking what users need."
      },
      {
        "word": "TEST",
        "clue": "Try the revised instructions with a reader before printing them widely."
      },
      {
        "word": "REVIEW",
        "clue": "Look back at what worked and what needs changing after an event."
      },
      {
        "word": "GOAL",
        "clue": "The result a project intends to achieve, such as reducing litter."
      },
      {
        "word": "OPTION",
        "clue": "One possible choice among several ways to solve the same problem."
      },
      {
        "word": "IMPROVE",
        "clue": "Make an existing arrangement work better than it did before."
      },
      {
        "word": "FEASIBLE",
        "clue": "A plan fits the time, funds and people actually available."
      },
      {
        "word": "RECOMMEND",
        "clue": "Advise the team to choose the option your reasons support."
      },
      {
        "word": "COMPROMISE",
        "clue": "Two groups each accept part of what the other wants to reach agreement."
      }
    ],
    "questions": [
      {
        "id": "trailblazers-01",
        "prompt": "A hall needs more seating. The floor must be cleared after events, and there is little storage space. Which proposal addresses these needs together?",
        "options": [
          "Install fixed sofas across the middle of the hall.",
          "Order the cheapest chairs without checking how they will be stored.",
          "Keep additional fixed chairs in place after every event.",
          "Buy folding chairs that can be stored after events."
        ],
        "correct": "Buy folding chairs that can be stored after events.",
        "explanation": "Folding chairs respond to the need for seats while considering the stated storage limitation."
      },
      {
        "id": "trailblazers-02",
        "prompt": "Choose the best connector: “The new printer costs less to buy. ___, its ink is more expensive.”",
        "options": [
          "In the same way",
          "As a result of this agreement",
          "However",
          "For example"
        ],
        "correct": "However",
        "explanation": "The second sentence introduces a disadvantage that contrasts with the lower purchase price."
      },
      {
        "id": "trailblazers-03",
        "prompt": "A proposal begins, “We should place a water refill point beside the playground.” Which sentence gives a relevant reason?",
        "options": [
          "The first version of the proposal was printed last week.",
          "People using the playground currently walk to another building for drinking water.",
          "The playground opens at eight each morning.",
          "The project team uses the same meeting room every month."
        ],
        "correct": "People using the playground currently walk to another building for drinking water.",
        "explanation": "This explains the need that the proposed refill point would address."
      },
      {
        "id": "trailblazers-04",
        "prompt": "A team can trial a new queue system at one event before adopting it everywhere. What is the strongest purpose of that trial?",
        "options": [
          "To observe how the system works before making a wider commitment.",
          "To guarantee that every future event will have no queues.",
          "To avoid gathering comments from visitors.",
          "To prove that the old system has never worked."
        ],
        "correct": "To observe how the system works before making a wider commitment.",
        "explanation": "A limited trial provides practical evidence and can reveal adjustments needed before expansion."
      },
      {
        "id": "trailblazers-05",
        "prompt": "A garden proposal lists its benefits but gives no information about upkeep. Which question fills that gap?",
        "options": [
          "What colour should the opening-day invitation be?",
          "Which month would suit an opening celebration?",
          "How should the project name appear on the entrance sign?",
          "Who will water and maintain the garden after it opens?"
        ],
        "correct": "Who will water and maintain the garden after it opens?",
        "explanation": "Long-term maintenance is a practical requirement that the stated benefits do not answer."
      },
      {
        "id": "trailblazers-06",
        "prompt": "Read these notes: “Ten residents tried the collection box. Eight found it easy to use. Two could not reach the slot.” Which recommendation uses all the feedback?",
        "options": [
          "Remove the slot entirely without trying an adjusted height.",
          "Make the slot higher without consulting the people who could not reach it.",
          "Keep the simple design and test a lower slot.",
          "Adopt it unchanged because most responses were positive."
        ],
        "correct": "Keep the simple design and test a lower slot.",
        "explanation": "This preserves a reported strength while responding to the access problem raised by two residents."
      },
      {
        "id": "trailblazers-07",
        "prompt": "Which project goal states both a numerical target and a period for checking it?",
        "options": [
          "Look for better ways to share meeting papers this term.",
          "Reduce paper used for meeting handouts by half this term.",
          "Reduce paper used for meeting handouts whenever possible.",
          "Reduce the use of meeting handouts by a large amount."
        ],
        "correct": "Reduce paper used for meeting handouts by half this term.",
        "explanation": "It names the thing to change, the amount of change and the period for checking progress."
      },
      {
        "id": "trailblazers-08",
        "prompt": "A writer recommends a free online form because it is easy to edit. Which sentence fairly acknowledges a limitation?",
        "options": [
          "People without internet access will need another way to respond.",
          "The form can be edited after it is published.",
          "Responses can be collected in one place.",
          "The team can choose a simple colour scheme."
        ],
        "correct": "People without internet access will need another way to respond.",
        "explanation": "This identifies a practical access limitation without ignoring the form’s stated benefit."
      },
      {
        "id": "trailblazers-09",
        "prompt": "Which order presents the problem first, a proposed solution’s benefit next, and a final recommendation last? A: “A lockable rack would keep the tools together.” B: “Tools are often misplaced after workshops.” C: “I recommend a rack beside the workbench.”",
        "options": [
          "B, C, A",
          "A, B, C",
          "C, B, A",
          "B, A, C"
        ],
        "correct": "B, A, C",
        "explanation": "B identifies the problem; A explains what a solution would achieve; C gives the final recommendation. This is the order requested."
      },
      {
        "id": "trailblazers-10",
        "prompt": "Two clubs want the same room: one needs quiet practice and the other needs a meeting area. Which response offers a workable compromise?",
        "options": [
          "Tell both clubs their needs are irrelevant.",
          "Promise the room to both clubs for the same time.",
          "Agree separate time slots and review whether the arrangement meets both clubs’ needs.",
          "Give the room to the first person who complains."
        ],
        "correct": "Agree separate time slots and review whether the arrangement meets both clubs’ needs.",
        "explanation": "Separate slots recognise both uses and provide a chance to adjust the agreement after trying it."
      }
    ]
  },
  "seniors": {
    "words": [
      {
        "word": "REQUEST",
        "clue": "Ask a colleague to send the missing delivery note."
      },
      {
        "word": "ATTACHMENT",
        "clue": "A document travels with your email as a separate file."
      },
      {
        "word": "SUBJECT",
        "clue": "The short heading above an email helps readers identify its purpose."
      },
      {
        "word": "CLARIFY",
        "clue": "Ask what “next Friday” means when the date is uncertain."
      },
      {
        "word": "CONFIRM",
        "clue": "Check and state that the booking is definitely for twelve people."
      },
      {
        "word": "DEADLINE",
        "clue": "The final date by which the completed form must arrive."
      },
      {
        "word": "RECIPIENT",
        "clue": "The person or team your message is addressed to."
      },
      {
        "word": "UPDATE",
        "clue": "Send the latest information when a delivery arrangement changes."
      },
      {
        "word": "ACKNOWLEDGE",
        "clue": "Let a sender know you have received their message before a full reply is ready."
      },
      {
        "word": "CONSENT",
        "clue": "Permission given before someone uses your photo in a newsletter."
      },
      {
        "word": "ACCESS",
        "clue": "A readable file format helps more people get to and use the information."
      },
      {
        "word": "FORMAT",
        "clue": "Choose whether a shared document should be a spreadsheet or a PDF."
      },
      {
        "word": "REVISION",
        "clue": "A changed version of a document replaces an earlier draft."
      },
      {
        "word": "AGENDA",
        "clue": "A list of topics is circulated before the meeting begins."
      },
      {
        "word": "MINUTES",
        "clue": "The written record of decisions and agreed actions from a meeting."
      },
      {
        "word": "REMINDER",
        "clue": "A brief message prompts someone about an agreed task or appointment."
      },
      {
        "word": "SPECIFY",
        "clue": "State the exact model number instead of asking vaguely for “that part”."
      },
      {
        "word": "COURTEOUS",
        "clue": "A firm request can still be respectful and considerate in its wording."
      },
      {
        "word": "CONCISE",
        "clue": "A message gives the needed information in a small number of clear words."
      },
      {
        "word": "ACTION",
        "clue": "The next thing a reader is being asked to do."
      },
      {
        "word": "PLAIN",
        "clue": "Everyday wording can be clearer than specialist jargon for a broad audience."
      },
      {
        "word": "CHECKLIST",
        "clue": "A short list helps a team confirm that each preparation task is complete."
      },
      {
        "word": "ADDRESS",
        "clue": "Check this destination carefully before sending a private email."
      },
      {
        "word": "REDACT",
        "clue": "Remove a private account number from a screenshot before sharing it."
      },
      {
        "word": "HANDOVER",
        "clue": "A departing shift passes essential information to the team taking over."
      },
      {
        "word": "APPROVAL",
        "clue": "A plan needs the responsible person’s agreement before work can start."
      },
      {
        "word": "OPTIONAL",
        "clue": "An extra workshop may be attended by choice rather than by requirement."
      },
      {
        "word": "MANDATORY",
        "clue": "A required safety check must be completed before the equipment is used."
      },
      {
        "word": "RESCHEDULE",
        "clue": "Move an appointment to another agreed date or time."
      },
      {
        "word": "AVAILABLE",
        "clue": "A person who is free to join a meeting at the proposed time."
      }
    ],
    "questions": [
      {
        "id": "seniors-01",
        "prompt": "An email asks a colleague to check a revised invoice by Thursday. Which subject line makes its purpose clearest?",
        "options": [
          "Revised invoice",
          "Invoice approved for payment",
          "Thursday meeting arrangements",
          "Please review revised invoice by Thursday"
        ],
        "correct": "Please review revised invoice by Thursday",
        "explanation": "The subject identifies the action, the document and the deadline, helping the reader judge what is needed."
      },
      {
        "id": "seniors-02",
        "prompt": "A notice says, “Return the form by 12:00 on 18 June.” Which rewrite keeps the deadline clear?",
        "options": [
          "Submit the form after noon on 18 June.",
          "Submit the form by noon on 19 June.",
          "Submit the form no later than noon on 18 June.",
          "Submit the form by midnight on 18 June."
        ],
        "correct": "Submit the form no later than noon on 18 June.",
        "explanation": "Noon is 12:00. The rewrite retains both the time and the date."
      },
      {
        "id": "seniors-03",
        "prompt": "A customer reports a damaged item. You need the order number before investigating. Which reply clearly and courteously asks for the detail you need?",
        "options": [
          "Thank you for letting us know. We will look into the matter.",
          "I’m sorry the item arrived damaged. Please send your order number so we can check the delivery.",
          "I’m sorry the item arrived damaged. We will close this request now.",
          "Please send your passport and bank statement so we can locate the order."
        ],
        "correct": "I’m sorry the item arrived damaged. Please send your order number so we can check the delivery.",
        "explanation": "The reply acknowledges the problem, asks for a relevant detail and explains why it is needed."
      },
      {
        "id": "seniors-04",
        "prompt": "An instruction reads, “Utilise the designated receptacle for the disposal of paper.” Which plain-language version keeps the meaning?",
        "options": [
          "Put paper in the marked bin.",
          "Put all rubbish in the marked bin.",
          "Place paper beside the marked bin.",
          "Put paper in any available bin."
        ],
        "correct": "Put paper in the marked bin.",
        "explanation": "This keeps the action, material and specified destination while replacing unnecessarily formal wording."
      },
      {
        "id": "seniors-05",
        "prompt": "You have received a detailed request but cannot answer fully until tomorrow. Which acknowledgement sets a clear expectation?",
        "options": [
          "Thank you; we will respond when we can.",
          "Thank you; we have read your request.",
          "Thank you; your issue is fully resolved already.",
          "Thank you; I’ve received your request and will send a full reply tomorrow."
        ],
        "correct": "Thank you; I’ve received your request and will send a full reply tomorrow.",
        "explanation": "It confirms receipt and gives a specific next step without pretending the issue is already resolved."
      },
      {
        "id": "seniors-06",
        "prompt": "A draft message says, “We need it soon.” Which replacement specifies both the document and a complete deadline?",
        "options": [
          "Please send the signed agreement by four o’clock.",
          "Please send the documents by Monday, 6 July.",
          "Please send the signed agreement by 4 pm on Monday, 6 July.",
          "Please send the agreement soon."
        ],
        "correct": "Please send the signed agreement by 4 pm on Monday, 6 July.",
        "explanation": "It specifies what to send and an exact deadline, replacing the unclear “it” and “soon”."
      },
      {
        "id": "seniors-07",
        "prompt": "Before sharing a screenshot of a website error in a public forum, which step protects unnecessary private information?",
        "options": [
          "Publish another person’s account details for comparison.",
          "Hide visible account numbers and personal contact details that are not needed to explain the error.",
          "Add your password so readers can reproduce the problem.",
          "Include every private message on the screen."
        ],
        "correct": "Hide visible account numbers and personal contact details that are not needed to explain the error.",
        "explanation": "The error can be described while removing unrelated private information. Passwords and other people’s details are unnecessary."
      },
      {
        "id": "seniors-08",
        "prompt": "A meeting agreed that Noor will check the room booking by Tuesday. Which minutes entry records the action most usefully?",
        "options": [
          "Noor — confirm room booking by Tuesday.",
          "Noor will check the room booking.",
          "The room booking must be checked by Tuesday.",
          "Noor is available on Tuesday."
        ],
        "correct": "Noor — confirm room booking by Tuesday.",
        "explanation": "An actionable record identifies the responsible person, the task and the deadline."
      },
      {
        "id": "seniors-09",
        "prompt": "A colleague writes, “Can we move our call from Wednesday to Friday at 10 am?” You are free then. Which reply confirms the complete change?",
        "options": [
          "Friday works; I’ll keep Wednesday’s call as well.",
          "Ten in the morning works; let’s meet on Monday instead.",
          "The new day should probably be fine; I’ll check later.",
          "Yes, Friday at 10 am works; I’ll replace the Wednesday call in my calendar."
        ],
        "correct": "Yes, Friday at 10 am works; I’ll replace the Wednesday call in my calendar.",
        "explanation": "It confirms the proposed day and time and explicitly replaces the previous arrangement."
      },
      {
        "id": "seniors-10",
        "prompt": "You need a supplier to resend a missing specification. Which request names the file and avoids making an unsupported accusation?",
        "options": [
          "Could you send it again, please?",
          "Your team deliberately withheld the specification; send it now.",
          "I can’t see the specification attached to your message. Could you resend the file?",
          "You forgot to attach the specification again."
        ],
        "correct": "I can’t see the specification attached to your message. Could you resend the file?",
        "explanation": "The request describes what the writer can observe, names the missing file and asks for a clear remedy."
      }
    ]
  }
};

export function wordsForPractice(id: PracticePathId): PracticeWord[] {
  return practiceData[id].words;
}

export function questionsForPractice(id: PracticePathId): PracticeQuestion[] {
  return practiceData[id].questions;
}
