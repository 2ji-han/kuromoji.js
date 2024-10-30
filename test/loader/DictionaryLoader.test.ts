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

import { expect, describe, beforeEach, it } from "bun:test";
import DictionaryLoader from "../../src/loader/NodeDictionaryLoader";
import type DynamicDictionaries from "../../src/dict/DynamicDictionaries";

const DIC_DIR = "dict/";

describe("DictionaryLoader", () => {
    let dictionaries: DynamicDictionaries | null = null; // target object

    beforeEach((done) => {
        const loader = new DictionaryLoader(DIC_DIR);
        loader.load((err, dic) => {
            dictionaries = dic;
            done();
        });
    });

    it("Unknown dictionaries are loaded properly", () => {
        if (!dictionaries) {
            throw new Error("dictionaries is null")
        }
        expect(dictionaries.unknown_dictionary.lookup(" ")).toEqual({
            class_id: 1,
            class_name: "SPACE",
            is_always_invoke: false,
            is_grouping: true,
            max_length: 0
        });
    });
    it("TokenInfoDictionary is loaded properly", () => {
        if (!dictionaries) {
            throw new Error("dictionaries is null")
        }
        expect(dictionaries.token_info_dictionary.getFeatures("0").length).toBeGreaterThanOrEqual(1);
    });
});

describe("DictionaryLoader about loading", () => {
    it("could load directory path without suffix /", (done) => {
        const loader = new DictionaryLoader("dict"); // not have suffix /
        loader.load((err, dic) => {
            expect(err).toBeNull();
            expect(dic).not.toBeUndefined();
            done();
        });
    });
    it("couldn't load dictionary, then call with error", (done) => {
        const loader = new DictionaryLoader("non-exist/dictionaries");
        loader.load((err, dic) => {
            expect(err).toBeObject();
            expect(err).not.toBeNull();
            done();
        });
    });
});
