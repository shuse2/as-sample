import { types, encoding, env, events } from 'lisk-sdk/assembly';

@event
@codec
export class TransferEvent extends events.BaseEvent {
	@topic(1)
	@fieldNumber(1)
	senderAddress: types.Address;
	@fieldNumber(2)
	@topic(2)
	recipientAddress: types.Address;
	@fieldNumber(3)
	amount: u64 = 0;
	@topic(3)
	tokenID: u8[];

	constructor(
		senderAddress: types.Address,
		recipientAddress: types.Address,
		amount: u64,
		tokenID: u8[],
	) {
		super();
		this.senderAddress = senderAddress;
		this.recipientAddress = recipientAddress;
		this.amount = amount;
		this.tokenID = tokenID;
	}
}
