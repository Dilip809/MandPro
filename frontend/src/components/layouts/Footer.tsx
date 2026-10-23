
import CurrentYear from "@/components/ui/CurrentYear";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-text-muted sm:px-8">
        © <CurrentYear /> Mandipro. Fresh supply, simpler business.
      </div>
    </footer>
  );
}
