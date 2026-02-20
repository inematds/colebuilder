import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

export default neonAuthMiddleware({
	loginUrl: "/login",
});

export const config = {
	matcher: ["/editor/:path*", "/analytics/:path*", "/settings/:path*"],
};
