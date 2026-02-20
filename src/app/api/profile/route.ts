import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { linkItems, profiles } from "@/lib/db/schema";
import { apiRateLimiter } from "@/lib/rate-limit";
import { profileSchema, slugSchema } from "@/lib/validations";

async function getUser() {
	const { data } = await auth.getSession();
	return data?.user ?? null;
}

export async function GET(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = apiRateLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const user = await getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, user.id),
	});

	if (!profile) {
		return NextResponse.json({ profile: null, links: [] });
	}

	const links = await db.query.linkItems.findMany({
		where: eq(linkItems.profileId, profile.id),
		orderBy: [asc(linkItems.sortOrder)],
	});

	return NextResponse.json({ profile, links });
}

export async function POST(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = apiRateLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const user = await getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Check if profile already exists
	const existing = await db.query.profiles.findFirst({
		where: eq(profiles.userId, user.id),
	});
	if (existing) {
		return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
	}

	const body = await request.json();
	const slugResult = slugSchema.safeParse(body.slug);
	if (!slugResult.success) {
		return NextResponse.json({ error: slugResult.error.issues[0]?.message }, { status: 400 });
	}

	// Check slug uniqueness
	const slugTaken = await db.query.profiles.findFirst({
		where: eq(profiles.slug, body.slug),
	});
	if (slugTaken) {
		return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
	}

	const [profile] = await db
		.insert(profiles)
		.values({
			userId: user.id,
			slug: body.slug,
			displayName: body.displayName || "",
		})
		.returning();

	return NextResponse.json({ profile }, { status: 201 });
}

export async function PUT(request: NextRequest) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = apiRateLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const user = await getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const result = profileSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
	}

	const [updated] = await db
		.update(profiles)
		.set({
			displayName: result.data.displayName,
			bio: result.data.bio,
			avatarUrl: result.data.avatarUrl,
			theme: result.data.theme,
			updatedAt: new Date(),
		})
		.where(eq(profiles.userId, user.id))
		.returning();

	if (!updated) {
		return NextResponse.json({ error: "Profile not found" }, { status: 404 });
	}

	return NextResponse.json({ profile: updated });
}
