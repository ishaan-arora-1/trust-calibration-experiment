import { describe, it, expect } from "vitest";
import { toCSV } from "@/lib/export/csv";

describe("toCSV", () => {
  it("returns empty string for empty array", () => {
    expect(toCSV([])).toBe("");
  });

  it("produces correct headers and rows", () => {
    const data = [
      { name: "Alice", score: 95 },
      { name: "Bob", score: 87 },
    ];
    const csv = toCSV(data);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("name,score");
    expect(lines[1]).toBe("Alice,95");
    expect(lines[2]).toBe("Bob,87");
  });

  it("escapes values containing commas", () => {
    const data = [{ description: "hello, world", id: 1 }];
    const csv = toCSV(data);
    expect(csv).toContain('"hello, world"');
  });

  it("escapes values containing double quotes", () => {
    const data = [{ text: 'He said "hi"', id: 1 }];
    const csv = toCSV(data);
    expect(csv).toContain('"He said ""hi"""');
  });

  it("escapes values containing newlines", () => {
    const data = [{ text: "line1\nline2", id: 1 }];
    const csv = toCSV(data);
    expect(csv).toContain('"line1\nline2"');
  });

  it("handles null and undefined values", () => {
    const data = [{ a: null, b: undefined, c: "ok" }];
    const csv = toCSV(data);
    const lines = csv.split("\n");
    expect(lines[1]).toBe(",,ok");
  });

  it("handles numeric and boolean values", () => {
    const data = [{ num: 42, bool: true, str: "test" }];
    const csv = toCSV(data);
    const lines = csv.split("\n");
    expect(lines[1]).toBe("42,true,test");
  });
});
