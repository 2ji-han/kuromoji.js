import Tokenizer from "./Tokenizer";
export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
};
declare class TokenizerBuilder {
    #private;
    constructor(option?: TokenizerBuilderOption);
    build(): Promise<Tokenizer>;
}
export default TokenizerBuilder;
