import { Terminal } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export function FloatingLauncher() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  return (
    <>
      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          }}
          className="fixed right-6 bottom-24 z-[2147483647] w-[480px] max-w-[calc(100vw-48px)] max-h-[calc(100dvh-120px)] overflow-auto rounded-md border border-zinc-300 bg-white p-4 text-sm text-zinc-900 shadow-lg"
        >
          <header className="mb-4 flex items-center justify-between gap-4">
            <h2 id={titleId} className="font-semibold">
              Tracer Console Panel
            </h2>
            <Button ref={closeRef} type="button" size="sm" onClick={close}>
              Close Console Panel
            </Button>
          </header>
          <div id={descriptionId} className="space-y-2">
            <p>Log capture is not yet implemented.</p>
            <p>Tracer does not collect page logs or access native DevTools history.</p>
          </div>
        </section>
      )}
      <Button
        ref={launcherRef}
        type="button"
        size="icon"
        aria-label="Tracer Floating Launcher"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
        title={open ? 'Close Tracer Console Panel' : 'Open Tracer Console Panel'}
        className="fixed right-6 bottom-6 z-[2147483647] size-14 rounded-full border border-white/20 shadow-lg focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-white [&_svg]:size-6"
      >
        <Terminal aria-hidden="true" />
      </Button>
    </>
  );
}
