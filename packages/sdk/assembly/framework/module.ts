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
	public call(_method: string, _params: Uint8Array): Uint8Array {
		return new Uint8Array(0);
	}
}
