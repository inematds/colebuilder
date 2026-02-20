"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Link as LinkIcon, Minus, Trash2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkItemProps {
	id: string;
	type: "link" | "header" | "divider";
	title: string;
	url: string;
	onDelete: (id: string) => void;
}

export function LinkItemCard({ id, type, title, url, onDelete }: LinkItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-2 rounded-lg border bg-card p-3"
		>
			<button
				type="button"
				className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
				aria-label="Drag handle"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="h-4 w-4" />
			</button>

			<div className="flex-1 min-w-0">
				{type === "link" && (
					<div className="flex items-center gap-2">
						<LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
						<div className="min-w-0">
							<p className="text-sm font-medium truncate">{title}</p>
							<p className="text-xs text-muted-foreground truncate">{url}</p>
						</div>
					</div>
				)}
				{type === "header" && (
					<div className="flex items-center gap-2">
						<Type className="h-4 w-4 shrink-0 text-muted-foreground" />
						<p className="text-sm font-semibold">{title}</p>
					</div>
				)}
				{type === "divider" && (
					<div className="flex items-center gap-2">
						<Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
						<div className="flex-1 border-t" />
					</div>
				)}
			</div>

			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
				onClick={() => onDelete(id)}
				aria-label="Delete"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
