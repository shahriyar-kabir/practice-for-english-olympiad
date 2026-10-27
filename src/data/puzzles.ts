/** Beginner crosswords transcribed from the supplied English Olympiad PDF.
 * Coordinates, clue numbering, clues, and word banks preserve the original ten puzzles.
 * Rows and columns are zero-based; unused border cells are omitted.
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
    "id": "animal-friends",
    "title": "Animal Friends",
    "category": "Animals",
    "emoji": "🦁",
    "color": "#7a9c48",
    "description": "Meet some furry, feathered, and fantastic friends!",
    "rows": 15,
    "cols": 12,
    "entries": [
      {
        "id": "4-across",
        "number": 4,
        "direction": "across",
        "row": 3,
        "col": 6,
        "answer": "MONKEY",
        "clue": "An animal that can swing in trees."
      },
      {
        "id": "5-across",
        "number": 5,
        "direction": "across",
        "row": 4,
        "col": 0,
        "answer": "SHEEP",
        "clue": "A farm animal that gives us wool."
      },
      {
        "id": "6-across",
        "number": 6,
        "direction": "across",
        "row": 6,
        "col": 1,
        "answer": "GIRAFFE",
        "clue": "A tall animal with a very long neck."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 9,
        "col": 4,
        "answer": "TIGER",
        "clue": "A big wild cat with orange fur and black stripes."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 13,
        "col": 7,
        "answer": "LION",
        "clue": "A big wild cat known for its mane."
      },
      {
        "id": "1-down",
        "number": 1,
        "direction": "down",
        "row": 0,
        "col": 9,
        "answer": "DUCK",
        "clue": "A bird that swims and says quack."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 2,
        "col": 7,
        "answer": "HORSE",
        "clue": "An animal people may ride."
      },
      {
        "id": "3-down",
        "number": 3,
        "direction": "down",
        "row": 3,
        "col": 3,
        "answer": "ZEBRA",
        "clue": "A horse-like animal with black and white stripes."
      },
      {
        "id": "7-down",
        "number": 7,
        "direction": "down",
        "row": 6,
        "col": 6,
        "answer": "FROG",
        "clue": "A small green animal that jumps and croaks."
      },
      {
        "id": "9-down",
        "number": 9,
        "direction": "down",
        "row": 9,
        "col": 8,
        "answer": "RABBIT",
        "clue": "An animal with long ears that hops."
      }
    ],
    "wordBank": [
      "RABBIT",
      "TIGER",
      "HORSE",
      "GIRAFFE",
      "FROG",
      "SHEEP",
      "LION",
      "MONKEY",
      "ZEBRA",
      "DUCK"
    ]
  },
  {
    "id": "in-the-classroom",
    "title": "In the Classroom",
    "category": "School",
    "emoji": "🎒",
    "color": "#6c8ed1",
    "description": "Pack your curiosity. A classroom adventure is waiting!",
    "rows": 11,
    "cols": 12,
    "entries": [
      {
        "id": "2-across",
        "number": 2,
        "direction": "across",
        "row": 0,
        "col": 7,
        "answer": "DESK",
        "clue": "A table used by a student at school."
      },
      {
        "id": "4-across",
        "number": 4,
        "direction": "across",
        "row": 1,
        "col": 0,
        "answer": "TEACHER",
        "clue": "A person who helps students learn."
      },
      {
        "id": "7-across",
        "number": 7,
        "direction": "across",
        "row": 3,
        "col": 6,
        "answer": "LESSON",
        "clue": "Something a teacher teaches in class."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 5,
        "col": 2,
        "answer": "PAPER",
        "clue": "You can write on a sheet of this."
      },
      {
        "id": "9-across",
        "number": 9,
        "direction": "across",
        "row": 8,
        "col": 1,
        "answer": "SCHOOL",
        "clue": "A place where children go to learn."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 10,
        "col": 1,
        "answer": "CLASS",
        "clue": "A group of students learning together."
      },
      {
        "id": "1-down",
        "number": 1,
        "direction": "down",
        "row": 0,
        "col": 2,
        "answer": "BAG",
        "clue": "You carry your school things in this."
      },
      {
        "id": "3-down",
        "number": 3,
        "direction": "down",
        "row": 0,
        "col": 8,
        "answer": "ERASER",
        "clue": "You use this to remove pencil marks."
      },
      {
        "id": "5-down",
        "number": 5,
        "direction": "down",
        "row": 1,
        "col": 6,
        "answer": "RULER",
        "clue": "You use this to draw straight lines."
      },
      {
        "id": "6-down",
        "number": 6,
        "direction": "down",
        "row": 2,
        "col": 10,
        "answer": "BOOK",
        "clue": "You read pages in this."
      },
      {
        "id": "8-down",
        "number": 8,
        "direction": "down",
        "row": 5,
        "col": 2,
        "answer": "PENCIL",
        "clue": "You write or draw with it; it can be sharpened."
      }
    ],
    "wordBank": [
      "CLASS",
      "BAG",
      "BOOK",
      "TEACHER",
      "SCHOOL",
      "PENCIL",
      "DESK",
      "PAPER",
      "ERASER",
      "RULER",
      "LESSON"
    ]
  },
  {
    "id": "food-and-drinks",
    "title": "Food and Drinks",
    "category": "Food",
    "emoji": "🍎",
    "color": "#d98559",
    "description": "A delicious puzzle full of everyday favorites.",
    "rows": 13,
    "cols": 9,
    "entries": [
      {
        "id": "4-across",
        "number": 4,
        "direction": "across",
        "row": 2,
        "col": 4,
        "answer": "MILK",
        "clue": "A white drink that comes from cows."
      },
      {
        "id": "5-across",
        "number": 5,
        "direction": "across",
        "row": 4,
        "col": 0,
        "answer": "ORANGE",
        "clue": "A round citrus fruit of the same colour."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 6,
        "col": 4,
        "answer": "APPLE",
        "clue": "A round fruit that can be red or green."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 8,
        "col": 1,
        "answer": "WATER",
        "clue": "A clear drink we need every day."
      },
      {
        "id": "11-across",
        "number": 11,
        "direction": "across",
        "row": 11,
        "col": 0,
        "answer": "HONEY",
        "clue": "Sweet food made by bees."
      },
      {
        "id": "1-down",
        "number": 1,
        "direction": "down",
        "row": 0,
        "col": 0,
        "answer": "CARROT",
        "clue": "An orange vegetable that grows underground."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 1,
        "col": 2,
        "answer": "BREAD",
        "clue": "Food made from flour and baked into loaves."
      },
      {
        "id": "3-down",
        "number": 3,
        "direction": "down",
        "row": 1,
        "col": 5,
        "answer": "RICE",
        "clue": "Small grains often eaten with curry."
      },
      {
        "id": "6-down",
        "number": 6,
        "direction": "down",
        "row": 4,
        "col": 4,
        "answer": "GRAPES",
        "clue": "Small round fruits that grow in bunches."
      },
      {
        "id": "7-down",
        "number": 7,
        "direction": "down",
        "row": 4,
        "col": 8,
        "answer": "CHEESE",
        "clue": "A food made from milk, often on pizza."
      },
      {
        "id": "9-down",
        "number": 9,
        "direction": "down",
        "row": 7,
        "col": 2,
        "answer": "BANANA",
        "clue": "A long yellow fruit you peel."
      }
    ],
    "wordBank": [
      "BANANA",
      "GRAPES",
      "WATER",
      "CHEESE",
      "MILK",
      "ORANGE",
      "RICE",
      "CARROT",
      "APPLE",
      "HONEY",
      "BREAD"
    ]
  },
  {
    "id": "our-natural-world",
    "title": "Our Natural World",
    "category": "Nature",
    "emoji": "🌿",
    "color": "#65a393",
    "description": "Explore the wonderful world just outside your window.",
    "rows": 12,
    "cols": 7,
    "entries": [
      {
        "id": "1-across",
        "number": 1,
        "direction": "across",
        "row": 0,
        "col": 0,
        "answer": "LEAF",
        "clue": "A flat green part of a plant."
      },
      {
        "id": "3-across",
        "number": 3,
        "direction": "across",
        "row": 2,
        "col": 1,
        "answer": "CLOUD",
        "clue": "A white or grey shape high in the sky."
      },
      {
        "id": "4-across",
        "number": 4,
        "direction": "across",
        "row": 4,
        "col": 0,
        "answer": "TREE",
        "clue": "A tall plant with a trunk and branches."
      },
      {
        "id": "6-across",
        "number": 6,
        "direction": "across",
        "row": 5,
        "col": 3,
        "answer": "RAIN",
        "clue": "Water that falls from clouds."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 8,
        "col": 2,
        "answer": "STORM",
        "clue": "Weather with strong wind, often with rain."
      },
      {
        "id": "9-across",
        "number": 9,
        "direction": "across",
        "row": 9,
        "col": 0,
        "answer": "SUN",
        "clue": "The star that gives Earth light and warmth."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 11,
        "col": 2,
        "answer": "WIND",
        "clue": "Air that moves outside."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 0,
        "col": 3,
        "answer": "FLOWER",
        "clue": "The colourful part of a plant."
      },
      {
        "id": "5-down",
        "number": 5,
        "direction": "down",
        "row": 4,
        "col": 5,
        "answer": "RIVER",
        "clue": "A long stream of flowing water."
      },
      {
        "id": "7-down",
        "number": 7,
        "direction": "down",
        "row": 6,
        "col": 0,
        "answer": "GRASS",
        "clue": "The short green plants covering many lawns."
      },
      {
        "id": "8-down",
        "number": 8,
        "direction": "down",
        "row": 8,
        "col": 2,
        "answer": "SNOW",
        "clue": "Soft white ice that falls from the sky."
      }
    ],
    "wordBank": [
      "RIVER",
      "SUN",
      "TREE",
      "CLOUD",
      "LEAF",
      "FLOWER",
      "GRASS",
      "STORM",
      "WIND",
      "SNOW",
      "RAIN"
    ]
  },
  {
    "id": "opposites",
    "title": "Opposites",
    "category": "Word play",
    "emoji": "↔️",
    "color": "#a48bc6",
    "description": "Big or small, hot or cold? Find the other side!",
    "rows": 10,
    "cols": 11,
    "entries": [
      {
        "id": "1-across",
        "number": 1,
        "direction": "across",
        "row": 0,
        "col": 1,
        "answer": "COLD",
        "clue": "The opposite of hot."
      },
      {
        "id": "6-across",
        "number": 6,
        "direction": "across",
        "row": 2,
        "col": 6,
        "answer": "SMALL",
        "clue": "The opposite of big."
      },
      {
        "id": "7-across",
        "number": 7,
        "direction": "across",
        "row": 3,
        "col": 2,
        "answer": "SHORT",
        "clue": "The opposite of tall (about height)."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 5,
        "col": 4,
        "answer": "EARLY",
        "clue": "The opposite of late."
      },
      {
        "id": "9-across",
        "number": 9,
        "direction": "across",
        "row": 8,
        "col": 0,
        "answer": "QUIET",
        "clue": "The opposite of noisy."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 9,
        "col": 4,
        "answer": "YOUNG",
        "clue": "The opposite of old (about age)."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 0,
        "col": 3,
        "answer": "LIGHT",
        "clue": "The opposite of heavy."
      },
      {
        "id": "3-down",
        "number": 3,
        "direction": "down",
        "row": 0,
        "col": 6,
        "answer": "FAST",
        "clue": "The opposite of slow."
      },
      {
        "id": "4-down",
        "number": 4,
        "direction": "down",
        "row": 1,
        "col": 8,
        "answer": "HAPPY",
        "clue": "The opposite of sad."
      },
      {
        "id": "5-down",
        "number": 5,
        "direction": "down",
        "row": 1,
        "col": 10,
        "answer": "CLEAN",
        "clue": "The opposite of dirty."
      },
      {
        "id": "8-down",
        "number": 8,
        "direction": "down",
        "row": 5,
        "col": 4,
        "answer": "EMPTY",
        "clue": "The opposite of full."
      }
    ],
    "wordBank": [
      "CLEAN",
      "SHORT",
      "EMPTY",
      "LIGHT",
      "EARLY",
      "HAPPY",
      "FAST",
      "QUIET",
      "YOUNG",
      "SMALL",
      "COLD"
    ]
  },
  {
    "id": "action-words",
    "title": "Action Words",
    "category": "Actions",
    "emoji": "🚀",
    "color": "#deaa4e",
    "description": "Jump into a puzzle packed with things to do!",
    "rows": 12,
    "cols": 10,
    "entries": [
      {
        "id": "1-across",
        "number": 1,
        "direction": "across",
        "row": 0,
        "col": 2,
        "answer": "READ",
        "clue": "To look at words and understand them."
      },
      {
        "id": "5-across",
        "number": 5,
        "direction": "across",
        "row": 1,
        "col": 7,
        "answer": "RUN",
        "clue": "To move faster than walking."
      },
      {
        "id": "7-across",
        "number": 7,
        "direction": "across",
        "row": 3,
        "col": 5,
        "answer": "CLAP",
        "clue": "To hit your hands together to applaud."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 4,
        "col": 1,
        "answer": "WRITE",
        "clue": "To make words with a pen or pencil."
      },
      {
        "id": "9-across",
        "number": 9,
        "direction": "across",
        "row": 6,
        "col": 0,
        "answer": "LAUGH",
        "clue": "To make a happy sound when something is funny."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 8,
        "col": 0,
        "answer": "SWIM",
        "clue": "To move through water using your body."
      },
      {
        "id": "11-across",
        "number": 11,
        "direction": "across",
        "row": 10,
        "col": 0,
        "answer": "EAT",
        "clue": "To put food in your mouth and swallow it."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 0,
        "col": 5,
        "answer": "DANCE",
        "clue": "To move your body to music."
      },
      {
        "id": "3-down",
        "number": 3,
        "direction": "down",
        "row": 0,
        "col": 8,
        "answer": "JUMP",
        "clue": "To push yourself up off the ground."
      },
      {
        "id": "4-down",
        "number": 4,
        "direction": "down",
        "row": 1,
        "col": 1,
        "answer": "DRAW",
        "clue": "To make a picture using lines."
      },
      {
        "id": "6-down",
        "number": 6,
        "direction": "down",
        "row": 3,
        "col": 3,
        "answer": "SING",
        "clue": "To make music with your voice."
      },
      {
        "id": "9-down",
        "number": 9,
        "direction": "down",
        "row": 6,
        "col": 0,
        "answer": "LISTEN",
        "clue": "To pay attention to sounds."
      }
    ],
    "wordBank": [
      "DRAW",
      "READ",
      "LAUGH",
      "SING",
      "RUN",
      "EAT",
      "DANCE",
      "JUMP",
      "CLAP",
      "SWIM",
      "LISTEN",
      "WRITE"
    ]
  },
  {
    "id": "around-the-house",
    "title": "Around the House",
    "category": "Home",
    "emoji": "🏡",
    "color": "#cb9186",
    "description": "Open the door to familiar things around your home.",
    "rows": 13,
    "cols": 10,
    "entries": [
      {
        "id": "1-across",
        "number": 1,
        "direction": "across",
        "row": 0,
        "col": 0,
        "answer": "PILLOW",
        "clue": "A soft thing you rest your head on in bed."
      },
      {
        "id": "5-across",
        "number": 5,
        "direction": "across",
        "row": 4,
        "col": 4,
        "answer": "SOFA",
        "clue": "A long, soft seat for several people."
      },
      {
        "id": "6-across",
        "number": 6,
        "direction": "across",
        "row": 5,
        "col": 7,
        "answer": "BED",
        "clue": "Furniture you sleep on."
      },
      {
        "id": "7-across",
        "number": 7,
        "direction": "across",
        "row": 7,
        "col": 2,
        "answer": "KITCHEN",
        "clue": "The room where meals are prepared."
      },
      {
        "id": "9-across",
        "number": 9,
        "direction": "across",
        "row": 9,
        "col": 4,
        "answer": "GARDEN",
        "clue": "An outdoor area where flowers may grow."
      },
      {
        "id": "11-across",
        "number": 11,
        "direction": "across",
        "row": 11,
        "col": 3,
        "answer": "MIRROR",
        "clue": "You look into this to see your reflection."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 0,
        "col": 2,
        "answer": "LAMP",
        "clue": "An electric light that stands on a desk or table."
      },
      {
        "id": "3-down",
        "number": 3,
        "direction": "down",
        "row": 0,
        "col": 5,
        "answer": "WINDOW",
        "clue": "A glass opening that lets light into a room."
      },
      {
        "id": "4-down",
        "number": 4,
        "direction": "down",
        "row": 3,
        "col": 7,
        "answer": "TABLE",
        "clue": "Furniture you can eat or work at."
      },
      {
        "id": "8-down",
        "number": 8,
        "direction": "down",
        "row": 7,
        "col": 5,
        "answer": "CHAIR",
        "clue": "Furniture for one person to sit on."
      },
      {
        "id": "10-down",
        "number": 10,
        "direction": "down",
        "row": 9,
        "col": 7,
        "answer": "DOOR",
        "clue": "You open this to enter a room."
      }
    ],
    "wordBank": [
      "LAMP",
      "PILLOW",
      "BED",
      "CHAIR",
      "DOOR",
      "GARDEN",
      "KITCHEN",
      "WINDOW",
      "SOFA",
      "MIRROR",
      "TABLE"
    ]
  },
  {
    "id": "travel-and-transport",
    "title": "Travel and Transport",
    "category": "Travel",
    "emoji": "🚂",
    "color": "#709fba",
    "description": "All aboard! Discover words that take you places.",
    "rows": 8,
    "cols": 14,
    "entries": [
      {
        "id": "1-across",
        "number": 1,
        "direction": "across",
        "row": 0,
        "col": 3,
        "answer": "ROAD",
        "clue": "A path for cars, buses and other vehicles."
      },
      {
        "id": "6-across",
        "number": 6,
        "direction": "across",
        "row": 2,
        "col": 5,
        "answer": "AIRPORT",
        "clue": "The place where planes take off and land."
      },
      {
        "id": "7-across",
        "number": 7,
        "direction": "across",
        "row": 4,
        "col": 0,
        "answer": "BICYCLE",
        "clue": "A two-wheeled vehicle with pedals."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 4,
        "col": 8,
        "answer": "BRIDGE",
        "clue": "A structure that carries a road over water."
      },
      {
        "id": "9-across",
        "number": 9,
        "direction": "across",
        "row": 7,
        "col": 7,
        "answer": "STATION",
        "clue": "A place where trains stop for passengers."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 0,
        "col": 6,
        "answer": "DRIVER",
        "clue": "The person who controls a car."
      },
      {
        "id": "3-down",
        "number": 3,
        "direction": "down",
        "row": 0,
        "col": 13,
        "answer": "PLANE",
        "clue": "A flying vehicle with wings."
      },
      {
        "id": "4-down",
        "number": 4,
        "direction": "down",
        "row": 1,
        "col": 10,
        "answer": "TRAIN",
        "clue": "A vehicle that runs on railway tracks."
      },
      {
        "id": "5-down",
        "number": 5,
        "direction": "down",
        "row": 2,
        "col": 2,
        "answer": "TICKET",
        "clue": "A paper or digital pass for a journey."
      },
      {
        "id": "7-down",
        "number": 7,
        "direction": "down",
        "row": 4,
        "col": 0,
        "answer": "BUS",
        "clue": "A large road vehicle that carries passengers."
      },
      {
        "id": "8-down",
        "number": 8,
        "direction": "down",
        "row": 4,
        "col": 8,
        "answer": "BOAT",
        "clue": "A small vehicle used to travel on water."
      }
    ],
    "wordBank": [
      "AIRPORT",
      "BRIDGE",
      "BUS",
      "TICKET",
      "BICYCLE",
      "BOAT",
      "TRAIN",
      "DRIVER",
      "STATION",
      "ROAD",
      "PLANE"
    ]
  },
  {
    "id": "time-and-calendar",
    "title": "Time and Calendar",
    "category": "Time",
    "emoji": "⏰",
    "color": "#ba9c5a",
    "description": "Make a little time for a word adventure.",
    "rows": 12,
    "cols": 10,
    "entries": [
      {
        "id": "3-across",
        "number": 3,
        "direction": "across",
        "row": 1,
        "col": 3,
        "answer": "MORNING",
        "clue": "The time of day before noon."
      },
      {
        "id": "4-across",
        "number": 4,
        "direction": "across",
        "row": 3,
        "col": 0,
        "answer": "NIGHT",
        "clue": "The dark part of the day."
      },
      {
        "id": "6-across",
        "number": 6,
        "direction": "across",
        "row": 4,
        "col": 4,
        "answer": "HOUR",
        "clue": "Sixty minutes."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 7,
        "col": 2,
        "answer": "MONDAY",
        "clue": "The day after Sunday."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 9,
        "col": 0,
        "answer": "WEEK",
        "clue": "A period of seven days."
      },
      {
        "id": "11-across",
        "number": 11,
        "direction": "across",
        "row": 11,
        "col": 0,
        "answer": "FRIDAY",
        "clue": "The day before Saturday."
      },
      {
        "id": "1-down",
        "number": 1,
        "direction": "down",
        "row": 0,
        "col": 4,
        "answer": "MONTH",
        "clue": "One of the twelve parts of a year."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 1,
        "col": 0,
        "answer": "MINUTE",
        "clue": "Sixty seconds."
      },
      {
        "id": "5-down",
        "number": 5,
        "direction": "down",
        "row": 3,
        "col": 6,
        "answer": "SUNDAY",
        "clue": "The day before Monday."
      },
      {
        "id": "7-down",
        "number": 7,
        "direction": "down",
        "row": 5,
        "col": 3,
        "answer": "CLOCK",
        "clue": "Something that shows the time."
      },
      {
        "id": "9-down",
        "number": 9,
        "direction": "down",
        "row": 8,
        "col": 1,
        "answer": "YEAR",
        "clue": "A period of twelve months."
      }
    ],
    "wordBank": [
      "SUNDAY",
      "FRIDAY",
      "WEEK",
      "YEAR",
      "MORNING",
      "MINUTE",
      "HOUR",
      "MONDAY",
      "MONTH",
      "CLOCK",
      "NIGHT"
    ]
  },
  {
    "id": "english-word-skills",
    "title": "English Word Skills",
    "category": "English",
    "emoji": "🔤",
    "color": "#8b83bc",
    "description": "Become a word wizard with a little language magic.",
    "rows": 9,
    "cols": 17,
    "entries": [
      {
        "id": "3-across",
        "number": 3,
        "direction": "across",
        "row": 1,
        "col": 1,
        "answer": "VOWEL",
        "clue": "One of the letters A, E, I, O or U."
      },
      {
        "id": "7-across",
        "number": 7,
        "direction": "across",
        "row": 3,
        "col": 9,
        "answer": "QUESTION",
        "clue": "A sentence that asks something."
      },
      {
        "id": "8-across",
        "number": 8,
        "direction": "across",
        "row": 4,
        "col": 3,
        "answer": "LETTER",
        "clue": "One symbol of the English alphabet."
      },
      {
        "id": "10-across",
        "number": 10,
        "direction": "across",
        "row": 6,
        "col": 4,
        "answer": "CAPITAL",
        "clue": "A big letter, such as A instead of a."
      },
      {
        "id": "11-across",
        "number": 11,
        "direction": "across",
        "row": 7,
        "col": 0,
        "answer": "RHYME",
        "clue": "Two words do this when their endings sound alike."
      },
      {
        "id": "1-down",
        "number": 1,
        "direction": "down",
        "row": 0,
        "col": 2,
        "answer": "NOUN",
        "clue": "A word that names a person, place or thing."
      },
      {
        "id": "2-down",
        "number": 2,
        "direction": "down",
        "row": 0,
        "col": 4,
        "answer": "SENTENCE",
        "clue": "A group of words that gives a complete thought."
      },
      {
        "id": "4-down",
        "number": 4,
        "direction": "down",
        "row": 1,
        "col": 10,
        "answer": "PLURAL",
        "clue": "The form of a noun meaning more than one."
      },
      {
        "id": "5-down",
        "number": 5,
        "direction": "down",
        "row": 2,
        "col": 15,
        "answer": "COMMA",
        "clue": "The punctuation mark (,) used for a short pause."
      },
      {
        "id": "6-down",
        "number": 6,
        "direction": "down",
        "row": 3,
        "col": 7,
        "answer": "PERIOD",
        "clue": "The punctuation mark (.) at the end of a statement."
      },
      {
        "id": "9-down",
        "number": 9,
        "direction": "down",
        "row": 5,
        "col": 0,
        "answer": "VERB",
        "clue": "A word that describes an action, like run."
      }
    ],
    "wordBank": [
      "LETTER",
      "VOWEL",
      "VERB",
      "RHYME",
      "QUESTION",
      "PERIOD",
      "COMMA",
      "CAPITAL",
      "NOUN",
      "PLURAL",
      "SENTENCE"
    ]
  }
];
