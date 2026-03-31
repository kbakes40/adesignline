import clsx from 'clsx';
import Image from 'next/image';
import Label from '../label';

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: 'bottom' | 'center';
  };
} & React.ComponentProps<typeof Image>) {
  return (
    <div
      className={clsx('group flex h-full w-full items-center justify-center overflow-hidden bg-white', {
        relative: label,
        'ring-1 ring-black/20': active
      })}
    >
      {props.src ? (
        <Image
          className={clsx('relative h-full w-full object-contain object-center', {
            'transition duration-500 ease-in-out group-hover:scale-[1.015]': isInteractive
          })}
          {...props}
          alt={props.alt || ''}
        />
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}
