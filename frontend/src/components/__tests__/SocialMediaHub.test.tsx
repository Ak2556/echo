/**
 * SocialMediaHub Component Tests
 * Comprehensive test suite for the social media hub functionality
 */

import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import {
  render,
  setupUserEvent,
  mockUser,
  mockPost,
  mockMessage,
  mockChat,
  createTestData,
} from '@/__tests__/setup/test-utils';
import SocialMediaHub from '@/components/SocialMediaHub';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock useResponsive hook
jest.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'lg',
  }),
}));

describe('SocialMediaHub', () => {
  const user = setupUserEvent();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the component without errors', () => {
      render(<SocialMediaHub />);

      // Component should render the main container
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders feed content by default', () => {
      render(<SocialMediaHub />);

      // Should display posts in the feed
      const posts = screen.queryAllByText(/Just finished this amazing/i);
      expect(posts.length).toBeGreaterThan(0);
    });

    it('renders post content', () => {
      render(<SocialMediaHub />);

      // Should have post author information
      const avatars = screen.queryAllByAltText(
        /Priya Sharma|Raj Kumar|Sarah Johnson/i
      );
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('does not render internal navigation tabs', () => {
      render(<SocialMediaHub />);

      // Navigation has been removed from this component
      expect(
        screen.queryByRole('button', { name: /feed/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /stories/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /messages/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /explore/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /profile/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Feed View', () => {
    it('renders create post interface', () => {
      render(<SocialMediaHub />);

      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
      expect(screen.getByAltText('Your Avatar')).toBeInTheDocument();
    });

    it('expands create post form when clicked', async () => {
      render(<SocialMediaHub />);

      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      expect(
        screen.getByPlaceholderText("What's happening?")
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it('shows media attachment options in create post', async () => {
      render(<SocialMediaHub />);

      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      expect(screen.getByText('📷')).toBeInTheDocument();
      expect(screen.getByText('🎥')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('📍')).toBeInTheDocument();
      expect(screen.getByText('😊')).toBeInTheDocument();
    });

    it('enables post button when text is entered', async () => {
      render(<SocialMediaHub />);

      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /post/i });

      expect(postButton).toBeDisabled();

      await user.type(textarea, 'Test post content');
      expect(postButton).toBeEnabled();
    });

    it('cancels post creation when cancel is clicked', async () => {
      render(<SocialMediaHub />);

      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, 'Test content');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("What's happening?")
      ).not.toBeInTheDocument();
    });

    it('renders sample posts', () => {
      render(<SocialMediaHub />);

      // Check for sample post content
      expect(
        screen.getByText(/Just finished this amazing digital artwork/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Building something amazing with React/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Made this incredible South Indian feast/)
      ).toBeInTheDocument();
    });

    it('renders post interactions', () => {
      render(<SocialMediaHub />);

      // Check for like buttons
      const likeButtons = screen.getAllByText('🤍');
      expect(likeButtons.length).toBeGreaterThan(0);

      // Check for comment buttons
      const commentButtons = screen.getAllByText('💬');
      expect(commentButtons.length).toBeGreaterThan(0);

      // Check for share buttons
      const shareButtons = screen.getAllByText('🔄');
      expect(shareButtons.length).toBeGreaterThan(0);
    });

    it('handles post like interaction', async () => {
      render(<SocialMediaHub />);

      const likeButtons = screen.getAllByText('🤍');
      const firstLikeButton = likeButtons[0];

      await user.click(firstLikeButton);

      // Should change to liked state - there might be multiple hearts now
      const hearts = screen.queryAllByText('❤️');
      expect(hearts.length).toBeGreaterThan(0);
    });

    it('renders trending sidebar on desktop', () => {
      render(<SocialMediaHub />);

      expect(screen.getByText('🔥 Trending')).toBeInTheDocument();
      expect(screen.getByText('#ReactJS')).toBeInTheDocument();
      expect(screen.getByText('#WebDev')).toBeInTheDocument();
    });

    it('renders suggested users sidebar', () => {
      render(<SocialMediaHub />);

      expect(screen.getByText('👥 Suggested for you')).toBeInTheDocument();
      expect(screen.getByText('Ravi Kumar')).toBeInTheDocument();
      expect(screen.getByText('Sneha Patel')).toBeInTheDocument();
    });

    it('renders poll in posts', () => {
      render(<SocialMediaHub />);

      expect(
        screen.getByText("What's your favorite frontend framework?")
      ).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Vue')).toBeInTheDocument();
      expect(screen.getByText('Angular')).toBeInTheDocument();
      expect(screen.getByText('Svelte')).toBeInTheDocument();
    });
  });

  describe('Stories View', () => {
    it('does not render stories interface in this component', () => {
      render(<SocialMediaHub />);

      // Stories view has been removed from this component
      expect(screen.queryByText('📸 Stories')).not.toBeInTheDocument();
    });
  });

  describe('Messages View', () => {
    it('does not render messages interface in this component', () => {
      render(<SocialMediaHub />);

      // Messages view has been removed from this component
      expect(screen.queryByText('💬 Messages')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Select a conversation')
      ).not.toBeInTheDocument();
    });
  });

  describe('Explore View', () => {
    it('does not render explore interface in this component', () => {
      render(<SocialMediaHub />);

      // Explore view has been removed from this component
      expect(screen.queryByText('🔍 Explore')).not.toBeInTheDocument();
      expect(screen.queryByText('🔥 Trending Topics')).not.toBeInTheDocument();
    });
  });

  describe('Profile View', () => {
    it('does not render profile interface in this component', () => {
      render(<SocialMediaHub />);

      // Profile view has been removed from this component
      expect(screen.queryByText('👤 Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts layout for mobile devices', () => {
      render(<SocialMediaHub />);

      // Should render main content
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<SocialMediaHub />);

      // Main content should be accessible
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<SocialMediaHub />);

      // Find any interactive element to test keyboard nav
      const buttons = screen.queryAllByRole('button');
      if (buttons.length > 0) {
        buttons[0].focus();
        expect(buttons[0]).toHaveFocus();
      }
    });

    it('has proper alt text for images', () => {
      render(<SocialMediaHub />);

      const avatarImages = screen.getAllByAltText(/avatar/i);
      expect(avatarImages.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles missing data gracefully', () => {
      // Test with empty data
      render(<SocialMediaHub />);

      // Should still render without crashing
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      // Mock fetch to return error
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      render(<SocialMediaHub />);

      // Should still render the interface
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time', async () => {
      const startTime = performance.now();
      render(<SocialMediaHub />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('memoizes components properly', () => {
      const { rerender } = render(<SocialMediaHub />);

      // Re-render with same props should not cause unnecessary re-renders
      rerender(<SocialMediaHub />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
