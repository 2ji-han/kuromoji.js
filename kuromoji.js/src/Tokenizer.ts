import type DynamicDictionaries from "./dict/DynamicDictionaries";
import type TokenInfoDictionary from "./dict/TokenInfoDictionary";
import type UnknownDictionary from "./dict/UnknownDictionary";
import IpadicFormatter, { type TOKEN } from "./util/IpadicFormatter";
import ViterbiBuilder from "./viterbi/ViterbiBuilder";
import type ViterbiNode from "./viterbi/ViterbiNode";
import ViterbiSearcher from "./viterbi/ViterbiSearcher";

class Tokenizer {
    static readonly #PUNCTUATION_REGEX = /、|。/g;

    #token_info_dictionary: TokenInfoDictionary;
    #unknown_dictionary: UnknownDictionary;
    #viterbi_builder: ViterbiBuilder;
    #viterbi_searcher: ViterbiSearcher;
    #formatter: IpadicFormatter;
    constructor(dic: DynamicDictionaries) {
        this.#token_info_dictionary = dic.token_info_dictionary;
        this.#unknown_dictionary = dic.unknown_dictionary;
        this.#viterbi_builder = new ViterbiBuilder(dic);
        this.#viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
        this.#formatter = new IpadicFormatter(); // TODO Other dictionaries
    }

    static splitByPunctuation(input: string): string[] {
        const matches = input.matchAll(Tokenizer.#PUNCTUATION_REGEX);
        const sentences = [];
        let lastIndex = 0;
        for (const match of matches) {
            const index = match.index;
            sentences.push(input.slice(lastIndex, index + 1));
            lastIndex = index + 1;
        }
        if (lastIndex < input.length) {
            sentences.push(input.slice(lastIndex));
        }
        return sentences;
    }

    tokenize(text: string) {
        //console.log("token_info_dictionary: ", this.token_info_dictionary.target_map.size);
        //console.log("unknown_dictionary: ", this.unknown_dictionary.target_map.size);
        //console.log("viterbi_builder: ", this.viterbi_builder.trie.size());

        const sentences = Tokenizer.splitByPunctuation(text);
        const tokens: TOKEN[] = [];
        for (const sentence of sentences) {
            this.#tokenizeForSentence(sentence, tokens);
        }
        return tokens;
    }

    #tokenizeForSentence(sentence: string, tokens: TOKEN[] = []) {
        const lattice = this.#getLattice(sentence);
        const best_path = this.#viterbi_searcher.search(lattice);
        const last_pos = tokens.length > 0 ? tokens[tokens.length - 1].word_position : 0;

        const best_path_length = best_path.length;
        for (let i = 0; i < best_path_length; i++) {
            const node = best_path[i];
            const token: TOKEN = this.#getTokenFromNode(node, last_pos);
            tokens.push(token);
        }

        return tokens;
    }

    #getTokenFromNode(node: ViterbiNode, last_pos: number): TOKEN {
        if (node.type === "KNOWN") {
            const features_line = this.#token_info_dictionary.getFeatures(node.name);
            const features = features_line == null ? [] : features_line.split(",");
            return this.#formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
        }
        if (node.type === "UNKNOWN") {
            // Unknown word
            const features_line = this.#unknown_dictionary.getFeatures(node.name);
            const features = features_line == null ? [] : features_line.split(",");
            return this.#formatter.formatUnknownEntry(
                node.name,
                last_pos + node.start_pos,
                node.type,
                features,
                node.surface_form
            );
        }
        // TODO User dictionary
        return this.#formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, []);
    }

    #getLattice(text: string) {
        return this.#viterbi_builder.build(text);
    }
}

export default Tokenizer;
