import NotesApp from "@/components/Notes";
import Header from "@/components/Header";

const page = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <NotesApp />
    </div>
  );
};

export default page;
