"use client";

import { Link, Minus, Type } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddLinkButtonProps {
	onAddLink: (title: string, url: string) => void;
	onAddHeader: (title: string) => void;
	onAddDivider: () => void;
}

export function AddLinkButton({ onAddLink, onAddHeader, onAddDivider }: AddLinkButtonProps) {
	const [linkOpen, setLinkOpen] = useState(false);
	const [headerOpen, setHeaderOpen] = useState(false);
	const [linkTitle, setLinkTitle] = useState("");
	const [linkUrl, setLinkUrl] = useState("");
	const [headerTitle, setHeaderTitle] = useState("");

	const handleAddLink = () => {
		if (linkTitle.trim() && linkUrl.trim()) {
			onAddLink(linkTitle.trim(), linkUrl.trim());
			setLinkTitle("");
			setLinkUrl("");
			setLinkOpen(false);
		}
	};

	const handleAddHeader = () => {
		if (headerTitle.trim()) {
			onAddHeader(headerTitle.trim());
			setHeaderTitle("");
			setHeaderOpen(false);
		}
	};

	return (
		<div className="flex gap-2">
			<Dialog open={linkOpen} onOpenChange={setLinkOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						<Link className="mr-2 h-4 w-4" />
						Add Link
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Link</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="link-title">Title</Label>
							<Input
								id="link-title"
								value={linkTitle}
								onChange={(e) => setLinkTitle(e.target.value)}
								placeholder="My Website"
								aria-label="Title"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="link-url">URL</Label>
							<Input
								id="link-url"
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
								placeholder="https://example.com"
								aria-label="URL"
							/>
						</div>
						<Button onClick={handleAddLink} className="w-full">
							Add
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={headerOpen} onOpenChange={setHeaderOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						<Type className="mr-2 h-4 w-4" />
						Add Header
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Header</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="header-title">Header</Label>
							<Input
								id="header-title"
								value={headerTitle}
								onChange={(e) => setHeaderTitle(e.target.value)}
								placeholder="Section Title"
								aria-label="Header"
							/>
						</div>
						<Button onClick={handleAddHeader} className="w-full">
							Add
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Button variant="outline" size="sm" onClick={onAddDivider}>
				<Minus className="mr-2 h-4 w-4" />
				Add Divider
			</Button>
		</div>
	);
}
