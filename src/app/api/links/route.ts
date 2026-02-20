import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { linkItems, profiles } from "@/lib/db/schema";
import { apiRateLimiter } from "@/lib/rate-limit";
import { linkItemSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
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
	const result = linkItemSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
	}

	// Get current max sortOrder
	const lastItem = await db.query.linkItems.findFirst({
		where: eq(linkItems.profileId, profile.id),
		orderBy: [desc(linkItems.sortOrder)],
	});
	const nextOrder = (lastItem?.sortOrder ?? -1) + 1;

	const [newLink] = await db
		.insert(linkItems)
		.values({
			profileId: profile.id,
			type: result.data.type,
			title: result.data.title ?? "",
			url: result.data.url ?? "",
			sortOrder: nextOrder,
		})
		.returning();

	return NextResponse.json({ link: newLink }, { status: 201 });
}
