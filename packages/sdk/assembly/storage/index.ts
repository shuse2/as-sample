import * as env from "../env";
import { EncodeDecoder } from '../encoding';

export class BaseStore<T extends EncodeDecoder> {
    _name: string = "";

    get name(): string {
        if (this._name == "") {
            this._name = nameof<this>();
        }
        return this._name;
    }

    get(key: Uint8Array): T {
        const val = env.storage.get(key);
        const i = instantiate<T>();
        return i.decode<T>(val);
    }

    set(key: Uint8Array, value: T): void {
        const bytes = value.encode();
        env.storage.set(key, bytes);
    }

    has(key: Uint8Array): bool {
        return false;
    }
}