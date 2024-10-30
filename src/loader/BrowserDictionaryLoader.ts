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

"use strict";

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

"use strict";

import path from "path";
import zlib from "zlib";
import DynamicDictionaries from "../dict/DynamicDictionaries";

class BrowserDictionaryLoader {
    dic: DynamicDictionaries;
    dic_path: string;
    constructor(dic_path: string) {
        this.dic = new DynamicDictionaries();
        this.dic_path = dic_path;
    }

    loadArrayBuffer = (url: string) => new Promise<ArrayBufferLike>((resolve, reject) => {
        fetch(url)
            .then(async res => await res.arrayBuffer())
            .then(buffer => {
                zlib.gunzip(buffer, (err, binary) => {
                    if (err) return reject(err);
                    const typed_array = new Uint8Array(binary);
                    resolve(typed_array.buffer);
                });
            })
            .catch(err => {
                reject(err)
            })
    });

    load(callback: (error: Error[] | null, dic: DynamicDictionaries) => void) {
        const dic = this.dic;
        const dic_path = this.dic_path;
        const loadArrayBuffer = this.loadArrayBuffer;

        Promise.allSettled([
            // Trie
            Promise.all(["base.dat.gz", "check.dat.gz"].map(filename =>
                loadArrayBuffer(path.join(dic_path, filename))
            )).then(buffers => {
                const base_buffer = new Int32Array(buffers[0]);
                const check_buffer = new Int32Array(buffers[1]);
                dic.loadTrie(base_buffer, check_buffer);
            }),

            // Token info dictionaries
            Promise.all(["tid.dat.gz", "tid_pos.dat.gz", "tid_map.dat.gz"].map(filename =>
                loadArrayBuffer(path.join(dic_path, filename))
            )).then(buffers => {
                const token_info_buffer = new Uint8Array(buffers[0]);
                const pos_buffer = new Uint8Array(buffers[1]);
                const target_map_buffer = new Uint8Array(buffers[2]);
                dic.loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer);
            }),

            // Connection cost matrix
            loadArrayBuffer(path.join(dic_path, "cc.dat.gz")).then(buffer => {
                const cc_buffer = new Int16Array(buffer);
                dic.loadConnectionCosts(cc_buffer);
            }),

            // Unknown dictionaries
            Promise.all(["unk.dat.gz", "unk_pos.dat.gz", "unk_map.dat.gz", "unk_char.dat.gz", "unk_compat.dat.gz", "unk_invoke.dat.gz"].map(filename =>
                loadArrayBuffer(path.join(dic_path, filename))
            )).then(buffer => {
                const unk_buffer = new Uint8Array(buffer[0]);
                const unk_pos_buffer = new Uint8Array(buffer[1]);
                const unk_map_buffer = new Uint8Array(buffer[2]);
                const cat_map_buffer = new Uint8Array(buffer[3]);
                const compat_cat_map_buffer = new Uint32Array(buffer[4]);
                const invoke_def_buffer = new Uint8Array(buffer[5]);
                dic.loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
                // dic.loadUnknownDictionaries(char_buffer, unk_buffer);
            }),
        ]).then((results) => {
            const errors = results.filter(result => result.status === 'rejected');
            if (errors.length > 0) {
                callback(errors.map(err => err.reason), dic);
            } else {
                callback(null, dic);
            }
        });
    };
}

export default BrowserDictionaryLoader;

