import kuromoji from "../src/kuromoji.js/kuromoji";

console.time("build");
kuromoji.builder({ dicPath: "dict" }).build((err, tokenizer) => {
    console.timeEnd("build");
    console.time("tokenize");
    tokenizer.tokenize("すもももももももものうち");
    console.timeEnd("tokenize");
});