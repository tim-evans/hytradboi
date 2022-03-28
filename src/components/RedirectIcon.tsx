import { SVGAttributes } from "react";

export function RedirectIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 2a1 1 0 011-1h2.714a1 1 0 010 2H3v10h10v-1.714a1 1 0 112 0V14a1 1 0 01-1 1H2a1 1 0 01-1-1V2z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 2a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 11-2 0V4.414l-6.293 6.293a1 1 0 01-1.414-1.414L11.586 3H9a1 1 0 01-1-1z"
        fill="currentColor"
      />
    </svg>
  );
}
