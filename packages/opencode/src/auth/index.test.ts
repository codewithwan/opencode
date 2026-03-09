import { describe, it, expect } from "bun:test"
import { Auth } from "./index"

describe("Auth.resolveKey", () => {
  it("returns providerID when alias is undefined", () => {
    expect(Auth.resolveKey("openai")).toBe("openai")
  })

  it("returns providerID when alias is empty string", () => {
    expect(Auth.resolveKey("openai", "")).toBe("openai")
  })

  it("returns providerID/alias when alias is valid", () => {
    expect(Auth.resolveKey("openai", "work")).toBe("openai/work")
  })

  it("allows alphanumeric, dash, and underscore in alias", () => {
    expect(Auth.resolveKey("anthropic", "my-account_1")).toBe("anthropic/my-account_1")
  })

  it("throws TypeError for alias with uppercase letters", () => {
    expect(() => Auth.resolveKey("openai", "Work")).toThrow(TypeError)
  })

  it("throws TypeError for alias with spaces", () => {
    expect(() => Auth.resolveKey("openai", "my account")).toThrow(TypeError)
  })

  it("throws TypeError for alias with slashes", () => {
    expect(() => Auth.resolveKey("openai", "a/b")).toThrow(TypeError)
  })
})

describe("Auth.listByProvider", () => {
  it("returns only entries matching providerID or providerID/alias", async () => {
    const mockAll = async (): Promise<Record<string, Auth.Info>> => ({
      openai: { type: "api", key: "key1" },
      "openai/work": { type: "api", key: "key2" },
      "openai/personal": { type: "api", key: "key3" },
      anthropic: { type: "api", key: "key4" },
      "anthropic/other": { type: "api", key: "key5" },
    })

    const data = await mockAll()
    const result = Object.fromEntries(
      Object.entries(data).filter(([key]) => key === "openai" || key.startsWith("openai/")),
    )

    expect(Object.keys(result)).toEqual(["openai", "openai/work", "openai/personal"])
    expect(result["anthropic"]).toBeUndefined()
    expect(result["anthropic/other"]).toBeUndefined()
  })

  it("does not include providers that share a prefix but are different providers", async () => {
    const data: Record<string, Auth.Info> = {
      open: { type: "api", key: "key1" },
      openai: { type: "api", key: "key2" },
      "openai/work": { type: "api", key: "key3" },
    }

    const result = Object.fromEntries(
      Object.entries(data).filter(([key]) => key === "openai" || key.startsWith("openai/")),
    )

    expect(Object.keys(result)).toEqual(["openai", "openai/work"])
    expect(result["open"]).toBeUndefined()
  })

  it("returns empty object when no matching entries", async () => {
    const data: Record<string, Auth.Info> = {
      anthropic: { type: "api", key: "key1" },
    }

    const result = Object.fromEntries(
      Object.entries(data).filter(([key]) => key === "openai" || key.startsWith("openai/")),
    )

    expect(Object.keys(result)).toHaveLength(0)
  })
})
