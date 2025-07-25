import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NoteViewModal from "@/components/Notes/NoteViewModal";
import ReminderModal from "@/components/Notes/ReminderModal";
import ReactMarkdown from "react-markdown";
import { Toaster, toast } from "sonner";

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
  onDelete?: (noteId: string) => void;
};

// Function to get a color based on string hash
const getColorFromString = (str: string, colorList: string[]): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return colorList[Math.abs(hash) % colorList.length];
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

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  formatDate,
  onEdit,
  onDelete,
}) => {
  const [borderColor, setBorderColor] = useState("");
  const [tagColors, setTagColors] = useState<Record<string, string>>({});
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  useEffect(() => {
    // Get consistent border color based on note ID
    setBorderColor(getColorFromString(note.id, borderColors));

    // Get consistent colors for tags
    const newTagColors: Record<string, string> = {};
    note.tags.forEach((tag) => {
      newTagColors[tag] = getColorFromString(tag, colors);
    });
    setTagColors(newTagColors);
  }, [note.id, note.tags]);

  // Handle delete confirmation
  const handleDeleteClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent card click from triggering
    toast.error(note.title, {
      description: "Your note has been deleted",
    });
    e.stopPropagation();

    if (onDelete) {
      onDelete(note.id);
    }
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent card click from triggering
    e.stopPropagation();

    onEdit(note);
  };

  // Handle entire card click
  const handleCardClick = () => {
    setIsViewModalOpen(true);
  };

  // Handle reminder button click
  const handleReminderClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent card click from triggering
    e.stopPropagation();
    setIsReminderModalOpen(true);
  };

  return (
    <>
      <Card
        key={note.id}
        className={`flex h-full flex-col border-2 bg-[#0a1b38] transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${borderColor} group relative cursor-pointer`}
        onClick={handleCardClick}
      >
        {/* Edit, reminder, and delete buttons */}
        <div className="absolute right-2 top-2 z-20 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-yellow-500"
            onClick={handleReminderClick}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-red-500"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardHeader className="z-10 mt-5 w-full">
          <CardTitle>{note.title}</CardTitle>
          <CardDescription aria-label="Note created date">
            Created {formatDate(note.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col">
          {/* Content section */}
          <div className="flex-grow">
            <div className="prose-sm mb-3 line-clamp-3 text-sm text-gray-200 text-muted-foreground">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          </div>
          {/* Tags section */}
          <div className="mt-auto flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={`${tagColors[tag]} rounded-full px-2`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <Toaster position="bottom-right" richColors />
      </Card>

      {/* Expanded View Modal */}
      <NoteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        note={note}
        borderColor={borderColor}
        tagColors={tagColors}
        formatDate={formatDate}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        note={note}
      />
    </>
  );
};

export default NoteCard;
