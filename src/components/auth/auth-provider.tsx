"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	return (
		<NeonAuthUIProvider
			// @ts-expect-error -- beta package type mismatch between internal better-auth versions
			authClient={authClient}
			navigate={router.push}
			replace={router.replace}
			onSessionChange={() => router.refresh()}
			Link={Link}
			social={{ providers: ["google"] }}
		>
			{children}
		</NeonAuthUIProvider>
	);
}
