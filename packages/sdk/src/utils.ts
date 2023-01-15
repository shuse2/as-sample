import {Decorator} from "./types";

export function containsDecorator(decorators: Decorator[], name: string) {
	return decorators.some(d => d.name === name);
}
