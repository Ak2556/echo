const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
// API key is now handled securely on the server-side only

export interface ChatMessage {
  content: string;
  role: string;
  image_url?: string;
  image_prompt?: string;
  type?: 'text' | 'image';
}

export interface AISettings {
  model: string;
  personality: string;
  temperature: number;
  maxTokens: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
}

export interface Post {
  id: string;
  content: string;
  author: string;
  tags: string[];
  timestamp: string;
  likes: number;
}

export interface PostCreate {
  content: string;
  author: string;
  tags?: string[];
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text}`);
      }
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        throw new Error('Service is currently offline. Please try again later.');
      }
      throw error;
    }
  }

  async chat(message: ChatMessage, conversationHistory?: ChatMessage[], settings?: AISettings, language?: string): Promise<{ response: string; image_url?: string; image_prompt?: string; type?: string }> {
    try {

      // Use the secure backend API route
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.content,
          model: settings?.model || 'anthropic/claude-3-haiku',
          temperature: settings?.temperature || 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        throw new Error(errorData.error || `Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        response: data.response,
        type: data.type || 'text'
      };
    } catch (error) {

      // Fallback to mock response when server is not available
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
        return this.getContextualMockResponse(message.content, conversationHistory || [], settings);
      }

      return {
        response: `Sorry, I'm having trouble connecting to the AI service. ${error instanceof Error ? error.message : 'Please try again later.'}`,
        type: 'error'
      };
    }
  }

  private getContextualMockResponse(userMessage: string, conversationHistory: ChatMessage[], settings?: AISettings): Promise<{ response: string; image_url?: string; type?: string }> {
    const lowerMessage = userMessage.toLowerCase();

    // Advanced context analysis
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentTime = new Date();
    const timeOfDay = this.getTimeOfDay(currentTime);
    const isOnFeed = currentPath.includes('feed') || window.location.hash.includes('feed');
    const isOnHome = currentPath === '/' || window.location.hash.includes('home') || currentPath.includes('home');
    const isOnMessages = currentPath.includes('messages') || window.location.hash.includes('messages');
    const isOnDiscover = window.location.hash.includes('discover');
    const isOnLive = window.location.hash.includes('live');

    // Deep conversation analysis
    const conversationContext = this.analyzeConversationContext(conversationHistory);
    const userPreferences = this.inferUserPreferences(conversationHistory);
    const conversationTone = this.detectConversationTone(conversationHistory);
    const userIntent = this.analyzeUserIntent(userMessage);
    const emotionalContext = this.detectEmotionalContext(userMessage);

    // Track conversation state
    const hasDiscussedEcho = conversationHistory.some(msg =>
      msg.content.toLowerCase().includes('echo') ||
      msg.role === 'assistant' && msg.content.toLowerCase().includes('echo')
    );
    const hasAskedAboutFeatures = conversationHistory.some(msg =>
      msg.content.toLowerCase().includes('feature') ||
      msg.content.toLowerCase().includes('help') ||
      msg.role === 'assistant' && (msg.content.includes('help') || msg.content.includes('feature'))
    );

    // Check for image generation requests first
    const imageKeywords = ['generate image', 'create image', 'draw', 'picture', 'generate picture', 'make image', 'image of', 'picture of'];
    const isImageRequest = imageKeywords.some(keyword => lowerMessage.includes(keyword));

    if (isImageRequest) {
      // Mock image generation response
      const mockImageResponses = [
        "I'd love to generate that image for you! However, I'm currently running in offline mode. When connected to the server, I can create amazing images using AI. Try refreshing and connecting to enable image generation! 🎨",
        "That sounds like a great image idea! Unfortunately, I need to be connected to the image generation service to create visuals for you. Please check your connection and try again! 🖼️",
        "I can definitely help with image generation when I'm connected to the server! Right now I'm in offline mode, but once connected, I can create beautiful AI-generated images for you. ✨"
      ];
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            response: mockImageResponses[Math.floor(Math.random() * mockImageResponses.length)],
            type: 'text'
          });
        }, 800 + Math.random() * 1200);
      });
    }

    // Generate intelligent response using all analysis
    let response = `I understand you're asking about "${userMessage}". Based on our conversation context (${conversationContext}) and your intent (${userIntent}), I'm here to help with your ${emotionalContext} inquiry.`;

    // Echo platform questions
    if (lowerMessage.includes('echo') && !hasDiscussedEcho) {
      response = `Echo is your social hub for authentic connections! 🌟 We're built around real conversations, not just likes. You can share stories, discover amazing creators, join live sessions, and connect through secure messaging. Think of it as where meaningful social interaction happens. What interests you most about social platforms?`;
    }

    // Feature-specific help based on current page
    else if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('how do')) {
      if (isOnFeed) {
        response = `Great question! On the feed, you can discover personalized content from people you follow and trending topics. Each post shows real engagement - likes, comments, shares. You can interact with posts, share your own content with photos/videos, and use hashtags to join conversations. Want me to walk you through creating your first post?`;
      } else if (isOnHome) {
        response = `From the homepage, you can explore everything Echo offers! Navigate to Feed for personalized content, Discover to find new creators, Live for real-time events, Messages for private chats, or check out trending topics. The AI assistant (that's me!) is always here to help. Where would you like to start exploring?`;
      } else if (isOnMessages) {
        response = `In Messages, you can have private conversations with friends and creators! Send text, photos, videos - all encrypted for your privacy. You can search conversations, see who's online, and manage group chats. Need help starting a conversation with someone?`;
      } else if (isOnDiscover) {
        response = `Discovery is where you find amazing new content and creators! Browse by categories like tech, food, travel, art. Follow hashtags that interest you, check out trending creators, and join communities. It's designed to help you find your tribe on Echo. What topics are you passionate about?`;
      } else {
        response = `Echo has so many features! Smart feeds, live streaming, secure messaging, content discovery, and AI assistance. Each section is designed for different needs - would you like me to explain any specific area?`;
      }
    }

    // Help requests
    else if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('how to')) {
      if (isOnFeed && !hasAskedAboutFeatures) {
        response = `I'm here to help! 🤝 On the feed, you can scroll through posts, like them with ❤️, comment to join discussions, or share interesting content. To create your own post, look for the "What's on your mind?" box at the top. You can add photos, videos, or just share your thoughts. What would you like to try first?`;
      } else {
        response = `I'm here to help with anything! 🤝 I can explain Echo's features, help you navigate the platform, suggest ways to connect with others, or just have a conversation. I understand context from our chat and what page you're on. What specific thing can I help you with?`;
      }
    }

    // Social/connection questions
    else if (lowerMessage.includes('friend') || lowerMessage.includes('connect') || lowerMessage.includes('follow')) {
      response = `Building connections on Echo is what it's all about! 🤝 You can follow creators you admire, join conversations through comments, send direct messages, or participate in live sessions. The key is authentic engagement - comment meaningfully, share interesting content, and be genuine. Quality connections matter more than quantity. Want tips on finding people with similar interests?`;
    }

    // Content creation questions
    else if (lowerMessage.includes('post') || lowerMessage.includes('share') || lowerMessage.includes('content')) {
      response = `Content creation on Echo is fun and flexible! 📝 You can share text posts, photos, videos, or carousel galleries. Use hashtags to join conversations, tag locations, and write authentic captions. The community loves genuine stories, helpful tips, beautiful photos, and thoughtful perspectives. What kind of content are you thinking of sharing?`;
    }

    // Privacy/security questions
    else if (lowerMessage.includes('private') || lowerMessage.includes('secure') || lowerMessage.includes('safe')) {
      response = `Your privacy and security are super important on Echo! 🔒 Messages are end-to-end encrypted, you control who can message you, and you can make your profile private. We don't sell your data or show you invasive ads. You can block users, report inappropriate content, and manage your visibility. Feel safe to be yourself here!`;
    }

    // Gratitude responses
    else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      const responses = [
        "You're so welcome! 😊 Happy to help anytime. Is there anything else you'd like to know?",
        "My pleasure! That's what I'm here for. Feel free to ask me anything else about Echo or just chat!",
        "Glad I could help! 🌟 I'm always here if you need assistance or want to explore more features."
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    // Contextual follow-ups based on conversation history
    else if (hasDiscussedEcho && (lowerMessage.includes('more') || lowerMessage.includes('tell me'))) {
      response = `Since we've talked about Echo, let me share something cool! 🚀 The platform uses AI to curate your feed (that's not me, that's a different AI!), supports live streaming with real-time chat, and has mini-apps built right in. Plus, the community is growing with amazing creators from India and beyond. What aspect interests you most?`;
    }

    // Default contextual responses
    else {
      const contextResponses = [
        `That's a great point! ${isOnFeed ? 'I notice you\'re browsing the feed - ' : isOnHome ? 'From the homepage, ' : ''}what else would you like to explore or discuss?`,
        `Interesting perspective! ${conversationHistory.length > 2 ? 'Based on our conversation, ' : ''}I think you might enjoy discovering more about how Echo connects people. What draws you to social platforms?`,
        `I love that question! ${isOnMessages ? 'Since you\'re in the messages section, ' : ''}have you thought about how technology shapes the way we communicate?`,
        `That makes me think! You seem curious about ${hasDiscussedEcho ? 'diving deeper into platform features' : 'exploring new ideas'}. What's got your attention lately?`
      ];
      response = contextResponses[Math.floor(Math.random() * contextResponses.length)];
    }

    // Simulate realistic response delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ response, type: 'text' });
      }, 800 + Math.random() * 1200);
    });
  }

  // Advanced AI Intelligence Methods
  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private analyzeConversationContext(history: ChatMessage[]): Record<string, unknown> {
    const topics = new Set<string>();
    const entities = new Set<string>();
    const keywords = new Set<string>();

    history.forEach(msg => {
      const content = msg.content.toLowerCase();

      // Topic detection
      if (content.includes('tech') || content.includes('technology') || content.includes('ai') || content.includes('coding')) topics.add('technology');
      if (content.includes('food') || content.includes('cooking') || content.includes('recipe') || content.includes('restaurant')) topics.add('food');
      if (content.includes('travel') || content.includes('trip') || content.includes('vacation') || content.includes('place')) topics.add('travel');
      if (content.includes('music') || content.includes('song') || content.includes('artist') || content.includes('concert')) topics.add('music');
      if (content.includes('sport') || content.includes('game') || content.includes('team') || content.includes('player')) topics.add('sports');
      if (content.includes('movie') || content.includes('film') || content.includes('show') || content.includes('series')) topics.add('entertainment');
      if (content.includes('work') || content.includes('job') || content.includes('career') || content.includes('business')) topics.add('work');
      if (content.includes('health') || content.includes('fitness') || content.includes('exercise') || content.includes('wellness')) topics.add('health');

      // Entity extraction (simple patterns)
      const words = content.split(' ');
      words.forEach(word => {
        if (word.length > 3 && !['this', 'that', 'with', 'have', 'will', 'been', 'were', 'they', 'them', 'what', 'when', 'where', 'which', 'would'].includes(word)) {
          keywords.add(word);
        }
      });
    });

    return { topics: Array.from(topics), entities: Array.from(entities), keywords: Array.from(keywords) };
  }

  private inferUserPreferences(history: ChatMessage[]): Record<string, unknown> {
    const preferences = {
      communicationStyle: 'balanced', // casual, formal, balanced
      interestLevel: 'moderate', // low, moderate, high
      technicalLevel: 'intermediate', // beginner, intermediate, advanced
      responseLength: 'medium', // short, medium, long
      topics: [] as string[]
    };

    const userMessages = history.filter(msg => msg.role === 'user');

    if (userMessages.length === 0) return preferences;

    // Analyze communication style
    const casualIndicators = userMessages.filter(msg =>
      msg.content.toLowerCase().includes('hey') ||
      msg.content.toLowerCase().includes('yeah') ||
      msg.content.includes('!') ||
      msg.content.includes('lol') ||
      msg.content.includes('😊') ||
      msg.content.includes('👍')
    ).length;

    const formalIndicators = userMessages.filter(msg =>
      msg.content.includes('please') ||
      msg.content.includes('thank you') ||
      msg.content.includes('could you') ||
      msg.content.includes('would you')
    ).length;

    if (casualIndicators > formalIndicators) preferences.communicationStyle = 'casual';
    else if (formalIndicators > casualIndicators) preferences.communicationStyle = 'formal';

    // Analyze technical level
    const technicalTerms = userMessages.filter(msg =>
      msg.content.toLowerCase().includes('api') ||
      msg.content.toLowerCase().includes('code') ||
      msg.content.toLowerCase().includes('algorithm') ||
      msg.content.toLowerCase().includes('database') ||
      msg.content.toLowerCase().includes('framework')
    ).length;

    if (technicalTerms > 2) preferences.technicalLevel = 'advanced';
    else if (technicalTerms > 0) preferences.technicalLevel = 'intermediate';

    return preferences;
  }

  private detectConversationTone(history: ChatMessage[]): string {
    const recentMessages = history.slice(-4);
    let positiveCount = 0;
    let negativeCount = 0;
    let questionCount = 0;

    recentMessages.forEach(msg => {
      const content = msg.content.toLowerCase();

      // Positive indicators
      if (content.includes('great') || content.includes('awesome') || content.includes('thanks') ||
          content.includes('good') || content.includes('excellent') || content.includes('perfect') ||
          content.includes('😊') || content.includes('👍') || content.includes('❤️')) {
        positiveCount++;
      }

      // Negative indicators
      if (content.includes('problem') || content.includes('issue') || content.includes('error') ||
          content.includes('wrong') || content.includes('bad') || content.includes('difficult') ||
          content.includes('confused') || content.includes('help')) {
        negativeCount++;
      }

      // Question indicators
      if (content.includes('?') || content.includes('how') || content.includes('what') ||
          content.includes('why') || content.includes('when') || content.includes('where')) {
        questionCount++;
      }
    });

    if (negativeCount > positiveCount) return 'supportive';
    if (questionCount > 2) return 'educational';
    if (positiveCount > 0) return 'enthusiastic';
    return 'neutral';
  }

  private analyzeUserIntent(message: string): string {
    const lower = message.toLowerCase();

    // Intent classification
    if (lower.includes('how') || lower.includes('explain') || lower.includes('what is') || lower.includes('tell me about')) {
      return 'information_seeking';
    }
    if (lower.includes('help') || lower.includes('stuck') || lower.includes('problem') || lower.includes('issue')) {
      return 'help_seeking';
    }
    if (lower.includes('create') || lower.includes('make') || lower.includes('build') || lower.includes('generate')) {
      return 'creation_request';
    }
    if (lower.includes('compare') || lower.includes('difference') || lower.includes('better') || lower.includes('vs')) {
      return 'comparison_request';
    }
    if (lower.includes('opinion') || lower.includes('think') || lower.includes('feel') || lower.includes('recommend')) {
      return 'opinion_seeking';
    }
    if (lower.includes('step') || lower.includes('guide') || lower.includes('tutorial') || lower.includes('process')) {
      return 'procedural_request';
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('thanks')) {
      return 'social_interaction';
    }

    return 'general_inquiry';
  }

  private detectEmotionalContext(message: string): string {
    const lower = message.toLowerCase();

    // Emotional indicators
    if (lower.includes('excited') || lower.includes('amazing') || lower.includes('awesome') ||
        lower.includes('😊') || lower.includes('🎉') || lower.includes('❤️')) {
      return 'positive';
    }
    if (lower.includes('frustrated') || lower.includes('confused') || lower.includes('difficult') ||
        lower.includes('annoying') || lower.includes('😞') || lower.includes('😤')) {
      return 'negative';
    }
    if (lower.includes('curious') || lower.includes('interested') || lower.includes('wondering')) {
      return 'curious';
    }
    if (lower.includes('urgent') || lower.includes('quickly') || lower.includes('asap') || lower.includes('emergency')) {
      return 'urgent';
    }

    return 'neutral';
  }

  // TODO: Implement intelligent response generation
  /* private generateIntelligentResponse(
    _userMessage: string,
    _lowerMessage: string,
    _conversationContext: Record<string, unknown>,
    _userPreferences: Record<string, unknown>,
    _conversationTone: string,
    _userIntent: string,
    _emotionalContext: string,
    _timeOfDay: string,
    _pageContext: Record<string, unknown>,
    _conversationHistory: ChatMessage[]
  ): string {
    // Generate a contextual response based on all the analyzed parameters
    const responses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're looking for. Here's what I can tell you:",
      "Great question! Based on what you've shared, I think you'd be interested to know:",
      "Thanks for asking! Let me provide some helpful information:",
      "I'm here to help! Here's what I can share about that:"
    ];

    // Return a random response for now - this could be made more sophisticated
    return responses[Math.floor(Math.random() * responses.length)];
  } */

  async getPosts(): Promise<{ posts: Post[] }> {
    return this.request('/api/posts');
  }

  async createPost(post: PostCreate): Promise<Post> {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async healthCheck(): Promise<{ message: string }> {
    return this.request('/');
  }

  async getAvailableModels(): Promise<{ models: AIModel[] }> {
    try {
      return await this.request('/api/ai/models');
    } catch (error) {
      // Fallback models when API is offline
      return {
        models: [
          { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku (Fast)", description: "Quick and efficient responses" },
        ]
      };
    }
  }

  async getAvailablePersonalities(): Promise<{ personalities: AIPersonality[] }> {
    try {
      return await this.request('/api/ai/personalities');
    } catch (error) {
      // Fallback personalities when API is offline
      return {
        personalities: [
          { id: "helpful", name: "Helpful", description: "Supportive and informative" },
          { id: "casual", name: "Casual", description: "Laid-back and friendly" },
          { id: "professional", name: "Professional", description: "Clear and structured" },
          { id: "creative", name: "Creative", description: "Imaginative and enthusiastic" },
          { id: "technical", name: "Technical", description: "Detailed and precise" }
        ]
      };
    }
  }
}

export const apiService = new ApiService();