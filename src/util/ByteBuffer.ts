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
/*
 *
 * rewrite by f1w3_ | 2024
 * All rights reserved by Takuya Asano.
 * See above for more information.
 *  
 */

"use strict";

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

class ByteBuffer {
    buffer: Uint8Array
    position = 0

    constructor(arg?: number | Uint8Array) {
        if (arg == undefined) {
            const initial_size = 1024 * 1024;
            this.buffer = new Uint8Array(initial_size);
            this.position = 0;
        } else if (typeof arg === "number") {
            const initial_size = arg;
            this.buffer = new Uint8Array(initial_size);
            this.position = 0;
        } else if (arg instanceof Uint8Array) {
            this.buffer = arg;
            this.position = 0;  // Overwrite
        } else {
            // typeof arg -> String
            throw typeof arg + " is invalid parameter type for ByteBuffer constructor";
        }
    }

    size() {
        return this.buffer.length;
    };

    reallocate() {
        var new_array = new Uint8Array(this.buffer.length * 2);
        new_array.set(this.buffer);
        this.buffer = new_array;
    };

    shrink() {
        this.buffer = this.buffer.subarray(0, this.position);
        return this.buffer;
    };

    put(b: number | boolean) {
        if (this.buffer.length < this.position + 1) {
            this.reallocate();
        }
        if (typeof b === "boolean") {
            this.buffer[this.position++] = b ? 1 : 0;
        } else {
            this.buffer[this.position++] = b;
        }
    };

    get(index: number | null = null) {
        if (index == null) {
            index = this.position;
            this.position += 1;
        }
        if (this.buffer.length < index + 1) {
            return 0;
        }
        return this.buffer[index];
    };

    // Write short to buffer by little endian
    putShort(num: number) {
        if (0xFFFF < num) {
            throw num + " is over short value";
        }
        const lower = (0x00FF & num);
        const upper = (0xFF00 & num) >> 8;
        this.put(lower);
        this.put(upper);
    };

    // Read short from buffer by little endian
    getShort(index: number | null) {
        if (index == null) {
            index = this.position;
            this.position += 2;
        }
        if (this.buffer.length < index + 2) {
            return 0;
        }
        const lower = this.buffer[index];
        const upper = this.buffer[index + 1];
        let value = (upper << 8) + lower;
        if (value & 0x8000) {
            value = -((value - 1) ^ 0xFFFF);
        }
        return value;
    };

    // Write integer to buffer by little endian
    putInt(num: number) {
        if (0xFFFFFFFF < num) {
            throw num + " is over integer value";
        }
        const b0 = (0x000000FF & num);
        const b1 = (0x0000FF00 & num) >> 8;
        const b2 = (0x00FF0000 & num) >> 16;
        const b3 = (0xFF000000 & num) >> 24;
        this.put(b0);
        this.put(b1);
        this.put(b2);
        this.put(b3);
    };

    // Read integer from buffer by little endian
    getInt(index: number | null = null) {
        if (index == null) {
            index = this.position;
            this.position += 4;
        }
        if (this.buffer.length < index + 4) {
            return 0;
        }
        const b0 = this.buffer[index];
        const b1 = this.buffer[index + 1];
        const b2 = this.buffer[index + 2];
        const b3 = this.buffer[index + 3];

        return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
    };

    readInt() {
        const pos = this.position;
        this.position += 4;
        return this.getInt(pos);
    };

    putString(str: string) {
        const bytes = stringToUtf8Bytes(str);
        if (!bytes) throw new Error("bytes null.");
        for (const byte of bytes) {
            this.put(byte);
        }
        // put null character as terminal character
        this.put(0);
    };

    getString(index: number = this.position) {
        const buf = [];
        let ch: number;

        while (index < this.buffer.length) {
            ch = this.get(index++);
            if (ch === 0) break;
            buf.push(ch);
        }

        this.position = index;
        return utf8BytesToString(new Uint8Array(buf));
    };

    getUtf32(index: number | null = null): number {
        if (index == null) {
            index = this.position;
            this.position += 4;
        }
        if (this.buffer.length < index + 4) {
            return 0;
        }
        const codePoint = this.buffer.subarray(index, index + 4);
        return new DataView(codePoint.buffer).getUint32(0, false); // little-endian
    }
}

export default ByteBuffer;
