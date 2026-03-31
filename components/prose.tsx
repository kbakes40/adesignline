import clsx from 'clsx';
import type { FunctionComponent } from 'react';

interface TextProps {
  html: string;
  className?: string;
  /** Tighter vertical rhythm for PDP Description tab (Nike-style density vs. default marketing prose). */
  compact?: boolean;
}

const defaultProse =
  'prose mx-auto max-w-6xl text-base leading-7 text-black prose-headings:mt-8 prose-headings:font-semibold prose-headings:tracking-wide prose-headings:text-black prose-h1:text-6xl prose-h2:text-5xl prose-h3:text-4xl prose-h4:text-3xl prose-h5:text-2xl prose-h6:text-xl prose-a:text-black prose-a:underline hover:prose-a:text-neutral-300 prose-strong:text-black prose-ol:mt-8 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mt-8 prose-ul:list-disc prose-ul:pl-6 dark:text-white dark:prose-headings:text-white dark:prose-a:text-white dark:prose-strong:text-white';

/** Overrides default `prose` paragraph/list margins so catalog HTML doesn’t stack huge gaps. */
const compactProse =
  'prose prose-sm max-w-none text-[13px] leading-snug text-neutral-800 [&_p]:mb-2 [&_p]:mt-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:mb-2 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_li]:leading-snug [&_li]:pl-0.5 [&_strong]:font-semibold [&_strong]:text-neutral-900 [&_a]:text-neutral-900 [&_a]:underline';

const Prose: FunctionComponent<TextProps> = ({ html, className, compact }) => {
  return (
    <div
      className={clsx(compact ? compactProse : defaultProse, className)}
      dangerouslySetInnerHTML={{ __html: html as string }}
    />
  );
};

export default Prose;
