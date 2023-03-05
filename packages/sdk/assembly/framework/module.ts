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
	public call(_method: string, _params: u8[]): u8[] {
		return [];
	}
}
