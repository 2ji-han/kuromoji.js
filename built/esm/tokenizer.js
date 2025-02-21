import { IpadicFormatter } from "./util/ipadic-formatter.js";
import { ViterbiBuilder } from "./viterbi/viterbi-builder.js";
import { ViterbiSearcher } from "./viterbi/viterbi-searcher.js";
export class Tokenizer {
    #token_info_dictionary;
    #unknown_dictionary;
    #viterbi_builder;
    #viterbi_searcher;
    #formatter;
    constructor(dic) {
        this.#token_info_dictionary = dic.token_info_dictionary;
        this.#unknown_dictionary = dic.unknown_dictionary;
        this.#viterbi_builder = new ViterbiBuilder(dic);
        this.#viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
        this.#formatter = new IpadicFormatter(); // TODO Other dictionaries
    }
    tokenize(text) {
        const matches = text.matchAll(/、|。/g);
        const sentences = [];
        let lastIndex = 0;
        for (const match of matches) {
            const index = match.index;
            sentences.push(text.slice(lastIndex, index + 1));
            lastIndex = index + 1;
        }
        if (lastIndex < text.length) {
            sentences.push(text.slice(lastIndex));
        }
        const tokens = [];
        for (const sentence of sentences) {
            this.#tokenizeForSentence(sentence, tokens);
        }
        return tokens;
    }
    #tokenizeForSentence(sentence, tokens = []) {
        const lattice = this.#viterbi_builder.build(sentence);
        const best_path = this.#viterbi_searcher.search(lattice);
        const last_pos = tokens.length > 0 ? tokens[tokens.length - 1].word_position : 0;
        for (const node of best_path) {
            tokens.push(this.#getTokenFromNode(node, last_pos));
        }
        return tokens;
    }
    #getTokenFromNode(node, last_pos) {
        const features_line = node.type === "KNOWN"
            ? this.#token_info_dictionary.getFeatures(node.name)
            : this.#unknown_dictionary.getFeatures(node.name);
        const features = features_line ? features_line.split(",") : [];
        if (node.type === "UNKNOWN") {
            return this.#formatter.formatUnknownEntry(node.name, last_pos + node.start_pos, node.type, features, node.surface_form);
        }
        return this.#formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
    }
}
//# sourceMappingURL=tokenizer.js.map