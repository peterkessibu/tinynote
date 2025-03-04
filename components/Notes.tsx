"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NoteList from "@/components/NoteList";
import NoteModal, { NoteForm } from "@/components/NoteModal";
import { Note } from "@/components/NoteCard";
import { db } from "@/app/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";

export default function NotesApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [, setIsProcessing] = useState(false);

  const auth = getAuth();

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

  const handleCreateNote = async () => {
    if (!auth.currentUser) {
      toast.error("Authentication required", {
        description: "Please sign in to create notes",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Format tags from comma-separated string to array
      const formattedTags = currentNote.title
        ? currentNote.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];

      // Add document to the user's notes collection
      await addDoc(collection(db, `users/${auth.currentUser.uid}/notes`), {
        title: currentNote.title || "Untitled Note",
        content: currentNote.content,
        tags: formattedTags,
        createdAt: serverTimestamp(),
      });

      toast.success("Note created", {
        description: "Your note has been saved to the database",
      });

      handleCloseModal();
      setNewNote({ title: "", content: "", tags: "" });
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Error creating note", {
        description: "There was a problem saving your note",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditNote = async () => {
    if (!auth.currentUser || !currentNote.id) {
      toast.error("Error updating note", {
        description: "Authentication required or invalid note ID",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Format tags from comma-separated string to array
      const formattedTags = currentNote.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean);

      // Update the document in Firestore
      const noteRef = doc(
        db,
        `users/${auth.currentUser.uid}/notes/${currentNote.id}`,
      );

      await updateDoc(noteRef, {
        title: currentNote.title || "Untitled Note",
        content: currentNote.content,
        tags: formattedTags,
        // Don't update createdAt to preserve original creation time
      });

      toast.success("Note updated", {
        description: "Your changes have been saved",
      });

      handleCloseModal();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Error updating note", {
        description: "There was a problem saving your changes",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!auth.currentUser) {
      toast.error("Note Deleted", {
        description: "Note has been successfully deleted",
      });
      return;
    }

    try {
      // Delete the document from Firestore
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/notes/${noteId}`));

      toast.success("Note deleted", {
        description: "Your note has been successfully removed",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast("Error deleting note", {
        description: "There was a problem deleting your note",
      });
    }
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

  const handleNewNoteClick = () => {
    setIsEditing(false);
    setCurrentNote({ id: "", title: "", content: "", tags: "" });
    setIsModalOpen(true);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days > 0 && days < 31) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative mx-auto flex flex-col space-y-4 p-4">
      <div className="mx-8">
        <div className="my-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Notes</h1>
          {currentNote.title.length > 0 && (
            <Button
              className="gap-2 rounded-xl bg-blue-700 px-4 py-2 text-white hover:scale-[1.02] hover:bg-blue-800 active:border"
              onClick={handleNewNoteClick}
            >
              <PlusCircle className="h-4 w-4" />
              Add Note
            </Button>
          )}
        </div>

        <NoteList
          formatDate={formatDate}
          handleOpenEditModal={handleOpenEditModal}
          handleNewNoteClick={handleNewNoteClick}
          handleDeleteNote={handleDeleteNote}
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
