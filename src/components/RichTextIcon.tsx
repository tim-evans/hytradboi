import { SVGAttributes } from "react";

export function RichTextIcon(props: SVGAttributes<SVGElement>) {
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
        d="M3 9a1 1 0 010-2h10a1 1 0 110 2H3zM3 13a1 1 0 110-2h4a1 1 0 110 2H3zM3 5a1 1 0 010-2h10a1 1 0 110 2H3z"
        fill="currentColor"
      />
    </svg>
  );
}
