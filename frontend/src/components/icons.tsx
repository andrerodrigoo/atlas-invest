import type { ReactNode } from "react";

interface IconProps {
  size?: number;
  className?: string;
}

const base = (children: ReactNode, { size = 20, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const Home = (props: IconProps) =>
  base(
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>,
    props
  );

export const Wallet = (props: IconProps) =>
  base(
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </>,
    props
  );

export const MessageCircle = (props: IconProps) =>
  base(<path d="M21 12c0 4.42-4.03 8-9 8-1.13 0-2.2-.18-3.19-.51L3 21l1.6-4.8A7.9 7.9 0 013 12c0-4.42 4.03-8 9-8s9 3.58 9 8z" />, props);

export const Newspaper = (props: IconProps) =>
  base(
    <>
      <path d="M4 4h13a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      <path d="M8 8h6M8 12h6M8 16h4" />
    </>,
    props
  );

export const User = (props: IconProps) =>
  base(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </>,
    props
  );

export const ArrowUp = (props: IconProps) => base(<path d="M12 19V5M5 12l7-7 7 7" />, props);
export const ArrowDown = (props: IconProps) => base(<path d="M12 5v14M19 12l-7 7-7-7" />, props);
export const Send = (props: IconProps) => base(<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />, props);
export const Star = (props: IconProps) =>
  base(<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" />, props);
export const Shield = (props: IconProps) => base(<path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z" />, props);
