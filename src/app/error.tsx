"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="display text-4xl">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted">
        That wasn&apos;t supposed to happen. Try again, and if it keeps failing, come back in a few minutes.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
