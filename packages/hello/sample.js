import { instantiate } from "./build/debug.js";
import * as fs from 'fs';

const wasmFile = fs.readFileSync('./build/debug.wasm');

const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 })
const memoryView = new Uint8Array(memory.buffer);

const split = val => {
    const ptr = val >> 4n;
    const size = val & 15n;
    return [Number(ptr), Number(size)];
}

const exports = await instantiate(await WebAssembly.compile(wasmFile), {
    env: {
        storage: {
            get: (key) => console.log('get',  { key }),
            set: (key, val) => {
                console.log('set', { key, val })
                const [keyPtr, keySize] = split(key);
                const [valuePtr, valueSize] = split(val);
                const keyBytes = memoryView.slice(keyPtr, keyPtr+keySize);
                const valueBytes = memoryView.slice(valuePtr, valuePtr+valueSize);
                console.log({ keyBytes, valueBytes })
            },
        },
        memory,
    },
})


exports.debug();

// "storage.get"(key) {
//   // ~lib/lisk-sdk/assembly/env/storage/get(i64) => i64
//   return imports.env.storage.get(key) || 0n;
// },
// "storage.set": (
//   // ~lib/lisk-sdk/assembly/env/storage/set(i64, i64) => void
//   imports.env.storage.set
// ),