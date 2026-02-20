import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { linkItems, profiles } from "@/lib/db/schema";
import { apiRateLimiter } from "@/lib/rate-limit";
import { reorderSchema } from "@/lib/validations";

export async function PUT(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = apiRateLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const { data } = await auth.getSession();
	if (!data?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, data.user.id),
	});
	if (!profile) {
		return NextResponse.json({ error: "Profile not found" }, { status: 404 });
	}

	const body = await request.json();
	const result = reorderSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
	}

	// Update each item's sort order with ownership check
	for (const item of result.data.items) {
		await db
			.update(linkItems)
			.set({ sortOrder: item.sortOrder, updatedAt: new Date() })
			.where(and(eq(linkItems.id, item.id), eq(linkItems.profileId, profile.id)));
	}

	return NextResponse.json({ success: true });
}
