import { describe, expect, it } from "vitest";
import { linkItemSchema, profileSchema, reorderSchema, slugSchema } from "../validations";

describe("slugSchema", () => {
	it("accepts valid slugs", () => {
		expect(slugSchema.safeParse("cole").success).toBe(true);
		expect(slugSchema.safeParse("my-page").success).toBe(true);
		expect(slugSchema.safeParse("user123").success).toBe(true);
		expect(slugSchema.safeParse("a1b").success).toBe(true);
	});

	it("rejects slugs that are too short", () => {
		expect(slugSchema.safeParse("ab").success).toBe(false);
		expect(slugSchema.safeParse("a").success).toBe(false);
	});

	it("rejects slugs that are too long", () => {
		expect(slugSchema.safeParse("a".repeat(31)).success).toBe(false);
	});

	it("rejects reserved slugs", () => {
		expect(slugSchema.safeParse("admin").success).toBe(false);
		expect(slugSchema.safeParse("login").success).toBe(false);
		expect(slugSchema.safeParse("api").success).toBe(false);
		expect(slugSchema.safeParse("editor").success).toBe(false);
	});

	it("rejects uppercase slugs", () => {
		expect(slugSchema.safeParse("MyPage").success).toBe(false);
		expect(slugSchema.safeParse("COLE").success).toBe(false);
	});

	it("rejects special characters", () => {
		expect(slugSchema.safeParse("my_page").success).toBe(false);
		expect(slugSchema.safeParse("my page").success).toBe(false);
		expect(slugSchema.safeParse("my@page").success).toBe(false);
	});

	it("rejects slugs starting or ending with a hyphen", () => {
		expect(slugSchema.safeParse("-mypage").success).toBe(false);
		expect(slugSchema.safeParse("mypage-").success).toBe(false);
		expect(slugSchema.safeParse("-my-").success).toBe(false);
	});
});

describe("profileSchema", () => {
	it("accepts a valid profile", () => {
		const result = profileSchema.safeParse({
			displayName: "Cole",
			bio: "Hello world",
			avatarUrl: "https://example.com/avatar.png",
			theme: "minimal",
		});
		expect(result.success).toBe(true);
	});

	it("accepts empty displayName", () => {
		const result = profileSchema.safeParse({
			displayName: "",
			bio: "",
			avatarUrl: "",
			theme: "minimal",
		});
		expect(result.success).toBe(true);
	});

	it("rejects bio over 160 characters", () => {
		const result = profileSchema.safeParse({
			displayName: "Cole",
			bio: "x".repeat(161),
			avatarUrl: "",
			theme: "minimal",
		});
		expect(result.success).toBe(false);
	});

	it("accepts bio at exactly 160 characters", () => {
		const result = profileSchema.safeParse({
			displayName: "Cole",
			bio: "x".repeat(160),
			avatarUrl: "",
			theme: "minimal",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid avatar URL", () => {
		const result = profileSchema.safeParse({
			displayName: "Cole",
			bio: "",
			avatarUrl: "not-a-url",
			theme: "minimal",
		});
		expect(result.success).toBe(false);
	});

	it("accepts empty avatar URL", () => {
		const result = profileSchema.safeParse({
			displayName: "Cole",
			bio: "",
			avatarUrl: "",
			theme: "minimal",
		});
		expect(result.success).toBe(true);
	});

	it("rejects name over 50 characters", () => {
		const result = profileSchema.safeParse({
			displayName: "x".repeat(51),
			bio: "",
			avatarUrl: "",
			theme: "minimal",
		});
		expect(result.success).toBe(false);
	});
});

describe("linkItemSchema", () => {
	it("accepts a link with title and URL", () => {
		const result = linkItemSchema.safeParse({
			type: "link",
			title: "My Website",
			url: "https://example.com",
		});
		expect(result.success).toBe(true);
	});

	it("rejects a link without a URL", () => {
		const result = linkItemSchema.safeParse({
			type: "link",
			title: "My Website",
		});
		expect(result.success).toBe(false);
	});

	it("rejects a link without a title", () => {
		const result = linkItemSchema.safeParse({
			type: "link",
			url: "https://example.com",
		});
		expect(result.success).toBe(false);
	});

	it("accepts a header with title", () => {
		const result = linkItemSchema.safeParse({
			type: "header",
			title: "Social Media",
		});
		expect(result.success).toBe(true);
	});

	it("rejects a header without title", () => {
		const result = linkItemSchema.safeParse({
			type: "header",
		});
		expect(result.success).toBe(false);
	});

	it("accepts a divider with no fields", () => {
		const result = linkItemSchema.safeParse({
			type: "divider",
		});
		expect(result.success).toBe(true);
	});
});

describe("reorderSchema", () => {
	it("accepts a valid reorder array", () => {
		const result = reorderSchema.safeParse({
			items: [
				{ id: "550e8400-e29b-41d4-a716-446655440000", sortOrder: 0 },
				{ id: "550e8400-e29b-41d4-a716-446655440001", sortOrder: 1 },
			],
		});
		expect(result.success).toBe(true);
	});

	it("accepts an empty array", () => {
		const result = reorderSchema.safeParse({ items: [] });
		expect(result.success).toBe(true);
	});

	it("rejects missing id", () => {
		const result = reorderSchema.safeParse({
			items: [{ sortOrder: 0 }],
		});
		expect(result.success).toBe(false);
	});

	it("rejects negative sortOrder", () => {
		const result = reorderSchema.safeParse({
			items: [{ id: "550e8400-e29b-41d4-a716-446655440000", sortOrder: -1 }],
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-uuid id", () => {
		const result = reorderSchema.safeParse({
			items: [{ id: "not-a-uuid", sortOrder: 0 }],
		});
		expect(result.success).toBe(false);
	});
});
