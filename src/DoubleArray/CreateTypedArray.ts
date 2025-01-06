export default (signed: boolean, bytes: number, size: number) => {
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
