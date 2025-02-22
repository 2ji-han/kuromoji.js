const TERM_CHAR = "\u0000"; // terminal character
const TERM_CODE = 0; // terminal character code
const ROOT_ID = 0; // index of root node
const NOT_FOUND = -1; // traverse() returns if no nodes found

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type TypedArrayBuffer = Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array;

export function createTypedArray(signed: boolean, bytes: number, size: number): TypedArrayBuffer {
    if (signed) {
        switch (bytes) {
            case 1:
                return new Int8Array(size);
            case 2:
                return new Int16Array(size);
            case 4:
                return new Int32Array(size);
            default:
                throw new RangeError(`Invalid parameter: ${bytes}`);
        }
    }
    switch (bytes) {
        case 1:
            return new Uint8Array(size);
        case 2:
            return new Uint16Array(size);
        case 4:
            return new Uint32Array(size);
        default:
            throw new RangeError(`Invalid parameter: ${bytes}`);
    }
};

class BufferController {
    #first_unused_node: number;

    #base_signed: boolean;
    #check_signed: boolean;
    #base_bytes: number;
    #check_bytes: number;
    #base_array: TypedArrayBuffer;
    #check_array: TypedArrayBuffer;

    constructor(initial_size = 1024) {
        this.#first_unused_node = ROOT_ID + 1;

        this.#base_signed = true;
        this.#base_bytes = 4;
        this.#base_array = createTypedArray(true, 4, initial_size);

        this.#check_signed = true;
        this.#check_bytes = 4;
        this.#check_array = createTypedArray(true, 4, initial_size);

        // Initialize root node
        this.#base_array[ROOT_ID] = 1;
        this.#check_array[ROOT_ID] = ROOT_ID;

        // Initialize BASE and CHECK arrays
        this.#initBase(this.#base_array, ROOT_ID + 1, this.#base_array.length);
        this.#initCheck(this.#check_array, ROOT_ID + 1, this.#check_array.length);
    }

    #initBase(_base: TypedArrayBuffer, start: number, end: number) {
        for (let i = start; i < end; i++) {
            _base[i] = -i + 1;
        }
        if (0 < this.#check_array[this.#check_array.length - 1]) {
            let last_used_id = this.#check_array.length - 2;
            while (0 < this.#check_array[last_used_id]) {
                last_used_id--;
            }
            _base[start] = -last_used_id;
        }
    }

    #initCheck(_check: TypedArrayBuffer, start: number, end: number) {
        for (let i = start; i < end; i++) {
            _check[i] = -i - 1;
        }
    }

    #realloc(min_size: number) {
        const new_size = min_size * 2;
        const base_new_array = createTypedArray(this.#base_signed, this.#base_bytes, new_size);
        this.#initBase(base_new_array, this.#base_array.length, new_size);
        base_new_array.set(this.#base_array);
        this.#base_array = base_new_array;

        const check_new_array = createTypedArray(this.#check_signed, this.#check_bytes, new_size);
        this.#initCheck(check_new_array, this.#check_array.length, new_size);
        check_new_array.set(this.#check_array);
        this.#check_array = check_new_array;
    }

    getBaseBuffer() {
        return this.#base_array;
    }

    getCheckBuffer() {
        return this.#check_array;
    }

    loadBaseBuffer(base_buffer: TypedArrayBuffer) {
        this.#base_array = base_buffer;
        return this;
    }

    loadCheckBuffer(check_buffer: TypedArrayBuffer) {
        this.#check_array = check_buffer;
        return this;
    }

    size() {
        return Math.max(this.#base_array.length, this.#check_array.length);
    }

    getBase(index: number) {
        if (this.#base_array.length - 1 < index) {
            return -index + 1;
        }
        if (this.#base_array[index] === undefined) {
            throw new Error(`base_array[${index}] is undefined`);
        }
        return this.#base_array[index];
    }

    getCheck(index: number) {
        if (this.#check_array.length - 1 < index) {
            return -index - 1;
        }
        if (this.#check_array[index] === undefined) {
            throw new Error(`check_array[${index}] is undefined`);
        }
        return this.#check_array[index];
    }

    setBase(index: number, base_value: number) {
        if (this.#base_array.length - 1 < index) {
            this.#realloc(index);
        }
        this.#base_array[index] = base_value;
    }

    setCheck(index: number, check_value: number) {
        if (this.#check_array.length - 1 < index) {
            this.#realloc(index);
        }
        this.#check_array[index] = check_value;
    }

    setFirstUnusedNode(index: number) {
        this.#first_unused_node = index;
    }

    getFirstUnusedNode() {
        return this.#first_unused_node;
    }

    shrink() {
        let last_index = Math.max(this.#base_array.length, this.#check_array.length) - 1;
        while (last_index > 0 && this.#check_array.length > last_index && this.#check_array[last_index] >= 0) {
            last_index--;
        }
        this.#base_array = this.#base_array.subarray(0, last_index + 2);
        this.#check_array = this.#check_array.subarray(0, last_index + 2);
    }

    calc() {
        let unused_count = 0;
        for (const data of this.#check_array) {
            if (data < 0) {
                unused_count++;
            }
        }
        const length = this.#check_array.length;
        return {
            all: length,
            unused: unused_count,
            efficiency: (length - unused_count) / length,
        };
    }

    dump() {
        let dump_base = "";
        let dump_check = "";

        for (const data of this.#base_array) {
            dump_base += ` ${data}`;
        }
        for (const data of this.#check_array) {
            dump_check += ` ${data}`;
        }
        return `base:${dump_base} check:${dump_check}`;
    }
}

/**
 * Factory method of double array
 */
class DoubleArrayBuilder {
    #bufferController: BufferController;
    #keys: { k: string | Uint8Array; v: number }[];
    constructor(initial_size = 1024) {
        this.#bufferController = new BufferController(initial_size); // BASE and CHECK
        this.#keys = [];
    }

    /**
     * Append a key to initialize set
     * (This method should be called by dictionary ordered key)
     *
     * @param {String} key
     * @param {Number} value Integer value from 0 to max signed integer number - 1
     */
    append(key: string, record: number) {
        this.#keys.push({ k: key, v: record });
        return this;
    }

    /**
     * Build double array for given keys
     *
     * @param {Array} keys Array of keys. A key is a Object which has properties 'k', 'v'.
     * 'k' is a key string, 'v' is a record assigned to that key.
     * @return {DoubleArray} Compiled double array
     */
    build(keys: { k: string | Uint8Array; v: number }[] = this.#keys, sorted = false): DoubleArray {
        if (keys == null) {
            return new DoubleArray(this.#bufferController);
        }
        // Convert key string to ArrayBuffer
        const buff_keys: { k: Uint8Array; v: number }[] | null = keys.map((k) => {
            return {
                k: encoder.encode(k.k + TERM_CHAR),
                v: k.v,
            };
        });

        // Sort keys by byte order
        if (sorted) {
            this.#keys = buff_keys;
        } else {
            this.#keys = buff_keys.sort((k1, k2) => {
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

        this.#_build(ROOT_ID, 0, 0, this.#keys.length);
        return new DoubleArray(this.#bufferController);
    }

    /**
     * Append nodes to BASE and CHECK array recursively
     */
    #_build(parent_index: number, position: number, start: number, length: number) {
        const children_info = this.#getChildrenInfo(position, start, length);
        const base = this.#findAllocatableBase(children_info);

        this.#setBufferController(parent_index, children_info, base);

        for (let i = 0; i < children_info.length; i = i + 3) {
            const child_code = children_info[i];
            if (child_code === TERM_CODE) {
                continue;
            }
            const child_start = children_info[i + 1];
            const child_len = children_info[i + 2];
            const child_index = base + child_code;
            this.#_build(child_index, position + 1, child_start, child_len);
        }
    }

    #getChildrenInfo(position: number, start: number, length: number) {
        if (this.#keys[start] == null) {
            throw new Error(`key is null. start:${start}`);
        }
        let current_char = this.#keys[start].k[position];
        let children_info = new Int32Array(length * 3);
        let i = 0;
        children_info[i++] = Number.parseInt(`${current_char}`); // char (current)
        children_info[i++] = start; // start index (current)

        let next_pos = start;
        let start_pos = start;
        for (; next_pos < start + length; next_pos++) {
            const next_key = this.#keys[next_pos];
            if (next_key === undefined) {
                throw new Error(`key is null. next_pos:${next_pos}`);
            }
            const next_char = next_key.k[position];
            if (current_char !== next_char) {
                children_info[i++] = next_pos - start_pos; // length (current)

                children_info[i++] = Number.parseInt(`${next_char}`); // char (next)
                children_info[i++] = next_pos; // start index (next)
                current_char = next_char;
                start_pos = next_pos;
            }
        }
        children_info[i++] = next_pos - start_pos;
        children_info = children_info.subarray(0, i);

        return children_info;
    }

    #setBufferController(parent_id: number, children_info: Int32Array, _base: number) {
        const bufferController = this.#bufferController;
        bufferController.setBase(parent_id, _base); // Update BASE of parent node
        for (let i = 0; i < children_info.length; i = i + 3) {
            const code = children_info[i];
            const child_id = _base + code;

            const prev_unused_id = -bufferController.getBase(child_id);
            const next_unused_id = -bufferController.getCheck(child_id);
            if (child_id !== bufferController.getFirstUnusedNode()) {
                bufferController.setCheck(prev_unused_id, -next_unused_id);
            } else {
                bufferController.setFirstUnusedNode(next_unused_id);
            }
            bufferController.setBase(next_unused_id, -prev_unused_id);

            const check = parent_id;
            bufferController.setCheck(child_id, check);

            // Update record
            if (code === TERM_CODE) {
                const start_pos = children_info[i + 1];
                if (this.#keys[start_pos] == null) {
                    throw new Error(`key is null. start_pos:${start_pos}`);
                }
                let value = this.#keys[start_pos].v;

                if (value == null) {
                    value = 0;
                }

                const base = -value - 1; // BASE is inverted record value
                bufferController.setBase(child_id, base); // Update BASE of child(leaf) node
            }
        }
    }

    /**
     * Find BASE value that all children are allocatable in double array's region
     */
    #findAllocatableBase(children_info: Int32Array) {
        const bufferController = this.#bufferController;

        let base: number;
        let curr = bufferController.getFirstUnusedNode(); // current index

        while (children_info.length > 0) {
            base = curr - children_info[0];

            if (base < 0) {
                curr = -bufferController.getCheck(curr); // next
                continue;
            }

            let empty_area_found = true;
            for (let i = 0; i < children_info.length; i = i + 3) {
                const code = children_info[i];
                const candidate_id = base + code;

                if (!this.#isUnusedNode(candidate_id)) {
                    curr = -bufferController.getCheck(curr);
                    empty_area_found = false;
                    break;
                }
            }
            if (empty_area_found) {
                return base;
            }
        }
        throw new Error("DoubleArrayBuilder#findAllocatableBase: Can't find allocatable base");
    }

    /**
     * Check this double array index is unused or not
     */
    #isUnusedNode(index: number) {
        const bufferController = this.#bufferController;
        const check = bufferController.getCheck(index);

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
    }
}

/**
 * Factory method of double array
 */
class DoubleArray {
    #bufferController: BufferController;
    constructor(bufferController: BufferController) {
        this.#bufferController = bufferController; // BASE and CHECK
        this.#bufferController.shrink();
    }

    get bufferController() {
        return this.#bufferController;
    }

    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Boolean} True if this trie contains a given key
     */
    contain(_key: string): boolean {
        let key = _key;
        const bufferController = this.#bufferController;
        key += TERM_CHAR;
        const buffer = encoder.encode(key);
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (const code of buffer) {

            child = this.#traverse(parent, code);
            if (child === NOT_FOUND) {
                return false;
            }

            if (bufferController.getBase(child) <= 0) {
                // leaf node
                return true;
            }
            // not leaf
            parent = child;
        }
        return false;
    }

    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Number} Record value assgned to this key, -1 if this key does not contain
     */
    lookup(_key: string): number {
        let key = _key;
        key += TERM_CHAR;
        const buffer = encoder.encode(key);
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (const code of buffer) {
            child = this.#traverse(parent, code);
            if (child === NOT_FOUND) {
                return NOT_FOUND;
            }
            parent = child;
        }
        const base = this.#bufferController.getBase(child);
        if (base <= 0) {
            // leaf node
            return -base - 1;
        }
        // not leaf
        return NOT_FOUND;
    }

    /**
     * Common prefix search
     *
     * @param {String} key
     * @return {Array} Each result object has 'k' and 'v' (key and record,
     * respectively) properties assigned to matched string
     */
    commonPrefixSearch(key: string): { k: string; v: number }[] {
        const buffer = encoder.encode(key);
        const result: { k: string; v: number }[] = [];
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (const [index, code] of buffer.entries()) {
            child = this.#traverse(parent, code);
            if (child !== NOT_FOUND) {
                parent = child;
                // look forward by terminal character code to check this node is a leaf or not
                const grand_child = this.#traverse(child, TERM_CODE);
                if (grand_child !== NOT_FOUND) {
                    const base = this.#bufferController.getBase(grand_child);
                    const r: { k: string; v: number } = {
                        k: "",
                        v: 0,
                    };

                    if (base <= 0) {
                        // If child is a leaf node, add record to result
                        r.v = -base - 1;
                    }
                    // If child is a leaf node, add word to result
                    r.k = decoder.decode(buffer.slice(0, index + 1));
                    result.push(r);
                }
                continue;
            }
            break;
        }
        return result;
    }

    #traverse(parent: number, code: number) {
        const child = this.#bufferController.getBase(parent) + code;
        if (this.#bufferController.getCheck(child) === parent) {
            return child;
        }
        return NOT_FOUND;
    }

    size() {
        return this.#bufferController.size();
    }

    calc() {
        return this.#bufferController.calc();
    }

    dump() {
        return this.#bufferController.dump();
    }
}

export { DoubleArrayBuilder, DoubleArray };

export default {
    builder: (initial_size = 1024) => {
        return new DoubleArrayBuilder(initial_size);
    },
    load: (base_buffer: TypedArrayBuffer, check_buffer: TypedArrayBuffer) => {
        const bufferController = new BufferController(0);
        bufferController.loadBaseBuffer(base_buffer);
        bufferController.loadCheckBuffer(check_buffer);
        return new DoubleArray(bufferController);
    },
};
