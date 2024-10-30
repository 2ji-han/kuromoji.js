/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

import ViterbiBuilder from "./viterbi/ViterbiBuilder";
import ViterbiSearcher from "./viterbi/ViterbiSearcher";
import IpadicFormatter, { type TOKEN } from "./util/IpadicFormatter";
import type DynamicDictionaries from "./dict/DynamicDictionaries";
import type UnknownDictionary from "./dict/UnknownDictionary";
import type TokenInfoDictionary from "./dict/TokenInfoDictionary";

const PUNCTUATION = /、|。/g;

class Tokenizer {
    token_info_dictionary: TokenInfoDictionary;
    unknown_dictionary: UnknownDictionary;
    viterbi_builder: ViterbiBuilder;
    viterbi_searcher: ViterbiSearcher;
    formatter: IpadicFormatter;
    constructor(dic: DynamicDictionaries) {
        this.token_info_dictionary = dic.token_info_dictionary;
        this.unknown_dictionary = dic.unknown_dictionary;
        this.viterbi_builder = new ViterbiBuilder(dic);
        this.viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
        this.formatter = new IpadicFormatter();  // TODO Other dictionaries
    }

    static splitByPunctuation(input: string): string[] {
        const matches = input.matchAll(PUNCTUATION);
        const sentences = [];
        let lastIndex = 0;
        for (const match of matches) {
            const index = match.index!;
            sentences.push(input.substring(lastIndex, index + 1));
            lastIndex = index + 1;
        }
        if (lastIndex < input.length) {
            sentences.push(input.substring(lastIndex));
        }
        return sentences;
        //return input.split(PUNCTUATION);
    };

    tokenize(text: string) {
        const sentences = Tokenizer.splitByPunctuation(text);
        const tokens: TOKEN[] = [];
        for (const sentence of sentences) {
            this.tokenizeForSentence(sentence, tokens);
        }
        return tokens;
    };

    tokenizeForSentence(sentence: string, tokens: TOKEN[]) {
        if (tokens == null) {
            tokens = [];
        }
        const lattice = this.getLattice(sentence);
        const best_path = this.viterbi_searcher.search(lattice);
        let last_pos = 0;
        if (tokens.length > 0) {
            last_pos = tokens[tokens.length - 1].word_position;
        }

        for (let j = 0; j < best_path.length; j++) {
            const node = best_path[j];

            let token: TOKEN;
            let features: string[] = [];
            let features_line: string | null = null;
            if (node.type === "KNOWN") {
                features_line = this.token_info_dictionary.getFeatures(node.name.toString());
                if (features_line == null) {
                    features = [];
                } else {
                    features = features_line.split(",");
                }
                token = this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
            } else if (node.type === "UNKNOWN") {
                // Unknown word
                features_line = this.unknown_dictionary.getFeatures(node.name.toString());
                if (features_line == null) {
                    features = [];
                } else {
                    features = features_line.split(",");
                }
                token = this.formatter.formatUnknownEntry(node.name, last_pos + node.start_pos, node.type, features, node.surface_form);
            } else {
                // TODO User dictionary
                token = this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, []);
            }
            tokens.push(token);
        }

        return tokens;
    };

    getLattice(text: string) {
        return this.viterbi_builder.build(text);
    };
}

export default Tokenizer;
