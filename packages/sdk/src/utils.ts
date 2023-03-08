import {Decorator} from "./types";

export function containsDecorator(decorators: Decorator[], name: string) {
	return decorators.some(d => d.name === name);
}

export const getGenericType = (type: string) => {
	let start = 0;
	let end = type.length - 1;
	for (let i = 0; i < type.length; i++) {
		if (start === 0 && type.at(i) === '<') {
			start = i + 1;
		}
		if (end === type.length - 1 && type.at(end - i) === '>') {
			end = type.length - 1 - i;
		}
	}
	return type.substring(start, end);
};