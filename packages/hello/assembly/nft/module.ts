import { framework, types, encoding } from 'lisk-sdk/assembly';
import {TransferEvent} from './events/transfer';
import {AccountStore} from './stores/account';

@module
export class NFTModule extends framework.Module {
	public beforeTransactionsExecute(): void {
	}

	@command()
	public transfer(sender: types.Address, recipient: types.Address, tokenID: u8[], amount: u64): void {
		const store = new AccountStore();
		const senderAccount = store.get(sender);
		senderAccount.balance -= amount;
		store.set(sender, senderAccount);
		new TransferEvent(sender, recipient, amount, tokenID).log();
	}

	@view()
	public getBalance(caller: types.Address, tokenID: u8[]): u64 {
		const store = new AccountStore();
		const senderAccount = store.get(caller);
		return 0;
	}

	public mint(caller: types.Address, tokenID: u8[], amount: u64): void {
	}

	// auto-generated
	public call(method: string, params: u8[]): u8[] {
		if (method == 'transfer') {
			const reader = new encoding.Reader(params);
			this.transfer(reader.readBytes(1), reader.readBytes(2), reader.readBytes(3), reader.readU64(4));
			return [];
		}
		if (method == 'getBalance') {
			const reader = new encoding.Reader(params);
			const result = this.getBalance(reader.readBytes(1), reader.readBytes(2));
			const writer = new encoding.Writer();
			writer.writeU64(1, result);
			return writer.result();
		}
		abort('method not registered');
		return [];
	}	
}
