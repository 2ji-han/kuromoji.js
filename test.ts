import kuromoji from "./src/kuromoji";
//import oldkuromoji from "./old/kuromoji"
//
//oldkuromoji.builder({ dicPath: "dict/" }).build((err, tokenizer) => {
//    var path = tokenizer.tokenize("𠮷野屋");
//    console.log("old", path.length);
//});

kuromoji.builder({ dicPath: "dict/" }).build((err, tokenizer) => {
    if (err) {
        console.error(err);
        return
    }
    var path = tokenizer.tokenize("野");
    console.log("new", path);
});