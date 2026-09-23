export function ErrorState({ message }: { message?: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-300 bg-red-50 py-16 text-center text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
    >
      <h2 className="text-lg font-medium">Something went wrong</h2>
      <p className="max-w-md text-sm">
        {message ?? "An unexpected error occurred. Please try again."}
      </p>
    </div>
  );
}