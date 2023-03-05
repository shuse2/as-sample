export class CommandContext {
	senderAddress: u8[] = [];
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
	public beforeTransactionsExecute(): void {}
	public afterTransactionsExecute(): void {}
	public verifyTransaction(): void {}
	public beforeCommandExecute(): void {}
	public afterCommandExecute(): void {}

	// call should be extended by compiler taking the 'command' decorator
	public call(_context: CommandContext, _method: string, _params: u8[]): u8[] {
		return [];
	}
	// view should be extended by compiler taking the 'view' decorator
	public view(_method: string, _params: u8[]): u8[] {
		return [];
	}
}
