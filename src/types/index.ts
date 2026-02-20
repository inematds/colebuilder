import type { InferSelectModel } from "drizzle-orm";
import type { clickEvents, linkItems, profiles } from "@/lib/db/schema";

export type Profile = InferSelectModel<typeof profiles>;
export type LinkItem = InferSelectModel<typeof linkItems>;
export type ClickEvent = InferSelectModel<typeof clickEvents>;

export type LinkItemType = "link" | "header" | "divider";

export type Theme = "minimal" | "dark" | "colorful" | "professional";

// API response types
export interface ProfileWithLinks {
	profile: Profile;
	links: LinkItem[];
}

// Editor state (client-side)
export interface EditorState {
	displayName: string;
	bio: string;
	avatarUrl: string;
	theme: Theme;
	links: LinkItem[];
	isDirty: boolean;
	isSaving: boolean;
}

// Theme component props
export interface ThemeProps {
	displayName: string;
	bio: string;
	avatarUrl: string;
	links: Array<{
		id: string;
		type: "link" | "header" | "divider";
		title: string;
		url: string;
	}>;
	isPreview?: boolean;
}
