// n1에 있는 모든 json 배열의 요소를 읽어서 이 폴더의 n1.json에 추가한다.

import fs from "node:fs";
import path from "node:path";

const n1Dir = path.join(import.meta.dirname, "n2");
const n1Files = fs.readdirSync(n1Dir).filter((file) => file.endsWith(".json"));

const ret: unknown[] = [];
for (const file of n1Files) {
	const filePath = path.join(n1Dir, file);
	const data: unknown[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
	ret.push(...data);
}

fs.writeFileSync(
	path.join(import.meta.dirname, "n2-raw.json"),
	JSON.stringify(ret, null, 2),
);
