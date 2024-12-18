import Tokenizer from "../_core/Tokenizer";
export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
};
declare class TokenizerBuilder {
    #private;
    constructor(option?: TokenizerBuilderOption);
    build(callback: (err: Error | null, tokenizer: Tokenizer) => void): void;
}
export default TokenizerBuilder;
