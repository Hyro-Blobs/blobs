function parseBody(body: string): {
  name?: string;
  image?: string;
  github?: string;
} | null {
  const start = body.indexOf("<!-- ARTWORK START -->");
  const end = body.indexOf("<!-- ARTWORK END -->");

  if (start === -1 || end === -1) {
    return null;
  }

  const content = body.substring(start, end);
  const lines = content.split("\n");

  const result: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = line.split(":");
    result[key.trim()] = value.trim();
  }

  result["name"] = result["Creator Name"].trim();
  result["image"] = result["Creator Profile Image"].trim();
  result["github"] = result["Creator GitHub"].trim();

  return result;
}

export { parseBody };
