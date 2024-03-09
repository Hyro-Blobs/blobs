import { $ } from "bun";
import { join, extname } from "node:path";
import { unlink } from "node:fs/promises";
import {
  addLabels,
  createReview,
  getBody,
  removeLabel,
  requestReviewers,
} from "./github";
import { parseBody } from "./util";

const a = await $`echo asd`.text();

const files = (await Bun.file(
  join(import.meta.dir, "..", "files.json")
).json()) as string[];
if (files.includes("creators.json")) {
  console.log("files.json contains creators");

  await createReview(
    "REQUEST_CHANGES",
    ["You don't need to modify creators.json itself"].join("\n")
  );
  await addLabels(["waiting"]);
  process.exit(0);
}

if (!files.some((f) => f.includes("categories"))) {
  console.error("files.json does not contain categories");
  process.exit(1);
}

const rawBody = await getBody();
const body = parseBody(rawBody);

if (!body || !body.name || !body.image || !body.github) {
  console.log("Could not parse body");

  await createReview(
    "REQUEST_CHANGES",
    [
      "### Could not parse author's metadata from body",
      "Make sure you all followed rules.",
      "",
      "You can copy the following template [here](https://raw.githubusercontent.com/Hyro-Blobs/blobs/.github/pull_request_template.md)",
    ].join("\n")
  );
  await addLabels(["waiting"]);
  process.exit(0);
}

const errors = [];
const success = [];

for (const file of files) {
  const extension = extname(file);

  if (!["png", "svg"].some((ext) => extension === `.${ext}`)) {
    console.log(`File ${file} has an invalid extension: ${extension}`);

    errors.push(
      `- File \`${file}\` has an invalid extension: \`${extension}\``
    );

    continue;
  }

  const res =
    await $`exiftool -creator="${body.name}" -creditline="${body.name} (https://github.com/${body.github})" ${file}`.text();
  if (res.trim() !== "1 image files updated") {
    errors.push(`- Failed to inject metadata into \`${file}\``);

    continue;
  }

  await unlink(`${file}_original`);

  success.push(`- Successfully injected metadata into \`${file}\``);
}

if (errors.length > 0) {
  const msg = ["## Please fix the following problems:", ...errors];

  if (success.length > 0) {
    msg.push("", "## The following things were successfully done:", ...success);
  }

  await createReview("REQUEST_CHANGES", msg.join("\n"));
  await addLabels(["waiting"]);

  process.exit(0);
}

if (success.length > 0) {
  await createReview(
    "APPROVE",
    ["## The following things were successfully done:", ...success].join("\n")
  );
} else {
  await createReview(
    "APPROVE",
    "No problems found 🎉, contacting maintainers."
  );
}

await requestReviewers(["xHyroM", "LowByteFox"]);
await removeLabel("waiting");
