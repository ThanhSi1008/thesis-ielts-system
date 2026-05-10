"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useState } from "react";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => Promise<void>;
}

export default function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const [error, setError] = useState("");

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError("No credential received from Google.");
      return;
    }
    setError("");
    try {
      await onSuccess(idToken);
    } catch {
      setError("Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError("Google sign-in failed. Please try again.")}
        width="100%"
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
      />
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
