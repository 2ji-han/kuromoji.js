import { Glob, $ } from "bun";
import { createHash } from "node:crypto";
import { parse, join } from "node:path";
import { stat, readdir, writeFile, exists } from "node:fs/promises";

const OUTDIR = "./dist";
const HASH_PATH = join(process.cwd(), "scripts", "_hashes.json");

const isExists = await exists(HASH_PATH);

const hashes = isExists
    ? ((await Bun.file(HASH_PATH).json()) as Record<string, string>)
    : {};

const computeDirHash = async (dir: string) => {
    const hash = createHash("md5");
    const paths = [...(await readdir(dir))].map((name) => join(dir, name));
    while (paths.length) {
        const path = paths.pop();
        if (!path) continue;
        const fileStat = await stat(path);
        if (fileStat.isDirectory()) {
            const filePaths = [...(await readdir(path))].map((name) =>
                join(path, name)
            );
            paths.push(...filePaths);
        } else {
            const file = Bun.file(path);
            const content = await file.text();
            hash.update(content);
        }
    }
    return hash.digest("hex");
};

const glob = new Glob("**/kuromoji.ts");
for await (const file of glob.scan({ cwd: "./src" })) {
    const path = parse(file);
    const basedir = join("src", path.dir);
    const basefile = join("src", file);
    const hash = await computeDirHash(basedir);
    const lastHash = hashes[basedir];
    if (hash === lastHash) {
        continue;
    }
    hashes[basedir] = hash;
    Bun.build({
        entrypoints: [basefile],
        outdir: OUTDIR,
        target: "bun",
        naming: `[dir]/${path.dir}/index.min.js`,
        minify: true,
        sourcemap: "linked",
    });
    Bun.build({
        entrypoints: [basefile],
        outdir: OUTDIR,
        target: "node",
        format: "cjs",
        naming: `[dir]/${path.dir}/cjs/index.min.js`,
        minify: true,
        sourcemap: "linked",
    });
    await writeFile(HASH_PATH, JSON.stringify(hashes, null, 4));
}

await $`bunx tsc -P tsconfig.types.json`;
