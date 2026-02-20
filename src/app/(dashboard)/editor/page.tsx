"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddLinkButton } from "@/components/editor/add-link-button";
import { EditorToolbar, type LayoutMode } from "@/components/editor/editor-toolbar";
import { LinkList } from "@/components/editor/link-list";
import { ProfileForm } from "@/components/editor/profile-form";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/use-profile";
import type { LinkItem } from "@/types";

export default function EditorPage() {
	const { profile, links: serverLinks, isLoading, error, refetch } = useProfile();

	// Local editor state
	const [displayName, setDisplayName] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [links, setLinks] = useState<LinkItem[]>([]);
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [layoutMode, setLayoutMode] = useState<LayoutMode>("both");

	// Track items added/deleted locally (not yet persisted)
	const addedLinksRef = useRef<LinkItem[]>([]);
	const deletedIdsRef = useRef<Set<string>>(new Set());
	const initializedRef = useRef(false);

	// Initialize local state from server data
	useEffect(() => {
		if (profile && !initializedRef.current) {
			setDisplayName(profile.displayName);
			setBio(profile.bio);
			setAvatarUrl(profile.avatarUrl);
			setLinks(serverLinks);
			initializedRef.current = true;
		}
	}, [profile, serverLinks]);

	const markDirty = useCallback(() => setIsDirty(true), []);

	const handleDisplayNameChange = (value: string) => {
		setDisplayName(value);
		markDirty();
	};

	const handleBioChange = (value: string) => {
		setBio(value);
		markDirty();
	};

	const handleAvatarUrlChange = (value: string) => {
		setAvatarUrl(value);
		markDirty();
	};

	const handleReorder = (reordered: LinkItem[]) => {
		setLinks(reordered);
		markDirty();
	};

	const handleDeleteLink = (id: string) => {
		// Check if it was a newly added item (not yet in DB)
		const wasAdded = addedLinksRef.current.some((l) => l.id === id);
		if (wasAdded) {
			addedLinksRef.current = addedLinksRef.current.filter((l) => l.id !== id);
		} else {
			deletedIdsRef.current.add(id);
		}
		setLinks((prev) => prev.filter((l) => l.id !== id));
		markDirty();
	};

	const handleAddLink = (title: string, url: string) => {
		const tempId = crypto.randomUUID();
		const newLink: LinkItem = {
			id: tempId,
			profileId: profile?.id ?? "",
			type: "link",
			title,
			url,
			sortOrder: links.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		addedLinksRef.current.push(newLink);
		setLinks((prev) => [...prev, newLink]);
		markDirty();
	};

	const handleAddHeader = (title: string) => {
		const tempId = crypto.randomUUID();
		const newHeader: LinkItem = {
			id: tempId,
			profileId: profile?.id ?? "",
			type: "header",
			title,
			url: "",
			sortOrder: links.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		addedLinksRef.current.push(newHeader);
		setLinks((prev) => [...prev, newHeader]);
		markDirty();
	};

	const handleAddDivider = () => {
		const tempId = crypto.randomUUID();
		const newDivider: LinkItem = {
			id: tempId,
			profileId: profile?.id ?? "",
			type: "divider",
			title: "",
			url: "",
			sortOrder: links.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		addedLinksRef.current.push(newDivider);
		setLinks((prev) => [...prev, newDivider]);
		markDirty();
	};

	const handleSave = async () => {
		if (!profile || isSaving) return;
		setIsSaving(true);

		try {
			// 1. Update profile
			const profileRes = await fetch("/api/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					displayName,
					bio,
					avatarUrl,
					theme: profile.theme,
				}),
			});
			if (!profileRes.ok) throw new Error("Failed to update profile");

			// 2. Delete removed items
			for (const id of deletedIdsRef.current) {
				await fetch(`/api/links/${id}`, { method: "DELETE" });
			}

			// 3. Add new items
			const newIdMap = new Map<string, string>();
			for (const item of addedLinksRef.current) {
				const res = await fetch("/api/links", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						type: item.type,
						title: item.title || undefined,
						url: item.url || undefined,
					}),
				});
				if (res.ok) {
					const data = await res.json();
					newIdMap.set(item.id, data.link.id);
				}
			}

			// 4. Reorder all items (using server IDs)
			const reorderItems = links
				.filter((l) => !deletedIdsRef.current.has(l.id))
				.map((l, index) => ({
					id: newIdMap.get(l.id) ?? l.id,
					sortOrder: index,
				}));

			if (reorderItems.length > 0) {
				await fetch("/api/links/reorder", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ items: reorderItems }),
				});
			}

			// Reset tracking
			addedLinksRef.current = [];
			deletedIdsRef.current.clear();

			// Refetch to get server state
			initializedRef.current = false;
			await refetch();
			setIsDirty(false);
			toast.success("Changes saved successfully!");
		} catch {
			toast.error("Failed to save changes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<p className="text-destructive">{error}</p>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<p className="text-muted-foreground">No profile found. Please complete signup first.</p>
			</div>
		);
	}

	const previewLinks = links.map((l) => ({
		id: l.id,
		type: l.type as "link" | "header" | "divider",
		title: l.title,
		url: l.url,
	}));

	const editorPanel = (
		<div className="flex flex-col gap-6 p-6">
			<ProfileForm
				displayName={displayName}
				bio={bio}
				avatarUrl={avatarUrl}
				onDisplayNameChange={handleDisplayNameChange}
				onBioChange={handleBioChange}
				onAvatarUrlChange={handleAvatarUrlChange}
			/>

			<Separator />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Links</h2>
				<LinkList links={links} onReorder={handleReorder} onDelete={handleDeleteLink} />
				<AddLinkButton
					onAddLink={handleAddLink}
					onAddHeader={handleAddHeader}
					onAddDivider={handleAddDivider}
				/>
			</div>

			<Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full">
				{isSaving ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Saving...
					</>
				) : (
					"Save"
				)}
			</Button>
		</div>
	);

	const previewPanel = (
		<div className="flex items-start justify-center p-6">
			<PreviewPanel
				displayName={displayName}
				bio={bio}
				avatarUrl={avatarUrl}
				links={previewLinks}
			/>
		</div>
	);

	return (
		<div className="mx-auto max-w-7xl">
			{/* Toolbar */}
			<div className="flex items-center justify-between border-b px-6 py-3">
				<h1 className="text-lg font-semibold">Editor</h1>
				<EditorToolbar mode={layoutMode} onModeChange={setLayoutMode} />
			</div>

			{/* Desktop layout */}
			<div className="hidden lg:block">
				<div className="grid grid-cols-2 divide-x min-h-[calc(100vh-8rem)]">
					{(layoutMode === "both" || layoutMode === "editor") && (
						<div className={`overflow-y-auto ${layoutMode === "editor" ? "col-span-2" : ""}`}>
							{editorPanel}
						</div>
					)}
					{(layoutMode === "both" || layoutMode === "preview") && (
						<div
							className={`overflow-y-auto bg-muted/30 ${layoutMode === "preview" ? "col-span-2" : ""}`}
						>
							{previewPanel}
						</div>
					)}
				</div>
			</div>

			{/* Mobile layout */}
			<div className="lg:hidden">
				<Tabs defaultValue="edit" className="w-full">
					<TabsList className="w-full">
						<TabsTrigger value="edit" className="flex-1">
							Edit
						</TabsTrigger>
						<TabsTrigger value="preview" className="flex-1">
							Preview
						</TabsTrigger>
					</TabsList>
					<TabsContent value="edit">{editorPanel}</TabsContent>
					<TabsContent value="preview">{previewPanel}</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
