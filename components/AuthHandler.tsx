import { useState } from "react";
import { X } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { auth, googleProvider } from "@/app/firebase";
import { signInWithPopup, UserCredential } from "firebase/auth";
import { FirebaseError } from "firebase/app";

interface AuthHandlerProps {
  handleClose: (success?: boolean) => void;
}

const AuthHandler = ({ handleClose }: AuthHandlerProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = async (result: UserCredential) => {
    console.log("Authenticated user", result.user);
    handleClose(true); // Pass true to indicate successful authentication
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result);
    } catch (error: unknown) {
      console.error("Google sign-in error:", error);
      if (error instanceof FirebaseError) {
        if (error.code === "auth/popup-blocked") {
          setError("Please enable popups for this site.");
        } else if (error.code === "auth/cancelled-popup-request") {
          setError("Sign in was cancelled.");
        } else {
          setError("Failed to sign in with Google.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => handleClose(false)}
    >
      <Card
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          className="absolute right-2 top-2"
          onClick={() => handleClose(false)}
          variant="destructive"
        >
          <X size={24} />
        </Button>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Sign In
          </CardTitle>
          {error && (
            <p className="mt-2 text-center text-sm text-red-500">{error}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={signInWithGoogle}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthHandler;
