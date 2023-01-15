import { framework, types } from 'lisk-sdk/assembly';
import {AccountStore} from './stores/account';

@module
export class NFTModule extends framework.Module {
	public beforeTransactionsExecute(): void {
		console.log('aaa');
	}

	@command()
	public transfer(sender: types.Address, recipient: types.Address, tokenID: Uint8Array, amount: u64): void {
		const store = new AccountStore();
		const senderAccount = store.get(sender);
		senderAccount.balance -= amount;
		store.set(sender, senderAccount);
	}

	@view()
	public getBalance(caller: types.Address, tokenID: Uint8Array): u64 {
		return 0;
	}

	public mint(caller: types.Address, tokenID: Uint8Array, amount: u64): void {
	}

	// auto-generated
	public call(method: string, params: Uint8Array): Uint8Array {
		if (method == 'transfer') {
			this.transfer(new Uint8Array(20), new Uint8Array(20), new Uint8Array(20), 0);
			return new Uint8Array(0);
		}
		abort('method not registered');
		return new Uint8Array(0);
	}	
}
