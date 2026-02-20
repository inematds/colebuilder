import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { linkItems, profiles } from "@/lib/db/schema";
import { apiRateLimiter } from "@/lib/rate-limit";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
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

	const { id } = await params;

	// Ownership check: ensure the link belongs to this profile
	const [deleted] = await db
		.delete(linkItems)
		.where(and(eq(linkItems.id, id), eq(linkItems.profileId, profile.id)))
		.returning();

	if (!deleted) {
		return NextResponse.json({ error: "Link not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
