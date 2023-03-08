import * as fs from 'fs';
import { codec } from '@liskhq/lisk-codec';

const wasmFile = fs.readFileSync('../hello/build/debug.wasm');

const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 })
const memoryView = new Uint8Array(memory.buffer);

const viewSchema = {
    $id: 'sample',
    type: 'object',
    properties: {
        action: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
        data: {
            type: 'object',
            fieldNumber: 2,
            properties: {
                module: {
                    dataType: 'string',
                    fieldNumber: 1,
                },
                method: {
                    dataType: 'string',
                    fieldNumber: 2,
                },
                params: {
                    type: 'object',
                    fieldNumber: 3,
                    properties: {
                        caller: {
                            dataType: 'bytes',
                            fieldNumber: 1,
                        },
                        tokenID: {
                            dataType: 'bytes',
                            fieldNumber: 2,
                        },
                    },
                },
            },
        },
    },
};

const resultSchema = {
    $id: 'sample/result',
    type: 'object',
    properties: {
        success: {
            dataType: 'boolean',
            fieldNumber: 1,
        },
        error: {
            type: 'object',
            fieldNumber: 2,
            properties: {
                message: {
                    dataType: 'string',
                    fieldNumber: 1,
                },
                code: {
                    dataType: 'uint32',
                    fieldNumber: 2,
                },
            },
        },
        data: {
            type: 'object',
            fieldNumber: 3,
            properties: {
                result: {
                    dataType: 'uint64',
                    fieldNumber: 1,
                },
            },
        },
    },
};

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
            console.log({ key })
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

const defaultReserved = 15 * 1024;
const viewCall = codec.encode(viewSchema, {
    action: 8,
    data: {
        module: 'Module',
        method: 'getBalance',
        params: {
            caller: Buffer.from([1,2,3,4]),
            tokenID: Buffer.from([9,9,9,9]),
        },
    },
});

const write = (data, ptr, size) => {
    const mem = new Uint8Array(memory.buffer);
    for (let i = 0; i < size; i++) {
        mem[i + ptr] = data[i];
    }
    return join(ptr, size);
}


const inputPtr = exports.alloc(viewCall.length);
const outputPtr = exports.alloc(defaultReserved);
const inputPtrSize = write(viewCall, inputPtr, viewCall.length);
const outputPtrSize = join(outputPtr, defaultReserved);

const resultPtrSize = exports.execute(inputPtrSize, outputPtrSize);
const [resultPtr, resultSize] = split(resultPtrSize);
const result = memoryView.slice(resultPtr, resultPtr + resultSize);

exports.free(inputPtr)
exports.free(resultPtr)
console.log(codec.decode(resultSchema, result));

// exports.debug();
