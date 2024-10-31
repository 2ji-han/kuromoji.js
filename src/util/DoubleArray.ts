// DoubleArray.ts MIT License
// Copyright (c) 2014 Takuya Asano All Rights Reserved.
/*
 *
 * rewrite by f1w3_ | 2024
 * All rights reserved by Takuya Asano.
 * See above for more information.
 *  
 */

"use strict";

const TERM_CHAR = "\u0000"; // terminal character
const TERM_CODE = 0;        // terminal character code
const ROOT_ID = 0;          // index of root node
const NOT_FOUND = -1;       // traverse() returns if no nodes found
const BASE_SIGNED = true;
const CHECK_SIGNED = true;
const BASE_BYTES = 4;
const CHECK_BYTES = 4;
const MEMORY_EXPAND_RATIO = 2;

// Array utility functions
const newArrayBuffer = (signed: boolean, bytes: number, size: number) => {
    if (signed) {
        switch (bytes) {
            case 1:
                return new Int8Array(size);
            case 2:
                return new Int16Array(size);
            case 4:
                return new Int32Array(size);
            default:
                throw new RangeError("Invalid newArray parameter element_bytes:" + bytes);
        }
    } else {
        switch (bytes) {
            case 1:
                return new Uint8Array(size);
            case 2:
                return new Uint16Array(size);
            case 4:
                return new Uint32Array(size);
            default:
                throw new RangeError("Invalid newArray parameter element_bytes:" + bytes);
        }
    }
};

const arrayCopy = (src: Uint8Array, src_offset: number, length: number) => {
    var buffer = new ArrayBuffer(length);
    var dstU8 = new Uint8Array(buffer, 0, length);
    var srcU8 = src.subarray(src_offset, length);
    dstU8.set(srcU8);
    return dstU8;
};

/**
 * Convert String (UTF-16) to UTF-8 ArrayBuffer
 *
 * @param {String} str UTF-16 string to convert
 * @return {Uint8Array | null} Byte sequence encoded by UTF-8
 */
const stringToUtf8Bytes = (str: string): Uint8Array | null => {
    const bytes = new Uint8Array(str.length * 4);
    let j = 0;
    for (let i = 0; i < str.length; i++) {
        let unicode_code = str.charCodeAt(i);
        if (unicode_code >= 0xD800 && unicode_code <= 0xDBFF) {
            // surrogate pair
            if (i + 1 < str.length) {
                const lower = str.charCodeAt(++i);
                if (lower >= 0xDC00 && lower <= 0xDFFF) {
                    unicode_code = ((unicode_code - 0xD800) << 10) + (lower - 0xDC00) + 0x10000;
                } else {
                    return null; // malformed surrogate pair
                }
            } else {
                return null; // malformed surrogate pair at end of string
            }
        }

        if (unicode_code < 0x80) {
            bytes[j++] = unicode_code;
        } else if (unicode_code < 0x800) {
            bytes[j++] = 0xC0 | (unicode_code >>> 6);
            bytes[j++] = 0x80 | (unicode_code & 0x3F);
        } else if (unicode_code < 0x10000) {
            bytes[j++] = 0xE0 | (unicode_code >>> 12);
            bytes[j++] = 0x80 | ((unicode_code >>> 6) & 0x3F);
            bytes[j++] = 0x80 | (unicode_code & 0x3F);
        } else if (unicode_code < 0x110000) {
            bytes[j++] = 0xF0 | (unicode_code >>> 18);
            bytes[j++] = 0x80 | ((unicode_code >>> 12) & 0x3F);
            bytes[j++] = 0x80 | ((unicode_code >>> 6) & 0x3F);
            bytes[j++] = 0x80 | (unicode_code & 0x3F);
        } else {
            return null; // malformed UCS4 code
        }
    }

    return bytes.subarray(0, j);
};

/**
 * Convert UTF-8 ArrayBuffer to String (UTF-16)
 *
 * @param {Uint8Array} bytes UTF-8 byte sequence to convert
 * @return {String} String encoded by UTF-16
 */
const utf8BytesToString = (bytes: Uint8Array): string => {
    const strArray = [];
    let i = 0;

    while (i < bytes.length) {
        const b1 = bytes[i++];
        let code;

        if (b1 < 0x80) {
            // 1 byte
            code = b1;
        } else if ((b1 >> 5) === 0x06) {
            // 2 bytes
            const b2 = bytes[i++];
            code = ((b1 & 0x1f) << 6) | (b2 & 0x3f);
        } else if ((b1 >> 4) === 0x0e) {
            // 3 bytes
            const b2 = bytes[i++];
            const b3 = bytes[i++];
            code = ((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
        } else {
            // 4 bytes
            const b2 = bytes[i++];
            const b3 = bytes[i++];
            const b4 = bytes[i++];
            code = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
        }

        if (code < 0x10000) {
            strArray.push(String.fromCharCode(code));
        } else {
            // surrogate pair
            code -= 0x10000;
            strArray.push(String.fromCharCode(0xD800 | (code >> 10)));
            strArray.push(String.fromCharCode(0xDC00 | (code & 0x3FF)));
        }
    }

    return strArray.join('');
};

type ArrayBuffer = Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array;

type BaseCheck = {
    signed: boolean,
    bytes: number,
    array: ArrayBuffer | null
};

const newBC = (initial_size: number = 1024) => {
    const initBase = (_base: ArrayBuffer, start: number, end: number) => {  // 'end' index does not include
        if (!check.array) {
            throw new Error("check array is not initialized");
        }
        for (let i = start; i < end; i++) {
            _base[i] = - i + 1;  // inversed previous empty node index
        }
        if (0 < check.array[check.array.length - 1]) {
            let last_used_id = check.array.length - 2;
            while (0 < check.array[last_used_id]) {
                last_used_id--;
            }
            _base[start] = - last_used_id;
        }
    };

    const initCheck = (_check: ArrayBuffer, start: number, end: number) => {
        for (let i = start; i < end; i++) {
            _check[i] = - i - 1;  // inversed next empty node index
        }
    };

    const realloc = (min_size: number) => {
        // expand arrays size by given ratio
        const new_size = min_size * MEMORY_EXPAND_RATIO;
        // console.log('re-allocate memory to ' + new_size);

        const base_new_array = newArrayBuffer(base.signed, base.bytes, new_size);
        if (!base.array) throw new Error('realloc failed. base.array is null');
        initBase(base_new_array, base.array.length, new_size);  // init BASE in new range
        base_new_array.set(base.array);
        base.array = null;  // explicit GC
        base.array = base_new_array;

        const check_new_array = newArrayBuffer(check.signed, check.bytes, new_size);
        if (!check.array) throw new Error('realloc failed. check.array is null');
        initCheck(check_new_array, check.array.length, new_size);  // init CHECK in new range
        check_new_array.set(check.array);
        check.array = null;  // explicit GC
        check.array = check_new_array;
    };

    let first_unused_node = ROOT_ID + 1;

    const base: BaseCheck = {
        signed: BASE_SIGNED,
        bytes: BASE_BYTES,
        array: newArrayBuffer(BASE_SIGNED, BASE_BYTES, initial_size)
    };

    const check: BaseCheck = {
        signed: CHECK_SIGNED,
        bytes: CHECK_BYTES,
        array: newArrayBuffer(CHECK_SIGNED, CHECK_BYTES, initial_size)
    };

    // init root node
    if (!base.array) {
        throw new Error("base.array is null");
    }
    if (!check.array) {
        throw new Error("check.array is null");
    }
    base.array[ROOT_ID] = 1;
    check.array[ROOT_ID] = ROOT_ID;

    // init BASE
    initBase(base.array, ROOT_ID + 1, base.array.length);

    // init CHECK
    initCheck(check.array, ROOT_ID + 1, check.array.length);

    return {
        getBaseBuffer: () => {
            return base.array;
        },
        getCheckBuffer: () => {
            return check.array;
        },
        loadBaseBuffer: (base_buffer: Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array) => {
            base.array = base_buffer;
            return this;
        },
        loadCheckBuffer: (check_buffer: Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array) => {
            check.array = check_buffer;
            return this;
        },
        size: () => {
            if (!base.array) {
                throw new Error("base.array is null");
            }
            if (!check.array) {
                throw new Error("check.array is null");
            }
            return Math.max(base.array.length, check.array.length);
        },
        getBase: (index: number) => {
            if (!base.array) {
                throw new Error("base.array is null");
            }
            if (base.array.length - 1 < index) {
                return - index + 1;
                // realloc(index);
            }
            // if (!Number.isFinite(base.array[index])) {
            //     console.log('getBase:' + index);
            //     throw 'getBase' + index;
            // }
            return base.array[index];
        },
        getCheck: (index: number) => {
            if (!check.array) {
                throw new Error("check.array is null");
            }
            if (check.array.length - 1 < index) {
                return - index - 1;
                // realloc(index);
            }
            // if (!Number.isFinite(check.array[index])) {
            //     console.log('getCheck:' + index);
            //     throw 'getCheck' + index;
            // }
            return check.array[index];
        },
        setBase: (index: number, base_value: number) => {
            if (!base.array) {
                throw new Error("base.array is null");
            }
            if (base.array.length - 1 < index) {
                realloc(index);
            }
            base.array[index] = base_value;
        },
        setCheck: (index: number, check_value: number) => {
            if (!check.array) {
                throw new Error("check.array is null");
            }
            if (check.array.length - 1 < index) {
                realloc(index);
            }
            check.array[index] = check_value;
        },
        setFirstUnusedNode: (index: number) => {
            // if (!Number.isFinite(index)) {
            //     throw 'assertion error: setFirstUnusedNode ' + index + ' is not finite number';
            // }
            first_unused_node = index;
        },
        getFirstUnusedNode: () => {
            // if (!Number.isFinite(first_unused_node)) {
            //     throw 'assertion error: getFirstUnusedNode ' + first_unused_node + ' is not finite number';
            // }
            return first_unused_node;
        },
        shrink: () => {
            if (!base.array) {
                throw new Error("base.array is null");
            }
            if (!check.array) {
                throw new Error("check.array is null");
            }
            let last_index = Math.max(base.array.length, check.array.length); - 1;
            while (true) {
                if (0 <= check.array[last_index]) {
                    break;
                }
                last_index--;
            }
            base.array = base.array.subarray(0, last_index + 2);   // keep last unused node
            check.array = check.array.subarray(0, last_index + 2); // keep last unused node
        },
        calc: () => {
            if (!base.array) {
                throw new Error("base.array is null");
            }
            if (!check.array) {
                throw new Error("check.array is null");
            }
            let unused_count = 0;
            const size = check.array.length;
            for (let i = 0; i < size; i++) {
                if (check.array[i] < 0) {
                    unused_count++;
                }
            }
            return {
                all: size,
                unused: unused_count,
                efficiency: (size - unused_count) / size
            };
        },
        dump: () => {
            // for debug
            if (!base.array) {
                throw new Error("base.array is null");
            }
            if (!check.array) {
                throw new Error("check.array is null");
            }

            let dump_base = "";
            let dump_check = "";

            for (const data of base.array) {
                dump_base = dump_base + " " + data;
            }
            for (const data of check.array) {
                dump_check = dump_check + " " + data;
            }
            console.log("base:" + dump_base);
            console.log("chck:" + dump_check);

            return "base:" + dump_base + " chck:" + dump_check;
        }
    };
};

/**
 * Factory method of double array
 */
class DoubleArrayBuilder {
    bc: ReturnType<typeof newBC>;
    keys: { k: string, v: number }[]
    constructor(initial_size: number = 1024) {
        this.bc = newBC(initial_size);  // BASE and CHECK
        this.keys = [];
    }

    /**
    * Append a key to initialize set
    * (This method should be called by dictionary ordered key)
    *
    * @param {String} key
    * @param {Number} value Integer value from 0 to max signed integer number - 1
    */
    append(key: string, record: number) {
        this.keys.push({ k: key, v: record });
        return this;
    };

    /**
    * Build double array for given keys
    *
    * @param {Array} keys Array of keys. A key is a Object which has properties 'k', 'v'.
    * 'k' is a key string, 'v' is a record assigned to that key.
    * @return {DoubleArray} Compiled double array
    */
    build(keys: { k: string, v: number }[] = this.keys, sorted: boolean = false) {
        if (keys == null) {
            return new DoubleArray(this.bc);
        }
        // Convert key string to ArrayBuffer
        let buff_keys: { k: any; v: number; }[] | null = keys.map((k) => {
            return {
                k: stringToUtf8Bytes(k.k + TERM_CHAR),
                v: k.v
            };
        });

        // Sort keys by byte order
        if (sorted) {
            this.keys = buff_keys;
        } else {
            this.keys = buff_keys.sort((k1, k2) => {
                const b1 = k1.k;
                const b2 = k2.k;
                const min_length = Math.min(b1.length, b2.length);
                for (let pos = 0; pos < min_length; pos++) {
                    if (b1[pos] === b2[pos]) {
                        continue;
                    }
                    return b1[pos] - b2[pos];
                }
                return b1.length - b2.length;
            });
        }

        buff_keys = null;  // explicit GC

        this._build(ROOT_ID, 0, 0, this.keys.length);
        return new DoubleArray(this.bc);
    };

    /**
    * Append nodes to BASE and CHECK array recursively
    */
    _build(parent_index: number, position: number, start: number, length: number) {
        const children_info = this.getChildrenInfo(position, start, length);
        const _base = this.findAllocatableBase(children_info);

        this.setBC(parent_index, children_info, _base);

        for (let i = 0; i < children_info.length; i = i + 3) {
            const child_code = children_info[i];
            if (child_code === TERM_CODE) {
                continue;
            }
            const child_start = children_info[i + 1];
            const child_len = children_info[i + 2];
            const child_index = _base + child_code;
            this._build(child_index, position + 1, child_start, child_len);
        }
    };

    getChildrenInfo(position: number, start: number, length: number) {
        let current_char = this.keys[start].k[position];
        let children_info = new Int32Array(length * 3);
        let i = 0;

        children_info[i++] = parseInt(current_char);  // char (current)
        children_info[i++] = start;         // start index (current)

        let next_pos = start;
        let start_pos = start;
        for (; next_pos < start + length; next_pos++) {
            const next_char = this.keys[next_pos].k[position];
            if (current_char !== next_char) {
                children_info[i++] = next_pos - start_pos;  // length (current)

                children_info[i++] = parseInt(next_char);             // char (next)
                children_info[i++] = next_pos;              // start index (next)
                current_char = next_char;
                start_pos = next_pos;
            }
        }
        children_info[i++] = next_pos - start_pos;
        children_info = children_info.subarray(0, i);

        return children_info;
    };

    setBC(parent_id: number, children_info: Int32Array, _base: number) {
        const bc = this.bc;
        bc.setBase(parent_id, _base);  // Update BASE of parent node
        let i;
        for (i = 0; i < children_info.length; i = i + 3) {
            const code = children_info[i];
            const child_id = _base + code;

            // Update linked list of unused nodes

            // Assertion
            // if (child_id < 0) {
            //     throw 'assertion error: child_id is negative'
            // }

            const prev_unused_id = - bc.getBase(child_id);
            const next_unused_id = - bc.getCheck(child_id);
            // if (prev_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            // if (next_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            if (child_id !== bc.getFirstUnusedNode()) {
                bc.setCheck(prev_unused_id, - next_unused_id);
            } else {
                // Update first_unused_node
                bc.setFirstUnusedNode(next_unused_id);
            }
            bc.setBase(next_unused_id, - prev_unused_id);

            const check = parent_id;         // CHECK is parent node index
            bc.setCheck(child_id, check);  // Update CHECK of child node

            // Update record
            if (code === TERM_CODE) {
                const start_pos = children_info[i + 1];
                // var len = children_info[i + 2];
                // if (len != 1) {
                //     throw 'assertion error: there are multiple terminal nodes. len:' + len;
                // }
                let value = this.keys[start_pos].v;

                if (value == null) {
                    value = 0;
                }

                const base = - value - 1;       // BASE is inverted record value
                bc.setBase(child_id, base);  // Update BASE of child(leaf) node
            }
        }
    };

    /**
    * Find BASE value that all children are allocatable in double array's region
    */
    findAllocatableBase(children_info: Int32Array) {
        const bc = this.bc;

        // Assertion: keys are sorted by byte order
        // var c = -1;
        // for (var i = 0; i < children_info.length; i = i + 3) {
        //     if (children_info[i] < c) {
        //         throw 'assertion error: not sort key'
        //     }
        //     c = children_info[i];
        // }

        // iterate linked list of unused nodes
        let _base: number;
        let curr = bc.getFirstUnusedNode();  // current index
        // if (curr < 0) {
        //     throw 'assertion error: getFirstUnusedNode returns negative value'
        // }

        while (true) {
            _base = curr - children_info[0];

            if (_base < 0) {
                curr = - bc.getCheck(curr);  // next

                // if (curr < 0) {
                //     throw 'assertion error: getCheck returns negative value'
                // }

                continue;
            }

            let empty_area_found = true;
            for (var i = 0; i < children_info.length; i = i + 3) {
                const code = children_info[i];
                const candidate_id = _base + code;

                if (!this.isUnusedNode(candidate_id)) {
                    // candidate_id is used node
                    // next
                    curr = - bc.getCheck(curr);
                    // if (curr < 0) {
                    //     throw 'assertion error: getCheck returns negative value'
                    // }

                    empty_area_found = false;
                    break;
                }
            }
            if (empty_area_found) {
                // Area is free
                return _base;
            }
        }
    }

    /**
    * Check this double array index is unused or not
    */
    isUnusedNode(index: number) {
        const bc = this.bc;
        const check = bc.getCheck(index);

        // if (index < 0) {
        //     throw 'assertion error: isUnusedNode index:' + index;
        // }

        if (index === ROOT_ID) {
            // root node
            return false;
        }
        if (check < 0) {
            // unused
            return true;
        }

        // used node (incl. leaf)
        return false;
    };
}

/**
* Factory method of double array
*/
class DoubleArray {
    bc: ReturnType<typeof newBC>;
    constructor(bc: ReturnType<typeof newBC>) {
        this.bc = bc;  // BASE and CHECK
        this.bc.shrink();
    }

    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Boolean} True if this trie contains a given key
     */
    contain(key: string) {
        const bc = this.bc;
        key += TERM_CHAR;
        const buffer = stringToUtf8Bytes(key);
        if (!buffer) {
            throw new Error('invalid key');
        }
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (let i = 0; i < buffer.length; i++) {
            const code = buffer[i];

            child = this.traverse(parent, code);
            if (child === NOT_FOUND) {
                return false;
            }

            if (bc.getBase(child) <= 0) {
                // leaf node
                return true;
            } else {
                // not leaf
                parent = child;
                continue;
            }
        }
        return false;
    };

    /**
    * Look up a given key in this trie
    *
    * @param {String} key
    * @return {Number} Record value assgned to this key, -1 if this key does not contain
    */
    lookup(key: string) {
        key += TERM_CHAR;
        const buffer = stringToUtf8Bytes(key);
        if (!buffer) {
            throw new Error('invalid key');
        }
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (let i = 0; i < buffer.length; i++) {
            const code = buffer[i];
            child = this.traverse(parent, code);
            if (child === NOT_FOUND) {
                return NOT_FOUND;
            }
            parent = child;
        }
        const base = this.bc.getBase(child);
        if (base <= 0) {
            // leaf node
            return - base - 1;
        } else {
            // not leaf
            return NOT_FOUND;
        }
    };


    /**
    * Common prefix search
    *
    * @param {String} key
    * @return {Array} Each result object has 'k' and 'v' (key and record,
    * respectively) properties assigned to matched string
    */
    commonPrefixSearch(key: string) {
        const buffer = stringToUtf8Bytes(key);
        if (!buffer) {
            throw new Error('invalid key');
        }
        const result = [];
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (let i = 0; i < buffer.length; i++) {
            const code = buffer[i];
            child = this.traverse(parent, code);
            if (child !== NOT_FOUND) {
                parent = child;
                // look forward by terminal character code to check this node is a leaf or not
                const grand_child = this.traverse(child, TERM_CODE);
                if (grand_child !== NOT_FOUND) {
                    const base = this.bc.getBase(grand_child);
                    const r: { k: string, v: number } = {
                        k: "",
                        v: 0
                    };

                    if (base <= 0) {
                        // If child is a leaf node, add record to result
                        r.v = - base - 1;
                    }
                    // If child is a leaf node, add word to result
                    r.k = utf8BytesToString(arrayCopy(buffer, 0, i + 1));
                    result.push(r);
                }
                continue;
            } else {
                break;
            }
        }
        return result;
    };

    traverse(parent: number, code: number) {
        const child = this.bc.getBase(parent) + code;
        if (this.bc.getCheck(child) === parent) {
            return child;
        } else {
            return NOT_FOUND;
        }
    };

    size() {
        return this.bc.size();
    };

    calc() {
        return this.bc.calc();
    };

    dump() {
        return this.bc.dump();
    };
}

const doublearray = {
    builder: (initial_size: number = 1024) => {
        return new DoubleArrayBuilder(initial_size);
    },
    load: (base_buffer: Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array, check_buffer: Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array) => {
        const bc = newBC(0);
        bc.loadBaseBuffer(base_buffer);
        bc.loadCheckBuffer(check_buffer);
        return new DoubleArray(bc);
    }
};

export { DoubleArrayBuilder, DoubleArray };

export default doublearray;
