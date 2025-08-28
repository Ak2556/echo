'use client';

import { ChatMessage } from '@/services/api';
import { Conversation } from '@/hooks/useConversationHistory';

export interface ExportOptions {
  format: 'json' | 'markdown' | 'txt' | 'pdf';
  includeMetadata: boolean;
  includeTimestamps: boolean;
  includeSystemMessages: boolean;
}

export class ChatUtils {
  static formatTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return this.formatDate(date);
  }

  static truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  }

  static highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  static extractCodeBlocks(text: string): { language: string; code: string }[] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  static formatMessageContent(content: string): string {
    // Convert markdown-style formatting to HTML
    let formatted = content;
    
    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline code
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  static exportConversation(conversation: Conversation, options: ExportOptions): string {
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(conversation, options);
      case 'markdown':
        return this.exportAsMarkdown(conversation, options);
      case 'txt':
        return this.exportAsText(conversation, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static exportAsJSON(conversation: Conversation, options: ExportOptions): string {
    const data: any = {
      title: conversation.title,
      messages: conversation.messages
    };

    if (options.includeMetadata) {
      data.metadata = {
        id: conversation.id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        model: conversation.model,
        personality: conversation.personality,
        tags: conversation.tags,
        isBookmarked: conversation.isBookmarked
      };
    }

    return JSON.stringify(data, null, 2);
  }

  private static exportAsMarkdown(conversation: Conversation, options: ExportOptions): string {
    let markdown = `# ${conversation.title}\n\n`;

    if (options.includeMetadata) {
      markdown += `**Created:** ${this.formatDate(conversation.createdAt)}\n`;
      markdown += `**Model:** ${conversation.model}\n`;
      markdown += `**Personality:** ${conversation.personality}\n`;
      if (conversation.tags && conversation.tags.length > 0) {
        markdown += `**Tags:** ${conversation.tags.join(', ')}\n`;
      }
      markdown += '\n---\n\n';
    }

    conversation.messages.forEach((message, index) => {
      const role = message.role === 'user' ? '👤 **You**' : '🤖 **AI Assistant**';
      markdown += `${role}:\n\n${message.content}\n\n`;
      
      if (index < conversation.messages.length - 1) {
        markdown += '---\n\n';
      }
    });

    return markdown;
  }

  private static exportAsText(conversation: Conversation, options: ExportOptions): string {
    let text = `${conversation.title}\n`;
    text += '='.repeat(conversation.title.length) + '\n\n';

    if (options.includeMetadata) {
      text += `Created: ${this.formatDate(conversation.createdAt)}\n`;
      text += `Model: ${conversation.model}\n`;
      text += `Personality: ${conversation.personality}\n`;
      if (conversation.tags && conversation.tags.length > 0) {
        text += `Tags: ${conversation.tags.join(', ')}\n`;
      }
      text += '\n' + '-'.repeat(50) + '\n\n';
    }

    conversation.messages.forEach((message, index) => {
      const role = message.role === 'user' ? 'You' : 'AI Assistant';
      text += `${role}: ${message.content}\n\n`;
    });

    return text;
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(() => false);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve(successful);
      } catch (err) {
        document.body.removeChild(textArea);
        return Promise.resolve(false);
      }
    }
  }

  static generateConversationSummary(messages: ChatMessage[], maxLength: number = 100): string {
    if (messages.length === 0) return 'Empty conversation';
    
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New conversation';
    
    return this.truncateText(firstUserMessage.content, maxLength);
  }

  static calculateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  static estimateReadingTime(text: string): number {
    // Average reading speed: 200 words per minute
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  }

  static searchInMessages(messages: ChatMessage[], query: string): ChatMessage[] {
    if (!query.trim()) return messages;
    
    const searchTerm = query.toLowerCase();
    return messages.filter(message => 
      message.content.toLowerCase().includes(searchTerm)
    );
  }

  static getMessageStats(messages: ChatMessage[]): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    totalTokens: number;
    estimatedReadingTime: number;
  } {
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;
    const totalText = messages.map(m => m.content).join(' ');
    
    return {
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      totalTokens: this.calculateTokenCount(totalText),
      estimatedReadingTime: this.estimateReadingTime(totalText)
    };
  }
}