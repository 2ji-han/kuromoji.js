import { beforeEach, describe, expect, it } from "bun:test";
import doublearray, { type DoubleArray } from "../../DoubleArray/DoubleArray";

describe("doublearray", () => {
    describe("contain", () => {
        let trie: DoubleArray;
        const dict: { [key: string]: number } = {
            apple: 1,
            ball: 2,
            bear: 3,
            bird: 4,
            bison: 5,
            black: 6,
            blue: 7,
            blur: 8,
            cold: 10,
            column: 11,
            cow: 12,
        };
        const words: { k: string; v: number }[] = [];
        for (const key of Object.keys(dict)) {
            words.push({ k: key, v: dict[key] });
        }
        it("Contain bird", () => {
            trie = doublearray.builder().build(words);
            expect(trie.contain("bird")).toBeTrue();
        });
        it("Contain bison", () => {
            trie = doublearray.builder().build(words);
            expect(trie.contain("bison")).toBeTrue();
        });
        it("Lookup bird", () => {
            trie = doublearray.builder().build(words);
            expect(trie.lookup("bird")).toEqual(dict.bird);
        });
        it("Lookup bison", () => {
            trie = doublearray.builder().build(words);
            expect(trie.lookup("bison")).toEqual(dict.bison);
        });
        it("Build", () => {
            trie = doublearray.builder(4).build(words);
            expect(trie.lookup("bison")).toEqual(dict.bison);
        });
    });
    describe("load", () => {
        let trie: DoubleArray; // target
        let load_trie: DoubleArray; // target
        const words = [{ k: "apple", v: 1 }]; // test data
        beforeEach((done) => {
            // Build original
            trie = doublearray.builder().build(words);

            // Load from original typed array
            const base_buffer = trie.bufferController.getBaseBuffer();
            const check_buffer = trie.bufferController.getCheckBuffer();
            load_trie = doublearray.load(base_buffer, check_buffer);

            done();
        });
        it("Original and loaded tries lookup successfully", () => {
            expect(trie.lookup("apple")).toEqual(words[0].v);
            expect(load_trie.lookup("apple")).toEqual(words[0].v);
        });
        it("Original and loaded typed arrays are same", () => {
            expect(trie.bufferController.getBaseBuffer()).toEqual(
                load_trie.bufferController.getBaseBuffer()
            );
            expect(trie.bufferController.getCheckBuffer()).toEqual(
                load_trie.bufferController.getCheckBuffer()
            );
        });
    });
});
