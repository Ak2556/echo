'use client';

import { parseText, ParsedEntity } from '@/utils/textParsing';
import { useRouter } from 'next/navigation';

interface LinkifiedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LinkifiedText({ text, className = '', style = {} }: LinkifiedTextProps) {
  const router = useRouter();
  const entities = parseText(text);

  const handleMentionClick = (username: string) => {
    router.push(`/@${username}`);
  };

  const handleHashtagClick = (hashtag: string) => {
    router.push(`/explore?tag=${hashtag}`);
  };

  const handleUrlClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <span className={className} style={style}>
      {entities.map((entity, index) => {
        switch (entity.type) {
          case 'mention':
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMentionClick(entity.value!);
                }}
                style={{
                  color: '#3b82f6',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {entity.content}
              </span>
            );

          case 'hashtag':
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHashtagClick(entity.value!);
                }}
                style={{
                  color: '#10b981',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {entity.content}
              </span>
            );

          case 'url':
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUrlClick(entity.value!);
                }}
                style={{
                  color: '#8b5cf6',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#a78bfa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8b5cf6';
                }}
              >
                {entity.content}
              </span>
            );

          case 'text':
          default:
            return <span key={index}>{entity.content}</span>;
        }
      })}
    </span>
  );
}
