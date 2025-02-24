import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
};

type NoteCardProps = {
  note: Note;
  formatDate: (date: Date) => string;
  onEdit: (note: Note) => void;
};

// Predefined color lists
const colors = [
  "bg-red-500 text-white",
  "bg-green-500 text-white",
  "bg-blue-500 text-white",
  "bg-yellow-500 text-black",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
  "bg-indigo-500 text-white",
  "bg-teal-500 text-white",
  "bg-orange-500 text-white",
];

const borderColors = [
  "border-red-500",
  "border-green-500",
  "border-blue-500",
  "border-yellow-500",
  "border-purple-500",
  "border-pink-500",
  "border-indigo-500",
  "border-teal-500",
  "border-orange-500",
];

// Function to get a color based on note id
const getPersistentColor = (id: string, list: string[]) => {
  const storedColors = JSON.parse(localStorage.getItem("noteColors") || "{}");

  if (storedColors[id]) return storedColors[id];

  const newColor = list[Math.floor(Math.random() * list.length)];
  storedColors[id] = newColor;

  localStorage.setItem("noteColors", JSON.stringify(storedColors));
  return newColor;
};

const NoteCard: React.FC<NoteCardProps> = ({ note, formatDate, onEdit }) => {
  const [borderColor, setBorderColor] = useState("");
  const [tagColors, setTagColors] = useState<Record<string, string>>({});

  useEffect(() => {
    setBorderColor(getPersistentColor(note.id, borderColors));

    // Generate persistent colors for each tag
    const storedTagColors = JSON.parse(
      localStorage.getItem("tagColors") || "{}"
    );
    if (!storedTagColors[note.id]) {
      storedTagColors[note.id] = {};
      note.tags.forEach((tag) => {
        storedTagColors[note.id][tag] = getPersistentColor(tag, colors);
      });
      localStorage.setItem("tagColors", JSON.stringify(storedTagColors));
    }

    setTagColors(storedTagColors[note.id]);
  }, [note.id, note.tags]);

  return (
    <Card
      key={note.id}
      className={`hover:shadow-lg group flex flex-col h-full border-2 hover:scale-[1.03] transition-all duration-300 ${borderColor}`}
    >
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(note)}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit note</span>
        </Button>
        <CardTitle>{note.title}</CardTitle>
        <CardDescription>Created {formatDate(note.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        {/* Content section */}
        <div className="flex-grow">
          <div
            className="text-sm text-muted-foreground line-clamp-3 mb-3 prose-sm"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
        {/* Tags section */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className={tagColors[tag]}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
