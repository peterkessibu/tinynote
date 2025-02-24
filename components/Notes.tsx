"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NoteList from "@/components/NoteList";
import NoteModal, { NoteForm } from "@/components/NoteModal";
import { Note } from "@/components/NoteCard";
import Header from "@/components/Header";

export default function NotesApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Shopping List",
      content: "MilkEggsBreadFruitsVegetables",
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

  const [currentNote, setCurrentNote] = useState<NoteForm>({
    id: "",
    title: "",
    content: "",
    tags: "",
  });
  const [newNote, setNewNote] = useState<NoteForm>({
    title: "",
    content: "",
    tags: "",
  });

  const handleCreateNote = () => {
    const note: Note = {
      id: Date.now().toString(),
      title: currentNote.title,
      content: currentNote.content,
      tags: currentNote.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean),
      createdAt: new Date(),
    };

    setNotes((prev) => [note, ...prev]);
    handleCloseModal();
    setNewNote({ title: "", content: "", tags: "" });
    setIsModalOpen(false);
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
                .map((tag: string) => tag.trim())
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
  };

  const handleOpenEditModal = (note: Note) => {
    setCurrentNote({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
    setIsEditing(true);
    setIsModalOpen(true);
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
    <div className="relative mx-auto p-4 flex flex-col space-y-4">
      <Header />{" "}
      <div className="mx-8">
        <div className="flex items-center justify-between my-4">
          <h1 className="text-2xl font-bold">My Notes</h1>
          <Button
            className="gap-2 bg-blue-700 hover:scale-[1.02] hover:bg-blue-800 active:border"
            onClick={() => {
              setIsEditing(false);
              setIsModalOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        <NoteList
          notes={notes}
          formatDate={formatDate}
          handleOpenEditModal={handleOpenEditModal}
        />

        <NoteModal
          isModalOpen={isModalOpen}
          isEditing={isEditing}
          currentNote={currentNote}
          newNote={newNote}
          setIsModalOpen={setIsModalOpen}
          setCurrentNote={setCurrentNote}
          setNewNote={setNewNote}
          handleCreateNote={handleCreateNote}
          handleEditNote={handleEditNote}
          handleCloseModal={handleCloseModal}
        />
      </div>
    </div>
  );
}
