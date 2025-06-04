import fs from "node:fs";

import n1 from "./n1.json";
import n2 from "./n2.json";
import n3 from "./n3.json";
import n4 from "./n4.json";
import n5 from "./n5.json";

const files = [
  { data: n1, name: "n1" },
  { data: n2, name: "n2" },
  { data: n3, name: "n3" },
  { data: n4, name: "n4" },
  { data: n5, name: "n5" },
];

files.forEach(({ data, name }) => {
  const parsed = data.map((a) => ({
    word: a.word,
    meaning: a.meaning,
    furigana: a.furigana,
  }));
  fs.writeFileSync(`${name}-parsed.json`, JSON.stringify(parsed, null, 2));
});
