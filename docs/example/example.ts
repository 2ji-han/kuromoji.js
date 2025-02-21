import kuromoji from "@f1w3/kuromoji.js";

const tokenizer = await kuromoji.fromURL('https://coco-ly.com/kuromoji.js/dict');
const path = tokenizer.tokenize("すもももももももものうち");
console.log(path.length);
