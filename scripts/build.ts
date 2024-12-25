import { Glob, $ } from "bun";
import { parse, join } from "node:path";

const OUTDIR = "./dist";

await $`bun tsc -P tsconfig.types.json`;

const glob = new Glob("**/kuromoji.ts");

for await (const file of glob.scan({ cwd: "./src" })) {
    const path = parse(file);
    const basefile = join("src", file);
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
}
