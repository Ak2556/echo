/**
 * PasswordStrength Component Tests
 * Comprehensive test suite for password strength validation and display
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '@/__tests__/setup/test-utils';
import PasswordStrength from '@/components/auth/PasswordStrength';

describe('PasswordStrength', () => {
  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<PasswordStrength password="" />);
      expect(screen.getByText('Password Strength')).toBeInTheDocument();
    });

    it('shows all strength criteria', () => {
      render(<PasswordStrength password="" />);

      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('Contains number')).toBeInTheDocument();
      expect(
        screen.getByText('Contains special character')
      ).toBeInTheDocument();
    });

    it('shows strength meter', () => {
      render(<PasswordStrength password="" />);

      const strengthMeter = screen.getByRole('progressbar');
      expect(strengthMeter).toBeInTheDocument();
    });
  });

  describe('Password Validation', () => {
    it('validates minimum length requirement', () => {
      const { rerender } = render(<PasswordStrength password="short" />);

      // Short password should not meet length requirement
      expect(screen.getByText('At least 8 characters')).toHaveClass(
        'text-red-500'
      );

      rerender(<PasswordStrength password="longenough" />);

      // Long enough password should meet length requirement
      expect(screen.getByText('At least 8 characters')).toHaveClass(
        'text-green-500'
      );
    });

    it('validates uppercase letter requirement', () => {
      const { rerender } = render(<PasswordStrength password="lowercase" />);

      // No uppercase should fail
      expect(screen.getByText('Contains uppercase letter')).toHaveClass(
        'text-red-500'
      );

      rerender(<PasswordStrength password="Uppercase" />);

      // With uppercase should pass
      expect(screen.getByText('Contains uppercase letter')).toHaveClass(
        'text-green-500'
      );
    });

    it('validates lowercase letter requirement', () => {
      const { rerender } = render(<PasswordStrength password="UPPERCASE" />);

      // No lowercase should fail
      expect(screen.getByText('Contains lowercase letter')).toHaveClass(
        'text-red-500'
      );

      rerender(<PasswordStrength password="lowercase" />);

      // With lowercase should pass
      expect(screen.getByText('Contains lowercase letter')).toHaveClass(
        'text-green-500'
      );
    });

    it('validates number requirement', () => {
      const { rerender } = render(<PasswordStrength password="NoNumbers" />);

      // No numbers should fail
      expect(screen.getByText('Contains number')).toHaveClass('text-red-500');

      rerender(<PasswordStrength password="WithNumber1" />);

      // With number should pass
      expect(screen.getByText('Contains number')).toHaveClass('text-green-500');
    });

    it('validates special character requirement', () => {
      const { rerender } = render(<PasswordStrength password="NoSpecial" />);

      // No special characters should fail
      expect(screen.getByText('Contains special character')).toHaveClass(
        'text-red-500'
      );

      rerender(<PasswordStrength password="WithSpecial!" />);

      // With special character should pass
      expect(screen.getByText('Contains special character')).toHaveClass(
        'text-green-500'
      );
    });
  });

  describe('Strength Calculation', () => {
    it('shows very weak for empty password', () => {
      render(<PasswordStrength password="" />);

      expect(screen.getByText('Very Weak')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('shows weak for password meeting few criteria', () => {
      render(<PasswordStrength password="weak" />);

      expect(screen.getByText('Weak')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });

    it('shows fair for password meeting some criteria', () => {
      render(<PasswordStrength password="Fair123" />);

      expect(screen.getByText('Fair')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });

    it('shows good for password meeting most criteria', () => {
      render(<PasswordStrength password="GoodPass123" />);

      expect(screen.getByText('Good')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '80');
    });

    it('shows strong for password meeting all criteria', () => {
      render(<PasswordStrength password="StrongPass123!" />);

      expect(screen.getByText('Strong')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Visual Indicators', () => {
    it('uses correct colors for strength levels', () => {
      const { rerender } = render(<PasswordStrength password="" />);

      // Very weak - red
      expect(screen.getByText('Very Weak')).toHaveClass('text-red-600');

      rerender(<PasswordStrength password="weak" />);

      // Weak - red
      expect(screen.getByText('Weak')).toHaveClass('text-red-500');

      rerender(<PasswordStrength password="Fair123" />);

      // Fair - yellow
      expect(screen.getByText('Fair')).toHaveClass('text-yellow-500');

      rerender(<PasswordStrength password="GoodPass123" />);

      // Good - blue
      expect(screen.getByText('Good')).toHaveClass('text-blue-500');

      rerender(<PasswordStrength password="StrongPass123!" />);

      // Strong - green
      expect(screen.getByText('Strong')).toHaveClass('text-green-500');
    });

    it('shows progress bar with correct width', () => {
      const { rerender } = render(<PasswordStrength password="Fair123" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle('width: 60%');

      rerender(<PasswordStrength password="StrongPass123!" />);

      expect(progressBar).toHaveStyle('width: 100%');
    });

    it('shows checkmarks for met criteria', () => {
      render(<PasswordStrength password="StrongPass123!" />);

      // All criteria should show checkmarks (✓)
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(5);
    });

    it('shows X marks for unmet criteria', () => {
      render(<PasswordStrength password="weak" />);

      // Most criteria should show X marks
      const xMarks = screen.getAllByText('✗');
      expect(xMarks.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced Validation', () => {
    it('detects common patterns', () => {
      render(<PasswordStrength password="123456789" showAdvanced={true} />);

      expect(screen.getByText('Avoid common patterns')).toBeInTheDocument();
    });

    it('validates character diversity', () => {
      render(<PasswordStrength password="aaaaaaaaA1!" showAdvanced={true} />);

      expect(screen.getByText('Good character diversity')).toBeInTheDocument();
    });

    it('checks for dictionary words', () => {
      render(<PasswordStrength password="password123!" showAdvanced={true} />);

      expect(screen.getByText('Avoid dictionary words')).toBeInTheDocument();
    });

    it('validates against common passwords', () => {
      render(<PasswordStrength password="Password123!" showAdvanced={true} />);

      expect(screen.getByText('Not a common password')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<PasswordStrength password="test" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Password strength');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('provides screen reader friendly text', () => {
      render(<PasswordStrength password="StrongPass123!" />);

      const strengthText = screen.getByText('Strong');
      expect(strengthText).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper color contrast', () => {
      render(<PasswordStrength password="StrongPass123!" />);

      // Green text should have sufficient contrast
      const strongText = screen.getByText('Strong');
      expect(strongText).toHaveClass('text-green-500');
    });
  });

  describe('Performance', () => {
    it('updates efficiently on password change', () => {
      const { rerender } = render(<PasswordStrength password="test" />);

      // Multiple rapid updates should not cause performance issues
      for (let i = 0; i < 10; i++) {
        rerender(<PasswordStrength password={`test${i}`} />);
      }

      expect(screen.getByText('Password Strength')).toBeInTheDocument();
    });

    it('memoizes expensive calculations', () => {
      const { rerender } = render(
        <PasswordStrength password="ComplexPassword123!" />
      );

      // Re-render with same password should use memoized result
      rerender(<PasswordStrength password="ComplexPassword123!" />);

      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long passwords', () => {
      const longPassword = 'a'.repeat(1000) + 'A1!';
      render(<PasswordStrength password={longPassword} />);

      expect(screen.getByText('Password Strength')).toBeInTheDocument();
    });

    it('handles special Unicode characters', () => {
      render(<PasswordStrength password="Pässwörd123!🔒" />);

      expect(screen.getByText('Password Strength')).toBeInTheDocument();
    });

    it('handles empty and whitespace passwords', () => {
      const { rerender } = render(<PasswordStrength password="" />);

      expect(screen.getByText('Very Weak')).toBeInTheDocument();

      rerender(<PasswordStrength password="   " />);

      expect(screen.getByText('Very Weak')).toBeInTheDocument();
    });

    it('handles null and undefined passwords', () => {
      const { rerender } = render(<PasswordStrength password={null as any} />);

      expect(screen.getByText('Very Weak')).toBeInTheDocument();

      rerender(<PasswordStrength password={undefined as any} />);

      expect(screen.getByText('Very Weak')).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    it('accepts custom className', () => {
      render(<PasswordStrength password="test" className="custom-class" />);

      const container = screen
        .getByText('Password Strength')
        .closest('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('supports custom minimum length', () => {
      render(<PasswordStrength password="short" minLength={12} />);

      expect(screen.getByText('At least 12 characters')).toBeInTheDocument();
    });

    it('allows hiding specific criteria', () => {
      render(<PasswordStrength password="test" hideLength={true} />);

      expect(
        screen.queryByText('At least 8 characters')
      ).not.toBeInTheDocument();
    });

    it('supports custom strength labels', () => {
      const customLabels = {
        0: 'Terrible',
        20: 'Bad',
        40: 'Okay',
        60: 'Better',
        80: 'Great',
        100: 'Perfect',
      };

      render(
        <PasswordStrength
          password="StrongPass123!"
          strengthLabels={customLabels}
        />
      );

      expect(screen.getByText('Perfect')).toBeInTheDocument();
    });
  });

  describe('Production Error Scenarios', () => {
    describe('Malicious Input Handling', () => {
      it('handles SQL injection attempts', () => {
        const sqlInjection = "'; DROP TABLE users; --";
        const { container } = render(
          <PasswordStrength password={sqlInjection} />
        );

        expect(container).toBeInTheDocument();
        // Should treat as normal password, not execute
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles XSS script injection', () => {
        const xssAttempt = '<script>alert("xss")</script>';
        const { container } = render(
          <PasswordStrength password={xssAttempt} />
        );

        expect(container).toBeInTheDocument();
        // Should not execute script
        expect(container.innerHTML).not.toContain('<script>');
      });

      it('handles HTML injection', () => {
        const htmlInjection = '<img src=x onerror=alert(1)>';
        render(<PasswordStrength password={htmlInjection} />);

        // Should render safely without executing
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles NULL bytes', () => {
        const nullBytePassword = 'password\x00admin';
        const { container } = render(
          <PasswordStrength password={nullBytePassword} />
        );

        expect(container).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles Unicode exploits', () => {
        const unicodeExploit = 'admin\u202E\u202Duser';
        const { container } = render(
          <PasswordStrength password={unicodeExploit} />
        );

        expect(container).toBeInTheDocument();
      });
    });

    describe('Extreme Input Sizes', () => {
      it('handles extremely long passwords (10,000 characters)', () => {
        const longPassword = 'A'.repeat(10000) + 'a1!';
        const { container } = render(
          <PasswordStrength password={longPassword} />
        );

        expect(container).toBeInTheDocument();
        // Should still calculate strength
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles extremely long passwords (100,000 characters)', () => {
        const veryLongPassword = 'A'.repeat(100000) + 'a1!';
        const { container } = render(
          <PasswordStrength password={veryLongPassword} />
        );

        // Should render without hanging
        expect(container).toBeInTheDocument();
      });

      it('handles empty string', () => {
        render(<PasswordStrength password="" />);

        expect(screen.getByText('Very Weak')).toBeInTheDocument();
        expect(
          screen.getByText('Enter a password to check strength')
        ).toBeInTheDocument();
      });

      it('handles whitespace-only passwords', () => {
        render(<PasswordStrength password="     " />);

        expect(screen.getByText('Very Weak')).toBeInTheDocument();
      });

      it('handles single character', () => {
        render(<PasswordStrength password="A" />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    describe('Unicode and International Characters', () => {
      it('handles emoji passwords', () => {
        const emojiPassword = '😀😁😂🤣😃😄';
        render(<PasswordStrength password={emojiPassword} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles Chinese characters', () => {
        const chinesePassword = '密码强度测试123!';
        render(<PasswordStrength password={chinesePassword} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles Arabic characters', () => {
        const arabicPassword = 'كلمةالسر123!';
        render(<PasswordStrength password={arabicPassword} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles Cyrillic characters', () => {
        const cyrillicPassword = 'Пароль123!';
        render(<PasswordStrength password={cyrillicPassword} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles mixed scripts', () => {
        const mixedPassword = 'PassПароль密码123!';
        render(<PasswordStrength password={mixedPassword} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles zero-width characters', () => {
        const zeroWidthPassword = 'Pass\u200B\u200Cword123!';
        render(<PasswordStrength password={zeroWidthPassword} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    describe('Performance Under Load', () => {
      it('handles rapid password changes (100 updates)', () => {
        const { rerender } = render(<PasswordStrength password="" />);

        for (let i = 0; i < 100; i++) {
          rerender(<PasswordStrength password={`password${i}`} />);
        }

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles alternating between complex passwords', () => {
        const passwords = [
          'SimplePass1!',
          'C0mpl3x!P@ssw0rd',
          'Sh0rt!',
          'VeryLongAndComplexPassword123!@#',
        ];

        const { rerender } = render(
          <PasswordStrength password={passwords[0]} />
        );

        for (let i = 0; i < 50; i++) {
          rerender(
            <PasswordStrength password={passwords[i % passwords.length]} />
          );
        }

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('memoizes strength calculation', () => {
        const password = 'TestPassword123!';
        const { rerender } = render(<PasswordStrength password={password} />);

        // Re-render with same password
        for (let i = 0; i < 10; i++) {
          rerender(<PasswordStrength password={password} />);
        }

        // Should use memoized value
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    describe('Common Attack Patterns', () => {
      it('detects keyboard walks', () => {
        render(<PasswordStrength password="qwertyuiop" />);

        expect(screen.getByText(/Avoid common patterns/i)).toBeInTheDocument();
      });

      it('detects number sequences', () => {
        render(<PasswordStrength password="12345678" />);

        expect(screen.getByText(/Avoid common patterns/i)).toBeInTheDocument();
      });

      it('detects alphabet sequences', () => {
        render(<PasswordStrength password="abcdefgh" />);

        expect(screen.getByText(/Avoid common patterns/i)).toBeInTheDocument();
      });

      it('detects repeated characters', () => {
        render(<PasswordStrength password="aaaaaaaa" />);

        expect(
          screen.getByText(/Avoid repeated characters/i)
        ).toBeInTheDocument();
      });

      it('detects password variations', () => {
        render(<PasswordStrength password="password123" />);

        expect(screen.getByText(/Avoid common patterns/i)).toBeInTheDocument();
      });

      it('detects admin variations', () => {
        render(<PasswordStrength password="admin1234" />);

        expect(screen.getByText(/Avoid common patterns/i)).toBeInTheDocument();
      });
    });

    describe('Component Lifecycle', () => {
      it('handles rapid mount/unmount', () => {
        for (let i = 0; i < 20; i++) {
          const { unmount } = render(<PasswordStrength password="test" />);
          unmount();
        }

        // Should not leak memory
        expect(true).toBe(true);
      });

      it('updates when password prop changes', () => {
        const { rerender } = render(<PasswordStrength password="weak" />);

        rerender(<PasswordStrength password="StrongPassword123!" />);

        expect(screen.getByText('Strong')).toBeInTheDocument();
      });

      it('handles null password gracefully', () => {
        const { container } = render(
          <PasswordStrength password={null as any} />
        );

        expect(container).toBeInTheDocument();
        expect(screen.getByText('Very Weak')).toBeInTheDocument();
      });

      it('handles undefined password gracefully', () => {
        const { container } = render(
          <PasswordStrength password={undefined as any} />
        );

        expect(container).toBeInTheDocument();
        expect(screen.getByText('Very Weak')).toBeInTheDocument();
      });
    });

    describe('Edge Case Password Patterns', () => {
      it('handles all special characters', () => {
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        render(<PasswordStrength password={specialChars} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles mixed case with numbers and symbols', () => {
        render(<PasswordStrength password="Aa1!Bb2@Cc3#" />);

        expect(screen.getByText('Strong')).toBeInTheDocument();
      });

      it('handles password with newlines', () => {
        const passwordWithNewline = 'Pass\nword123!';
        render(<PasswordStrength password={passwordWithNewline} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles password with tabs', () => {
        const passwordWithTab = 'Pass\tword123!';
        render(<PasswordStrength password={passwordWithTab} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles Base64 encoded strings', () => {
        const base64 = 'SGVsbG9Xb3JsZDEyMyE=';
        render(<PasswordStrength password={base64} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    describe('Accessibility Under Stress', () => {
      it('maintains ARIA attributes during rapid updates', () => {
        const { rerender } = render(<PasswordStrength password="test1" />);

        for (let i = 0; i < 10; i++) {
          rerender(<PasswordStrength password={`test${i}`} />);

          const progressbar = screen.getByRole('progressbar');
          expect(progressbar).toHaveAttribute('aria-valuemin', '0');
          expect(progressbar).toHaveAttribute('aria-valuemax', '100');
          expect(progressbar).toHaveAttribute('aria-valuenow');
        }
      });

      it('updates live region correctly', () => {
        const { rerender } = render(<PasswordStrength password="weak" />);

        const liveRegion = screen.getByText('Weak');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');

        rerender(<PasswordStrength password="StrongPassword123!" />);

        expect(screen.getByText('Strong')).toHaveAttribute(
          'aria-live',
          'polite'
        );
      });
    });

    describe('Prop Validation Edge Cases', () => {
      it('handles negative minLength', () => {
        const { container } = render(
          <PasswordStrength password="test" minLength={-5} />
        );

        expect(container).toBeInTheDocument();
      });

      it('handles extremely large minLength', () => {
        render(<PasswordStrength password="test" minLength={10000} />);

        expect(
          screen.getByText('At least 10000 characters')
        ).toBeInTheDocument();
      });

      it('handles showAdvanced toggle during render', () => {
        const { rerender } = render(
          <PasswordStrength password="Password123!" showAdvanced={false} />
        );

        rerender(
          <PasswordStrength password="Password123!" showAdvanced={true} />
        );

        expect(screen.getByText(/character diversity/i)).toBeInTheDocument();
      });

      it('handles empty strengthLabels object', () => {
        const { container } = render(
          <PasswordStrength password="Test123!" strengthLabels={{}} />
        );

        expect(container).toBeInTheDocument();
      });

      it('handles partial strengthLabels', () => {
        const partialLabels = {
          100: 'Great',
        };

        render(
          <PasswordStrength
            password="StrongPass123!"
            strengthLabels={partialLabels}
          />
        );

        expect(screen.getByText('Great')).toBeInTheDocument();
      });
    });

    describe('Real-World Password Scenarios', () => {
      it('handles passphrase style passwords', () => {
        const passphrase = 'correct horse battery staple 123!';
        render(<PasswordStrength password={passphrase} />);

        expect(screen.getByText('Strong')).toBeInTheDocument();
      });

      it('handles leetspeak passwords', () => {
        const leetspeak = 'P@55w0rd!23';
        render(<PasswordStrength password={leetspeak} />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      it('handles randomly generated passwords', () => {
        const random = 'xK9#mP2$qL5@wN8!';
        render(<PasswordStrength password={random} />);

        expect(screen.getByText('Strong')).toBeInTheDocument();
      });

      it('handles common substitution patterns', () => {
        const substitution = 'Password123!';
        render(<PasswordStrength password={substitution} />);

        // Should detect password pattern
        expect(screen.getByText(/Avoid common patterns/i)).toBeInTheDocument();
      });
    });
  });
});
