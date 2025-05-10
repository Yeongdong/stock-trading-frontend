import { formatKRW } from "../formatters";

describe("formatKRW function", () => {
  test("formats numbers correctly", () => {
    expect(formatKRW("1000")).toBe("₩1,000");
    expect(formatKRW("1000000")).toBe("₩1,000,000");
    expect(formatKRW("0")).toBe("₩0");
  });

  test("handles string numbers", () => {
    expect(formatKRW("1234567")).toBe("₩1,234,567");
  });

  test("handles invalid inputs", () => {
    expect(formatKRW("")).toBe("₩0");
    expect(formatKRW("invalid")).toBe("₩0");
  });
});
