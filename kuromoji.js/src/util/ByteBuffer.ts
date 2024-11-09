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

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class ByteBuffer {
    buffer: Uint8Array;
    position = 0;

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
            this.position = 0; // Overwrite
        } else {
            // typeof arg -> String
            throw typeof arg + " is invalid parameter type for ByteBuffer constructor";
        }
    }

    size() {
        return this.buffer.length;
    }

    reallocate() {
        var new_array = new Uint8Array(this.buffer.length * 2);
        new_array.set(this.buffer);
        this.buffer = new_array;
    }

    shrink() {
        this.buffer = this.buffer.subarray(0, this.position);
        return this.buffer;
    }

    put(b: number | boolean) {
        if (this.buffer.length < this.position + 1) {
            this.reallocate();
        }
        if (typeof b === "boolean") {
            this.buffer[this.position++] = b ? 1 : 0;
        } else {
            this.buffer[this.position++] = b;
        }
    }

    get(index: number | null = null) {
        if (index == null) {
            index = this.position;
            this.position += 1;
        }
        if (this.buffer.length < index + 1) {
            return 0;
        }
        return this.buffer[index];
    }

    // Write short to buffer by little endian
    putShort(num: number) {
        if (0xffff < num) {
            throw num + " is over short value";
        }
        const lower = 0x00ff & num;
        const upper = (0xff00 & num) >> 8;
        this.put(lower);
        this.put(upper);
    }

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
            value = -((value - 1) ^ 0xffff);
        }
        return value;
    }

    // Write integer to buffer by little endian
    putInt(num: number) {
        if (0xffffffff < num) {
            throw num + " is over integer value";
        }
        const b0 = 0x000000ff & num;
        const b1 = (0x0000ff00 & num) >> 8;
        const b2 = (0x00ff0000 & num) >> 16;
        const b3 = (0xff000000 & num) >> 24;
        this.put(b0);
        this.put(b1);
        this.put(b2);
        this.put(b3);
    }

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
    }

    readInt() {
        const pos = this.position;
        this.position += 4;
        return this.getInt(pos);
    }

    putString(str: string) {
        const bytes = encoder.encode(str);
        if (!bytes) throw new Error("bytes null.");
        for (const byte of bytes) {
            this.put(byte);
        }
        // put null character as terminal character
        this.put(0);
    }

    getString(index: number = this.position) {
        const buf = [];
        let ch: number;

        while (index < this.buffer.length) {
            ch = this.get(index++);
            if (ch === 0) break;
            buf.push(ch);
        }

        this.position = index;
        return decoder.decode(new Uint8Array(buf));
    }

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
