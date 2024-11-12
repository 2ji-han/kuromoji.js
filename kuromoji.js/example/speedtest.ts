import kuromoji from "../src/kuromoji";

setInterval(() => {
    console.time("build");
    kuromoji.builder({ dicPath: "dict" }).build((err, tokenizer) => {
        console.timeEnd("build");
        console.time("tokenize");
        tokenizer.tokenize("すもももももももものうち");
        console.timeEnd("tokenize");
    });
}, 2000);
