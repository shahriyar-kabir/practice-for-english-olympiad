/** Newly authored Wizpiko word-puzzle collection.
 * Each theme, clue and connected layout was created for this collection.
 * New IDs deliberately keep historical answers separate from these activities.
 * Rows and columns are zero-based.
 */
export interface Entry {
  id: string;
  number: number;
  direction: 'across' | 'down';
  row: number;
  col: number;
  answer: string;
  clue: string;
}

export interface Puzzle {
  id: string;
  title: string;
  category: string;
  emoji: string;
  color: string;
  description: string;
  rows: number;
  cols: number;
  entries: Entry[];
  wordBank: string[];
}

export const puzzles: Puzzle[] = [
  {
    "id": "wizpiko-rooftop-garden",
    "title": "Rooftop Garden",
    "category": "Growing things",
    "emoji": "🌱",
    "color": "#22a779",
    "description": "Help turn a sunny roof into a little green retreat.",
    "rows": 10,
    "cols": 13,
    "entries": [
      {
        "answer": "HARVEST",
        "clue": "When the beans are ready, it is time to gather this season’s crop.",
        "row": 0,
        "col": 0,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "SEED",
        "clue": "Mina plants this tiny beginning of a bean in a pot.",
        "row": 0,
        "col": 9,
        "direction": "across",
        "number": 2,
        "id": "2-across"
      },
      {
        "answer": "SHADE",
        "clue": "Move the delicate seedling out of direct sunshine and into this.",
        "row": 0,
        "col": 9,
        "direction": "down",
        "number": 2,
        "id": "2-down"
      },
      {
        "answer": "WATER",
        "clue": "Fill the can with this before giving thirsty plants a drink.",
        "row": 2,
        "col": 8,
        "direction": "across",
        "number": 3,
        "id": "3-across"
      },
      {
        "answer": "ROOT",
        "clue": "Look under the soil for the part that takes in water.",
        "row": 2,
        "col": 12,
        "direction": "down",
        "number": 4,
        "id": "4-down"
      },
      {
        "answer": "STEM",
        "clue": "This upright part holds the sunflower above its leaves.",
        "row": 4,
        "col": 7,
        "direction": "across",
        "number": 5,
        "id": "5-across"
      },
      {
        "answer": "SPADE",
        "clue": "Use this small digging tool to make a planting hole.",
        "row": 4,
        "col": 7,
        "direction": "down",
        "number": 5,
        "id": "5-down"
      },
      {
        "answer": "SOIL",
        "clue": "The roots settle into this dark material inside the planter.",
        "row": 5,
        "col": 0,
        "direction": "across",
        "number": 6,
        "id": "6-across"
      },
      {
        "answer": "LEAF",
        "clue": "A caterpillar has nibbled one green part growing from the stem.",
        "row": 5,
        "col": 3,
        "direction": "down",
        "number": 7,
        "id": "7-down"
      },
      {
        "answer": "POT",
        "clue": "The balcony tomato grows inside this round container.",
        "row": 7,
        "col": 5,
        "direction": "down",
        "number": 8,
        "id": "8-down"
      },
      {
        "answer": "FLOWER",
        "clue": "The bee lands on the colourful part of the marigold.",
        "row": 8,
        "col": 3,
        "direction": "across",
        "number": 9,
        "id": "9-across"
      }
    ],
    "wordBank": [
      "SOIL",
      "FLOWER",
      "SEED",
      "LEAF",
      "SHADE",
      "ROOT",
      "STEM",
      "POT",
      "HARVEST",
      "WATER",
      "SPADE"
    ]
  },
  {
    "id": "wizpiko-rainy-day-walk",
    "title": "After the Rain",
    "category": "Weather discoveries",
    "emoji": "🌦️",
    "color": "#4c8fea",
    "description": "Follow a puddle-filled path and notice what the weather leaves behind.",
    "rows": 13,
    "cols": 16,
    "entries": [
      {
        "answer": "BOOTS",
        "clue": "Wear these waterproof shoes before stepping into the wet garden.",
        "row": 0,
        "col": 0,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "PUDDLE",
        "clue": "A little pool on the pavement invites one careful splash.",
        "row": 0,
        "col": 3,
        "direction": "down",
        "number": 2,
        "id": "2-down"
      },
      {
        "answer": "DRIZZLE",
        "clue": "The rain is very light, with tiny drops rather than a downpour.",
        "row": 3,
        "col": 6,
        "direction": "down",
        "number": 3,
        "id": "3-down"
      },
      {
        "answer": "SHELTER",
        "clue": "Wait in a covered place until the heavy shower passes.",
        "row": 4,
        "col": 0,
        "direction": "across",
        "number": 4,
        "id": "4-across"
      },
      {
        "answer": "CLOUD",
        "clue": "The grey shape above us is carrying many tiny water drops.",
        "row": 4,
        "col": 8,
        "direction": "across",
        "number": 5,
        "id": "5-across"
      },
      {
        "answer": "DRAIN",
        "clue": "Water runs off the street through this opening.",
        "row": 4,
        "col": 12,
        "direction": "down",
        "number": 6,
        "id": "6-down"
      },
      {
        "answer": "RAINBOW",
        "clue": "Sunlight and raindrops make a curved band of colours.",
        "row": 6,
        "col": 10,
        "direction": "down",
        "number": 7,
        "id": "7-down"
      },
      {
        "answer": "DRY",
        "clue": "After hanging in the sun, the towel is no longer wet.",
        "row": 7,
        "col": 3,
        "direction": "down",
        "number": 8,
        "id": "8-down"
      },
      {
        "answer": "REFLECTION",
        "clue": "The still water shows an upside-down image of the bridge.",
        "row": 8,
        "col": 3,
        "direction": "across",
        "number": 9,
        "id": "9-across"
      },
      {
        "answer": "COAT",
        "clue": "Zip up this outer layer before leaving in chilly weather.",
        "row": 8,
        "col": 8,
        "direction": "down",
        "number": 10,
        "id": "10-down"
      },
      {
        "answer": "BREEZE",
        "clue": "A gentle wind moves the washing on the line.",
        "row": 10,
        "col": 10,
        "direction": "across",
        "number": 11,
        "id": "11-across"
      }
    ],
    "wordBank": [
      "CLOUD",
      "DRIZZLE",
      "DRAIN",
      "RAINBOW",
      "REFLECTION",
      "COAT",
      "BOOTS",
      "BREEZE",
      "DRY",
      "SHELTER",
      "PUDDLE"
    ]
  },
  {
    "id": "wizpiko-creative-desk",
    "title": "The Creative Desk",
    "category": "Drawing and making",
    "emoji": "🎨",
    "color": "#a06bdb",
    "description": "Set up a small studio for a colourful afternoon project.",
    "rows": 17,
    "cols": 9,
    "entries": [
      {
        "answer": "ERASER",
        "clue": "Rub out a pencil mark with this instead of crossing it out.",
        "row": 0,
        "col": 1,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "PAINT",
        "clue": "Mix yellow and blue portions of this to make green.",
        "row": 2,
        "col": 0,
        "direction": "across",
        "number": 2,
        "id": "2-across"
      },
      {
        "answer": "GLUE",
        "clue": "A thin layer of this joins the collage pieces.",
        "row": 3,
        "col": 5,
        "direction": "down",
        "number": 3,
        "id": "3-down"
      },
      {
        "answer": "PENCIL",
        "clue": "Sketch lightly with this so you can change your lines later.",
        "row": 4,
        "col": 0,
        "direction": "across",
        "number": 4,
        "id": "4-across"
      },
      {
        "answer": "SKETCH",
        "clue": "Make a quick, light drawing before adding the details.",
        "row": 4,
        "col": 8,
        "direction": "down",
        "number": 5,
        "id": "5-down"
      },
      {
        "answer": "PALETTE",
        "clue": "The artist mixes colours on this little board.",
        "row": 6,
        "col": 2,
        "direction": "across",
        "number": 6,
        "id": "6-across"
      },
      {
        "answer": "PAPER",
        "clue": "Fold this flat sheet to begin your greeting card.",
        "row": 6,
        "col": 2,
        "direction": "down",
        "number": 6,
        "id": "6-down"
      },
      {
        "answer": "BRUSH",
        "clue": "Dip its soft bristles into blue paint for the sky.",
        "row": 9,
        "col": 4,
        "direction": "across",
        "number": 7,
        "id": "7-across"
      },
      {
        "answer": "RULER",
        "clue": "Use this straight measuring tool to draw the border.",
        "row": 9,
        "col": 5,
        "direction": "down",
        "number": 8,
        "id": "8-down"
      },
      {
        "answer": "SCISSORS",
        "clue": "These two joined blades cut the paper into strips.",
        "row": 9,
        "col": 7,
        "direction": "down",
        "number": 9,
        "id": "9-down"
      },
      {
        "answer": "FOLDER",
        "clue": "Keep the finished drawings together inside this flat cover.",
        "row": 15,
        "col": 2,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      }
    ],
    "wordBank": [
      "SKETCH",
      "PAPER",
      "PENCIL",
      "PAINT",
      "BRUSH",
      "SCISSORS",
      "PALETTE",
      "RULER",
      "FOLDER",
      "GLUE",
      "ERASER"
    ]
  },
  {
    "id": "wizpiko-picnic-plan",
    "title": "Picnic Plans",
    "category": "An outdoor meal",
    "emoji": "🧺",
    "color": "#ef9a28",
    "description": "Pack a shared lunch and leave the park as tidy as you found it.",
    "rows": 14,
    "cols": 15,
    "entries": [
      {
        "answer": "FRUIT",
        "clue": "Apples and bananas belong to this food group.",
        "row": 0,
        "col": 13,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "SHARE",
        "clue": "Give everyone some of the strawberries instead of keeping them all.",
        "row": 1,
        "col": 10,
        "direction": "across",
        "number": 2,
        "id": "2-across"
      },
      {
        "answer": "SPOON",
        "clue": "Use this curved utensil to eat the yoghurt.",
        "row": 2,
        "col": 5,
        "direction": "down",
        "number": 3,
        "id": "3-down"
      },
      {
        "answer": "BASKET",
        "clue": "Carry the picnic food in this woven container.",
        "row": 4,
        "col": 8,
        "direction": "across",
        "number": 4,
        "id": "4-across"
      },
      {
        "answer": "BOTTLE",
        "clue": "Screw the lid onto this container of drinking water.",
        "row": 4,
        "col": 8,
        "direction": "down",
        "number": 4,
        "id": "4-down"
      },
      {
        "answer": "PLATE",
        "clue": "Rest your slice of pie on this flat dish.",
        "row": 5,
        "col": 3,
        "direction": "down",
        "number": 5,
        "id": "5-down"
      },
      {
        "answer": "BLANKET",
        "clue": "Spread this over the grass so everyone has a place to sit.",
        "row": 6,
        "col": 2,
        "direction": "across",
        "number": 6,
        "id": "6-across"
      },
      {
        "answer": "SANDWICH",
        "clue": "Put a filling between two slices of bread to make this.",
        "row": 6,
        "col": 10,
        "direction": "down",
        "number": 7,
        "id": "7-down"
      },
      {
        "answer": "LITTER",
        "clue": "Take these dropped wrappers to a bin before leaving.",
        "row": 8,
        "col": 0,
        "direction": "across",
        "number": 8,
        "id": "8-across"
      },
      {
        "answer": "BREAD",
        "clue": "Slice this loaf to prepare the picnic sandwiches.",
        "row": 9,
        "col": 6,
        "direction": "across",
        "number": 9,
        "id": "9-across"
      },
      {
        "answer": "NAPKIN",
        "clue": "Use this small cloth to wipe your fingers after eating.",
        "row": 11,
        "col": 6,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      }
    ],
    "wordBank": [
      "BLANKET",
      "LITTER",
      "BASKET",
      "PLATE",
      "BREAD",
      "SHARE",
      "FRUIT",
      "NAPKIN",
      "BOTTLE",
      "SANDWICH",
      "SPOON"
    ]
  },
  {
    "id": "wizpiko-makers-table",
    "title": "The Makers Table",
    "category": "Build and test",
    "emoji": "🛠️",
    "color": "#24a6b0",
    "description": "Gather simple materials and try a small building challenge.",
    "rows": 11,
    "cols": 14,
    "entries": [
      {
        "answer": "WHEEL",
        "clue": "This round part lets the model roll across the table.",
        "row": 0,
        "col": 6,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "TAPE",
        "clue": "A short sticky strip holds the paper wheel in place.",
        "row": 1,
        "col": 1,
        "direction": "down",
        "number": 2,
        "id": "2-down"
      },
      {
        "answer": "BALANCE",
        "clue": "Adjust both sides so the model does not tip over.",
        "row": 2,
        "col": 0,
        "direction": "across",
        "number": 3,
        "id": "3-across"
      },
      {
        "answer": "FOLD",
        "clue": "Bend the sheet neatly along a line without cutting it.",
        "row": 4,
        "col": 4,
        "direction": "across",
        "number": 4,
        "id": "4-across"
      },
      {
        "answer": "DESIGN",
        "clue": "Plan how the useful parts of your invention will fit together.",
        "row": 4,
        "col": 7,
        "direction": "down",
        "number": 5,
        "id": "5-down"
      },
      {
        "answer": "MEASURE",
        "clue": "Find the strip’s length before cutting it.",
        "row": 4,
        "col": 9,
        "direction": "down",
        "number": 6,
        "id": "6-down"
      },
      {
        "answer": "TEST",
        "clue": "Try the model to discover whether your idea works.",
        "row": 5,
        "col": 11,
        "direction": "down",
        "number": 7,
        "id": "7-down"
      },
      {
        "answer": "BUILD",
        "clue": "Put the pieces together to make your model bridge.",
        "row": 6,
        "col": 5,
        "direction": "down",
        "number": 8,
        "id": "8-down"
      },
      {
        "answer": "SHAPE",
        "clue": "A circle, triangle or square is one of these.",
        "row": 6,
        "col": 7,
        "direction": "across",
        "number": 9,
        "id": "9-across"
      },
      {
        "answer": "STRING",
        "clue": "Tie the two card pieces together with this thin cord.",
        "row": 8,
        "col": 2,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      },
      {
        "answer": "REPAIR",
        "clue": "Fix the broken handle so the model can be used again.",
        "row": 10,
        "col": 8,
        "direction": "across",
        "number": 11,
        "id": "11-across"
      }
    ],
    "wordBank": [
      "SHAPE",
      "FOLD",
      "BUILD",
      "MEASURE",
      "TAPE",
      "BALANCE",
      "STRING",
      "REPAIR",
      "WHEEL",
      "TEST",
      "DESIGN"
    ]
  },
  {
    "id": "wizpiko-kindness-club",
    "title": "The Kindness Club",
    "category": "Words that help",
    "emoji": "🤝",
    "color": "#e5749c",
    "description": "Practise small actions that make a shared space welcoming.",
    "rows": 11,
    "cols": 13,
    "entries": [
      {
        "answer": "THANKS",
        "clue": "Say this when a neighbour helps carry your bag.",
        "row": 0,
        "col": 9,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "PATIENT",
        "clue": "Someone who waits calmly while a partner learns the new game is this.",
        "row": 2,
        "col": 0,
        "direction": "across",
        "number": 2,
        "id": "2-across"
      },
      {
        "answer": "ENCOURAGE",
        "clue": "Say something supportive when a friend wants to try again.",
        "row": 2,
        "col": 4,
        "direction": "down",
        "number": 3,
        "id": "3-down"
      },
      {
        "answer": "HELP",
        "clue": "Offer to carry one box when a friend has too much to hold.",
        "row": 3,
        "col": 7,
        "direction": "down",
        "number": 4,
        "id": "4-down"
      },
      {
        "answer": "PLEASE",
        "clue": "Add this polite word when asking someone to pass the jug.",
        "row": 3,
        "col": 11,
        "direction": "down",
        "number": 5,
        "id": "5-down"
      },
      {
        "answer": "WELCOME",
        "clue": "Offer this greeting when a new person joins the club.",
        "row": 4,
        "col": 1,
        "direction": "across",
        "number": 6,
        "id": "6-across"
      },
      {
        "answer": "LISTEN",
        "clue": "Give your attention to what another person is saying.",
        "row": 5,
        "col": 7,
        "direction": "across",
        "number": 7,
        "id": "7-across"
      },
      {
        "answer": "FAIR",
        "clue": "Give each player the same number of turns to make the game this.",
        "row": 7,
        "col": 9,
        "direction": "down",
        "number": 8,
        "id": "8-down"
      },
      {
        "answer": "CARE",
        "clue": "Show thoughtful attention to someone who feels worried.",
        "row": 8,
        "col": 8,
        "direction": "across",
        "number": 9,
        "id": "9-across"
      },
      {
        "answer": "RESPECT",
        "clue": "Treat another person’s feelings and choices as important.",
        "row": 10,
        "col": 0,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      },
      {
        "answer": "TRUST",
        "clue": "When someone keeps promises, you learn to rely on them.",
        "row": 10,
        "col": 8,
        "direction": "across",
        "number": 11,
        "id": "11-across"
      }
    ],
    "wordBank": [
      "THANKS",
      "ENCOURAGE",
      "RESPECT",
      "CARE",
      "PLEASE",
      "LISTEN",
      "WELCOME",
      "FAIR",
      "HELP",
      "TRUST",
      "PATIENT"
    ]
  },
  {
    "id": "wizpiko-market-morning",
    "title": "Market Morning",
    "category": "Everyday choices",
    "emoji": "🍐",
    "color": "#86a943",
    "description": "Read the stalls, compare choices and prepare for a simple shopping trip.",
    "rows": 14,
    "cols": 9,
    "entries": [
      {
        "answer": "COINS",
        "clue": "Count these small pieces of metal money at the till.",
        "row": 0,
        "col": 2,
        "direction": "across",
        "number": 1,
        "id": "1-across"
      },
      {
        "answer": "CHANGE",
        "clue": "The seller returns this when you pay more than the total.",
        "row": 0,
        "col": 2,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "BAG",
        "clue": "Put your shopping into this reusable carrier.",
        "row": 2,
        "col": 1,
        "direction": "across",
        "number": 2,
        "id": "2-across"
      },
      {
        "answer": "FRESH",
        "clue": "These vegetables were picked recently and still look crisp.",
        "row": 3,
        "col": 4,
        "direction": "down",
        "number": 3,
        "id": "3-down"
      },
      {
        "answer": "QUEUE",
        "clue": "Join the line of people waiting for their turn to pay.",
        "row": 5,
        "col": 0,
        "direction": "across",
        "number": 4,
        "id": "4-across"
      },
      {
        "answer": "STALL",
        "clue": "A seller arranges pears on this small market stand.",
        "row": 6,
        "col": 4,
        "direction": "across",
        "number": 5,
        "id": "5-across"
      },
      {
        "answer": "LIST",
        "clue": "Write the items you need here before leaving home.",
        "row": 6,
        "col": 7,
        "direction": "down",
        "number": 6,
        "id": "6-down"
      },
      {
        "answer": "BUNCH",
        "clue": "Choose one group of bananas joined together.",
        "row": 7,
        "col": 0,
        "direction": "across",
        "number": 7,
        "id": "7-across"
      },
      {
        "answer": "RECEIPT",
        "clue": "Keep this printed record of the items you bought.",
        "row": 9,
        "col": 1,
        "direction": "across",
        "number": 8,
        "id": "8-across"
      },
      {
        "answer": "PRICE",
        "clue": "Check this number to find how much the apples cost.",
        "row": 9,
        "col": 6,
        "direction": "down",
        "number": 9,
        "id": "9-down"
      },
      {
        "answer": "SCALE",
        "clue": "The seller places the potatoes on this to find their weight.",
        "row": 13,
        "col": 2,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      }
    ],
    "wordBank": [
      "BAG",
      "FRESH",
      "RECEIPT",
      "QUEUE",
      "BUNCH",
      "SCALE",
      "CHANGE",
      "STALL",
      "COINS",
      "LIST",
      "PRICE"
    ]
  },
  {
    "id": "wizpiko-story-lantern",
    "title": "The Story Lantern",
    "category": "Reading together",
    "emoji": "📖",
    "color": "#9f7bdd",
    "description": "Find the pieces that help a little tale make sense.",
    "rows": 17,
    "cols": 9,
    "entries": [
      {
        "answer": "TITLE",
        "clue": "Read the story’s name at the top of the first page.",
        "row": 0,
        "col": 0,
        "direction": "across",
        "number": 1,
        "id": "1-across"
      },
      {
        "answer": "IMAGINE",
        "clue": "Picture the strange floating island in your own mind.",
        "row": 0,
        "col": 1,
        "direction": "down",
        "number": 2,
        "id": "2-down"
      },
      {
        "answer": "ENDING",
        "clue": "The final part reveals whether the lost key was found.",
        "row": 1,
        "col": 6,
        "direction": "down",
        "number": 3,
        "id": "3-down"
      },
      {
        "answer": "PAGE",
        "clue": "Turn one sheet of the book to carry on reading.",
        "row": 2,
        "col": 0,
        "direction": "across",
        "number": 4,
        "id": "4-across"
      },
      {
        "answer": "DIALOGUE",
        "clue": "The lines inside quotation marks show a conversation.",
        "row": 5,
        "col": 4,
        "direction": "down",
        "number": 5,
        "id": "5-down"
      },
      {
        "answer": "SETTING",
        "clue": "A seaside village in winter gives the story its place and time.",
        "row": 6,
        "col": 0,
        "direction": "across",
        "number": 6,
        "id": "6-across"
      },
      {
        "answer": "SCENE",
        "clue": "One part of the tale happens beside an old lighthouse.",
        "row": 6,
        "col": 0,
        "direction": "down",
        "number": 6,
        "id": "6-down"
      },
      {
        "answer": "CLUE",
        "clue": "A muddy footprint gives the reader a useful hint.",
        "row": 8,
        "col": 3,
        "direction": "across",
        "number": 7,
        "id": "7-across"
      },
      {
        "answer": "HERO",
        "clue": "This central character tries to solve the story’s main problem.",
        "row": 9,
        "col": 8,
        "direction": "down",
        "number": 8,
        "id": "8-down"
      },
      {
        "answer": "CHAPTER",
        "clue": "One numbered section of a longer book has this name.",
        "row": 10,
        "col": 6,
        "direction": "down",
        "number": 9,
        "id": "9-down"
      },
      {
        "answer": "AUTHOR",
        "clue": "This person chose and wrote the words of the story.",
        "row": 11,
        "col": 3,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      }
    ],
    "wordBank": [
      "SCENE",
      "CHAPTER",
      "HERO",
      "PAGE",
      "IMAGINE",
      "CLUE",
      "SETTING",
      "TITLE",
      "ENDING",
      "AUTHOR",
      "DIALOGUE"
    ]
  },
  {
    "id": "wizpiko-city-discovery",
    "title": "A City Discovery",
    "category": "Finding your way",
    "emoji": "🚌",
    "color": "#478ed1",
    "description": "Use signs and useful words to explore a new part of town.",
    "rows": 12,
    "cols": 17,
    "entries": [
      {
        "answer": "LANDMARK",
        "clue": "The tall clock tower is a recognisable feature that helps you navigate.",
        "row": 0,
        "col": 16,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "TICKET",
        "clue": "Keep this small pass ready to show before boarding.",
        "row": 1,
        "col": 14,
        "direction": "down",
        "number": 2,
        "id": "2-down"
      },
      {
        "answer": "STATION",
        "clue": "The train stops here so passengers can get on and off.",
        "row": 2,
        "col": 10,
        "direction": "across",
        "number": 3,
        "id": "3-across"
      },
      {
        "answer": "CROSSING",
        "clue": "Use the marked place where people safely walk across the road.",
        "row": 4,
        "col": 10,
        "direction": "down",
        "number": 4,
        "id": "4-down"
      },
      {
        "answer": "BRIDGE",
        "clue": "Cross this structure to reach the other side of the river.",
        "row": 5,
        "col": 9,
        "direction": "across",
        "number": 5,
        "id": "5-across"
      },
      {
        "answer": "CORNER",
        "clue": "Turn left where the two streets meet.",
        "row": 6,
        "col": 0,
        "direction": "across",
        "number": 6,
        "id": "6-across"
      },
      {
        "answer": "ROUTE",
        "clue": "Choose the path that takes you from the library to the park.",
        "row": 6,
        "col": 5,
        "direction": "down",
        "number": 7,
        "id": "7-down"
      },
      {
        "answer": "MUSEUM",
        "clue": "Visit this building to explore carefully kept objects and displays.",
        "row": 7,
        "col": 8,
        "direction": "across",
        "number": 8,
        "id": "8-across"
      },
      {
        "answer": "MAP",
        "clue": "Follow the marked streets on this guide to find the museum.",
        "row": 8,
        "col": 7,
        "direction": "down",
        "number": 9,
        "id": "9-down"
      },
      {
        "answer": "TRAFFIC",
        "clue": "Many moving cars and buses make the road busy with this.",
        "row": 9,
        "col": 5,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      },
      {
        "answer": "SIGN",
        "clue": "Read the board that points towards the swimming pool.",
        "row": 11,
        "col": 8,
        "direction": "across",
        "number": 11,
        "id": "11-across"
      }
    ],
    "wordBank": [
      "STATION",
      "CROSSING",
      "MUSEUM",
      "CORNER",
      "LANDMARK",
      "TRAFFIC",
      "BRIDGE",
      "ROUTE",
      "SIGN",
      "MAP",
      "TICKET"
    ]
  },
  {
    "id": "wizpiko-space-workshop",
    "title": "Space Workshop",
    "category": "Curious questions",
    "emoji": "🚀",
    "color": "#6674d5",
    "description": "Prepare an imaginary space mission using words from observation and discovery.",
    "rows": 16,
    "cols": 9,
    "entries": [
      {
        "answer": "ORBIT",
        "clue": "The station follows this curved path around Earth.",
        "row": 0,
        "col": 5,
        "direction": "down",
        "number": 1,
        "id": "1-down"
      },
      {
        "answer": "OBSERVE",
        "clue": "Look carefully and record what you notice.",
        "row": 0,
        "col": 8,
        "direction": "down",
        "number": 2,
        "id": "2-down"
      },
      {
        "answer": "PLANET",
        "clue": "Earth is one; Mars is another world travelling around the Sun.",
        "row": 2,
        "col": 2,
        "direction": "down",
        "number": 3,
        "id": "3-down"
      },
      {
        "answer": "GRAVITY",
        "clue": "This force pulls objects towards one another.",
        "row": 4,
        "col": 0,
        "direction": "across",
        "number": 4,
        "id": "4-across"
      },
      {
        "answer": "EXPLORE",
        "clue": "Investigate an unfamiliar place to learn what is there.",
        "row": 6,
        "col": 2,
        "direction": "across",
        "number": 5,
        "id": "5-across"
      },
      {
        "answer": "ROCKET",
        "clue": "This vehicle pushes upwards to carry the crew beyond the atmosphere.",
        "row": 6,
        "col": 7,
        "direction": "down",
        "number": 6,
        "id": "6-down"
      },
      {
        "answer": "LAUNCH",
        "clue": "The countdown ends and the spacecraft begins its journey.",
        "row": 10,
        "col": 0,
        "direction": "down",
        "number": 7,
        "id": "7-down"
      },
      {
        "answer": "SAMPLE",
        "clue": "Bring back a small piece of rock for careful study.",
        "row": 10,
        "col": 2,
        "direction": "across",
        "number": 8,
        "id": "8-across"
      },
      {
        "answer": "SIGNAL",
        "clue": "The crew sends this message back to the ground team.",
        "row": 10,
        "col": 2,
        "direction": "down",
        "number": 8,
        "id": "8-down"
      },
      {
        "answer": "MODULE",
        "clue": "The crew attaches one separate working section to the station.",
        "row": 10,
        "col": 4,
        "direction": "down",
        "number": 9,
        "id": "9-down"
      },
      {
        "answer": "HELMET",
        "clue": "The astronaut wears this protective covering around the head.",
        "row": 15,
        "col": 0,
        "direction": "across",
        "number": 10,
        "id": "10-across"
      }
    ],
    "wordBank": [
      "ROCKET",
      "MODULE",
      "OBSERVE",
      "PLANET",
      "EXPLORE",
      "HELMET",
      "SAMPLE",
      "GRAVITY",
      "ORBIT",
      "LAUNCH",
      "SIGNAL"
    ]
  }
];
