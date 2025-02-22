
import type { DynamicDictionaries } from "./dict/dynamic-dictionaries.js";
import type { TokenInfoDictionary } from "./dict/token-info-dictionary.js";
import type { UnknownDictionary } from "./dict/unknown-dictionary.js";
import { type TOKEN, IpadicFormatter } from "./util/ipadic-formatter.js";
import { ViterbiBuilder } from "./viterbi/viterbi-builder.js";
import type { ViterbiNode } from "./viterbi/viterbi-node.js";
import { ViterbiSearcher } from "./viterbi/viterbi-searcher.js";

export class Tokenizer {
    private readonly token_info_dictionary: TokenInfoDictionary;
    private readonly unknown_dictionary: UnknownDictionary;
    private readonly viterbi_builder: ViterbiBuilder;
    private readonly viterbi_searcher: ViterbiSearcher;
    private readonly formatter: IpadicFormatter;
    constructor(dic: DynamicDictionaries) {
        this.token_info_dictionary = dic.token_info_dictionary;
        this.unknown_dictionary = dic.unknown_dictionary;
        this.viterbi_builder = new ViterbiBuilder(dic);
        this.viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
        this.formatter = new IpadicFormatter(); // TODO Other dictionaries
    }

    tokenize(text: string): TOKEN[] {
        const matches = text.matchAll(/、|。/g);
        const sentences: string[] = [];
        let lastIndex = 0;
        for (const match of matches) {
            const index = match.index;
            sentences.push(text.slice(lastIndex, index + 1));
            lastIndex = index + 1;
        }
        if (lastIndex < text.length) {
            sentences.push(text.slice(lastIndex));
        }

        const tokens: TOKEN[] = [];
        for (const sentence of sentences) {
            this.tokenizeForSentence(sentence, tokens);
        }
        return tokens;
    }

    private tokenizeForSentence(sentence: string, tokens: TOKEN[] = []): TOKEN[] {
        const lattice = this.viterbi_builder.build(sentence);
        const best_path = this.viterbi_searcher.search(lattice);
        const last_pos = tokens.length > 0 ? tokens[tokens.length - 1].word_position : 0;
        for (const node of best_path) {
            tokens.push(this.getTokenFromNode(node, last_pos));
        }
        return tokens;
    }

    private getTokenFromNode(node: ViterbiNode, last_pos: number): TOKEN {
        const features_line =
            node.type === "KNOWN"
                ? this.token_info_dictionary.getFeatures(node.name)
                : this.unknown_dictionary.getFeatures(node.name);

        const features = features_line ? features_line.split(",") : [];

        if (node.type === "UNKNOWN") {
            return this.formatter.formatUnknownEntry(
                node.name,
                last_pos + node.start_pos,
                node.type,
                features,
                node.surface_form
            );
        }

        return this.formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
    }
}
