export function alloc(size: u32): usize {
	return heap.alloc(size);
} 

export function free(ptr: u32): void {
	heap.free(ptr);
}

export function realloc(ptr: u32, size: u32): u32 {
	return heap.realloc(ptr, size) as u32;
}