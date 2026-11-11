import { act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test } from 'vitest';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createShell } from './mount';

const contexts: ContentScriptContext[] = [];

afterEach(async () => {
  await act(async () => {
    for (const ctx of contexts.splice(0)) ctx.notifyInvalidated();
  });
  document.body.replaceChildren();
});

test('starts closed and opens an honestly unfinished Console Panel on the page', async () => {
  const ctx = new ContentScriptContext('launcher', {});
  contexts.push(ctx);
  const shell = await createShell(ctx);

  await act(async () => shell.mount());

  const ui = within(shell.uiContainer);
  const launcher = ui.getByRole('button', { name: 'Tracer Floating Launcher' });
  expect(launcher).toBeVisible();
  expect(launcher).toHaveAttribute('aria-expanded', 'false');
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(launcher);
  const panel = ui.getByRole('dialog', { name: 'Tracer Console Panel' });
  expect(panel).toBeVisible();
  expect(launcher).toHaveAttribute('aria-expanded', 'true');
  expect(launcher).toHaveAttribute('aria-controls', panel.id);
  expect(within(panel).getByText('Log capture is not yet implemented.')).toBeVisible();
  expect(panel).toHaveAccessibleDescription(
    'Log capture is not yet implemented. Tracer does not collect page logs or access native DevTools history.',
  );
});

test('closes and reopens with either the close control or Floating Launcher', async () => {
  const ctx = new ContentScriptContext('launcher', {});
  contexts.push(ctx);
  const shell = await createShell(ctx);
  await act(async () => shell.mount());
  const ui = within(shell.uiContainer);
  const user = userEvent.setup();
  const launcher = ui.getByRole('button', { name: 'Tracer Floating Launcher' });

  await user.click(launcher);
  await user.click(ui.getByRole('button', { name: 'Close Console Panel' }));
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
  expect(launcher).toHaveAttribute('aria-expanded', 'false');
  expect(shell.shadow.activeElement).toBe(launcher);

  await user.click(launcher);
  expect(ui.getByRole('dialog', { name: 'Tracer Console Panel' })).toBeVisible();
  await user.click(launcher);
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(launcher);
  expect(ui.getAllByRole('dialog', { name: 'Tracer Console Panel' })).toHaveLength(1);
});

test('keyboard users can open, close with Escape, and reopen with focus restored', async () => {
  const ctx = new ContentScriptContext('launcher', {});
  contexts.push(ctx);
  const shell = await createShell(ctx);
  await act(async () => shell.mount());
  const ui = within(shell.uiContainer);
  const user = userEvent.setup();
  const launcher = ui.getByRole('button', { name: 'Tracer Floating Launcher' });

  // jsdom does not model Tab traversal into a shadow root; start at the launcher.
  launcher.focus();
  await user.keyboard('{Enter}');
  expect(ui.getByRole('dialog', { name: 'Tracer Console Panel' })).toBeVisible();
  const close = ui.getByRole('button', { name: 'Close Console Panel' });
  expect(shell.shadow.activeElement).toBe(close);

  await user.keyboard('{Escape}');
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
  expect(shell.shadow.activeElement).toBe(launcher);

  await user.keyboard(' ');
  expect(ui.getByRole('dialog', { name: 'Tracer Console Panel' })).toBeVisible();
  expect(shell.shadow.activeElement).toBe(ui.getByRole('button', { name: 'Close Console Panel' }));
  await user.keyboard('{Enter}');
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
  expect(shell.shadow.activeElement).toBe(launcher);
});

test('repeated mount/open/remove cycles leave no duplicate controls or leftover panels', async () => {
  const ctx = new ContentScriptContext('launcher', {});
  contexts.push(ctx);
  const shell = await createShell(ctx);

  const ui = within(shell.uiContainer);
  const user = userEvent.setup();
  for (let cycle = 0; cycle < 3; cycle++) {
    await act(async () => {
      shell.mount();
      shell.mount();
    });
    expect(ui.getAllByRole('button', { name: 'Tracer Floating Launcher' })).toHaveLength(1);
    expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(ui.getByRole('button', { name: 'Tracer Floating Launcher' }));
    await act(async () => shell.mount());
    expect(ui.getAllByRole('dialog', { name: 'Tracer Console Panel' })).toHaveLength(1);
    expect(ui.getAllByRole('button', { name: 'Close Console Panel' })).toHaveLength(1);

    await act(async () => {
      shell.remove();
      shell.remove();
    });
    expect(ui.queryByRole('button')).not.toBeInTheDocument();
    expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
    expect(shell.shadowHost).not.toBeInTheDocument();
  }

  await act(async () => shell.mount());
  expect(ui.getAllByRole('button', { name: 'Tracer Floating Launcher' })).toHaveLength(1);
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(ui.getByRole('button', { name: 'Tracer Floating Launcher' }));

  await act(async () => ctx.notifyInvalidated());
  expect(shell.shadowHost).not.toBeInTheDocument();
  expect(ui.queryByRole('button')).not.toBeInTheDocument();
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
  await act(async () => shell.mount());
  expect(shell.shadowHost).not.toBeInTheDocument();
});

test('a replacement content-script context removes the previous visible shell', async () => {
  const first = new ContentScriptContext('launcher', {});
  contexts.push(first);
  const oldShell = await createShell(first);
  await act(async () => oldShell.mount());
  await userEvent
    .setup()
    .click(within(oldShell.uiContainer).getByRole('button', { name: 'Tracer Floating Launcher' }));

  let next!: ContentScriptContext;
  await act(async () => {
    next = new ContentScriptContext('launcher', {});
    contexts.push(next);
  });
  const newShell = await createShell(next);
  await act(async () => newShell.mount());

  expect(oldShell.shadowHost).not.toBeInTheDocument();
  expect(within(oldShell.uiContainer).queryByRole('button')).not.toBeInTheDocument();
  expect(within(oldShell.uiContainer).queryByRole('dialog')).not.toBeInTheDocument();
  expect(
    within(newShell.uiContainer).getAllByRole('button', { name: 'Tracer Floating Launcher' }),
  ).toHaveLength(1);
  expect(within(newShell.uiContainer).queryByRole('dialog')).not.toBeInTheDocument();
  await userEvent
    .setup()
    .click(within(newShell.uiContainer).getByRole('button', { name: 'Tracer Floating Launcher' }));
  expect(
    within(newShell.uiContainer).getAllByRole('dialog', { name: 'Tracer Console Panel' }),
  ).toHaveLength(1);
});
