import changelogs from "../docs/changelog.json";
import fs from "node:fs";

const FILE_NAME = "docs/CHANGELOG.md";

fs.writeFileSync(FILE_NAME, "# automatically generated file\n\n");
const entries = Object.entries(changelogs);
for (let i = 0; i < entries.length; i++) {
    const [key, data] = entries[i];
    const nextKey = (entries[i + 1] ? entries[i + 1][0] : null) ?? "0.0.1";
    fs.appendFileSync(FILE_NAME, `<a name="${key}"></a>\n`);
    fs.appendFileSync(FILE_NAME, `## [${key}](https://github.com/takuyaa/kuromoji.js/compare/${nextKey}...${key}) (${data.date})\n\n`);
    for (const [title, messages] of Object.entries(data.messages)) {
        fs.appendFileSync(FILE_NAME, `### ${title}\n\n`);
        for (const message of messages) {
            fs.appendFileSync(FILE_NAME, `* ${message}\n`);
        }
        fs.appendFileSync(FILE_NAME, "\n");
    }
}