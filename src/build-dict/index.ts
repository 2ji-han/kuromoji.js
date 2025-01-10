import fs from "node:fs";
import path from "node:path";
import { gzip } from "node:zlib";
import type { TypedArrayBuffer } from "../DoubleArray";
import kuromoji from "../kuromoji.js";
import IPADic from "../mecab-ipadic-seed";

console.log("Dictionary builder for kuromoji.js");

const dictPath = process.argv[2] ?? "dict/";
const dicPath = process.argv[3];

if (dictPath) {
    console.log(`Using output dictionary path: ${dictPath}`);
}

if (dicPath) {
    console.log(`Using user seed dictionary path: ${dicPath}`);
}

if (!fs.existsSync(dictPath)) {
    console.log("Creating dict directory ...");
    fs.mkdirSync(dictPath);
} else {
    console.log("Cleaning up dict directory ...");
    for (const file of fs.readdirSync(dictPath)) {
        fs.unlinkSync(path.join(dictPath, file));
    }
}

const dic = new IPADic(dicPath);
const builder = kuromoji.dictionaryBuilder();

// Build token info dictionary
const tokenInfoPromise = dic.readTokenInfo((line) => {
    builder.addTokenInfoDictionary(line);
});

// Build connection costs matrix
const matrixDefPromise = dic.readMatrixDef((line) => {
    builder.putCostMatrixLine(line);
});

// Build unknown dictionary
const unkDefPromise = dic.readUnkDef((line) => {
    builder.putUnkDefLine(line);
});

// Build character definition dictionary
const charDefPromise = dic.readCharDef((line) => {
    builder.putCharDefLine(line);
});

const writeDictionaryFiles = (buffer: TypedArrayBuffer, savePath: string) =>
    new Promise<void>((resolve, reject) => {
        gzip(buffer, (err, gzipbuffer) => {
            if (err) {
                reject(err);
            }
            const writeableBuffer = new Uint8Array(gzipbuffer);
            fs.writeFile(path.join(dictPath, savePath), writeableBuffer, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });

// Wait for all promises to complete
Promise.all([tokenInfoPromise, matrixDefPromise, unkDefPromise, charDefPromise])
    .then(() => {
        console.log("Finishied to read all seed dictionary files");
        console.log("Building binary dictionary ...");
        return builder.build();
    })
    .then(async (dic) => {
        if (
            !dic.unknown_dictionary.character_definition ||
            !dic.unknown_dictionary.character_definition.invoke_definition_map
        ) {
            throw new Error("Failed to build dictionary");
        }
        console.log("Dictionary has been built.");
        console.log("Writing dictionary files ...");

        const base_buffer = dic.trie.bufferController.getBaseBuffer();
        const check_buffer = dic.trie.bufferController.getCheckBuffer();
        const token_info_buffer = dic.token_info_dictionary.dictionary.buffer;
        const tid_pos_buffer = dic.token_info_dictionary.pos_buffer.buffer;
        const tid_map_buffer = dic.token_info_dictionary.targetMapToBuffer();
        const connection_costs_buffer = dic.connection_costs.buffer;
        const unk_buffer = dic.unknown_dictionary.dictionary.buffer;
        const unk_pos_buffer = dic.unknown_dictionary.pos_buffer.buffer;
        const unk_map_buffer = dic.unknown_dictionary.targetMapToBuffer();
        const char_map_buffer = dic.unknown_dictionary.character_definition.character_category_map;
        const char_compat_map_buffer = dic.unknown_dictionary.character_definition.compatible_category_map;
        const invoke_definition_map_buffer =
            dic.unknown_dictionary.character_definition.invoke_definition_map.toBuffer();

        Promise.all([
            writeDictionaryFiles(base_buffer, "base.dat.gz"),
            writeDictionaryFiles(check_buffer, "check.dat.gz"),
            writeDictionaryFiles(token_info_buffer, "tid.dat.gz"),
            writeDictionaryFiles(tid_pos_buffer, "tid_pos.dat.gz"),
            writeDictionaryFiles(tid_map_buffer, "tid_map.dat.gz"),
            writeDictionaryFiles(connection_costs_buffer, "cc.dat.gz"),
            writeDictionaryFiles(unk_buffer, "unk.dat.gz"),
            writeDictionaryFiles(unk_pos_buffer, "unk_pos.dat.gz"),
            writeDictionaryFiles(unk_map_buffer, "unk_map.dat.gz"),
            writeDictionaryFiles(char_map_buffer, "unk_char.dat.gz"),
            writeDictionaryFiles(char_compat_map_buffer, "unk_compat.dat.gz"),
            writeDictionaryFiles(invoke_definition_map_buffer, "unk_invoke.dat.gz"),
        ])
            .then(() => {
                console.log("Dictionary files have been written.");
            })
            .catch(console.error);
    })
    .catch(console.error);
