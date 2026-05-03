interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return <div className="error" role="alert">{error}</div>;
}
