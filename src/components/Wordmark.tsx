// "ras.ruchi" with its full stop centred (see .wordmark-dot in globals.css).
// Any name works: only a full stop gets the measured spacing.
export function Wordmark({ name }: { name: string }) {
  const at = name.indexOf(".");
  if (at <= 0 || at === name.length - 1) return <>{name}</>;
  return (
    <>
      {name.slice(0, at)}
      <span className="wordmark-dot">.</span>
      {name.slice(at + 1)}
    </>
  );
}
