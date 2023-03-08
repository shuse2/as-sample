import * as dev from '../dev';
import * as env from '../env';
import * as types from '../type_def';
import * as encoding from '../encoding';
import { pointer } from '../internal';
import { ExecuteAction, VerifyResult, VersionActionResult, ViewAction } from './actions';
import { Module, TransactionExecuteResult, TransactionVerifyResult } from './module';
import { CommandResultEvent } from '../events';

@codec
class ExecuteData extends encoding.EncodeDecoder {
	@fieldNumber(1)
	action: u32 = 0;
	@fieldNumber(2)
	data: u8[] = [];
}

@codec
class ExecutionResult extends encoding.EncodeDecoder {
	@fieldNumber(1)
	success: bool = false;
	@fieldNumber(2)
	error: types.RuntimeError = new types.RuntimeError('');
	@fieldNumber(3)
	data: u8[] = [];

	public static error(err: types.RuntimeError): u8[] {
		const res = new ExecutionResult();
		res.error = err;
		return res.encode();
	}

	public static success(): u8[] {
		const res = new ExecutionResult();
		res.success = true;
		return res.encode();
	}

	public static successWithData(data: u8[]): u8[] {
		const res = new ExecutionResult();
		res.success = true;
		res.data = data;
		return res.encode();
	}
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
				return this._init(execData.data, outputPtrSize);
			// if action == 2 call insertAsset
			case 2:
				return this._insertAsset(execData.data, outputPtrSize);
			// if action == 3 call verifyAsset
			case 3:
				return this._verifyAsset(execData.data, outputPtrSize);
			// if action == 4 call beforeTransactionsExecute
			case 4:
				return this._beforeTransactionsExecute(execData.data, outputPtrSize);
			// if action == 5 call afterTransactionExecute
			case 5:
				return this._afterTransactionsExecute(execData.data, outputPtrSize);
			// if action == 6 call verifyTransaciton
			case 6:
				return this._verifyTransaction(execData.data, outputPtrSize);
			// if action == 7 call executeTransaction
			case 7:
				return this._executeTransaction(execData.data, outputPtrSize);
			// if action == 8 call executeTransaction
			case 8:
				return this._view(execData.data, outputPtrSize);
			default:
				abort('Not supported action.');
				unreachable();
		}
		return pointer.toZeroPtr(outputPtrSize);
	}

	private _init(data: u8[], outputPtrSize: u64): u64 {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.init();
		}
		return this._writeResult(ExecutionResult.success(), outputPtrSize);
	}

	private _insertAsset(data: u8[], outputPtrSize: u64): u64 {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			mod.insertAsset();
		}
		return this._writeResult(ExecutionResult.success(), outputPtrSize);
	}

	private _verifyAsset(data: u8[], outputPtrSize: u64): u64 {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			const result = mod.verifyAsset();
			if (result.isErr()) {
				return this._writeResult(ExecutionResult.error(result.unwrap()), outputPtrSize);
			}
		}
		return this._writeResult(ExecutionResult.success(), outputPtrSize);
	}

	private _beforeTransactionsExecute(data: u8[], outputPtrSize: u64): u64 {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			const result = mod.beforeTransactionsExecute();
			if (result.isErr()) {
				return this._writeResult(ExecutionResult.error(result.unwrap()), outputPtrSize);
			}
		}
		return this._writeResult(ExecutionResult.success(), outputPtrSize);
	}

	private _afterTransactionsExecute(data: u8[], outputPtrSize: u64): u64 {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			const result = mod.afterTransactionsExecute();
			if (result.isErr()) {
				return this._writeResult(ExecutionResult.error(result.unwrap()), outputPtrSize);
			}
		}
		return this._writeResult(ExecutionResult.success(), outputPtrSize);
	}

	private _verifyTransaction(data: u8[], outputPtrSize: u64): u64 {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			const result = mod.verifyTransaction();
			if (result != TransactionVerifyResult.SUCCESS) {
				return this._writeResult(ExecutionResult.successWithData(VerifyResult.new(result)), outputPtrSize);
			}
		}
		return this._writeResult(ExecutionResult.successWithData(VerifyResult.new(TransactionVerifyResult.SUCCESS)), outputPtrSize);
	}

	private _beforeCommandExecute(data: u8[]): types.MaybeError {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			const result = mod.beforeCommandExecute();
			if (result.isErr()) {
				return result;
			}
		}
		return types.MaybeError.ok();
	}

	private _afterCommandExecute(data: u8[]): types.MaybeError {
		for (let i = 0; i < this._modules.length; i++) {
			const mod = this._modules[i];
			const result = mod.afterCommandExecute();
			if (result.isErr()) {
				return result;
			}
		}
		return types.MaybeError.ok();
	}

	private _executeTransaction(data: u8[], outputPtrSize: u64): u64 {
		const action = new ExecuteAction();
		action.mustDecode(data);
		const beforeRes = this._beforeCommandExecute(data);
		if (beforeRes.isErr()) {
			return this._writeResult(ExecutionResult.error(beforeRes.unwrap()), outputPtrSize)
		}
		const result = this._execute(action);
		if (result == -1) {
			return this._writeResult(ExecutionResult.error(new types.RuntimeError('unknown method')), outputPtrSize)
		}
		const afterRes = this._afterCommandExecute(data);
		if (afterRes.isErr()) {
			return this._writeResult(ExecutionResult.error(afterRes.unwrap()), outputPtrSize)
		}
		this._writeEvent(CommandResultEvent.new(action.transaction.module, action.transaction.command, result === TransactionExecuteResult.SUCCESS));
		return this._writeResult(ExecutionResult.success(), outputPtrSize);
	}

	public _execute(action: ExecuteAction): i32 {
		for (let i = 0; i < this._modules.length; i++) {
			if (this._modules[i].name == action.transaction.module) {
				return this._modules[i].call({ senderAddress : action.senderAddress }, action.transaction.command, action.transaction.params);
			}
		}
		return -1;
	}

	public _view(data: u8[], outputPtrSize: i64): i64 {
		const action = new ViewAction();
		action.decode(data);
		for (let i = 0; i < this._modules.length; i++) {
			dev.log(this._modules[i].name);
			if (this._modules[i].name == action.module) {
				 const result = this._modules[i].view(action.method, action.params);
				 if (result.isErr()) {
				 	return this._writeResult(ExecutionResult.error(new types.RuntimeError(result.err())), outputPtrSize);
				 }
				 return this._writeResult(ExecutionResult.successWithData(result.unwrap()), outputPtrSize);
			}
		}
		return this._writeResult(ExecutionResult.error(new types.RuntimeError('Invalid input. module does not exist.')), outputPtrSize);
	}

	public _writeResult(result: u8[], outputPtrSize: u64): u64 {
		let ptr = pointer.getPtr(outputPtrSize);
		const size = pointer.getSize(outputPtrSize);
		if (size < result.length) {
			ptr = u32(heap.realloc(ptr, result.length));
		}
		memory.copy(ptr, result.dataStart, result.length);
		const ptrSize = pointer.toPtrSize(ptr, result.length);
		return ptrSize;
	}

	public _writeEvent(encodedEvent: u8[]): void {
		const ptr = heap.alloc(encodedEvent.length);
		const ptrSize: u64 = (u64(encodedEvent.length) << 32) + ptr;
		memory.copy(ptr, encodedEvent.dataStart, encodedEvent.length);
		env.event.log(ptrSize);
		heap.free(ptr);
	}
}

export const app = new Application();
