import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingLauncher() {
  return (
    <Button
      type="button"
      size="icon"
      aria-label="Tracer Floating Launcher"
      title="Tracer — Console Panel coming soon"
      className="fixed right-6 bottom-6 z-[2147483647] size-14 rounded-full border border-white/20 shadow-lg focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-white [&_svg]:size-6"
    >
      <Terminal aria-hidden="true" />
    </Button>
  );
}
