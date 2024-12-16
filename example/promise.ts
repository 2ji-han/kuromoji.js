import kuromoji from "../src/promise/kuromoji";

const tokenizer = await kuromoji.builder({ dicPath: "dict" }).build();

const path = tokenizer.tokenize("すもももももももものうち");
console.log(path.length);