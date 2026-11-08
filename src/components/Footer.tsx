import Mark from "./Mark";

export default function Footer() {
  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 flex flex-col sm:flex-row justify-between gap-2 text-sm text-faint">
        <span className="flex items-center gap-2">
          <Mark className="h-4 w-4" />© 2026 Gustav Safi
        </span>
        <span>Designed and built by me with Next.js</span>
      </div>
    </footer>
  );
}
