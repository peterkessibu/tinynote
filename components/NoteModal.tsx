import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type NoteForm = {
  id?: string;
  title: string;
  content: string;
  tags: string;
};

type NoteModalProps = {
  isModalOpen: boolean;
  isEditing: boolean;
  currentNote: NoteForm;
  newNote: NoteForm;
  setIsModalOpen: (open: boolean) => void;
  setCurrentNote: (note: NoteForm) => void;
  setNewNote: (note: NoteForm) => void;
  handleCreateNote: () => void;
  handleEditNote: () => void;
  handleCloseModal: () => void;
  handleAIAssist: () => Promise<void>;
};

const NoteModal: React.FC<NoteModalProps> = ({
  isModalOpen,
  isEditing,
  currentNote,
  newNote,
  setIsModalOpen,
  setCurrentNote,
  setNewNote,
  handleCreateNote,
  handleEditNote,
  handleCloseModal,
  handleAIAssist,
}) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Note" : "Create New Note"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit your note details below."
              : "Add a new note with a title, content, and optional tags."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Note title"
              value={currentNote.title}
              onChange={(e) =>
                setCurrentNote({ ...currentNote, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <div className="border rounded-md p-2">
              <Textarea
                id="content"
                placeholder="Write your note here..."
                className="min-h-[150px]"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              placeholder="work, ideas, todo"
              value={currentNote.tags}
              onChange={(e) =>
                setCurrentNote({ ...currentNote, tags: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="secondary"
            onClick={handleAIAssist}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Assist
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleEditNote : handleCreateNote}
              disabled={
                !currentNote.title.trim() || !currentNote.content.trim()
              }
            >
              {isEditing ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
