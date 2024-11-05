import { TokenizerBuilder } from "./src/kuromoji";

const builder = new TokenizerBuilder();
const tokenizer = await builder.build();

const paths = tokenizer.tokenize("すもももももももものうち");
console.log(paths);