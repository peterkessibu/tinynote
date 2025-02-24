import React, { useState } from "react";
import axios from "axios";
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
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAIAssistClick = async () => {
    if (!newNote.content.trim()) return;

    setIsAiLoading(true);

    try {
      console.log("AI Assist clicked");
      const response = await axios.post(
        "/api/chat",
        {
          input: newNote.content,
          title: currentNote.title,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = response.data;
      console.log("AI Response:", data);

      // Update the note content with the structured version
      if (data.structuredContent) {
        setNewNote({ ...newNote, content: data.structuredContent });
      }

      // Create a new updated note object
      const updatedNote = { ...currentNote };

      // Update tags based on AI response
      if (data.suggestedTags) {
        updatedNote.tags = data.suggestedTags;
      }

      // If there is no title, update with the AI-suggested title
      if (!currentNote.title.trim() && data.suggestedTitle) {
        updatedNote.title = data.suggestedTitle;
      }

      setCurrentNote(updatedNote);
    } catch (error) {
      console.error("AI Assist error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent
        className={`sm:max-w-[725px] transition-all duration-300 ${
          isAiLoading ? "blur-sm pointer-events-none" : ""
        }`}
      >
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
            onClick={handleAIAssistClick}
            disabled={!newNote.content.trim() || isAiLoading}
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
              disabled={!currentNote.title.trim() || !newNote.content.trim()}
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
