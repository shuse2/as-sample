import { Reader } from "../../encoding/reader";
import { Result } from "../../type_def";

describe("Reader", () => {
  it("should read u32 values correctly", () => {
    const data: Array<u8> = [
      0x08, 0x96, 0x01, // field 1, value 150
      0x10, 0x2D, // field 2, value 45
      0x18, 0x00, // field 3, value 0
    ];
    const reader = new Reader(data);
    expect(reader.readU32(1).unwrap()).toBe(<u32>(150));
    expect(reader.readU32(2).unwrap()).toBe(<u32>(45));
    expect(reader.readU32(3).unwrap()).toBe(<u32>(0));
  });

  it("should read u64 values correctly", () => {
    const data: Array<u8> = [
        0x08, 0x96, 0x01, // field 1, value 150
        0x10, 0x2D, // field 2, value 45
        0x18, 0x00, // field 3, value 0
    ];
    const reader = new Reader(data);
    expect(reader.readU64(1).unwrap()).toBe(<u64>(150));
    expect(reader.readU64(2).unwrap()).toBe(<u64>(45));
    expect(reader.readU64(3).unwrap()).toBe(<u64>(0));
  });

    it("should read i32 values correctly", () => {
        const data: Array<u8> = [
            0x08, 0xac, 0x02, // field 1, value 150
            0x10, 0x2D, 0x00, // field 2, value -45
            0x18, 0x00,       // field 3, value 0
            0x22, 0x07, 0xE2, 0x04, 0x00, // field 4, value 314159
            0x30, 0x01,       // field 6, value true
            0x38, 0x00,       // field 7, value false
            0x40, 0x7F, 0xFF, 0xFF, 0xFF, // field 8, value 2147483647
            0x48, 0x80, 0x00, 0x00, 0x01, // field 9, value -2147483648
        ];
        const reader = new Reader(data);
        expect(reader.readI32(1).unwrap()).toBe(<i32>150);
        // expect(reader.readI32(2).unwrap()).toBe(<i32>-45);
        // expect(reader.readI32(3).unwrap()).toBe(<i32>0);
        // expect(reader.readI32(4).unwrap()).toBe(<i32>314159);
        // expect(reader.readI32(6).unwrap()).toBe(<i32>1);
        // expect(reader.readI32(7).unwrap()).toBe(<i32>0);
    });

  it("should read i64 values correctly", () => {
    const data: Array<u8> = [
      0x08, 0xac, 0x02, // field 1, value 150
      0x10, 0x2D, 0x00, // field 2, value -45
      0x18, 0x00, // field 3, value 0
    ];
    const reader = new Reader(data);
    expect(reader.readI64(1).unwrap()).toBe(<i64>150);
  });

});
