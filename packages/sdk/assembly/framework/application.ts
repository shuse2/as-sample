import * as encoding from '../encoding';
import { pointer } from '../internal';
import { ExecuteAction, VersionActionResult, ViewAction } from './actions';
import { Module, TransactionExecuteResult, TransactionVerifyResult } from './module';

@codec
class ExecuteData extends encoding.EncodeDecoder {
	@fieldNumber(1)
	action: u32 = 0;
	@fieldNumber(2)
	data: u8[] = [];
}

class Application {
	private _modules: Array<Module> = new Array<Module>();
	private _version: u32 = 0;

	public register(mod: Module): void {
		this._modules.push(mod);
	}		

	public setVersion(version: u32): void {
		this._version = version;
	}

	public execute(inputPtrSize: u64, outputPtrSize: u64): u64 {
		const ptr = pointer.getPtr(inputPtrSize);
		const size = pointer.getSize(inputPtrSize);
		const data = new Array<u8>(size);
		memory.copy(data.dataStart, ptr, size);
		const execData = new ExecuteData();
		execData.decode(data);
		
		switch (execData.action) {
			// if action == 0 call version
			case 0:
				const result = new VersionActionResult();
				result.version = this._version;
				return this._writeResult(result.encode(), outputPtrSize);
			// if action == 1 call init
			case 1:
				this._init(execData.data);
				break;
			// if action == 2 call insertAsset
			case 2:
				this._insertAsset(execData.data);
				break;
			// if action == 3 call verifyAsset
			case 3:
				this._verifyAsset(execData.data);
				break;
			// if action == 4 call beforeTransactionsExecute
			case 4:
				this._beforeTransactionsExecute(execData.data);
				break;
			// if action == 5 call afterTransactionExecute
			case 5:
				this._afterTransactionsExecute(execData.data);
				break;
			// if action == 6 call verifyTransaciton
			case 6:
				return this._verifyTransaction(execData.data);
			// if action == 7 call executeTransaction
			case 7:
				return this._executeTransaction(execData.data);
			// if action == 8 call executeTransaction
			case 8:
				return this._view(execData.data, outputPtrSize);
			default:
				abort('Not supported action.');
		}
		return pointer.toZeroPtr(outputPtrSize);
	}

	private _init(data: u8[]): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.init();
		}
	}

	private _insertAsset(data: u8[]): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.insertAsset();
		}
	}

	private _verifyAsset(data: u8[]): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.verifyAsset();
		}
	}

	private _beforeTransactionsExecute(data: u8[]): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.beforeTransactionsExecute();
		}
	}

	private _afterTransactionsExecute(data: u8[]): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.afterTransactionsExecute();
		}
	}

	private _verifyTransaction(data: u8[]): i32 {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			const result = mod.verifyTransaction();
			if (result != TransactionVerifyResult.SUCCESS) {
				return result;
			}
		}
		return TransactionVerifyResult.SUCCESS;
	}

	private _beforeCommandExecute(data: u8[]): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.beforeCommandExecute();
		}
	}

	private _afterCommandExecute(data: u8[]): void {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.afterCommandExecute();
		}
	}

	private _executeTransaction(data: u8[]): i32 {
		const action = new ExecuteAction();
		action.decode(data);
		this._beforeCommandExecute(data);
		const result = this._execute(action);
		this._afterCommandExecute(data);
		return result;
	}

	public _execute(action: ExecuteAction): i32 {
		for (let i = 0; i < this._modules.length; i++) {
			if (this._modules[i].name == action.transaction.module) {
				return this._modules[i].call({ senderAddress : action.senderAddress }, action.transaction.command, action.transaction.params);
			}
		}
		abort('Invalid input. module does not exist.')
		return -1;
	}

	public _view(data: u8[], outputPtrSize: i64): i64 {
		const action = new ViewAction();
		action.decode(data);
		for (let i = 0; i < this._modules.length; i++) {
			if (this._modules[i].name == action.module) {
				 const result = this._modules[i].view(action.method, action.params);
				 return this._writeResult(result, outputPtrSize);
			}
		}
		abort('Invalid input. module does not exist.')
		return pointer.toZeroPtr(outputPtrSize);
	}

	public _writeResult(result: u8[], outputPtrSize: i64): i64 {
		let ptr = pointer.getPtr(outputPtrSize);
		const size = pointer.getSize(outputPtrSize);
		if (size < result.length) {
			ptr = u32(heap.realloc(ptr, result.length));
		}
		memory.copy(ptr, result.dataStart, result.length);
		const ptrSize = pointer.toPtrSize(ptr, result.length);
		return ptrSize;
	}
}

export const app = new Application();
