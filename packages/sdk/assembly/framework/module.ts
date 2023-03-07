export class CommandContext {
	senderAddress: u8[] = [];
}

export enum TransactionVerifyResult {
	INVALID = i32(-1),
	PENDING = i32(0),
	SUCCESS = i32(1),
}

export enum TransactionExecuteResult {
	INVALID = i32(-1),
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
	public verifyAsset(): void {}
	public insertAsset(): void {}
	public beforeTransactionsExecute(): void {}
	public afterTransactionsExecute(): void {}
	public verifyTransaction(): TransactionVerifyResult { return TransactionVerifyResult.INVALID }
	public beforeCommandExecute(): void {}
	public afterCommandExecute(): void {}

	// call should be extended by compiler taking the 'command' decorator
	public call(_context: CommandContext, _method: string, _params: u8[]): TransactionExecuteResult {
		return TransactionExecuteResult.INVALID;
	}
	// view should be extended by compiler taking the 'view' decorator
	public view(_method: string, _params: u8[]): u8[] {
		return [];
	}
}
