import { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="max-w-md text-sm text-zinc-500">{description}</p>
      {action}
    </div>
  );
}