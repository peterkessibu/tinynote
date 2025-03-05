import { useEffect, useState, useCallback, useRef } from "react";
import NoteCard, { Note } from "@/components/NoteCard";
import { db } from "@/app/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  onSnapshot,
  FirestoreError,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type NoteListProps = {
  formatDate: (date: Date) => string;
  handleOpenEditModal: (note: Note) => void;
  handleNewNoteClick: () => void;
  handleDeleteNote: (noteId: string) => void;
};

const NOTES_PER_PAGE = 6;

const NoteList: React.FC<NoteListProps> = ({
  formatDate,
  handleOpenEditModal,
  handleDeleteNote,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null,
  );
  const [hasMore, setHasMore] = useState(true);
  const auth = getAuth();
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);

  // Memoized function to transform database documents to Note objects
  const transformDocsToNotes = useCallback((docs: QueryDocumentSnapshot[]) => {
    return docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      // Ensure tags is always an array
      tags: doc.data().tags || [],
    })) as Note[];
  }, []);

  // Optimized initial fetch to prevent unnecessary rerenders
  useEffect(() => {
    const fetchNotes = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Clean up any existing listeners before setting new ones
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }

        // Create a query with proper ordering and indexing for optimal performance
        const notesRef = collection(db, `users/${user.uid}/notes`);

        // Set up real-time listener with optimized query for initial data
        const notesQuery = query(
          notesRef,
          orderBy("createdAt", "desc"),
          limit(NOTES_PER_PAGE),
        );

        // Use a snapshot listener for real-time updates
        const unsubscribe = onSnapshot(
          notesQuery,
          (snapshot) => {
            if (snapshot.empty) {
              setNotes([]);
              setHasMore(false);
            } else {
              // Process the data with the memoized transform function
              const fetchedNotes = transformDocsToNotes(snapshot.docs);

              setNotes(fetchedNotes);
              setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
              setHasMore(snapshot.docs.length >= NOTES_PER_PAGE);
            }
            setLoading(false);
          },
          (error: FirestoreError) => {
            console.error("Notes listener error:", error);
            setLoading(false);
          },
        );

        // Store unsubscribe function in ref for cleanup
        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error("Error setting up notes listener:", error);
        setLoading(false);
      }
    };

    fetchNotes();

    // Cleanup function to prevent memory leaks
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [auth.currentUser, transformDocsToNotes]);

  // Optimized pagination with better error handling
  const loadMoreNotes = async () => {
    if (!lastVisible || !auth.currentUser) return;

    setLoadingMore(true);
    try {
      const nextQuery = query(
        collection(db, `users/${auth.currentUser.uid}/notes`),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(NOTES_PER_PAGE),
      );

      const querySnapshot = await getDocs(nextQuery);

      if (querySnapshot.empty) {
        setHasMore(false);
      } else {
        const fetchedNotes = transformDocsToNotes(querySnapshot.docs);

        // Use functional update to avoid race conditions
        setNotes((prevNotes) => [...prevNotes, ...fetchedNotes]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length >= NOTES_PER_PAGE);
      }
    } catch (error) {
      console.error("Error loading more notes:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <Loader2 className="size-16 animate-spin text-blue-500" />
        <span className="text-xl">Fetching Notes...</span>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 bg-opacity-10 p-12 text-center">
        <p className="mb-4 text-xl font-semibold text-gray-200">No notes yet</p>
        <p className="mb-6 text-sm text-gray-400">
          Create your first note to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            formatDate={formatDate}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteNote}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMoreNotes}
            disabled={loadingMore}
            className="w-1/3"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Notes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NoteList;
