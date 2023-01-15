import { types, env, storage, encoding } from 'lisk-sdk/assembly';
import { Account, AccountStore } from '../stores/account';

@codec
export class Params extends encoding.EncodeDecoder{
    @fieldNumber(1)
    senderAddress: types.Address = new Uint8Array(0);
    @fieldNumber(2)
    recipientAddress: types.Address = new Uint8Array(0);
    @fieldNumber(3)
    amount: u64 = 0;
    @fieldNumber(4)
    tokenID: Uint8Array = new Uint8Array(0);
}

export function verify(): types.Result<bool> {
    const params = new Params();
    params.decode(env.transaction.params());
    const sender = new Account();

    if (sender.balance < params.amount) {
        return types.Result.error("Insufficient balance");
    }

    return types.Result.success(true);
}

export function execute(): types.Result<bool> {
    const params = new Params();
    params.decode(env.transaction.params());
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
