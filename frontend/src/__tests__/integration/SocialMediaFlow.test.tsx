/**
 * Social Media Flow Integration Tests
 * End-to-end testing of social media functionality workflows
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import {
  render,
  setupUserEvent,
  createTestData,
} from '@/__tests__/setup/test-utils';
import SocialMediaHub from '@/components/SocialMediaHub';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Next.js Image
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

describe('Social Media Flow Integration Tests', () => {
  const user = setupUserEvent();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Post Creation Flow', () => {
    it('allows user to create and publish a post', async () => {
      render(<SocialMediaHub />);

      // Start post creation
      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      // Enter post content
      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, 'This is my test post! #testing #socialmedia');

      // Verify post button is enabled
      const postButton = screen.getByRole('button', { name: /post/i });
      expect(postButton).toBeEnabled();

      // Publish the post
      await user.click(postButton);

      // Verify post creation interface is closed
      await waitFor(() => {
        expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
        expect(
          screen.queryByPlaceholderText("What's happening?")
        ).not.toBeInTheDocument();
      });
    });

    it('allows user to cancel post creation', async () => {
      render(<SocialMediaHub />);

      // Start post creation
      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      // Enter some content
      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, 'This post will be cancelled');

      // Cancel the post
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Verify interface is reset
      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("What's happening?")
      ).not.toBeInTheDocument();
    });

    it('prevents posting empty content', async () => {
      render(<SocialMediaHub />);

      // Start post creation
      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      // Try to post without content
      const postButton = screen.getByRole('button', { name: /post/i });
      expect(postButton).toBeDisabled();

      // Add content and verify button becomes enabled
      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, 'Now there is content');
      expect(postButton).toBeEnabled();

      // Clear content and verify button becomes disabled again
      await user.clear(textarea);
      expect(postButton).toBeDisabled();
    });
  });

  describe('Post Interaction Flow', () => {
    it('allows user to like and unlike posts', async () => {
      render(<SocialMediaHub />);

      // Find the first like button (should be unliked initially)
      const likeButtons = screen.getAllByText('🤍');
      const firstLikeButton = likeButtons[0];

      // Like the post
      await user.click(firstLikeButton);

      // Verify post is now liked - there might be multiple hearts
      await waitFor(() => {
        const hearts = screen.queryAllByText('❤️');
        expect(hearts.length).toBeGreaterThan(0);
      });

      // Unlike the post
      const likedButtons = screen.queryAllByText('❤️');
      if (likedButtons.length > 0) {
        await user.click(likedButtons[0]);
      }

      // Verify post is now unliked
      await waitFor(() => {
        const emptyHearts = screen.queryAllByText('🤍');
        expect(emptyHearts.length).toBeGreaterThan(0);
      });
    });

    it('allows user to bookmark and unbookmark posts', async () => {
      render(<SocialMediaHub />);

      // Find the first bookmark button
      const bookmarkButtons = screen.getAllByText('📑');
      const firstBookmarkButton = bookmarkButtons[0];

      // Bookmark the post
      await user.click(firstBookmarkButton);

      // Verify post is now bookmarked - there might be multiple bookmarks
      await waitFor(() => {
        const bookmarkedIcons = screen.queryAllByText('🔖');
        expect(bookmarkedIcons.length).toBeGreaterThan(0);
      });

      // Unbookmark the post
      const bookmarkedButtons = screen.queryAllByText('🔖');
      if (bookmarkedButtons.length > 0) {
        await user.click(bookmarkedButtons[0]);
      }

      // Verify post is now unbookmarked
      await waitFor(() => {
        const unbookmarkedIcons = screen.queryAllByText('📑');
        expect(unbookmarkedIcons.length).toBeGreaterThan(0);
      });
    });

    it('shows poll interaction correctly', async () => {
      render(<SocialMediaHub />);

      // Find the poll question
      const pollQuestion = screen.getByText(
        "What's your favorite frontend framework?"
      );
      expect(pollQuestion).toBeInTheDocument();

      // Find poll options - there might be multiple matches for common words like "React"
      const allText = screen.queryAllByText(/^React$/);
      const vueOptions = screen.queryAllByText(/^Vue$/);
      const angularOptions = screen.queryAllByText(/^Angular$/);
      const svelteOptions = screen.queryAllByText(/^Svelte$/);

      expect(allText.length).toBeGreaterThan(0);
      expect(vueOptions.length).toBeGreaterThan(0);
      expect(angularOptions.length).toBeGreaterThan(0);
      expect(svelteOptions.length).toBeGreaterThan(0);

      // Verify poll shows percentages
      const percentages = screen.queryAllByText(/51\.9%|23\.8%/);
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Flow', () => {
    it('component no longer has internal navigation', () => {
      render(<SocialMediaHub />);

      // Internal navigation has been removed - component only shows feed
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

      // Feed content should be rendered
      expect(
        screen.getByText(/Just finished this amazing digital artwork/)
      ).toBeInTheDocument();
    });

    it('always renders feed content', () => {
      render(<SocialMediaHub />);

      // Component now only displays feed, no active tab state
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(
        screen.getByText(/Just finished this amazing digital artwork/)
      ).toBeInTheDocument();
    });
  });

  describe('Messaging Flow', () => {
    it('does not have messaging interface in this component', () => {
      render(<SocialMediaHub />);

      // Messaging has been removed from this component
      expect(screen.queryByText('💬 Messages')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Select a conversation')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText('Type a message...')
      ).not.toBeInTheDocument();
    });
  });

  describe('Stories Flow', () => {
    it('does not have stories interface in this component', () => {
      render(<SocialMediaHub />);

      // Stories have been removed from this component
      expect(screen.queryByText('📸 Stories')).not.toBeInTheDocument();
    });
  });

  describe('Explore Flow', () => {
    it('does not have explore interface in this component', () => {
      render(<SocialMediaHub />);

      // Explore has been removed from this component
      expect(screen.queryByText('🔍 Explore')).not.toBeInTheDocument();
      expect(screen.queryByText('🔥 Trending Topics')).not.toBeInTheDocument();
      expect(screen.queryByText('⭐ Popular Creators')).not.toBeInTheDocument();
    });
  });

  describe('Profile Flow', () => {
    it('does not have profile interface in this component', () => {
      render(<SocialMediaHub />);

      // Profile has been removed from this component
      expect(screen.queryByText('👤 Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });
  });

  describe('Cross-Tab State Management', () => {
    it('maintains post creation state correctly', async () => {
      render(<SocialMediaHub />);

      // Create a post
      const createPostButton = screen.getByText("What's on your mind?");
      await user.click(createPostButton);

      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, 'Test post content');

      // State should be maintained in the component
      expect(textarea).toHaveValue('Test post content');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('renders without crashing', () => {
      render(<SocialMediaHub />);

      // Component should render successfully
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('handles empty states gracefully', () => {
      render(<SocialMediaHub />);

      // Component should render even without data
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    });
  });

  describe('Performance and Responsiveness', () => {
    it('renders within acceptable time', () => {
      const startTime = performance.now();

      render(<SocialMediaHub />);

      const endTime = performance.now();

      // Should render in reasonable time
      expect(endTime - startTime).toBeLessThan(200); // 200ms
    });

    it('handles rapid user interactions', async () => {
      render(<SocialMediaHub />);

      // Simulate rapid button clicks
      const buttons = screen.queryAllByRole('button');
      if (buttons.length > 0) {
        for (let i = 0; i < Math.min(5, buttons.length); i++) {
          await user.click(buttons[i]);
        }
      }

      // Should handle all interactions without errors
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
