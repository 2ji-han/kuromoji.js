const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class ByteBuffer {
    #_buffer: Uint8Array;
    #_position = 0;

    get buffer() {
        return this.#_buffer;
    }

    set buffer(value) {
        this.#_buffer = value;
    }

    get position() {
        return this.#_position;
    }

    set position(value) {
        this.#_position = value;
    }

    constructor(arg?: number | Uint8Array) {
        if (arg === undefined) {
            this.#_buffer = new Uint8Array(1024 * 1024);
            this.#_position = 0;
        } else if (typeof arg === "number") {
            this.#_buffer = new Uint8Array(arg);
            this.#_position = 0;
        } else if (arg instanceof Uint8Array) {
            this.#_buffer = arg;
            this.#_position = 0; // Overwrite
        } else {
            // typeof arg -> String
            throw `${typeof arg} is invalid parameter type`;
        }
    }

    size() {
        return this.#_buffer.length;
    }

    reallocate() {
        const new_array = new Uint8Array(this.#_buffer.length * 2);
        new_array.set(this.#_buffer);
        this.#_buffer = new_array;
    }

    shrink() {
        this.#_buffer = this.#_buffer.subarray(0, this.#_position);
        return this.#_buffer;
    }

    put(b: number | boolean) {
        if (this.#_buffer.length < this.#_position + 1) {
            this.reallocate();
        }
        if (typeof b === "boolean") {
            this.#_buffer[this.#_position++] = b ? 1 : 0;
        } else {
            this.#_buffer[this.#_position++] = b;
        }
    }

    get(_index: number | null = null) {
        let index = _index;
        if (index == null) {
            index = this.#_position;
            this.#_position += 1;
        }
        if (this.#_buffer.length < index + 1) {
            return 0;
        }
        return this.#_buffer[index];
    }

    // Write short to buffer by little endian
    putShort(num: number) {
        if (0xffff < num) {
            throw `${num} is over short value`;
        }
        const lower = 0x00ff & num;
        const upper = (0xff00 & num) >> 8;
        this.put(lower);
        this.put(upper);
    }

    // Read short from buffer by little endian
    getShort(_index: number | null) {
        let index = _index;
        if (index == null) {
            index = this.#_position;
            this.#_position += 2;
        }
        if (this.#_buffer.length < index + 2) {
            return 0;
        }
        const lower = this.#_buffer[index];
        const upper = this.#_buffer[index + 1];
        let value = (upper << 8) + lower;
        if (value & 0x8000) {
            value = -((value - 1) ^ 0xffff);
        }
        return value;
    }

    // Write integer to buffer by little endian
    putInt(num: number) {
        if (0xffffffff < num) {
            throw `${num} is over integer value`;
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
    getInt(_index: number | null = null) {
        let index = _index;
        if (index == null) {
            index = this.#_position;
            this.#_position += 4;
        }
        if (this.#_buffer.length < index + 4) {
            return 0;
        }
        const b0 = this.#_buffer[index];
        const b1 = this.#_buffer[index + 1];
        const b2 = this.#_buffer[index + 2];
        const b3 = this.#_buffer[index + 3];

        return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
    }

    readInt() {
        const pos = this.#_position;
        this.#_position += 4;
        return this.getInt(pos);
    }

    putString(str: string) {
        const bytes = encoder.encode(str);
        for (const byte of bytes) {
            this.put(byte);
        }
        // put null character as terminal character
        this.put(0);
    }

    getString(_index: number = this.#_position) {
        let index = _index;
        const buf: number[] = [];
        let ch: number;

        while (index < this.#_buffer.length) {
            ch = this.get(index++);
            if (ch === 0) break;
            buf.push(ch);
        }

        this.#_position = index;
        return decoder.decode(new Uint8Array(buf));
    }

    getUtf32(_index: number | null = null): number {
        let index = _index;
        if (index == null) {
            index = this.#_position;
            this.#_position += 4;
        }
        if (this.#_buffer.length < index + 4) {
            return 0;
        }
        const codePoint = this.#_buffer.subarray(index, index + 4);
        return new DataView(codePoint.buffer).getUint32(0, false); // little-endian
    }

    getBool(_index: number | null = null) {
        let index = _index;
        if (index == null) {
            index = this.#_position;
            this.#_position += 1;
        }
        if (this.#_buffer.length < index + 1) {
            return false;
        }
        return Boolean(this.#_buffer[index]);
    }
}
