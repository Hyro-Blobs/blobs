import { join } from "node:path";
import { writeFileSync } from "node:fs";

interface Creator {
  name: string;
  image: string;
  github: string;
}

function parseBody(body: string): Creator | null {
  const start = body.indexOf("<!-- ARTWORK START -->");
  const end = body.indexOf("<!-- ARTWORK END -->");

  if (start === -1 || end === -1) {
    return null;
  }

  const content = body.substring(start, end);
  const lines = content.split("\n");

  const result: Record<string, string> = {};

  for (const line of lines) {
    const [key, ...value] = line.split(":");
    if (!key || !value) continue;

    result[key.trim()] = value.toString().trim();
  }

  result["name"] = result["Creator Name"].trim();
  result["image"] = result["Creator Profile Image"].trim();
  result["github"] = result["Creator GitHub"].trim();

  return {
    name: result["name"],
    image: result["image"],
    github: result["github"],
  };
}

async function addToCreators(name: string, image: string, github: string) {
  const creators: Array<Creator> = await Bun.file(
    join(import.meta.dir, "..", "creators.json")
  ).json();

  creators.push({ name, image, github });

  creators.sort((a, b) => a.name.localeCompare(b.name));

  await writeFileSync(
    join(import.meta.dir, "..", "creators.json"),
    JSON.stringify(creators, null, 2)
  );
}

export { parseBody, addToCreators };
