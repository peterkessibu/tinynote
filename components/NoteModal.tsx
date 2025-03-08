import React, { useState, useEffect } from "react";
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
  const [plainContent, setPlainContent] = useState("");

  const stripMarkdown = (markdown: string): string => {
    if (!markdown) return "";

    return markdown
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italics
      .replace(/~~(.*?)~~/g, "$1") // Remove strikethrough
      .replace(/`(.*?)`/g, "$1") // Remove inline code
      .replace(/```(?:.*?)\n([\s\S]*?)```/g, "$1") // Remove code blocks
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Remove links
      .replace(/^\s*[-*+]\s+/gm, "") // Remove unordered list markers
      .replace(/^\s*\d+\.\s+/gm, "") // Remove ordered list markers
      .replace(/^\s*>\s+/gm, "") // Remove blockquotes
      .replace(/\n{3,}/g, "\n\n"); // Replace multiple newlines with just two
  };

  useEffect(() => {
    setPlainContent(stripMarkdown(newNote.content));
  }, [newNote.content]);

  const handlePlainTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlainContent(e.target.value);
    // Also update the original markdown content
    setNewNote({ ...newNote, content: e.target.value });
  };

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
          tags: currentNote.tags,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = response.data;
      console.log("AI Response:", data);

      // Always update the note content with the structured version
      if (data.structuredContent) {
        setNewNote({ ...newNote, content: data.structuredContent });
        setPlainContent(stripMarkdown(data.structuredContent));
      }

      // Create a new updated note object
      const updatedNote = { ...currentNote };

      // Update title if empty or if AI suggests it should be updated
      if (
        (!currentNote.title.trim() || data.shouldUpdateTitle) &&
        data.suggestedTitle
      ) {
        updatedNote.title = data.suggestedTitle;
      }

      // Update tags if empty or if AI suggests they should be updated
      if (
        (!currentNote.tags.trim() || data.shouldUpdateTags) &&
        data.suggestedTags
      ) {
        updatedNote.tags = data.suggestedTags;
      }

      // Apply all changes directly without notification
      setCurrentNote(updatedNote);
    } catch (error) {
      console.error("AI Assist error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="transition-all duration-300 sm:max-w-[725px]">
        {isAiLoading && (
          <>
            <div className="pointer-events-none absolute inset-0 z-10 bg-background/50 backdrop-blur-sm"></div>
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 size-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-lg font-medium text-white">
                  AI is refining note...
                </p>
              </div>
            </div>
          </>
        )}
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
            <div>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                className="min-h-[150px]"
                value={plainContent}
                onChange={handlePlainTextChange}
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
        <DialogFooter className="flex w-full flex-row items-center justify-between">
          <div className="flex w-full items-center justify-between">
            <Button
              size="lg"
              onClick={handleAIAssistClick}
              disabled={!newNote.content.trim() || isAiLoading}
              className="gap-2 rounded-full bg-gradient-to-tr from-blue-700 via-purple-700 to-pink-700 p-4 text-xs text-white md:rounded-none md:px-4 md:py-2"
            >
              <Sparkles className="size-6" />
              <span className="text-sm md:text-base">AI Assist</span>
            </Button>

            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                onClick={isEditing ? handleEditNote : handleCreateNote}
                disabled={!currentNote.title.trim() || !newNote.content.trim()}
                className="text-white"
              >
                {isEditing ? "Save Changes" : "Create Note"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
