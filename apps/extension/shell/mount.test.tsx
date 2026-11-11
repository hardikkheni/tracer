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

test('mounts an accessibly named Floating Launcher in the host document', async () => {
  const ctx = new ContentScriptContext('launcher', {});
  contexts.push(ctx);
  const shell = await createShell(ctx);

  await act(async () => shell.mount());

  const ui = within(shell.uiContainer);
  const launcher = ui.getByRole('button', { name: 'Tracer Floating Launcher' });
  expect(launcher).toBeVisible();

  const user = userEvent.setup();
  await user.click(launcher);
  expect(shell.shadow.activeElement).toBe(launcher);
  expect(ui.queryByRole('dialog')).not.toBeInTheDocument();
});

test('repeated mounting leaves exactly one launcher and disposal removes the UI', async () => {
  const ctx = new ContentScriptContext('launcher', {});
  contexts.push(ctx);
  const shell = await createShell(ctx);

  await act(async () => {
    shell.mount();
    shell.mount();
  });

  const ui = within(shell.uiContainer);
  expect(ui.getAllByRole('button', { name: 'Tracer Floating Launcher' })).toHaveLength(1);

  await act(async () => {
    shell.remove();
    shell.remove();
  });
  expect(ui.queryByRole('button', { name: 'Tracer Floating Launcher' })).not.toBeInTheDocument();
  expect(shell.shadowHost).not.toBeInTheDocument();

  await act(async () => shell.mount());
  expect(ui.getAllByRole('button', { name: 'Tracer Floating Launcher' })).toHaveLength(1);

  await act(async () => ctx.notifyInvalidated());
  expect(shell.shadowHost).not.toBeInTheDocument();
  expect(ui.queryByRole('button', { name: 'Tracer Floating Launcher' })).not.toBeInTheDocument();
  await act(async () => shell.mount());
  expect(shell.shadowHost).not.toBeInTheDocument();
});

test('a replacement content-script context removes the previous visible shell', async () => {
  const first = new ContentScriptContext('launcher', {});
  contexts.push(first);
  const oldShell = await createShell(first);
  await act(async () => oldShell.mount());

  let next!: ContentScriptContext;
  await act(async () => {
    next = new ContentScriptContext('launcher', {});
    contexts.push(next);
  });
  const newShell = await createShell(next);
  await act(async () => newShell.mount());

  expect(oldShell.shadowHost).not.toBeInTheDocument();
  expect(within(oldShell.uiContainer).queryByRole('button')).not.toBeInTheDocument();
  expect(within(newShell.uiContainer).getAllByRole('button', { name: 'Tracer Floating Launcher' })).toHaveLength(1);
});
