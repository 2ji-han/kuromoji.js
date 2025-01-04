import fs from "node:fs/promises";

const paths = [
    "node_modules",
    "dist",
];

for (const path of paths) {
    fs.rm(path, { recursive: true })
        .then(() => console.info(`Successfully deleted: ${path}`))
        .catch(err => console.error(`Error cleaning ${path}: ${err.message}`))
}