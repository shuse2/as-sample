import { types, env, storage } from 'lisk-sdk/assembly';
import { EncodeDecoder } from 'lisk-sdk/assembly/encoding';
import { Result } from 'lisk-sdk/assembly/types';
import { Account, AccountStore } from '../stores/account';

// @ts-ignore
@codec
export class Params implements EncodeDecoder{
    // @ts-ignore
    @fieldNumber(1)
    senderAddress: types.Address = new Uint8Array(0);
    // @ts-ignore
    @fieldNumber(2)
    recipientAddress: types.Address = new Uint8Array(0);
    // @ts-ignore
    @fieldNumber(3)
    amount: u64 = 0;
    // @ts-ignore
    @fieldNumber(4)
    tokenID: Uint8Array = new Uint8Array(0);

    // Auto generate this function
    public decode<T>(val: Uint8Array): T {
        return <T>new Params();
    }

    // Auto generate this function
    public encode(): Uint8Array {
        return new Uint8Array(0);
    }
}

export function verify(): types.Result<bool> {
    const params = new Params();
    params.decode<Params>(env.transaction.params());
    const sender = new Account();

    if (sender.balance < params.amount) {
        return types.Result.error("Insufficient balance");
    }

    return types.Result.success(true);
}

export function execute(): types.Result<bool> {
    const params = new Params();
    params.decode<Params>(env.transaction.params());
    const store = new AccountStore();
    const sender = store.get(params.senderAddress);
    if (sender.balance < params.amount) {
        return types.Result.error("Insufficient balance");
    }
    sender.balance -= params.amount;
    store.set(params.senderAddress, sender);

    const recipient = store.get(params.recipientAddress);
    recipient.balance += params.amount;

    store.set(params.recipientAddress, recipient);

    return types.Result.success(true);
}
