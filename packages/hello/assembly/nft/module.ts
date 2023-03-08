import { framework, types, encoding } from 'lisk-sdk/assembly';
import {TransferEvent} from './events/transfer';
import {AccountStore} from './stores/account';

@module
export class NFTModule extends framework.Module {
	public beforeTransactionsExecute(): void {
	}

	@command()
	public transfer(context: framework.CommandContext, recipient: types.Address, tokenID: u8[], amount: u64): framework.TransactionExecuteResult {
		const store = new AccountStore();
		const senderAccount = store.get(context.senderAddress);
		senderAccount.balance -= amount;
		store.set(context.senderAddress, senderAccount);
		new TransferEvent(context.senderAddress, recipient, amount, tokenID).log();
		return framework.TransactionExecuteResult.SUCCESS;
	}

	@view()
	public getBalance(caller: types.Address, tokenID: u8[]): types.Result<u64> {
		const store = new AccountStore();
		const senderAccount = store.get(caller);
		return types.Result.ok<u64>(0);
	}

	public mint(caller: types.Address, tokenID: u8[], amount: u64): void {
	}
}
