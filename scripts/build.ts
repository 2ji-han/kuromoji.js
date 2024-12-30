import { Glob, $ } from "bun";
import { parse, join } from "node:path";

const OUTDIR = "./dist";

const glob = new Glob("**/kuromoji.ts");
for await (const file of glob.scan({ cwd: "./src" })) {
    const path = parse(file);
    const basename = path.dir;
    const basefile = join("src", file);
    Bun.build({
        entrypoints: [basefile],
        outdir: OUTDIR,
        target: basename === "browser" ? "browser" : "bun",
        format: "esm",
        naming: `[dir]/${path.dir}/index.min.js`,
        minify: true,
        sourcemap: basename === "browser" ? "inline" : "linked",
    }).then(result => {
        const outputFiles = result.outputs;
        for (const outputFile of outputFiles) {
            const { path, size } = outputFile;
            console.log(`Built ${path} (${(size / 1024).toFixed(2)} KB)`);
        }
    });
    Bun.build({
        entrypoints: [basefile],
        outdir: OUTDIR,
        target: basename === "browser" ? "browser" : "node",
        format: "cjs",
        naming: `[dir]/${path.dir}/cjs/index.min.js`,
        minify: true,
        sourcemap: basename === "browser" ? "inline" : "linked",
    }).then(result => {
        const outputFiles = result.outputs;
        for (const outputFile of outputFiles) {
            const { path, size } = outputFile;
            console.log(`Built ${path} (${(size / 1024).toFixed(2)} KB)`);
        }
    });;
}

const result = await $`bunx tsc -P tsconfig.types.json`;
if (result.exitCode === 0) {
    console.log("TypeScript types built successfully.");
} else {
    console.error("Failed to build TypeScript types.");
}
