# kuromoji.js

[![test](https://github.com/f1w3/kuromoji.js/actions/workflows/test.yml/badge.svg)](https://github.com/f1w3/kuromoji.js/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](/LICENSE.txt)

[English](/docs/README-en.md)・[日本語](/docs/README-ja.md)

## this is fork of [@takuyaa/kuromoji.js](https://github.com/takuyaa/kuromoji.js)

and, I was inspired by the following repositories

- **[@MijinkoSD/kuromoji.ts](https://github.com/MijinkoSD/kuromoji.ts)**

Once again, I would like to thank you!

## futures

- [x] Tests Pass 100% :partying_face:
- [x] async to promise/await :partying_face:
- [x] Support and build for browser :partying_face:
- [x] Asynchronization of init functions(eg. `await kuromoji.builder()`) :partying_face:
- [ ] Support Stream
- [ ] kuromoji-server
- [ ] Support user dictionary
- [ ] Search mode
- [ ] Output of N-best solution
- [ ] Support NAIST-jdic, Unidic
- [ ] Low dictionary size(use fst?)

## About

JavaScript implementation of Japanese morphological analyzer.
This is a pure JavaScript porting of [Kuromoji](https://www.atilika.com/ja/kuromoji/).

You can see how kuromoji.js works in [demo site](https://coco-ly.com/kuromoji.js/).

## Directory

Directory tree is as follows:
```
.github       -- Github settings
dict/         -- Dictionaries for tokenizer (gzipped)
docs/         -- kuromoji.js documents
   - demo/     -- kuromoji.js demo page (https://coco-ly.com/kuromoji.js/)
   - example/  -- Examples to use in Node.js
scripts/      -- build scripts
src/          -- Type Script source
```

## Usage

Install with package manager:
```
npm install kuromoji.js
pnpm install kuromoji.js
bun install kuromoji.js
```

Load this library as follows:
```typescript
import kuromoji from "kuromoji.js";
const kuromoji = require("kuromoji.js").default;
//browser
import kuromoji from 'https://cdn.jsdelivr.net/npm/kuromoji.js/dist/browser/index.min.js'
```

You can tokenize sentences with only 5 lines of code.
If you need working examples, you can see the files under the demo or example directory.
```typescript
import kuromoji from "kuromoji.js";

kuromoji.builder().build((err, tokenizer) => {
    // tokenizer is ready
    const path = tokenizer.tokenize("すもももももももものうち");
    console.log(path);
});
```

Also, Loading with top-level await is also supported as follows
```typescript
import kuromoji from "kuromoji.js/promise";

const tokenizer = await kuromoji.builder().build();

const path = tokenizer.tokenize("すもももももももものうち");
console.log(path.length);
```

## Build Dictionary

We currently use mecab-ipadic for our dictionaries, but
You can build and use your own dictionary as long as it is compatible with mecab-ipadic
```
bun build-dict <output path> <dict input path>
```

## API

The function tokenize() returns an JSON array like this:
```typescript
[ {
    // word id in dictionary
    word_id: 509800,
    // word type (KNOWN for words in the dictionary, UNKNOWN for unknown words)
    word_type: 'KNOWN',
    // word start position
    word_position: 1,
    // surface form
    surface_form: '黒文字',
    // part of speech
    pos: '名詞',
    // Part-of-Speech Subdivision 1
    pos_detail_1: '一般',
    // Part-of-Speech Subdivision 2
    pos_detail_2: '*',
    // Part-of-Speech Subdivision 3
    pos_detail_3: '*',
    // conjugated type
    conjugated_type: '*',
    // conjugated form
    conjugated_form: '*',
    // basic form
    basic_form: '黒文字',
    // reading
    reading: 'クロモジ',
    // pronunciation
    pronunciation: 'クロモジ'
} ]
```

(This is defined in [src/_core/util/IpadicFormatter.ts](/src/_core/util/IpadicFormatter.ts))
