import * as env from "../env";
import { pointer } from "../internal";
import { EncodeDecoder } from '../encoding';
import * as types from '../type_def';
import * as dev from '../dev';

export class BaseStore<T extends EncodeDecoder> {
    _name: string = "";

    get name(): string {
        if (this._name == "") {
            this._name = nameof<this>();
        }
        return this._name;
    }

    // this will be overwritten in extended class by compiler
    key(): u8[] {
        return [];
    }

    get(key: u8[]): T {
		const keyPtr = u32(heap.alloc(key.length));
        const keyPtrSize = pointer.toPtrSize(keyPtr, key.length);
        memory.copy(keyPtr, key.dataStart, key.length);

        const result = env.storage.get(keyPtrSize);
        const valSize = pointer.getSize(result)
        const valPtr = pointer.getPtr(result)

        const value = new Array<u8>(valSize);
        memory.copy(value.dataStart, valPtr, valSize);

        heap.free(keyPtr);
        const i = instantiate<T>();
        if (valSize == 0) {
            return i;
        }
		const decodeResult = i.decode(value);
        if (decodeResult.isErr()) {
            dev.abort('Invalid value obtained for decoding');
        }
        return i;
    }

    set(key: u8[], value: T): void {
        const valueBytes = value.encode();

        const keyPtr = u32(heap.alloc(key.length));
        const keyPtrSize = pointer.toPtrSize(keyPtr, key.length);
        memory.copy(keyPtr, key.dataStart, key.length);

        const valuePtr = u32(heap.alloc(valueBytes.length));
        const valuePtrSize = pointer.toPtrSize(valuePtr, valueBytes.length);
        memory.copy(valuePtr, valueBytes.dataStart, valueBytes.length);

        env.storage.set(keyPtrSize, valuePtrSize);

        heap.free(keyPtr);
        heap.free(valuePtr);
    }

    del(key: u8[]): void {
        const keyPtr = heap.alloc(key.length);
        const keyPtrSize = pointer.toPtrSize(keyPtr, key.length);

        env.storage.del(keyPtrSize);

        heap.free(keyPtr);
    }
}
