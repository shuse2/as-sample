import * as fs from 'fs';

const wasmFile = fs.readFileSync('./build/debug.wasm');

const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 })
const memoryView = new Uint8Array(memory.buffer);

const split = val => {
    const size = val >> 32n;
    const ptr = val & 4294967295n;
    return [Number(ptr), Number(size)];
}

const join = (ptr, size) =>
    (BigInt(size) << 32n) + BigInt(ptr)

function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }

const env = {
    cache: new Map(),
};

const imports = (env) => ({
    env: {
        "storage.get": (key) => {
            const [keyPtr, keySize] = split(key);
            const keyBytes = memoryView.slice(keyPtr, keyPtr + keySize);
            const value = env.cache.get(keyBytes.toString()) ?? Buffer.alloc(0);

            const ptr = env.exports.alloc(value.length);
            const mem = new Uint8Array(memory.buffer);
            for (let i = 0; i < value.length; i++) {
                mem[i + ptr] = value[i];
            }
            return join(ptr, value.length);
        },
        "storage.set": (key, val) => {
            console.log('set', { key, val })
            const [keyPtr, keySize] = split(key);
            const [valuePtr, valueSize] = split(val);
            const keyBytes = memoryView.slice(keyPtr, keyPtr + keySize);
            const valueBytes = memoryView.slice(valuePtr, valuePtr + valueSize);
            env.cache.set(keyBytes.toString('binary'), valueBytes);
            console.log(env.cache)
            console.log({ keyBytes, valueBytes })
        },
        "event.log": (data) => console.log(data),
        "dev.log": (data) => {
            const [keyPtr, keySize] = split(data);
            const keyBytes = memoryView.slice(keyPtr, keyPtr + keySize);
            console.log(Buffer.from(keyBytes).toString('utf-8'));
        },
        abort(message, fileName, lineNumber, columnNumber) {
            message = __liftString(message >>> 0);
            fileName = __liftString(fileName >>> 0);
            lineNumber = lineNumber >>> 0;
            columnNumber = columnNumber >>> 0;
            (() => {
                // @external.js
                throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
            })();
        },
        memory,
    },
});

const compiled = await WebAssembly.compile(wasmFile);
const { exports } = await WebAssembly.instantiate(compiled, imports(env));
env.exports = exports;

exports.debug();
