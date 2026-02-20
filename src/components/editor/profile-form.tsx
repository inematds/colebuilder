"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormProps {
	displayName: string;
	bio: string;
	avatarUrl: string;
	onDisplayNameChange: (value: string) => void;
	onBioChange: (value: string) => void;
	onAvatarUrlChange: (value: string) => void;
}

export function ProfileForm({
	displayName,
	bio,
	avatarUrl,
	onDisplayNameChange,
	onBioChange,
	onAvatarUrlChange,
}: ProfileFormProps) {
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="displayName">Display Name</Label>
				<Input
					id="displayName"
					value={displayName}
					onChange={(e) => onDisplayNameChange(e.target.value)}
					maxLength={50}
					placeholder="Your name"
					aria-label="Display Name"
				/>
				<p className="text-xs text-muted-foreground text-right">{displayName.length}/50</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="bio">Bio</Label>
				<Textarea
					id="bio"
					value={bio}
					onChange={(e) => onBioChange(e.target.value)}
					maxLength={160}
					placeholder="Tell the world about yourself"
					rows={3}
					aria-label="Bio"
				/>
				<p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="avatarUrl">Avatar URL</Label>
				<div className="flex items-center gap-3">
					<Avatar className="h-10 w-10">
						<AvatarImage src={avatarUrl} alt="Avatar preview" />
						<AvatarFallback>{displayName?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
					</Avatar>
					<Input
						id="avatarUrl"
						value={avatarUrl}
						onChange={(e) => onAvatarUrlChange(e.target.value)}
						placeholder="https://example.com/avatar.png"
						aria-label="Avatar URL"
					/>
				</div>
			</div>
		</div>
	);
}
