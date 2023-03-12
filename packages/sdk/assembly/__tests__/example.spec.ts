import * as bytes from '../bytes';

class TestCaseBytesCompare {
  arg1: u8[] = [];
  arg2: u8[] = [];
  expected: i32 = 0;
}

describe("bytes", () => {
  it("should be equal", () => {
    expect<bool>(bytes.equal(bytes.fromArray([1, 2, 3]), bytes.fromArray([1, 2, 3]))).toBe(true);
  });

  describe('compare', () => {
    
    it('should be compare', () => {
      const cases: TestCaseBytesCompare[] = [
        { arg1: [1, 1, 1], arg2: [1, 1, 1], expected: 0},
        { arg1: [1, 1, 0], arg2: [1, 1, 2], expected: -1},
        { arg1: [2, 1, 0], arg2: [1, 1, 2], expected: 1},
      ];
      for (let i = 0; i < cases.length; i++) {
        expect<i32>(bytes.compare(bytes.fromArray(cases[i].arg1), bytes.fromArray(cases[i].arg2))).toBe(cases[i].expected);
      }
    });
  });
});
