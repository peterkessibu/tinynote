"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  PlusCircle,
  Pencil,
  TagIcon,
  Bold,
  Italic,
  List,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toggle } from "@/components/ui/toggle";

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
};

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="mb-2 flex gap-2">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

export default function NotesApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Shopping List",
      content:
        "<ul><li>Milk</li><li>Eggs</li><li>Bread</li><li>Fruits</li><li>Vegetables</li></ul>",
      tags: ["shopping", "groceries"],
      createdAt: new Date("2024-02-22"),
    },
    {
      id: "2",
      title: "Project Ideas",
      content:
        "<p>Build a <strong>personal website</strong> with Next.js and Tailwind CSS. Add a blog section and portfolio showcase.</p>",
      tags: ["coding", "projects"],
      createdAt: new Date("2024-02-19"),
    },
    {
      id: "3",
      title: "Meeting Notes",
      content:
        "<p><em>Team sync discussion</em> about Q1 goals and upcoming product launches. Follow up with design team about new mockups.</p>",
      tags: ["work", "meetings"],
      createdAt: new Date("2024-02-17"),
    },
  ]);
  const [currentNote, setCurrentNote] = useState({
    id: "",
    title: "",
    content: "",
    tags: "",
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: currentNote.content,
    onUpdate: ({ editor }) => {
      setCurrentNote((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  const handleCreateNote = () => {
    const note: Note = {
      id: Date.now().toString(),
      title: currentNote.title,
      content: currentNote.content,
      tags: currentNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: new Date(),
    };

    setNotes((prev) => [note, ...prev]);
    handleCloseModal();
  };

  const handleEditNote = () => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === currentNote.id
          ? {
              ...note,
              title: currentNote.title,
              content: currentNote.content,
              tags: currentNote.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            }
          : note,
      ),
    );
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentNote({ id: "", title: "", content: "", tags: "" });
    editor?.commands.setContent("");
  };

  const handleOpenEditModal = (note: Note) => {
    setCurrentNote({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
    editor?.commands.setContent(note.content);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAIAssist = async () => {
    // This is a placeholder for AI functionality
    const aiContent = `<p>Here's a suggested outline:</p>
<ul>
<li><strong>Introduction</strong></li>
<li><strong>Key Points</strong></li>
<li><strong>Action Items</strong></li>
</ul>
<p>Feel free to modify this structure!</p>`;

    editor?.commands.setContent(aiContent);
    setCurrentNote((prev) => ({ ...prev, content: aiContent }));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <Button
          className="gap-2"
          onClick={() => {
            setIsEditing(false);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="group transition-shadow hover:shadow-lg"
          >
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleOpenEditModal(note)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit note</span>
              </Button>
              <CardTitle>{note.title}</CardTitle>
              <CardDescription>
                Created {formatDate(note.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="prose-sm mb-3 line-clamp-3 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  setCurrentNote((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <div className="rounded-md border p-2">
                <MenuBar editor={editor} />
                <EditorContent
                  editor={editor}
                  className="prose prose-sm min-h-[150px] max-w-none"
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
                  setCurrentNote((prev) => ({ ...prev, tags: e.target.value }))
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
    </div>
  );
}
