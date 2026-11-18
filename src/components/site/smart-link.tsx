import Link from "next/link";
import * as React from "react";
import { isExternalHref } from "@/lib/utils";

/** Uses next/link for internal paths and a plain anchor for external URLs. */
export function SmartLink({
  href,
  newTab,
  children,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; newTab?: boolean }) {
  if (isExternalHref(href) || newTab) {
    const external = /^(https?:)?\/\//.test(href);
    return (
      <a
        href={href}
        {...(newTab || external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
