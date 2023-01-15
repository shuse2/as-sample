export interface Metadata {
	commands: {};
	stores: {};
	events: {};
}

export interface Decorator {
	name: string;
	value: number | string;
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

export interface ParsedData {
	class: string;
	decorators: Decorator[];
	fields: Field[];
	methods: Method[];
}
