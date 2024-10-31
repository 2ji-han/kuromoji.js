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
/*
 *
 * rewrite by f1w3_ | 2024
 * All rights reserved by Takuya Asano.
 * See above for more information.
 *  
 */

"use strict";

import ViterbiBuilder from "./viterbi/ViterbiBuilder";
import ViterbiSearcher from "./viterbi/ViterbiSearcher";
import IpadicFormatter, { type TOKEN } from "./util/IpadicFormatter";
import type DynamicDictionaries from "./dict/DynamicDictionaries";
import type UnknownDictionary from "./dict/UnknownDictionary";
import type TokenInfoDictionary from "./dict/TokenInfoDictionary";
import type ViterbiNode from "./viterbi/ViterbiNode";

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
        const sentences = [];
        let lastIndex = 0;
        for (const match of input.matchAll(PUNCTUATION)) {
            const index = match.index!;
            sentences.push(input.slice(lastIndex, index + 1));
            lastIndex = index + 1;
        }
        if (lastIndex < input.length) {
            sentences.push(input.slice(lastIndex));
        }
        return sentences;
    };

    tokenize(text: string) {
        const sentences = Tokenizer.splitByPunctuation(text);
        const tokens: TOKEN[] = [];
        for (const sentence of sentences) {
            this.tokenizeForSentence(sentence, tokens);
        }
        return tokens;
    };

    tokenizeForSentence(sentence: string, tokens: TOKEN[] = []) {
        const lattice = this.getLattice(sentence);
        const best_path = this.viterbi_searcher.search(lattice);
        const last_pos = (tokens.length > 0) ? tokens[tokens.length - 1].word_position : 0;

        for (const node of best_path) {
            const token: TOKEN = this.getTokenFromNode(node, last_pos);
            tokens.push(token);
        }

        return tokens;
    };

    getTokenFromNode(node: ViterbiNode, last_pos: number): TOKEN {
        if (node.type === "KNOWN") {
            const features_line = this.token_info_dictionary.getFeatures(node.name.toString());
            const features = features_line == null ? [] : features_line.split(",");
            return this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
        } else if (node.type === "UNKNOWN") {
            // Unknown word
            const features_line = this.unknown_dictionary.getFeatures(node.name.toString());
            const features = features_line == null ? [] : features_line.split(",");
            return this.formatter.formatUnknownEntry(node.name, last_pos + node.start_pos, node.type, features, node.surface_form);
        } else {
            // TODO User dictionary
            return this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, []);
        }
    }

    getLattice(text: string) {
        return this.viterbi_builder.build(text);
    };
}

export default Tokenizer;
