import * as encoding from '../encoding';
import * as types from '../type_def';
import * as dev from '../dev';
import { TransactionVerifyResult } from './module';

@codec
export class Transaction extends encoding.EncodeDecoder {
    @fieldNumber(1)
    module: string = '';
    @fieldNumber(2)
    command: string = '';
    @fieldNumber(3)
    nonce: u64 = 0;
    @fieldNumber(4)
    fee: u64 = 0;
    @fieldNumber(5)
    senderPublicKey: types.ID = [];
    @fieldNumber(6)
    params: u8[] = [];
    @fieldNumber(7)
    signatures: u8[][] = [];
}

@codec
export class VerifyResult extends encoding.EncodeDecoder {
	@fieldNumber(1)
	result: u32 = TransactionVerifyResult.INVALID;

	static new(res: TransactionVerifyResult): u8[] {
		const val = new VerifyResult();
		val.result = res;
		return val.encode();
	}
}

@codec
export class ExecuteAction extends encoding.EncodeDecoder {
    @fieldNumber(1)
    transaction: Transaction = new Transaction();
    @fieldNumber(2)
    id: u8[] = [];
    @fieldNumber(3)
    size: u32 = 0;
    @fieldNumber(4)
    senderAddress: types.Address = [];

    mustDecode(val: u8[]): void {
        const res = this.decode(val);
        if (res.isErr()) {
            dev.abort('execution action cannot be decoded');
        }
    }
}

@codec
export class ViewAction extends encoding.EncodeDecoder {
    @fieldNumber(1)
    module: string = '';
    @fieldNumber(2)
    method: string = '';
    @fieldNumber(3)
    params: u8[] = [];
}

export class VersionActionResult extends encoding.EncodeDecoder {
    @fieldNumber(1)
    version: u32 = 0;
}