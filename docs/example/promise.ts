import kuromoji from "../src/kuromoji-promise";

const tokenizer = await kuromoji.builder({ dicPath: "dict" }).build();

const path = tokenizer.tokenize("すもももももももものうち");
console.log(path.length);