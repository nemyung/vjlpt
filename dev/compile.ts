import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readMigrationFiles } from "drizzle-orm/migrator";

// 현재 파일의 디렉토리명 구하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 root의 drizzle 폴더 경로 만들기
const migrationsFolder = path.join(__dirname, "..", "drizzle");

const migrations = readMigrationFiles({
	migrationsFolder,
});

await fs.writeFile(
	path.join(__dirname, "..", "src", "lib", "db", "mg.json"),
	JSON.stringify(migrations),
);
