interface ErrorMessageProps {
  error: string | null;
}

// role="alert" causes screen readers to announce the error immediately
// when it appears, without the user having to navigate to it.
export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return <p role="alert">{error}</p>;
}
