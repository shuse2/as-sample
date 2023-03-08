import { ParsedData } from "./types.js";
import { containsDecorator } from "./utils.js";


function getName(data: ParsedData, modName: string): { modName: string, eventName: string } {
    const decorator = data.decorators.find(d => d.name === 'event');
    if (!decorator) {
        throw new Error('data is not event');
    }
    if (decorator.value.length === 0) {
        const name = data.class.replace('Event', '');
        const eventName = name.charAt(0).toLowerCase() + name.substring(1);
        return {
            modName,
            eventName,
        }
    }
    if (decorator.value.some(v => typeof v !== 'string')) {
        throw new Error('event decorator must be string');
    }
    if (decorator.value.length === 1) {
        return {
            modName,
            eventName: decorator.value[0] as string,
        }

    }
    if (decorator.value.length === 2) {
        return {
            eventName: decorator.value[0] as string,
            modName: decorator.value[1] as string,
        }
    }

    throw new Error('Invalid decorator input for event');
}

export function createEvent(data: ParsedData, modName: string): { log: string, error: string } {
    if (!data.decorators.some(d => d.name === 'event')) {
		throw new Error('data is not event');
	}
	const fields = data.fields.filter(d => containsDecorator(d.decorators, 'topic'));
	fields.sort((a, b) => {
		const d1 = a.decorators.find(d => d.name === 'topic')!;
		const d2 = b.decorators.find(d => d.name === 'topic')!;
		return Number(d1.value[0]) - Number(d2.value[0]);
	});
    const topics = fields.map(f => `this.${f.name}`).join(',');
    const names = getName(data, modName);
    const logFunc = `
        log(): void {
            const event = new events.Event();
            event.module = '${names.modName}';
            event.name = '${names.eventName}';
            event.data = this.encode();
            event.topics = [${topics}];
            const encodedEvent = event.encode();

            const ptr = heap.alloc(encodedEvent.length);
            const ptrSize: u64 = (u64(encodedEvent.length) << 32) + ptr;
            memory.copy(ptr, encodedEvent.dataStart, encodedEvent.length);
            env.event.log(ptrSize);
            heap.free(ptr);
        }
    `;
    const errFunc = `
        error(): void {
            const event = new events.Event();
            event.module = '${names.modName}';
            event.name = '${names.eventName}';
            event.data = this.encode();
            event.topics = [${topics}];
            event.noRevert = true;

            const ptr = heap.alloc(encodedEvent.length);
            const ptrSize: u64 = (u64(encodedEvent.length) << 32) + ptr;
            memory.copy(ptr, encodedEvent.dataStart, encodedEvent.length);
            env.event.log(ptrSize);
            heap.free(ptr);
        }
    `;

    return {
        log: logFunc,
        error: errFunc,
    }
}


export interface EventMetadata {
    module: string;
    name: string;
    data: {
        name: string;
        type: string;
        fieldNumber: number;
    }[];
    topics: {
        name: string;
        type: string;
        index: number;
    }[];
}

export function getEventMetadata(data: ParsedData, modName: string): EventMetadata {
    if (!data.decorators.some(d => d.name === 'event')) {
		throw new Error('data is not event');
	}
	const topicFields = data.fields.filter(d => containsDecorator(d.decorators, 'topic'));
	topicFields.sort((a, b) => {
		const d1 = a.decorators.find(d => d.name === 'topic')!;
		const d2 = b.decorators.find(d => d.name === 'topic')!;
		return Number(d1.value[0]) - Number(d2.value[0]);
	});
    const codecFields = data.fields.filter(d => containsDecorator(d.decorators, 'fieldNumber'));
	codecFields.sort((a, b) => {
		const d1 = a.decorators.find(d => d.name === 'fieldNumber')!;
		const d2 = b.decorators.find(d => d.name === 'fieldNumber')!;
		return Number(d1.value[0]) - Number(d2.value[0]);
	});
    const names = getName(data, modName);
    return {
        module: names.modName,
        name: names.eventName,
        topics: topicFields.map((f, i) => ({
            name: f.name,
            type: f.type,
            index: i,
        })),
        data: codecFields.map(f => ({
            name: f.name,
            type: f.type,
            fieldNumber: f.decorators.find(d => d.name === 'fieldNumber')!.value[0] as number,
        })),
    }
}