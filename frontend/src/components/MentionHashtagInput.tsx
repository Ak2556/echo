'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getCurrentWord } from '@/utils/textParsing';
import MentionHashtagAutocomplete from './MentionHashtagAutocomplete';

interface MentionHashtagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function MentionHashtagInput({
  value,
  onChange,
  placeholder = "What's on your mind?",
  maxLength,
  rows = 4,
  autoFocus = false,
  style = {},
  className = '',
}: MentionHashtagInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteType, setAutocompleteType] = useState<
    'mention' | 'hashtag'
  >('mention');
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompletePosition, setAutocompletePosition] = useState({
    top: 0,
    left: 0,
  });
  const [currentWordContext, setCurrentWordContext] =
    useState<ReturnType<typeof getCurrentWord>>(null);

  // Update autocomplete state when text or cursor position changes
  const updateAutocomplete = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const wordContext = getCurrentWord(value, cursorPosition);

    setCurrentWordContext(wordContext);

    if (
      wordContext &&
      (wordContext.type === 'mention' || wordContext.type === 'hashtag')
    ) {
      // Calculate position for autocomplete dropdown
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const currentLineText = lines[lines.length - 1];

      // Get textarea position
      const rect = textarea.getBoundingClientRect();
      const lineHeight = 24; // approximate line height
      const topOffset = (lines.length - 1) * lineHeight + lineHeight + 8;

      setAutocompletePosition({
        top: rect.top + topOffset + window.scrollY,
        left: rect.left + 12 + window.scrollX,
      });

      setAutocompleteType(wordContext.type);
      setAutocompleteQuery(wordContext.word);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, [value]);

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Handle autocomplete selection
  const handleAutocompleteSelect = (selectedValue: string) => {
    if (!currentWordContext) return;

    const beforeWord = value.substring(0, currentWordContext.startIndex);
    const afterWord = value.substring(currentWordContext.endIndex);

    const prefix = currentWordContext.type === 'mention' ? '@' : '#';
    const newValue = beforeWord + prefix + selectedValue + ' ' + afterWord;

    onChange(newValue);
    setShowAutocomplete(false);

    // Set cursor position after the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos =
          beforeWord.length + prefix.length + selectedValue.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle autocomplete close
  const handleAutocompleteClose = () => {
    setShowAutocomplete(false);
  };

  // Update autocomplete on value or cursor change
  useEffect(() => {
    updateAutocomplete();
  }, [value, updateAutocomplete]);

  // Handle cursor movement
  const handleKeyUp = () => {
    updateAutocomplete();
  };

  const handleClick = () => {
    updateAutocomplete();
  };

  return (
    <>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        autoFocus={autoFocus}
        style={style}
        className={className}
      />

      <MentionHashtagAutocomplete
        isOpen={showAutocomplete}
        type={autocompleteType}
        query={autocompleteQuery}
        position={autocompletePosition}
        onSelect={handleAutocompleteSelect}
        onClose={handleAutocompleteClose}
      />
    </>
  );
}
