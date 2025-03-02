import NoteCard, { Note } from "@/components/NoteCard";

type NoteListProps = {
  notes: Note[];
  formatDate: (date: Date) => string;
  handleOpenEditModal: (note: Note) => void;
};

const NoteList: React.FC<NoteListProps> = ({
  notes,
  formatDate,
  handleOpenEditModal,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          formatDate={formatDate}
          onEdit={handleOpenEditModal}
        />
      ))}
    </div>
  );
};

export default NoteList;
