import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Bell } from "lucide-react";
import { Note } from "./NoteCard";
import ReminderModal from "./ReminderModal";
import ReactMarkdown from "react-markdown";

type NoteViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  borderColor: string;
  tagColors: Record<string, string>;
  formatDate: (date: Date) => string;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
};

const NoteViewModal: React.FC<NoteViewModalProps> = ({
  isOpen,
  onClose,
  note,
  borderColor,
  tagColors,
  formatDate,
  onEdit,
  onDelete,
}) => {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  const handleReminderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReminderModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          aria-label="Note content"
          className={`max-h-[50vh] items-center justify-center overflow-auto border-2 bg-[#0a1b38] md:max-h-[80vh] ${borderColor}`}
        >
          <div className="absolute right-6 top-8 mr-4 flex">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-400"
              onClick={onEdit}
            >
              <Pencil className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-yellow-500"
              onClick={handleReminderClick}
            >
              <Bell className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-red-500"
              onClick={onDelete}
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
          <DialogHeader className="z-10 w-full pt-12">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-wrap text-xl font-bold">
                {note.title}
              </DialogTitle>
            </div>
            <p className="text-sm italic text-gray-400">
              Created {formatDate(note.createdAt)}
            </p>
          </DialogHeader>

          <div className="p-6">
            <div className="prose prose-invert mb-4 flex-grow whitespace-pre-wrap text-gray-200">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>

            {/* Tags section */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        note={note}
      />
    </>
  );
};

export default NoteViewModal;
