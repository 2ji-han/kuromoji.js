var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/browser/kuromoji.ts
var exports_kuromoji = {};
__export(exports_kuromoji, {
  default: () => kuromoji_default,
  TokenizerBuilder: () => TokenizerBuilder_default,
  DictionaryBuilder: () => DictionaryBuilder_default
});
module.exports = __toCommonJS(exports_kuromoji);

// src/_core/util/CreateTypedArray.ts
var CreateTypedArray_default = (signed, bytes, size) => {
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

// src/_core/util/DoubleArray.ts
var TERM_CHAR = "\x00";
var TERM_CODE = 0;
var ROOT_ID = 0;
var NOT_FOUND = -1;
var encoder = new TextEncoder;
var decoder = new TextDecoder;

class BufferController {
  #first_unused_node;
  #base;
  #check;
  constructor(initial_size = 1024) {
    this.#first_unused_node = ROOT_ID + 1;
    this.#base = {
      signed: true,
      bytes: 4,
      array: CreateTypedArray_default(true, 4, initial_size)
    };
    this.#check = {
      signed: true,
      bytes: 4,
      array: CreateTypedArray_default(true, 4, initial_size)
    };
    this.#base.array[ROOT_ID] = 1;
    this.#check.array[ROOT_ID] = ROOT_ID;
    this.#initBase(this.#base.array, ROOT_ID + 1, this.#base.array.length);
    this.#initCheck(this.#check.array, ROOT_ID + 1, this.#check.array.length);
  }
  #initBase(_base, start, end) {
    for (let i = start;i < end; i++) {
      _base[i] = -i + 1;
    }
    if (0 < this.#check.array[this.#check.array.length - 1]) {
      let last_used_id = this.#check.array.length - 2;
      while (0 < this.#check.array[last_used_id]) {
        last_used_id--;
      }
      _base[start] = -last_used_id;
    }
  }
  #initCheck(_check, start, end) {
    for (let i = start;i < end; i++) {
      _check[i] = -i - 1;
    }
  }
  #realloc(min_size) {
    const new_size = min_size * 2;
    const base_new_array = CreateTypedArray_default(this.#base.signed, this.#base.bytes, new_size);
    this.#initBase(base_new_array, this.#base.array.length, new_size);
    base_new_array.set(this.#base.array);
    this.#base.array = base_new_array;
    const check_new_array = CreateTypedArray_default(this.#check.signed, this.#check.bytes, new_size);
    this.#initCheck(check_new_array, this.#check.array.length, new_size);
    check_new_array.set(this.#check.array);
    this.#check.array = check_new_array;
  }
  getBaseBuffer() {
    return this.#base.array;
  }
  getCheckBuffer() {
    return this.#check.array;
  }
  loadBaseBuffer(base_buffer) {
    this.#base.array = base_buffer;
    return this;
  }
  loadCheckBuffer(check_buffer) {
    this.#check.array = check_buffer;
    return this;
  }
  size() {
    return Math.max(this.#base.array.length, this.#check.array.length);
  }
  getBase(index) {
    if (this.#base.array.length - 1 < index) {
      return -index + 1;
    }
    return this.#base.array[index];
  }
  getCheck(index) {
    if (this.#check.array.length - 1 < index) {
      return -index - 1;
    }
    return this.#check.array[index];
  }
  setBase(index, base_value) {
    if (this.#base.array.length - 1 < index) {
      this.#realloc(index);
    }
    this.#base.array[index] = base_value;
  }
  setCheck(index, check_value) {
    if (this.#check.array.length - 1 < index) {
      this.#realloc(index);
    }
    this.#check.array[index] = check_value;
  }
  setFirstUnusedNode(index) {
    this.#first_unused_node = index;
  }
  getFirstUnusedNode() {
    return this.#first_unused_node;
  }
  shrink() {
    let last_index = Math.max(this.#base.array.length, this.#check.array.length) - 1;
    while (0 <= this.#check.array[last_index]) {
      last_index--;
    }
    this.#base.array = this.#base.array.subarray(0, last_index + 2);
    this.#check.array = this.#check.array.subarray(0, last_index + 2);
  }
  calc() {
    let unused_count = 0;
    const size = this.#check.array.length;
    for (let i = 0;i < size; i++) {
      if (this.#check.array[i] < 0) {
        unused_count++;
      }
    }
    return {
      all: size,
      unused: unused_count,
      efficiency: (size - unused_count) / size
    };
  }
  dump() {
    let dump_base = "";
    let dump_check = "";
    for (const data of this.#base.array) {
      dump_base += ` ${data}`;
    }
    for (const data of this.#check.array) {
      dump_check += ` ${data}`;
    }
    console.log(`base:${dump_base}`);
    console.log(`check:${dump_check}`);
    return `base:${dump_base} check:${dump_check}`;
  }
}

class DoubleArrayBuilder {
  #bufferController;
  #keys;
  constructor(initial_size = 1024) {
    this.#bufferController = new BufferController(initial_size);
    this.#keys = [];
  }
  append(key, record) {
    this.#keys.push({ k: key, v: record });
    return this;
  }
  build(keys = this.#keys, sorted = false) {
    if (keys == null) {
      return new DoubleArray(this.#bufferController);
    }
    const buff_keys = keys.map((k) => {
      return {
        k: encoder.encode(k.k + TERM_CHAR),
        v: k.v
      };
    });
    if (sorted) {
      this.#keys = buff_keys;
    } else {
      this.#keys = buff_keys.sort((k1, k2) => {
        const b1 = k1.k;
        const b2 = k2.k;
        const min_length = Math.min(b1.length, b2.length);
        for (let pos = 0;pos < min_length; pos++) {
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
  #_build(parent_index, position, start, length) {
    const children_info = this.#getChildrenInfo(position, start, length);
    const _base = this.#findAllocatableBase(children_info);
    this.#setBufferController(parent_index, children_info, _base);
    for (let i = 0;i < children_info.length; i = i + 3) {
      const child_code = children_info[i];
      if (child_code === TERM_CODE) {
        continue;
      }
      const child_start = children_info[i + 1];
      const child_len = children_info[i + 2];
      const child_index = _base + child_code;
      this.#_build(child_index, position + 1, child_start, child_len);
    }
  }
  #getChildrenInfo(position, start, length) {
    let current_char = this.#keys[start].k[position];
    let children_info = new Int32Array(length * 3);
    let i = 0;
    children_info[i++] = Number.parseInt(`${current_char}`);
    children_info[i++] = start;
    let next_pos = start;
    let start_pos = start;
    for (;next_pos < start + length; next_pos++) {
      const next_char = this.#keys[next_pos].k[position];
      if (current_char !== next_char) {
        children_info[i++] = next_pos - start_pos;
        children_info[i++] = Number.parseInt(`${next_char}`);
        children_info[i++] = next_pos;
        current_char = next_char;
        start_pos = next_pos;
      }
    }
    children_info[i++] = next_pos - start_pos;
    children_info = children_info.subarray(0, i);
    return children_info;
  }
  #setBufferController(parent_id, children_info, _base) {
    const bufferController = this.#bufferController;
    bufferController.setBase(parent_id, _base);
    for (let i = 0;i < children_info.length; i = i + 3) {
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
      if (code === TERM_CODE) {
        const start_pos = children_info[i + 1];
        let value = this.#keys[start_pos].v;
        if (value == null) {
          value = 0;
        }
        const base = -value - 1;
        bufferController.setBase(child_id, base);
      }
    }
  }
  #findAllocatableBase(children_info) {
    const bufferController = this.#bufferController;
    let _base;
    let curr = bufferController.getFirstUnusedNode();
    while (true) {
      _base = curr - children_info[0];
      if (_base < 0) {
        curr = -bufferController.getCheck(curr);
        continue;
      }
      let empty_area_found = true;
      for (let i = 0;i < children_info.length; i = i + 3) {
        const code = children_info[i];
        const candidate_id = _base + code;
        if (!this.#isUnusedNode(candidate_id)) {
          curr = -bufferController.getCheck(curr);
          empty_area_found = false;
          break;
        }
      }
      if (empty_area_found) {
        return _base;
      }
    }
  }
  #isUnusedNode(index) {
    const bufferController = this.#bufferController;
    const check = bufferController.getCheck(index);
    if (index === ROOT_ID) {
      return false;
    }
    if (check < 0) {
      return true;
    }
    return false;
  }
}

class DoubleArray {
  #bufferController;
  constructor(bufferController) {
    this.#bufferController = bufferController;
    this.#bufferController.shrink();
  }
  contain(_key) {
    let key = _key;
    const bufferController = this.#bufferController;
    key += TERM_CHAR;
    const buffer = encoder.encode(key);
    let parent = ROOT_ID;
    let child = NOT_FOUND;
    for (let i = 0;i < buffer.length; i++) {
      const code = buffer[i];
      child = this.#traverse(parent, code);
      if (child === NOT_FOUND) {
        return false;
      }
      if (bufferController.getBase(child) <= 0) {
        return true;
      }
      parent = child;
    }
    return false;
  }
  lookup(_key) {
    let key = _key;
    key += TERM_CHAR;
    const buffer = encoder.encode(key);
    let parent = ROOT_ID;
    let child = NOT_FOUND;
    for (let i = 0;i < buffer.length; i++) {
      const code = buffer[i];
      child = this.#traverse(parent, code);
      if (child === NOT_FOUND) {
        return NOT_FOUND;
      }
      parent = child;
    }
    const base = this.#bufferController.getBase(child);
    if (base <= 0) {
      return -base - 1;
    }
    return NOT_FOUND;
  }
  commonPrefixSearch(key) {
    const buffer = encoder.encode(key);
    const result = [];
    let parent = ROOT_ID;
    let child = NOT_FOUND;
    for (let i = 0;i < buffer.length; i++) {
      const code = buffer[i];
      child = this.#traverse(parent, code);
      if (child !== NOT_FOUND) {
        parent = child;
        const grand_child = this.#traverse(child, TERM_CODE);
        if (grand_child !== NOT_FOUND) {
          const base = this.#bufferController.getBase(grand_child);
          const r = {
            k: "",
            v: 0
          };
          if (base <= 0) {
            r.v = -base - 1;
          }
          r.k = decoder.decode(buffer.slice(0, i + 1));
          result.push(r);
        }
        continue;
      }
      break;
    }
    return result;
  }
  #traverse(parent, code) {
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
var DoubleArray_default = {
  builder: (initial_size = 1024) => {
    return new DoubleArrayBuilder(initial_size);
  },
  load: (base_buffer, check_buffer) => {
    const bufferController = new BufferController(0);
    bufferController.loadBaseBuffer(base_buffer);
    bufferController.loadCheckBuffer(check_buffer);
    return new DoubleArray(bufferController);
  }
};

// src/_core/dict/ConnectionCosts.ts
class ConnectionCosts {
  forward_dimension;
  backward_dimension;
  #buffer;
  constructor(forward_dimension, backward_dimension) {
    this.forward_dimension = forward_dimension;
    this.backward_dimension = backward_dimension;
    this.#buffer = new Int16Array(forward_dimension * backward_dimension + 2);
    this.#buffer[0] = forward_dimension;
    this.#buffer[1] = backward_dimension;
  }
  put(forward_id, backward_id, cost) {
    const index = forward_id * this.backward_dimension + backward_id + 2;
    if (this.#buffer.length < index + 1) {
      throw "ConnectionCosts buffer overflow";
    }
    this.#buffer[index] = cost;
  }
  get(forward_id, backward_id) {
    const index = forward_id * this.backward_dimension + backward_id + 2;
    if (this.#buffer.length < index + 1) {
      throw "ConnectionCosts buffer overflow";
    }
    return this.#buffer[index];
  }
  loadConnectionCosts(connection_costs_buffer) {
    this.forward_dimension = connection_costs_buffer[0];
    this.backward_dimension = connection_costs_buffer[1];
    this.#buffer = connection_costs_buffer;
  }
}
var ConnectionCosts_default = ConnectionCosts;

// src/_core/util/ByteBuffer.ts
var encoder2 = new TextEncoder;
var decoder2 = new TextDecoder;

class ByteBuffer {
  #_buffer;
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
  constructor(arg) {
    if (arg === undefined) {
      this.#_buffer = new Uint8Array(1024 * 1024);
      this.#_position = 0;
    } else if (typeof arg === "number") {
      this.#_buffer = new Uint8Array(arg);
      this.#_position = 0;
    } else if (arg instanceof Uint8Array) {
      this.#_buffer = arg;
      this.#_position = 0;
    } else {
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
  put(b) {
    if (this.#_buffer.length < this.#_position + 1) {
      this.reallocate();
    }
    if (typeof b === "boolean") {
      this.#_buffer[this.#_position++] = b ? 1 : 0;
    } else {
      this.#_buffer[this.#_position++] = b;
    }
  }
  get(_index = null) {
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
  putShort(num) {
    if (65535 < num) {
      throw `${num} is over short value`;
    }
    const lower = 255 & num;
    const upper = (65280 & num) >> 8;
    this.put(lower);
    this.put(upper);
  }
  getShort(_index) {
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
    if (value & 32768) {
      value = -(value - 1 ^ 65535);
    }
    return value;
  }
  putInt(num) {
    if (4294967295 < num) {
      throw `${num} is over integer value`;
    }
    const b0 = 255 & num;
    const b1 = (65280 & num) >> 8;
    const b2 = (16711680 & num) >> 16;
    const b3 = (4278190080 & num) >> 24;
    this.put(b0);
    this.put(b1);
    this.put(b2);
    this.put(b3);
  }
  getInt(_index = null) {
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
  putString(str) {
    const bytes = encoder2.encode(str);
    for (const byte of bytes) {
      this.put(byte);
    }
    this.put(0);
  }
  getString(_index = this.#_position) {
    let index = _index;
    const buf = [];
    let ch;
    while (index < this.#_buffer.length) {
      ch = this.get(index++);
      if (ch === 0)
        break;
      buf.push(ch);
    }
    this.#_position = index;
    return decoder2.decode(new Uint8Array(buf));
  }
  getUtf32(_index = null) {
    let index = _index;
    if (index == null) {
      index = this.#_position;
      this.#_position += 4;
    }
    if (this.#_buffer.length < index + 4) {
      return 0;
    }
    const codePoint = this.#_buffer.subarray(index, index + 4);
    return new DataView(codePoint.buffer).getUint32(0, false);
  }
  getBool(_index = null) {
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
var ByteBuffer_default = ByteBuffer;

// src/_core/dict/TokenInfoDictionary.ts
class TokenInfoDictionary {
  dictionary;
  target_map;
  pos_buffer;
  constructor() {
    this.dictionary = new ByteBuffer_default(10 * 1024 * 1024);
    this.target_map = new Map;
    this.pos_buffer = new ByteBuffer_default(10 * 1024 * 1024);
  }
  buildDictionary(entries) {
    const dictionary_entries = {};
    for (let i = 0;i < entries.length; i++) {
      const entry = entries[i];
      if (entry.length < 4) {
        continue;
      }
      const surface_form = entry[0];
      const left_id = Number.parseInt(entry[1]);
      const right_id = Number.parseInt(entry[2]);
      const word_cost = Number.parseInt(entry[3]);
      const feature = entry.slice(4).join(",");
      if (!Number.isFinite(left_id) || !Number.isFinite(right_id) || !Number.isFinite(word_cost)) {
        console.log(entry);
      }
      const token_info_id = this.put(left_id, right_id, word_cost, surface_form, feature);
      dictionary_entries[token_info_id] = surface_form;
    }
    this.dictionary.shrink();
    this.pos_buffer.shrink();
    return dictionary_entries;
  }
  put(left_id, right_id, word_cost, surface_form, feature) {
    const token_info_id = this.dictionary.position;
    const pos_id = this.pos_buffer.position;
    this.dictionary.putShort(left_id);
    this.dictionary.putShort(right_id);
    this.dictionary.putShort(word_cost);
    this.dictionary.putInt(pos_id);
    this.pos_buffer.putString(`${surface_form},${feature}`);
    return token_info_id;
  }
  addMapping(source, target) {
    let mapping = this.target_map.get(source);
    if (mapping == null) {
      mapping = [];
    }
    mapping.push(target);
    this.target_map.set(source, mapping);
  }
  targetMapToBuffer() {
    const buffer = new ByteBuffer_default;
    buffer.putInt(Object.keys(this.target_map).length);
    for (const _key in this.target_map) {
      const key = Number.parseInt(_key);
      const values = this.target_map.get(key);
      if (!values)
        continue;
      const map_values_size = values.length;
      buffer.putInt(key);
      buffer.putInt(map_values_size);
      for (const value of values) {
        buffer.putInt(value);
      }
    }
    return buffer.shrink();
  }
  loadDictionary(array_buffer) {
    this.dictionary = new ByteBuffer_default(array_buffer);
    return this;
  }
  loadPosVector(array_buffer) {
    this.pos_buffer = new ByteBuffer_default(array_buffer);
    return this;
  }
  loadTargetMap(array_buffer) {
    const buffer = new ByteBuffer_default(array_buffer);
    buffer.position = 0;
    this.target_map = new Map;
    buffer.readInt();
    while (true) {
      if (buffer.buffer.length < buffer.position + 1) {
        break;
      }
      const key = buffer.readInt();
      const map_values_size = buffer.readInt();
      for (let i = 0;i < map_values_size; i++) {
        const value = buffer.readInt();
        this.addMapping(key, value);
      }
    }
    return this;
  }
  getFeatures(token_info_id) {
    if (Number.isNaN(token_info_id)) {
      return null;
    }
    const pos_id = this.dictionary.getInt(token_info_id + 6);
    return this.pos_buffer.getString(pos_id);
  }
}
var TokenInfoDictionary_default = TokenInfoDictionary;

// src/_core/util/SurrogateAwareString.ts
class SurrogateAwareString {
  #str;
  #index_mapping;
  length;
  constructor(str) {
    this.#str = str;
    this.#index_mapping = [];
    for (let pos = 0;pos < str.length; pos++) {
      const ch = str.charAt(pos);
      this.#index_mapping.push(pos);
      if (SurrogateAwareString.isSurrogatePair(ch)) {
        pos++;
      }
    }
    this.length = this.#index_mapping.length;
  }
  slice(index) {
    if (this.#index_mapping.length <= index) {
      return "";
    }
    const surrogate_aware_index = this.#index_mapping[index];
    return this.#str.slice(surrogate_aware_index);
  }
  charAt(index) {
    if (this.#str.length <= index) {
      return "";
    }
    const surrogate_aware_start_index = this.#index_mapping[index];
    const surrogate_aware_end_index = this.#index_mapping[index + 1];
    if (surrogate_aware_end_index == null) {
      return this.#str.slice(surrogate_aware_start_index);
    }
    return this.#str.slice(surrogate_aware_start_index, surrogate_aware_end_index);
  }
  charCodeAt(index) {
    if (this.#index_mapping.length <= index) {
      return Number.NaN;
    }
    const surrogate_aware_index = this.#index_mapping[index];
    const upper = this.#str.charCodeAt(surrogate_aware_index);
    let lower;
    if (upper >= 55296 && upper <= 56319 && surrogate_aware_index < this.#str.length) {
      lower = this.#str.charCodeAt(surrogate_aware_index + 1);
      if (lower >= 56320 && lower <= 57343) {
        return (upper - 55296) * 1024 + lower - 56320 + 65536;
      }
    }
    return upper;
  }
  toString() {
    return this.#str;
  }
  add(other) {
    return new SurrogateAwareString(this.#str + other.#str);
  }
  append(str) {
    return new SurrogateAwareString(this.#str + str);
  }
  static isSurrogatePair(ch) {
    const utf16_code = ch.charCodeAt(0);
    if (utf16_code >= 55296 && utf16_code <= 56319) {
      return true;
    }
    return false;
  }
}
var SurrogateAwareString_default = SurrogateAwareString;

// src/_core/dict/CharacterClass.ts
class CharacterClass {
  class_id;
  class_name;
  is_always_invoke;
  is_grouping;
  max_length;
  constructor(class_id, class_name, is_always_invoke, is_grouping, max_length) {
    this.class_id = class_id;
    this.class_name = class_name;
    this.is_always_invoke = is_always_invoke;
    this.is_grouping = is_grouping;
    this.max_length = max_length;
  }
}
var CharacterClass_default = CharacterClass;

// src/_core/dict/InvokeDefinitionMap.ts
class InvokeDefinitionMap {
  #map;
  #lookup_table;
  constructor() {
    this.#map = [];
    this.#lookup_table = new Map;
  }
  static load(invoke_def_buffer) {
    const invoke_def = new InvokeDefinitionMap;
    const character_category_definition = [];
    const buffer = new ByteBuffer_default(invoke_def_buffer);
    while (buffer.position + 1 < buffer.size()) {
      const is_always_invoke = buffer.getBool();
      const is_grouping = buffer.getBool();
      const max_length = buffer.getInt();
      const class_name = buffer.getString();
      character_category_definition.push(new CharacterClass_default(character_category_definition.length, class_name, is_always_invoke, is_grouping, max_length));
    }
    invoke_def.init(character_category_definition);
    return invoke_def;
  }
  init(character_category_definition) {
    if (character_category_definition == null) {
      return;
    }
    const ccd_length = character_category_definition.length;
    for (let i = 0;i < ccd_length; i++) {
      const character_class = character_category_definition[i];
      this.#map[i] = character_class;
      this.#lookup_table.set(character_class.class_name, i);
    }
  }
  getCharacterClass(class_id) {
    return this.#map[class_id];
  }
  lookup(class_name) {
    const class_id = this.#lookup_table.get(class_name);
    if (class_id == null) {
      return null;
    }
    return class_id;
  }
  toBuffer() {
    const buffer = new ByteBuffer_default;
    for (let i = 0;i < this.#map.length; i++) {
      const char_class = this.#map[i];
      buffer.put(char_class.is_always_invoke);
      buffer.put(char_class.is_grouping);
      buffer.putInt(char_class.max_length);
      buffer.putString(char_class.class_name);
    }
    buffer.shrink();
    return buffer.buffer;
  }
}
var InvokeDefinitionMap_default = InvokeDefinitionMap;

// src/_core/dict/CharacterDefinition.ts
var DEFAULT_CATEGORY = "DEFAULT";

class CharacterDefinition {
  character_category_map;
  compatible_category_map;
  invoke_definition_map;
  constructor() {
    this.character_category_map = new Uint8Array(65536);
    this.compatible_category_map = new Uint32Array(65536);
    this.invoke_definition_map = null;
  }
  load(cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    const char_def = new CharacterDefinition;
    char_def.character_category_map = cat_map_buffer;
    char_def.compatible_category_map = compat_cat_map_buffer;
    char_def.invoke_definition_map = InvokeDefinitionMap_default.load(invoke_def_buffer);
    return char_def;
  }
  static parseCharCategory(class_id, parsed_category_def) {
    const category = parsed_category_def[1];
    const invoke = Number.parseInt(parsed_category_def[2]);
    const grouping = Number.parseInt(parsed_category_def[3]);
    const max_length = Number.parseInt(parsed_category_def[4]);
    if (!Number.isFinite(invoke) || invoke !== 0 && invoke !== 1) {
      console.log(`char.def parse error. INVOKE is 0 or 1 in:${invoke}`);
      return null;
    }
    if (!Number.isFinite(grouping) || grouping !== 0 && grouping !== 1) {
      console.log(`char.def parse error. GROUP is 0 or 1 in:${grouping}`);
      return null;
    }
    if (!Number.isFinite(max_length) || max_length < 0) {
      console.log(`char.def parse error. LENGTH is 1 to n:${max_length}`);
      return null;
    }
    return new CharacterClass_default(class_id, category, invoke === 1, grouping === 1, max_length);
  }
  static parseCategoryMapping(parsed_category_mapping) {
    const start = Number.parseInt(parsed_category_mapping[1]);
    if (!Number.isFinite(start) || start < 0 || start > 65535) {
      console.log(`char.def parse error. CODE is invalid:${start}`);
    }
    return {
      start,
      default: parsed_category_mapping[2],
      compatible: 3 < parsed_category_mapping.length ? parsed_category_mapping.slice(3) : []
    };
  }
  static parseRangeCategoryMapping(parsed_category_mapping) {
    const start = Number.parseInt(parsed_category_mapping[1]);
    const end = Number.parseInt(parsed_category_mapping[2]);
    if (!Number.isFinite(start) || start < 0 || start > 65535) {
      console.log(`char.def parse error. CODE is invalid:${start}`);
    }
    if (!Number.isFinite(end) || end < 0 || end > 65535) {
      console.log(`char.def parse error. CODE is invalid:${end}`);
    }
    return {
      start,
      end,
      default: parsed_category_mapping[3],
      compatible: 4 < parsed_category_mapping.length ? parsed_category_mapping.slice(4) : []
    };
  }
  initCategoryMappings(category_mapping) {
    if (!this.invoke_definition_map) {
      throw new Error("CharacterDefinition.initCategoryMappings: invoke_definition_map is null");
    }
    let code_point = 0;
    if (category_mapping != null) {
      const category_mapping_length = category_mapping.length;
      for (let i = 0;i < category_mapping_length; i++) {
        const mapping = category_mapping[i];
        for (code_point = mapping.start;code_point <= (mapping.end || mapping.start); code_point++) {
          const id = this.invoke_definition_map.lookup(mapping.default);
          if (id == null) {
            throw new Error("CharacterDefinition.initCategoryMappings: invoke_definition_map.lookup() returns null");
          }
          this.character_category_map[code_point] = id;
          for (let j = 0;j < mapping.compatible.length; j++) {
            let bitset = this.compatible_category_map[code_point];
            const compatible_category = mapping.compatible[j];
            if (compatible_category == null) {
              continue;
            }
            const class_id = this.invoke_definition_map.lookup(compatible_category);
            if (class_id == null) {
              continue;
            }
            const class_id_bit = 1 << class_id;
            bitset = bitset | class_id_bit;
            this.compatible_category_map[code_point] = bitset;
          }
        }
      }
    }
    const default_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    if (default_id == null) {
      return;
    }
    const ccm_length = this.compatible_category_map.length;
    for (code_point = 0;code_point < ccm_length; code_point++) {
      if (this.character_category_map[code_point] === 0) {
        this.character_category_map[code_point] = 1 << default_id;
      }
    }
  }
  lookupCompatibleCategory(ch) {
    const classes = [];
    if (!this.invoke_definition_map) {
      throw new Error("CharacterDefinition.lookupCompatibleCategory: invoke_definition_map is null");
    }
    const code = ch.charCodeAt(0);
    let integer = null;
    if (code < this.compatible_category_map.length) {
      integer = this.compatible_category_map[code];
    }
    if (integer == null || integer === 0) {
      return classes;
    }
    for (let bit = 0;bit < 32; bit++) {
      if (integer << 31 - bit >>> 31 === 1) {
        const character_class = this.invoke_definition_map.getCharacterClass(bit);
        if (character_class == null) {
          continue;
        }
        classes.push(character_class);
      }
    }
    return classes;
  }
  lookup(ch) {
    if (!this.invoke_definition_map) {
      throw new Error("CharacterDefinition.lookup: invoke_definition_map is null");
    }
    let class_id = null;
    const code = ch.charCodeAt(0);
    if (SurrogateAwareString_default.isSurrogatePair(ch)) {
      class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    } else if (code < this.character_category_map.length) {
      class_id = this.character_category_map[code];
    }
    if (class_id == null) {
      class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    }
    return this.invoke_definition_map.getCharacterClass(class_id);
  }
}
var CharacterDefinition_default = CharacterDefinition;

// src/_core/dict/UnknownDictionary.ts
class UnknownDictionary extends TokenInfoDictionary_default {
  #character_definition = null;
  characterDefinition(character_definition) {
    this.#character_definition = character_definition;
    return this;
  }
  lookup(ch) {
    if (this.#character_definition == null) {
      throw new Error("CharacterDefinition is not set");
    }
    return this.#character_definition.lookup(ch);
  }
  lookupCompatibleCategory(ch) {
    if (this.#character_definition == null) {
      throw new Error("CharacterDefinition is not set");
    }
    return this.#character_definition.lookupCompatibleCategory(ch);
  }
  loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    this.loadDictionary(unk_buffer);
    this.loadPosVector(unk_pos_buffer);
    this.loadTargetMap(unk_map_buffer);
    this.#character_definition = new CharacterDefinition_default().load(cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
  }
}
var UnknownDictionary_default = UnknownDictionary;

// src/_core/dict/DynamicDictionaries.ts
class DynamicDictionaries {
  trie;
  token_info_dictionary;
  connection_costs;
  unknown_dictionary;
  constructor(trie, token_info_dictionary, connection_costs, unknown_dictionary) {
    this.trie = trie ?? DoubleArray_default.builder(0).build([{ k: "", v: 1 }]);
    this.token_info_dictionary = token_info_dictionary ?? new TokenInfoDictionary_default;
    this.connection_costs = connection_costs ?? new ConnectionCosts_default(0, 0);
    this.unknown_dictionary = unknown_dictionary ?? new UnknownDictionary_default;
  }
  loadTrie(base_buffer, check_buffer) {
    this.trie = DoubleArray_default.load(base_buffer, check_buffer);
    return this;
  }
  loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer) {
    this.token_info_dictionary.loadDictionary(token_info_buffer);
    this.token_info_dictionary.loadPosVector(pos_buffer);
    this.token_info_dictionary.loadTargetMap(target_map_buffer);
    return this;
  }
  loadConnectionCosts(cc_buffer) {
    this.connection_costs.loadConnectionCosts(cc_buffer);
    return this;
  }
  loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    this.unknown_dictionary.loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer);
    return this;
  }
}
var DynamicDictionaries_default = DynamicDictionaries;

// src/_core/dict/builder/CharacterDefinitionBuilder.ts
var CATEGORY_DEF_PATTERN = /^(\w+)\s+(\d)\s+(\d)\s+(\d)/;
var CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;
var RANGE_CATEGORY_MAPPING_PATTERN = /^(0x[0-9A-F]{4})\.\.(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;

class CharacterDefinitionBuilder {
  char_def;
  character_category_definition;
  category_mapping;
  constructor() {
    this.char_def = new CharacterDefinition_default;
    this.char_def.invoke_definition_map = new InvokeDefinitionMap_default;
    this.character_category_definition = [];
    this.category_mapping = [];
  }
  putLine(line) {
    const parsed_category_def = CATEGORY_DEF_PATTERN.exec(line);
    if (parsed_category_def != null) {
      const class_id = this.character_category_definition.length;
      const char_class = CharacterDefinition_default.parseCharCategory(class_id, parsed_category_def);
      if (char_class == null) {
        return;
      }
      this.character_category_definition.push(char_class);
      return;
    }
    const parsed_category_mapping = CATEGORY_MAPPING_PATTERN.exec(line);
    if (parsed_category_mapping != null) {
      const mapping = CharacterDefinition_default.parseCategoryMapping(parsed_category_mapping);
      this.category_mapping.push(mapping);
    }
    const parsed_range_category_mapping = RANGE_CATEGORY_MAPPING_PATTERN.exec(line);
    if (parsed_range_category_mapping != null) {
      const range_mapping = CharacterDefinition_default.parseRangeCategoryMapping(parsed_range_category_mapping);
      this.category_mapping.push(range_mapping);
    }
  }
  build() {
    if (!this.char_def || !this.char_def.invoke_definition_map) {
      throw new Error("No data to build.");
    }
    this.char_def.invoke_definition_map.init(this.character_category_definition);
    this.char_def.initCategoryMappings(this.category_mapping);
    return this.char_def;
  }
}
var CharacterDefinitionBuilder_default = CharacterDefinitionBuilder;

// src/_core/dict/builder/ConnectionCostsBuilder.ts
class ConnectionCostsBuilder {
  lines;
  connection_cost;
  constructor() {
    this.lines = 0;
    this.connection_cost = null;
  }
  putLine(line) {
    if (this.lines === 0 || !this.connection_cost) {
      const dimensions = line.split(" ");
      const forward_dimension = Number.parseInt(dimensions[0]);
      const backward_dimension = Number.parseInt(dimensions[1]);
      if (forward_dimension < 0 || backward_dimension < 0) {
        throw "Parse error of matrix.def";
      }
      this.connection_cost = new ConnectionCosts_default(forward_dimension, backward_dimension);
      this.lines++;
      return this;
    }
    if (!this.connection_cost) {
      throw "connection_cost is null";
    }
    const costs = line.split(" ");
    if (costs.length !== 3) {
      return this;
    }
    const forward_id = Number.parseInt(costs[0]);
    const backward_id = Number.parseInt(costs[1]);
    const cost = Number.parseInt(costs[2]);
    if (forward_id < 0 || backward_id < 0 || !Number.isFinite(forward_id) || !Number.isFinite(backward_id) || this.connection_cost.forward_dimension <= forward_id || this.connection_cost.backward_dimension <= backward_id) {
      throw "Parse error of matrix.def";
    }
    this.connection_cost.put(forward_id, backward_id, cost);
    this.lines++;
    return this;
  }
  build() {
    if (!this.connection_cost) {
      throw "No data to build.";
    }
    return this.connection_cost;
  }
}
var ConnectionCostsBuilder_default = ConnectionCostsBuilder;

// src/_core/dict/builder/DictionaryBuilder.ts
class DictionaryBuilder {
  #tid_entries;
  #unk_entries;
  #cc_builder;
  #cd_builder;
  constructor() {
    this.#tid_entries = [];
    this.#unk_entries = [];
    this.#cc_builder = new ConnectionCostsBuilder_default;
    this.#cd_builder = new CharacterDefinitionBuilder_default;
  }
  addTokenInfoDictionary(line) {
    const new_entry = line.split(",");
    this.#tid_entries.push(new_entry);
    return this;
  }
  putCostMatrixLine(line) {
    this.#cc_builder.putLine(line);
    return this;
  }
  putCharDefLine(line) {
    this.#cd_builder.putLine(line);
    return this;
  }
  putUnkDefLine(line) {
    this.#unk_entries.push(line.split(","));
    return this;
  }
  build() {
    const dictionaries = this.buildTokenInfoDictionary();
    return new DynamicDictionaries_default(dictionaries.trie, dictionaries.token_info_dictionary, this.#cc_builder.build(), this.buildUnknownDictionary());
  }
  buildTokenInfoDictionary() {
    const token_info_dictionary = new TokenInfoDictionary_default;
    const dictionary_entries = token_info_dictionary.buildDictionary(this.#tid_entries);
    const trie = this.buildDoubleArray();
    for (const token_info_id in dictionary_entries) {
      const surface_form = dictionary_entries[token_info_id];
      const trie_id = trie.lookup(surface_form);
      token_info_dictionary.addMapping(trie_id, Number.parseInt(token_info_id));
    }
    return {
      trie,
      token_info_dictionary
    };
  }
  buildUnknownDictionary() {
    const unk_dictionary = new UnknownDictionary_default;
    const dictionary_entries = unk_dictionary.buildDictionary(this.#unk_entries);
    const char_def = this.#cd_builder.build();
    if (!char_def || !char_def.invoke_definition_map) {
      throw new Error("CharacterDefinition is not set");
    }
    unk_dictionary.characterDefinition(char_def);
    for (const token_info_id in dictionary_entries) {
      const class_name = dictionary_entries[token_info_id];
      const class_id = char_def.invoke_definition_map.lookup(class_name);
      if (!class_id) {
        throw new Error(`Class name not found: ${class_name}`);
      }
      unk_dictionary.addMapping(class_id, Number.parseInt(token_info_id));
    }
    return unk_dictionary;
  }
  buildDoubleArray() {
    let trie_id = 0;
    const words = this.#tid_entries.map((entry) => {
      const surface_form = entry[0];
      return { k: surface_form, v: trie_id++ };
    });
    const builder = DoubleArray_default.builder(1024 * 1024);
    return builder.build(words);
  }
}
var DictionaryBuilder_default = DictionaryBuilder;

// src/_core/util/IpadicFormatter.ts
class IpadicFormatter {
  formatEntry(word_id, position, type, features) {
    return {
      word_id,
      word_type: type,
      word_position: position,
      surface_form: features[0],
      pos: features[1],
      pos_detail_1: features[2],
      pos_detail_2: features[3],
      pos_detail_3: features[4],
      conjugated_type: features[5],
      conjugated_form: features[6],
      basic_form: features[7],
      reading: features[8],
      pronunciation: features[9]
    };
  }
  formatUnknownEntry(word_id, position, type, features, surface_form) {
    return {
      word_id,
      word_type: type,
      word_position: position,
      surface_form,
      pos: features[1],
      pos_detail_1: features[2],
      pos_detail_2: features[3],
      pos_detail_3: features[4],
      conjugated_type: features[5],
      conjugated_form: features[6],
      basic_form: features[7]
    };
  }
}
var IpadicFormatter_default = IpadicFormatter;

// src/_core/viterbi/ViterbiNode.ts
class ViterbiNode {
  name;
  cost;
  start_pos;
  length;
  left_id;
  right_id;
  prev;
  surface_form;
  shortest_cost;
  type;
  constructor(node_name, node_cost, start_pos, length, type, left_id, right_id, surface_form) {
    this.name = node_name;
    this.cost = node_cost;
    this.start_pos = start_pos;
    this.length = length;
    this.left_id = left_id;
    this.right_id = right_id;
    this.prev = null;
    this.surface_form = surface_form;
    this.shortest_cost = type === "BOS" ? 0 : Number.MAX_VALUE;
    this.type = type;
  }
}
var ViterbiNode_default = ViterbiNode;

// src/_core/viterbi/ViterbiLattice.ts
class ViterbiLattice {
  nodes_end_at;
  eos_pos;
  constructor() {
    this.nodes_end_at = [];
    this.nodes_end_at[0] = [new ViterbiNode_default(-1, 0, 0, 0, "BOS", 0, 0, "")];
    this.eos_pos = 1;
  }
  append(node) {
    const last_pos = node.start_pos + node.length - 1;
    if (this.eos_pos < last_pos) {
      this.eos_pos = last_pos;
    }
    const prev_nodes = this.nodes_end_at[last_pos] ?? [];
    prev_nodes.push(node);
    this.nodes_end_at[last_pos] = prev_nodes;
  }
  appendEos() {
    const last_index = this.nodes_end_at.length;
    this.eos_pos++;
    this.nodes_end_at[last_index] = [new ViterbiNode_default(-1, 0, this.eos_pos, 0, "EOS", 0, 0, "")];
  }
}
var ViterbiLattice_default = ViterbiLattice;

// src/_core/viterbi/ViterbiBuilder.ts
class ViterbiBuilder {
  #trie;
  #token_info_dictionary;
  #unknown_dictionary;
  constructor(dic) {
    this.#trie = dic.trie;
    this.#token_info_dictionary = dic.token_info_dictionary;
    this.#unknown_dictionary = dic.unknown_dictionary;
  }
  build(sentence_str) {
    const lattice = new ViterbiLattice_default;
    const sentence = new SurrogateAwareString_default(sentence_str);
    const sentence_length = sentence.length;
    for (let pos = 0;pos < sentence_length; pos++) {
      const tail = sentence.slice(pos);
      const vocabulary = this.#trie.commonPrefixSearch(tail);
      const vocabulary_length = vocabulary.length;
      for (let n = 0;n < vocabulary_length; n++) {
        const trie_id = vocabulary[n].v;
        const key = vocabulary[n].k;
        const token_info_ids = this.#token_info_dictionary.target_map.get(trie_id);
        if (!token_info_ids)
          throw new Error("TokenInfo dictionary is broken");
        for (const token_info_id of token_info_ids) {
          const left_id = this.#token_info_dictionary.dictionary.getShort(token_info_id);
          const right_id = this.#token_info_dictionary.dictionary.getShort(token_info_id + 2);
          const word_cost = this.#token_info_dictionary.dictionary.getShort(token_info_id + 4);
          lattice.append(new ViterbiNode_default(token_info_id, word_cost, pos + 1, key.length, "KNOWN", left_id, right_id, key));
        }
      }
      const head_char = tail.charAt(0);
      const head_char_class = this.#unknown_dictionary.lookup(head_char);
      if (!vocabulary?.length || head_char_class.is_always_invoke) {
        let key = head_char;
        const tail_length = tail.length;
        if (head_char_class.is_grouping && tail_length > 1) {
          const class_name = head_char_class.class_name;
          for (let k = 1;k < tail_length; k++) {
            const next_char = tail.charAt(k);
            if (this.#unknown_dictionary.lookup(next_char).class_name !== class_name) {
              break;
            }
            key += next_char;
          }
        }
        const unk_ids = this.#unknown_dictionary.target_map.get(head_char_class.class_id);
        if (!unk_ids)
          throw new Error("Unknown dictionary is broken");
        const unk_length = unk_ids.length;
        const unknown_dict = this.#unknown_dictionary.dictionary;
        for (let j = 0;j < unk_length; j++) {
          const unk_id = unk_ids[j];
          lattice.append(new ViterbiNode_default(unk_id, unknown_dict.getShort(unk_id + 4), pos + 1, key.length, "UNKNOWN", unknown_dict.getShort(unk_id), unknown_dict.getShort(unk_id + 2), key));
        }
      }
    }
    lattice.appendEos();
    return lattice;
  }
}
var ViterbiBuilder_default = ViterbiBuilder;

// src/_core/viterbi/ViterbiSearcher.ts
class ViterbiSearcher {
  #connection_costs;
  constructor(connection_costs) {
    this.#connection_costs = connection_costs;
  }
  search(_lattice) {
    let lattice = _lattice;
    lattice = this.#forward(lattice);
    return this.#backward(lattice);
  }
  #forward(lattice) {
    let i = 1;
    for (i = 1;i <= lattice.eos_pos; i++) {
      const nodes = lattice.nodes_end_at[i];
      if (nodes == null)
        continue;
      for (const node of nodes) {
        let cost = Number.MAX_VALUE;
        let shortest_prev_node = null;
        const index = node.start_pos - 1;
        if (!(index in lattice.nodes_end_at)) {
          continue;
        }
        const prev_nodes = lattice.nodes_end_at[index];
        for (const prev_node of prev_nodes) {
          let edge_cost;
          if (node.left_id == null || prev_node.right_id == null) {
            console.log("Left or right is null");
            edge_cost = 0;
          } else {
            edge_cost = this.#connection_costs.get(prev_node.right_id, node.left_id);
          }
          const _cost = prev_node.shortest_cost + edge_cost + node.cost;
          if (_cost < cost) {
            shortest_prev_node = prev_node;
            cost = _cost;
          }
        }
        node.prev = shortest_prev_node;
        node.shortest_cost = cost;
      }
    }
    return lattice;
  }
  #backward(lattice) {
    const shortest_path = [];
    const eos = lattice.nodes_end_at[lattice.nodes_end_at.length - 1][0];
    let node_back = eos.prev;
    if (node_back == null) {
      return [];
    }
    while (node_back.type !== "BOS") {
      shortest_path.push(node_back);
      if (node_back.prev == null) {
        return [];
      }
      node_back = node_back.prev;
    }
    return shortest_path.reverse();
  }
}
var ViterbiSearcher_default = ViterbiSearcher;

// src/_core/Tokenizer.ts
class Tokenizer {
  #token_info_dictionary;
  #unknown_dictionary;
  #viterbi_builder;
  #viterbi_searcher;
  #formatter;
  constructor(dic) {
    this.#token_info_dictionary = dic.token_info_dictionary;
    this.#unknown_dictionary = dic.unknown_dictionary;
    this.#viterbi_builder = new ViterbiBuilder_default(dic);
    this.#viterbi_searcher = new ViterbiSearcher_default(dic.connection_costs);
    this.#formatter = new IpadicFormatter_default;
  }
  static splitByPunctuation(input) {
    const matches = input.matchAll(/、|。/g);
    const sentences = [];
    let lastIndex = 0;
    for (const match of matches) {
      const index = match.index;
      sentences.push(input.slice(lastIndex, index + 1));
      lastIndex = index + 1;
    }
    if (lastIndex < input.length) {
      sentences.push(input.slice(lastIndex));
    }
    return sentences;
  }
  tokenize(text) {
    const sentences = Tokenizer.splitByPunctuation(text);
    const tokens = [];
    for (const sentence of sentences) {
      this.#tokenizeForSentence(sentence, tokens);
    }
    return tokens;
  }
  #tokenizeForSentence(sentence, tokens = []) {
    const lattice = this.#viterbi_builder.build(sentence);
    const best_path = this.#viterbi_searcher.search(lattice);
    const last_pos = tokens.length > 0 ? tokens[tokens.length - 1].word_position : 0;
    for (const node of best_path) {
      tokens.push(this.#getTokenFromNode(node, last_pos));
    }
    return tokens;
  }
  #getTokenFromNode(node, last_pos) {
    const features_line = node.type === "KNOWN" ? this.#token_info_dictionary.getFeatures(node.name) : this.#unknown_dictionary.getFeatures(node.name);
    const features = features_line ? features_line.split(",") : [];
    if (node.type === "UNKNOWN") {
      return this.#formatter.formatUnknownEntry(node.name, last_pos + node.start_pos, node.type, features, node.surface_form);
    }
    return this.#formatter.formatEntry(node.name, last_pos + node.start_pos, node.type, features);
  }
}
var Tokenizer_default = Tokenizer;

// src/browser/loader/DictionaryLoader.ts
var import_node_path = __toESM(require("node:path"));
class DictionaryLoader {
  #dic_path;
  constructor(dic_path = "dict/") {
    this.#dic_path = dic_path;
  }
  #loadArrayBuffer = (url) => new Promise((resolve, reject) => {
    fetch(url).then(async (res) => await res.arrayBuffer()).then(async (buffer) => {
      const decompressionStream = new DecompressionStream("gzip");
      const decompressedStream = new Blob([buffer]).stream().pipeThrough(decompressionStream);
      const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
      resolve(decompressedBuffer);
    }).catch((err) => {
      reject(err);
    });
  });
  load(callback) {
    const dictionaries = new DynamicDictionaries_default;
    Promise.all([
      "base.dat.gz",
      "check.dat.gz",
      "tid.dat.gz",
      "tid_pos.dat.gz",
      "tid_map.dat.gz",
      "cc.dat.gz",
      "unk.dat.gz",
      "unk_pos.dat.gz",
      "unk_map.dat.gz",
      "unk_char.dat.gz",
      "unk_compat.dat.gz",
      "unk_invoke.dat.gz"
    ].map((filename) => this.#loadArrayBuffer(import_node_path.default.join(this.#dic_path, filename)))).then((buffers) => {
      dictionaries.loadTrie(new Int32Array(buffers[0]), new Int32Array(buffers[1]));
      dictionaries.loadTokenInfoDictionaries(new Uint8Array(buffers[2]), new Uint8Array(buffers[3]), new Uint8Array(buffers[4]));
      dictionaries.loadConnectionCosts(new Int16Array(buffers[5]));
      dictionaries.loadUnknownDictionaries(new Uint8Array(buffers[6]), new Uint8Array(buffers[7]), new Uint8Array(buffers[8]), new Uint8Array(buffers[9]), new Uint32Array(buffers[10]), new Uint8Array(buffers[11]));
      callback(null, dictionaries);
    }).catch((error) => {
      callback(error, dictionaries);
    });
  }
}
var DictionaryLoader_default = DictionaryLoader;

// src/browser/TokenizerBuilder.ts
class TokenizerBuilder {
  #loader;
  constructor(option = {}) {
    this.#loader = new DictionaryLoader_default(option.dicPath);
  }
  build(callback) {
    this.#loader.load((err, dic) => {
      callback(err, new Tokenizer_default(dic));
    });
  }
}
var TokenizerBuilder_default = TokenizerBuilder;

// src/browser/kuromoji.ts
var kuromoji_default = {
  builder: (option = {}) => {
    return new TokenizerBuilder_default(option);
  },
  dictionaryBuilder: () => {
    return new DictionaryBuilder_default;
  }
};

//# debugId=2A7E3CAE132A356D64756E2164756E21
//# sourceMappingURL=index.js.map
