import { encoding, storage, types } from "lisk-sdk/assembly";

@codec
export class Vote extends encoding.EncodeDecoder {
    @fieldNumber(1)
    amount: u64 = 0;
}

@codec
export class Info extends encoding.EncodeDecoder {
    @fieldNumber(1)
    name: string = 'editor';
}

@codec
export class Account extends encoding.EncodeDecoder {
    @fieldNumber(1)
    balance: u64 = 0;
    @fieldNumber(2)
    init: bool = false;
    @fieldNumber(3)
    data: string = "sample";
    @fieldNumber(4)
    raw: u8[]  = [];
    @fieldNumber(5)
    rawList: u8[][]  = [];
    @fieldNumber(6)
    info: Info = new Info();
    @fieldNumber(7)
    infos: Info[] = [];
}

@store(1)
export class AccountStore extends storage.BaseStore<Account> {}
