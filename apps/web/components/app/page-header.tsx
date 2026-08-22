interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm text-text-muted">{description}</p>
      )}
    </div>
  );
}
