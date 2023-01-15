import {Decorator, ParsedData} from "./types.js";
import {containsDecorator} from "./utils.js";

const convertKnownType = (type: string): string => {
	switch(type) {
		case 'types.Address':
			return 'Uint8Array';
		default:
			return type;
	}
};

const getReader = (type: string, fieldNumber: number): string => {
	const convertedType = convertKnownType(type);
	if (convertedType === 'u32') {
		return `reader.readU32(${fieldNumber})`;
	}
	if (convertedType === 'i32') {
		return `reader.readI32(${fieldNumber})`;
	}
	if (convertedType === 'u64') {
		return `reader.readU64(${fieldNumber})`;
	}
	if (convertedType === 'i64') {
		return `reader.readI64(${fieldNumber})`;
	}
	if (convertedType === 'string') {
		return `reader.readString(${fieldNumber})`;
	}
	if (convertedType === 'boolean') {
		return `reader.readBoolean(${fieldNumber})`;
	}
	if (convertedType === 'Uint8Array') {
		return `reader.readBytes(${fieldNumber})`;
	}
	throw new Error(`Unknown type: ${convertedType}`);
}

const getWriter = (type: string, fieldNumber: number, name: string): string => {
	const convertedType = convertKnownType(type);
	if (convertedType === 'u32') {
		return `writer.writeU32(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'i32') {
		return `writer.writeI32(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'u64') {
		return `writer.writeU64(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'i64') {
		return `writer.writeI64(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Uint8Array') {
		return `writer.writeBytes(${fieldNumber}, this.${name})`;
	}

	throw new Error(`Unknown type: ${convertedType}`);
};

const getFieldNumber = (decorators: Decorator[]): number => {
	const d = decorators.find(d => d.name === 'fieldNumber');
	if (!d) {
		throw new Error('no decorator found.');
	}
	if (typeof d.value !== 'number') {
		throw new Error('invalid fieldNumber');
	}
	if (d.value <= 0) {
		throw new Error('invalid fieldNumber');
	}
	return d.value;
};

export function createCodec(data: ParsedData): ({ encode: string; decode: string }) {
	if (!data.decorators.some(d => d.name === 'codec')) {
		throw new Error('data is not codec');
	}
	const fields = data.fields.filter(d => containsDecorator(d.decorators, 'fieldNumber'));
	fields.sort((a, b) => {
		const d1 = a.decorators.find(d => d.name === 'fieldNumber')!;
		const d2 = b.decorators.find(d => d.name === 'fieldNumber')!;
		return Number(d1.value) - Number(d2.value);
	});
	let decode = `decode(val: Uint8Array): void { \nconst reader = new encoding.Reader(val);\n`;
	let encode = 'encode(): Uint8Array { \nconst writer = new encoding.Writer();\n';
	for (const field of fields) {
		decode += `this.${field.name} = ${getReader(field.type, getFieldNumber(field.decorators))};\n`;
		encode += `${getWriter(field.type, getFieldNumber(field.decorators), `${field.name}`)};\n`;
	}
	encode += 'return writer.result(); }\n';
	decode += '}';
	return {
		encode,
		decode,
	};
};
