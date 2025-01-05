import kuromoji from "../../src/kuromoji.js";

console.time("build");
kuromoji.builder({ dicPath: "dict" }).build((err, tokenizer) => {
    console.timeEnd("build");
    console.time("tokenize");
    tokenizer.tokenize("すもももももももものうち");
    console.timeEnd("tokenize");
});