import { Decoder, EncodeDecoder, Encoder } from "lisk-sdk/assembly/encoding";
import { BaseStore } from "lisk-sdk/assembly/storage";

// @ts-ignore
@codec
export class Account implements EncodeDecoder {
    // @ts-ignore
    @fieldNumber(1)
    balance: u64 = 0;

    // Auto generate this function
    decode<T>(val: Uint8Array): T {
        return <T>new Account();
    }

    // Auto generate this function
    encode(): Uint8Array {
        return new Uint8Array(0);
    }
}

export class AccountStore extends BaseStore<Account> {}