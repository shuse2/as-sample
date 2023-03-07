/// <reference types="assemblyscript/std/assembly" />

declare function module(_class: any): void;
declare function store(key: number | string | undefined): any;
declare function codec(_class: any): void;
declare function fieldNumber(num: number): any;
declare function topic(_class: any): any;
declare function event(eventName?: string, modName?: string): any;
declare function view(): any;
declare function command(): any;
declare function constants(name?: string): any;
