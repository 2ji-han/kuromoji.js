import Tokenizer from "../_core/Tokenizer";
export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
};
declare class TokenizerBuilder {
    #private;
    constructor(option?: TokenizerBuilderOption);
    build(): Promise<Tokenizer>;
}
export default TokenizerBuilder;
