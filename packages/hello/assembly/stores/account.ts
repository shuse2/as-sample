import { encoding } from "lisk-sdk/assembly";
import { BaseStore } from "lisk-sdk/assembly/storage";

@codec
export class Account extends encoding.EncodeDecoder {
    @fieldNumber(1)
    balance: u64 = 0;
}

@store
export class AccountStore extends BaseStore<Account> {}
