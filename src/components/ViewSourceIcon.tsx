import { SVGAttributes } from "react";

export function ViewSourceIcon(props: SVGAttributes<SVGElement>) {
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
        d="M3.414 8l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 1.414L3.414 8zM11.293 6.707a1 1 0 011.414-1.414l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L12.586 8l-1.293-1.293zM9.051 1.684a1 1 0 011.898.632l-4 12a1 1 0 01-1.898-.632l4-12z"
        fill="currentColor"
      />
    </svg>
  );
}
