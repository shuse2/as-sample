import { Module } from './module';

class Application {
	private _modules: Array<Module> = new Array<Module>();

	public register(mod: Module): void {
		this._modules.push(mod);
	}

	public beforeTransactionsExecute(): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.beforeTransactionsExecute();
		}
	}

	public call(module: string, command: string, params: u8[]): u8[] {
		for (let i = 0; i < this._modules.length; i++) {	
			const mod = this._modules[i];
			if (mod.name != module) {
				continue;
			}
			return mod.call(command, params);
		}
		return [];
	}

	public execute(ptr_start: u32, data_len: u32): void {
		const data = new Uint8Array(data_len);
		memory.copy(data.dataStart, ptr_start, data_len);
		const action: u32  = 8;

		console.log(data.toString());
		
		switch (action) {
			// if action == 0 call init
			case 0:
				break;
			// if action == 1 call insertAsset
			case 1:
				break;
			// if action == 2 call verifyAsset
			case 2:
				break;
			// if action == 3 call beforeTransactionExecute
			case 3:
				this.beforeTransactionsExecute();
				break;
			// if action == 4 call beforeTransactionExecute
			case 5:
				break;
			// if action == 5 call afterTransactionExecute
			case 6:
				break;
			// if action == 6 call verifyTransaciton
			case 7:
				break;
			// if action == 7 call executeTransaction
			case 8:
				const module = '';
				const method = '123';
				const params: u8[] = [];
				const result = this.call(module, method, params);
				// set the result back to memory to be used
				console.log(result.toString());
				break;
			default:
				abort('Not supported action.');
		}
	}
}

export const app = new Application();
