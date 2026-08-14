import type { ReactNode } from 'react';
import { useMagnetic } from '@/hooks/useMagnetic';
import './MagneticButton.css';

interface BaseProps {
  children: ReactNode;
  variant?: 'solid' | 'ghost';
  className?: string;
  strength?: number;
}

type Props = BaseProps &
  (
    | ({ as?: 'button' } & React.ButtonHTMLAttributes<HTMLButtonElement>)
    | ({ as: 'a' } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  );

/**
 * Pill button that drifts toward the pointer. Renders as <a> or <button>
 * depending on whether it navigates — keeps the semantics honest for
 * screen readers and keyboard users.
 */
export function MagneticButton({
  children,
  variant = 'solid',
  className = '',
  strength = 0.3,
  ...rest
}: Props) {
  const ref = useMagnetic<HTMLElement>(strength);
  const classes = `mbtn mbtn--${variant} ${className}`.trim();

  if (rest.as === 'a') {
    const { as: _as, ...anchorProps } = rest;
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...anchorProps}>
        <span className="mbtn__label" data-magnetic-inner>
          {children}
        </span>
      </a>
    );
  }

  const { as: _as, ...buttonProps } = rest as { as?: 'button' } & React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...buttonProps}>
      <span className="mbtn__label" data-magnetic-inner>
        {children}
      </span>
    </button>
  );
}
