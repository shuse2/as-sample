import { CodecMetadata } from "./codec.js";
import { MethodMetadata } from "./command.js";
import { EventMetadata } from "./event.js";
import { StoreMetadata } from "./store.js";

export interface Metadata {
	name: string;
	commands: MethodMetadata[];
	endpoints: MethodMetadata[];
	stores: StoreMetadata[];
	events: EventMetadata[];
	codec: CodecMetadata[];
};

export interface Decorator {
	name: string;
	value: (number | string)[];
}

export interface Param {
	name: string;
	type: string;
}

export interface Field {
	name: string;
	type: string;
	decorators: Decorator[];
}

 export interface Method {
	name: string;
	decorators: Decorator[];
	params: Param[];
	returnType: string;
}

export interface ExtendedClass {
	class: string;
	args: string[];
}

export interface ParsedData {
	class: string;
	extends: ExtendedClass | undefined;
	decorators: Decorator[];
	fields: Field[];
	methods: Method[];
}
