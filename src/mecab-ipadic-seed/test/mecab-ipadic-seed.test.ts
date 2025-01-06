import { describe, expect, it } from "bun:test";
import IPADic from "../../mecab-ipadic-seed/index";

describe('IPADic', () => {
    it('constructor', () => {
        const dic = new IPADic();
        expect(dic).not.toBeNull();
        expect(dic.costMatrixDefinition).not.toBeNull();
        expect(dic.characterDefinition).not.toBeNull();
        expect(dic.unknownWordDefinition).not.toBeNull();
        expect(dic.tokenInfoDictionaries).not.toBeNull();
    });
    it('read cost matrix (matrix.def)', (done) => {
        const dic = new IPADic();
        let lines = 0;
        dic.readMatrixDef((line) => {
            expect(line).not.toBeNull();
            lines++;
        }).then(() => {
            expect(lines).toBe(1731857);
            done();
        });
    });
    it('read character definition (char.def)', (done) => {
        const dic = new IPADic();
        let lines = 0;
        dic.readCharDef((line) => {
            expect(line).not.toBeNull();
            lines++;
        }).then(() => {
            expect(lines).toBe(147);
            done();
        });
    });
    it('read unknown word definition (unk.def)', (done) => {
        const dic = new IPADic();
        let lines = 0;
        dic.readUnkDef((line) => {
            lines++;
            expect(line).not.toBeNull();
        }).then(() => {
            expect(lines).toBe(40);
            done();
        });
    });
    it('read token info dictionaries (*.csv)', (done) => {
        const dic = new IPADic();
        let lines = 0;
        dic.readTokenInfo((line) => {
            expect(line).not.toBeNull();
            lines++;
        }).then(() => {
            expect(lines).toBe(392126);
            done();
        });
    });
});