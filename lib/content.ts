/**
 * All the words on the page live here so they're easy to personalise.
 * Edit freely — nothing else needs to change.
 */

export const NAME = "Rafia";
/** How the letter is signed — put your own name here if you like. */
export const FROM = "your friend";

/**
 * Photos & videos from /public/asset, in the order they appear on the wall.
 * Any new file you drop in that folder shows up too (after these), with an
 * auto-generated caption.
 */
export const QUEEN_PHOTO = "smile.jpeg";

export const MEDIA_CAPTIONS: Record<string, string> = {
  "award.mp4": "award winner, obviously 🏆",
  "away.jpeg": "plotting something",
  "bag.mp4": "the new bag reveal 👜",
  "food.jpeg": "mehndi hands & a lilac dupatta",
  "ball.jpeg": "pre-shot confidence 🏀",
  "through.mp4": "…and the shot",
  "bane.mp4": "first-bite food review",
  "contra.jpeg": "lilac walls = natural habitat",
  "bean.mp4": "pew pew 💥",
  "cocomo.jpeg": "cocomo appreciation society",
  "stair.mp4": "the dramatic exit",
  "draw.jpeg": "artist era 🐼",
  "look.jpeg": "horizontal mode activated",
};

export const DICTIONARY = {
  word: "rafia",
  phonetic: "/ˈrɑː.fi.ə/",
  type: "noun",
  meanings: [
    "the girl who lights up every room.",
    "the one who always gives us new adventures and fun.",
    "the most humble, sweetest and genuine person.",
  ],
};

export const TRACKS = [
  { title: "happy birthday (music box mix)", time: "0:15" },
  { title: "lavender mornings", time: "3:12" },
  { title: "matcha before meetings", time: "2:48" },
  { title: "birthday girl era", time: "3:33" },
  { title: "with regards, rafia", time: "4:04" },
];

export const DRINKS = [
  {
    id: "lilac",
    name: "lilac taro latte",
    tag: "house favourite",
    liquid: "#c9b2ef",
    foam: "#efe6fb",
    wish: "For soft mornings, calm inboxes, and days that feel like walking through a lavender field.",
  },
  {
    id: "blue",
    name: "blue sky milk",
    tag: "dreamy",
    liquid: "#a9d8f0",
    foam: "#e6f5fc",
    wish: "For big dreams, long weekends, and every plan you’ve ever pinned finally coming true.",
  },
  {
    id: "matcha",
    name: "iced matcha latte",
    tag: "extra shot of luck",
    liquid: "#b5d395",
    foam: "#f3f8ec",
    wish: "For fresh starts, good energy, and a year that keeps growing greener every month.",
  },
] as const;

/** Little reasons you think she's the best — edit, add or remove freely. */
export const REASONS = [
  "You smile at your laptop like it just told you the best joke. Workdays are better with that smile around.",
  "You won an award and still stayed the most humble person in the room. Proud of you!",
  "Your basketball confidence is unmatched. Your aim… we’re working on it. 🏀",
  "You can make a single cookie look like a Pinterest pin.",
  "Your Pinterest is basically a museum of good taste — I may have checked. Every lilac pin deserves to come true.",
  "Kind, funny, creative, and always down for food. Honestly, the full package.",
];

export const CLOSING_LETTER =
  "Thank you for all the laughs, the food adventures, the random little moments that made ordinary days fun. You bring colour, calm and kindness everywhere you go, and you deserve a year that treats you exactly the way you treat everyone around you — gently, warmly, and with a little extra sparkle. Happy birthday, my friend. Have the loveliest day.";

/** Captions used when a photo's filename doesn't give us a nice one. */
export const FALLBACK_CAPTIONS = [
  "main character energy",
  "certified icon",
  "a whole mood",
  "pin-worthy",
  "softest soul",
  "office sunshine",
  "lilac era",
  "iconic, as always",
  "core memory",
  "that smile tho",
  "living the moodboard",
  "birthday girl",
];
