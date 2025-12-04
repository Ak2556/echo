'use client';

import React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FooterColumnProps {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export function FooterColumn({ title, links }: FooterColumnProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, link: { label: string; href: string }) => {
    // If it's a placeholder link (starts with #), show a toast and prevent navigation
    if (link.href.startsWith('#')) {
      e.preventDefault();
      toast.info(`${link.label} - Coming soon!`, {
        icon: '🚧',
        duration: 3000,
      });
    }
    // Otherwise, show feedback for navigation
    else {
      toast.success(`Navigating to ${link.label}...`, {
        icon: '→',
        duration: 2000,
      });
    }
  };

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
              onClick={(e) => handleClick(e, link)}
              className="text-sm text-[var(--echo-text-secondary)] hover:text-[var(--echo-primary)] transition-colors hover:underline cursor-pointer inline-block"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
