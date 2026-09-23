export function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span className="rounded-full border border-amber-500/40 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-700 dark:bg-amber-950">
        Placeholder
      </span>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-300">{description}</p>
    </section>
  );
}