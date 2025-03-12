import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-400">
      <div className="flex items-center justify-center space-x-1">
        <span>Built by</span>
        <Link
          href="https://www.linkedin.com/in/peteressibu/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          <span>Peter Essibu</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
