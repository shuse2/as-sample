import * as types from '../type_def';
export class CommandContext {
	senderAddress: u8[] = [];
}

export enum TransactionVerifyResult {
	INVALID = i32(-1),
	PENDING = i32(0),
	SUCCESS = i32(1),
}

export enum TransactionExecuteResult {
	FAIL = i32(0),
	SUCCESS = i32(1),
}

export class Module {
	private _name: string = "";

	get name(): string {
        if (this._name == "") {
            this._name = nameof<this>();
        }
        return this._name;
    }
	public init(): void {}
	public verifyAsset(): types.MaybeError { return types.MaybeError.ok(); }
	public insertAsset(): void {}
	public beforeTransactionsExecute(): types.MaybeError { return types.MaybeError.ok(); }
	public afterTransactionsExecute(): types.MaybeError { return types.MaybeError.ok(); }
	public verifyTransaction(): TransactionVerifyResult { return TransactionVerifyResult.SUCCESS }
	public beforeCommandExecute(): types.MaybeError { return types.MaybeError.ok(); }
	public afterCommandExecute(): types.MaybeError { return types.MaybeError.ok(); }

	// call should be extended by compiler taking the 'command' decorator
	public call(_context: CommandContext, _method: string, _params: u8[]): TransactionExecuteResult {
		return TransactionExecuteResult.FAIL;
	}
	// view should be extended by compiler taking the 'view' decorator
	public view(_method: string, _params: u8[]): types.Result<u8[]> {
		return types.Result.err<u8[]>('method not implemented');
	}
}
