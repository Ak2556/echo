'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function HomePage() {
  useEffect(() => {
    // Add show class to feature cards on mount for animation
    setTimeout(() => {
      document.querySelectorAll('.feature-card').forEach(card => {
        card.classList.add('show');
      });
    }, 100);
  }, []);

  return (
    <section id="home" data-route="home" className="active">
      <div className="container">
        <div className="hero">
          {/* Parallax container for hero (empty; dotted global background handles aesthetics) */}
          <div className="parallax-bg" aria-hidden="true"></div>
          <h1>Connect. Share. Discover.</h1>
          <p>Experience a new way to engage with your community. Real-time interactions, curated content, and meaningful connections.</p>
          <div className="cta-btns">
            <a href="#/discover" className="btn">Get Started</a>
            <a href="#/feed" className="btn secondary">Explore Feed</a>
          </div>
        </div>

        {/* Features */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" style={{textAlign:'center',marginBottom:'2rem'}}>Features</h2>
          <div className="features-grid">
            <div className="glass feature-card tilt-card"
                 onClick={() => window.location.hash = '#/feed'}
                 style={{ cursor: 'pointer' }}>
              <div className="feature-icon" style={{fontSize:'3rem',marginBottom:'1rem',textAlign:'center'}}>📰</div>
              <h3>Smart Feed</h3>
              <p>AI-powered content curation that learns from your interests. Discover posts, stories, and updates from people and topics you care about most.</p>
              <div className="feature-highlight" style={{marginTop:'1rem',padding:'0.5rem',background:'rgba(var(--accent-rgb),0.1)',borderRadius:'8px',fontSize:'0.85rem'}}>
                ✨ Personalized recommendations • Real-time updates • Zero spam
              </div>
            </div>
            <div className="glass feature-card tilt-card"
                 onClick={() => window.location.hash = '#/discover'}
                 style={{ cursor: 'pointer' }}>
              <div className="feature-icon" style={{fontSize:'3rem',marginBottom:'1rem',textAlign:'center'}}>🔍</div>
              <h3>Discover & Connect</h3>
              <p>Find amazing creators, join communities, and explore trending topics across technology, culture, food, travel, and more.</p>
              <div className="feature-highlight" style={{marginTop:'1rem',padding:'0.5rem',background:'rgba(var(--accent-rgb),0.1)',borderRadius:'8px',fontSize:'0.85rem'}}>
                🌟 Creator spotlight • Community groups • Trending hashtags
              </div>
            </div>
            <div className="glass feature-card tilt-card"
                 onClick={() => window.location.hash = '#/live'}
                 style={{ cursor: 'pointer' }}>
              <div className="feature-icon" style={{fontSize:'3rem',marginBottom:'1rem',textAlign:'center'}}>🎥</div>
              <h3>Live Experiences</h3>
              <p>Join live sessions, workshops, and events. Chat with hosts in real-time, participate in Q&As, and be part of interactive experiences.</p>
              <div className="feature-highlight" style={{marginTop:'1rem',padding:'0.5rem',background:'rgba(var(--accent-rgb),0.1)',borderRadius:'8px',fontSize:'0.85rem'}}>
                🔴 Live streaming • Interactive chat • Event notifications
              </div>
            </div>
            <div className="glass feature-card tilt-card"
                 onClick={() => window.location.hash = '#/messages'}
                 style={{ cursor: 'pointer' }}>
              <div className="feature-icon" style={{fontSize:'3rem',marginBottom:'1rem',textAlign:'center'}}>💬</div>
              <h3>Secure Messaging</h3>
              <p>Connect privately with friends, colleagues, and new connections. Share photos, videos, and thoughts in secure, encrypted conversations.</p>
              <div className="feature-highlight" style={{marginTop:'1rem',padding:'0.5rem',background:'rgba(var(--accent-rgb),0.1)',borderRadius:'8px',fontSize:'0.85rem'}}>
                🔒 End-to-end encryption • Media sharing • Group chats
              </div>
            </div>
            <div className="glass feature-card tilt-card"
                 onClick={() => {
                   const aiChat = document.querySelector('.ai-chat-widget') as HTMLElement;
                   if (aiChat) {
                     aiChat.style.display = aiChat.style.display === 'none' ? 'flex' : 'flex';
                   }
                 }}
                 style={{ cursor: 'pointer' }}>
              <div className="feature-icon" style={{fontSize:'3rem',marginBottom:'1rem',textAlign:'center'}}>🤖</div>
              <h3>AI Assistant</h3>
              <p>Get help, answers, and creative inspiration from our intelligent AI companion. Ask questions, get recommendations, or just have a conversation.</p>
              <div className="feature-highlight" style={{marginTop:'1rem',padding:'0.5rem',background:'rgba(var(--accent-rgb),0.1)',borderRadius:'8px',fontSize:'0.85rem'}}>
                💭 Smart conversations • Instant help • Creative support
              </div>
            </div>
            <div className="glass feature-card tilt-card"
                 onClick={() => {
                   window.location.hash = '#/feed';
                   setTimeout(() => {
                     const createPostButton = document.querySelector('.create-post-button') as HTMLElement;
                     if (createPostButton) {
                       createPostButton.click();
                     }
                   }, 500);
                 }}
                 style={{ cursor: 'pointer' }}>
              <div className="feature-icon" style={{fontSize:'3rem',marginBottom:'1rem',textAlign:'center'}}>🎨</div>
              <h3>Rich Content Creation</h3>
              <p>Share your story with photos, videos, carousels, and rich text formatting. Express yourself with a full suite of creative tools.</p>
              <div className="feature-highlight" style={{marginTop:'1rem',padding:'0.5rem',background:'rgba(var(--accent-rgb),0.1)',borderRadius:'8px',fontSize:'0.85rem'}}>
                📸 Media uploads • Text formatting • Story templates
              </div>
            </div>
          </div>
        </section>

        {/* Trending Topics */}
        <section aria-labelledby="trending-heading" className="trending-section">
          <h2 id="trending-heading" style={{textAlign:'center',marginTop:'3rem',marginBottom:'2rem'}}>Trending Now</h2>
          <div className="trending-grid">
            <div className="glass trending-card tilt-card"
                 onClick={() => {
                   window.location.hash = '#/feed';
                   alert('Showing posts tagged with #TechInnovation');
                 }}
                 style={{ cursor: 'pointer' }}>
              <div className="trending-icon">🚀</div>
              <h3>#TechInnovation</h3>
              <p>45.2K posts • AI startups and breakthrough technologies dominating conversations</p>
            </div>
            <div className="glass trending-card tilt-card"
                 onClick={() => {
                   window.location.hash = '#/feed';
                   alert('Showing posts tagged with #FestivalSeason');
                 }}
                 style={{ cursor: 'pointer' }}>
              <div className="trending-icon">🎭</div>
              <h3>#FestivalSeason</h3>
              <p>32.8K posts • Navratri, Diwali preparations and cultural celebrations across India</p>
            </div>
            <div className="glass trending-card tilt-card"
                 onClick={() => {
                   window.location.hash = '#/feed';
                   alert('Showing posts tagged with #StreetFoodDiaries');
                 }}
                 style={{ cursor: 'pointer' }}>
              <div className="trending-icon">🍛</div>
              <h3>#StreetFoodDiaries</h3>
              <p>28.5K posts • Regional food discoveries and local cuisine recommendations</p>
            </div>
            <div className="glass trending-card tilt-card"
                 onClick={() => {
                   window.location.hash = '#/feed';
                   alert('Showing posts tagged with #StartupLife');
                 }}
                 style={{ cursor: 'pointer' }}>
              <div className="trending-icon">💼</div>
              <h3>#StartupLife</h3>
              <p>19.7K posts • Entrepreneurship journeys and business growth stories</p>
            </div>
          </div>
        </section>

        {/* Recent Community Activity */}
        <section aria-labelledby="activity-heading" className="activity-section">
          <h2 id="activity-heading" style={{textAlign:'center',marginTop:'3rem',marginBottom:'2rem'}}>Community Highlights</h2>
          <div className="activity-grid">
            <div className="glass activity-card">
              <div className="activity-header">
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya&backgroundColor=b6e3f4&eyes=happy&mouth=smile" alt="Kavya" className="activity-avatar" width={32} height={32} />
                <div>
                  <h4>Kavya Menon</h4>
                  <span>2 hours ago</span>
                </div>
              </div>
              <p>&quot;Just launched my sustainable fashion startup! From sketches to reality - 2 years of hard work paying off 🌱👗 #SustainableFashion #MadeInIndia&quot;</p>
              <div className="activity-stats">
                <span>❤️ 1.2K</span>
                <span>💬 89</span>
                <span>🔄 156</span>
              </div>
            </div>
            <div className="glass activity-card">
              <div className="activity-header">
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dev&backgroundColor=c0aede&eyes=default&mouth=smile" alt="Dev" className="activity-avatar" width={32} height={32} />
                <div>
                  <h4>Dev Patel</h4>
                  <span>5 hours ago</span>
                </div>
              </div>
              <p>&quot;My grandmother&apos;s 90th birthday celebration was magical ✨ 4 generations, endless stories, and the best homemade food ever. Family is everything 👴🏽❤️&quot;</p>
              <div className="activity-stats">
                <span>❤️ 2.8K</span>
                <span>💬 234</span>
                <span>🔄 189</span>
              </div>
            </div>
            <div className="glass activity-card">
              <div className="activity-header">
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&backgroundColor=ffd5dc&eyes=wink&mouth=smile" alt="Ananya" className="activity-avatar" width={32} height={32} />
                <div>
                  <h4>Ananya Iyer</h4>
                  <span>8 hours ago</span>
                </div>
              </div>
              <p>&quot;Monsoon trek to Lonavala was absolutely worth it! 🌧️⛰️ Sometimes you need to get lost in nature to find yourself. Weekend well spent 🥾&quot;</p>
              <div className="activity-stats">
                <span>❤️ 956</span>
                <span>💬 67</span>
                <span>🔄 112</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Events Preview */}
        <section aria-labelledby="live-heading" className="live-section">
          <h2 id="live-heading" style={{textAlign:'center',marginTop:'3rem',marginBottom:'2rem'}}>Live Now</h2>
          <div className="live-grid">
            <div className="glass live-card">
              <div className="live-badge">🔴 LIVE</div>
              <div className="live-content">
                <h4>Tech Talk: Future of AI in India</h4>
                <p>Radhika Mehta • 2.3K viewers</p>
                <div className="live-tags">
                  <span>#AI</span>
                  <span>#Technology</span>
                  <span>#Innovation</span>
                </div>
              </div>
            </div>
            <div className="glass live-card">
              <div className="live-badge">🔴 LIVE</div>
              <div className="live-content">
                <h4>Cooking with Mom: Authentic Gujarati Thali</h4>
                <p>Priya Shah • 1.8K viewers</p>
                <div className="live-tags">
                  <span>#Cooking</span>
                  <span>#GujaratiFood</span>
                  <span>#Family</span>
                </div>
              </div>
            </div>
            <div className="glass live-card">
              <div className="live-badge">🔴 LIVE</div>
              <div className="live-content">
                <h4>Weekend Jam Session</h4>
                <p>The Bangalore Collective • 945 viewers</p>
                <div className="live-tags">
                  <span>#Music</span>
                  <span>#IndieMusic</span>
                  <span>#Bangalore</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights / Stats */}
        <section aria-labelledby="highlights-heading" className="highlights">
          <h2 id="highlights-heading" style={{textAlign:'center',marginTop:'3rem',marginBottom:'2rem'}}>Why Echo?</h2>
          <div className="highlights-grid">
            <div className="glass highlight-card tilt-card">
              {/* Animated count will update this number from 0 to target */}
              <h3 data-count="500000" data-plus="true">500K+</h3>
              <p>Active members engaging daily</p>
            </div>
            <div className="glass highlight-card tilt-card">
              <h3 data-count="1000000" data-plus="true">1M+</h3>
              <p>Posts shared and growing</p>
            </div>
            <div className="glass highlight-card tilt-card">
              {/* Third stat remains static as it conveys a non-numeric concept */}
              <h3>24/7</h3>
              <p>Live sessions across the globe</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}