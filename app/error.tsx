"use client";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <main>
      <h1>Something went wrong</h1>

      <p>
        We could not load data from the graph database.
      </p>

      <p>{error.message}</p>

      <button onClick={reset}>
        Try again
      </button>
    </main>
  );
}