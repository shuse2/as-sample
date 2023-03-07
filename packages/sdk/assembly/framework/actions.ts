import * as encoding from '../encoding';
import * as types from '../type_def';

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

export class ExecuteAction extends encoding.EncodeDecoder {
    @fieldNumber(1)
    transaction: Transaction = new Transaction();
    @fieldNumber(2)
    id: u8[] = [];
    @fieldNumber(3)
    size: u32 = 0;
    @fieldNumber(4)
    senderAddress: types.Address = [];
}

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