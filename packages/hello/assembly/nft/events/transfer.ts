import { types, encoding, env } from 'lisk-sdk/assembly';

@codec
export class TransferEvent extends encoding.EncodeDecoder {
	@fieldNumber(1)
	senderAddress: types.Address = new Uint8Array(0);
	@fieldNumber(2)
	recipientAddress: types.Address = new Uint8Array(0);
	@fieldNumber(3)
	amount: u64 = 0;

	log(sender: types.Address): void {
		env.event.log([sender], this.encode());
	}
}
