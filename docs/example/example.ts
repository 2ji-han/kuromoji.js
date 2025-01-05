import kuromoji from "../../src/kuromoji.js";

kuromoji.builder().build((err, tokenizer) => {
    if (err) return;
    // tokenizer is ready
    const path = tokenizer.tokenize("すもももももももものうち");
    console.log(path.length);
});
