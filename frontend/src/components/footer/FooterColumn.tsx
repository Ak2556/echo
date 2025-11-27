'use client';

import React from 'react';
import Link from 'next/link';

interface FooterColumnProps {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--echo-text-primary)] uppercase tracking-wider">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[var(--echo-text-secondary)] hover:text-[var(--echo-primary)] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
