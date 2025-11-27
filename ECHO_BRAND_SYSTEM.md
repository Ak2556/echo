# Echo Brand Visual Identity System

## 1. Brand Philosophy

**Echo** is about amplifying voices, creating resonance, and building connections that matter.

### Core Values
- **Clarity**: Clear communication without noise
- **Resonance**: Ideas that echo and amplify
- **Connection**: Building meaningful relationships
- **Motion**: Dynamic, alive, evolving

---

## 2. Visual Identity

### Brand Colors

#### Primary Palette - "Echo Wave"
```css
--echo-primary: #0066FF;        /* Vibrant Blue - Energy & Trust */
--echo-primary-light: #3385FF;  /* Lighter wave */
--echo-primary-dark: #0052CC;   /* Deeper resonance */
--echo-accent: #00D9FF;          /* Cyan - Innovation & Clarity */
--echo-accent-glow: #00FFFF;     /* Glow effect */
```

#### Secondary Palette - "Resonance"
```css
--echo-purple: #7C3AED;          /* Voice & Creativity */
--echo-pink: #EC4899;            /* Passion & Energy */
--echo-gradient-primary: linear-gradient(135deg, #0066FF 0%, #00D9FF 100%);
--echo-gradient-accent: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
--echo-gradient-hero: linear-gradient(135deg, #0066FF 0%, #7C3AED 50%, #EC4899 100%);
```

#### Neutral Palette - "Space"
```css
/* Light Mode */
--echo-bg-primary: #FFFFFF;
--echo-bg-secondary: #F8FAFC;
--echo-bg-tertiary: #F1F5F9;
--echo-text-primary: #0F172A;
--echo-text-secondary: #475569;
--echo-text-tertiary: #94A3B8;

/* Dark Mode */
--echo-bg-primary-dark: #0A0E1A;
--echo-bg-secondary-dark: #111827;
--echo-bg-tertiary-dark: #1F2937;
--echo-text-primary-dark: #F8FAFC;
--echo-text-secondary-dark: #CBD5E1;
--echo-text-tertiary-dark: #64748B;
```

### Typography Scale

```css
--echo-font-display: 'Inter', -apple-system, system-ui, sans-serif;
--echo-font-body: 'Inter', -apple-system, system-ui, sans-serif;
--echo-font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Type Scale - Fluid Typography */
--echo-text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--echo-text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--echo-text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--echo-text-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);
--echo-text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
--echo-text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem);
--echo-text-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem);
--echo-text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3rem);
--echo-text-5xl: clamp(3rem, 2.55rem + 2.25vw, 4rem);
```

### Spacing System - "Rhythm"

```css
/* Base: 4px unit */
--echo-space-0: 0;
--echo-space-1: 0.25rem;   /* 4px */
--echo-space-2: 0.5rem;    /* 8px */
--echo-space-3: 0.75rem;   /* 12px */
--echo-space-4: 1rem;      /* 16px */
--echo-space-5: 1.25rem;   /* 20px */
--echo-space-6: 1.5rem;    /* 24px */
--echo-space-8: 2rem;      /* 32px */
--echo-space-10: 2.5rem;   /* 40px */
--echo-space-12: 3rem;     /* 48px */
--echo-space-16: 4rem;     /* 64px */
--echo-space-20: 5rem;     /* 80px */
--echo-space-24: 6rem;     /* 96px */
--echo-space-32: 8rem;     /* 128px */
```

### Border Radius - "Softness"

```css
--echo-radius-sm: 0.375rem;   /* 6px - Subtle */
--echo-radius-md: 0.5rem;     /* 8px - Standard */
--echo-radius-lg: 0.75rem;    /* 12px - Cards */
--echo-radius-xl: 1rem;       /* 16px - Large elements */
--echo-radius-2xl: 1.5rem;    /* 24px - Hero sections */
--echo-radius-full: 9999px;   /* Pills & Avatars */
```

### Shadows - "Elevation"

```css
--echo-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--echo-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--echo-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--echo-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--echo-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--echo-shadow-glow: 0 0 20px rgba(0, 102, 255, 0.3);
--echo-shadow-glow-lg: 0 0 40px rgba(0, 102, 255, 0.4);
```

---

## 3. Animation Language - "Wave Motion"

### Principles
1. **Natural**: Follow physics - easing curves matter
2. **Purposeful**: Every animation has meaning
3. **Responsive**: Respect reduced-motion preferences
4. **Delightful**: Subtle surprises enhance experience

### Timing Functions

```css
--echo-ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);        /* Standard */
--echo-ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Playful */
--echo-ease-wave: cubic-bezier(0.25, 0.46, 0.45, 0.94);    /* Flowing */
--echo-ease-snap: cubic-bezier(0.4, 0.0, 0.6, 1);          /* Decisive */
```

### Duration Scale

```css
--echo-duration-instant: 100ms;   /* Micro-interactions */
--echo-duration-fast: 200ms;      /* Hovers, tooltips */
--echo-duration-normal: 300ms;    /* Standard transitions */
--echo-duration-slow: 500ms;      /* Page transitions */
--echo-duration-slower: 700ms;    /* Complex animations */
```

### Signature Animations

#### 1. **Wave Entrance** (Page Load)
```css
@keyframes echo-wave-in {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-5px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

#### 2. **Ripple Effect** (Interactions)
```css
@keyframes echo-ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 102, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 102, 255, 0);
  }
}
```

#### 3. **Float** (Hover States)
```css
@keyframes echo-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
```

#### 4. **Glow Pulse** (Active States)
```css
@keyframes echo-glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 102, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 102, 255, 0.6);
  }
}
```

#### 5. **Card Lift** (Hover on Cards)
```css
.echo-card {
  transition: all var(--echo-duration-fast) var(--echo-ease-smooth);
}

.echo-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--echo-shadow-xl);
}
```

---

## 4. Component Patterns

### Cards
- Border radius: `--echo-radius-lg` (12px)
- Padding: `--echo-space-6` (24px)
- Background: Glass effect with backdrop blur
- Hover: Lift 4px with shadow transition

### Buttons
- Primary: Gradient background with glow on hover
- Border radius: `--echo-radius-md` (8px)
- Padding: `--echo-space-4 --echo-space-6` (16px 24px)
- Animation: Ripple effect on click

### Inputs
- Border radius: `--echo-radius-md` (8px)
- Focus ring: 3px solid `--echo-accent` with glow
- Transition: Smooth border and shadow change

---

## 5. Layout Hierarchy

### Information Architecture
1. **Hero Section** (Top priority)
   - Large heading (text-5xl)
   - Single CTA
   - Breathing room: 32px margins

2. **Primary Content** (Main focus)
   - Clear section breaks (24px gap)
   - Maximum 3 items visible at once
   - Progressive disclosure

3. **Secondary Content** (Supporting)
   - Collapsible panels
   - Reduced opacity (70%)
   - Smaller typography

4. **Tertiary Content** (Context)
   - Hidden by default on mobile
   - Side panels
   - Minimal visual weight

### Spacing Rules
- **Section gaps**: Minimum 48px (`--echo-space-12`)
- **Card spacing**: 24px (`--echo-space-6`)
- **Content max-width**: 1280px
- **Reading width**: 65ch for text content

---

## 6. Glassmorphism Style

```css
.echo-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.echo-glass-dark {
  background: rgba(10, 14, 26, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}
```

---

## 7. Accessibility

### Contrast Ratios
- Primary text: Minimum 7:1 (AAA)
- Secondary text: Minimum 4.5:1 (AA)
- Interactive elements: Minimum 3:1

### Motion
- All animations disabled with `prefers-reduced-motion: reduce`
- Alternative static states provided
- No essential information conveyed through motion alone

### Touch Targets
- Minimum: 44px × 44px (WCAG 2.1 Level AA)
- Preferred: 48px × 48px

---

## Implementation Checklist

- [ ] Update CSS custom properties with Echo brand colors
- [ ] Implement wave-in animation for page loads
- [ ] Add ripple effect to interactive elements
- [ ] Reduce section density (increase spacing)
- [ ] Implement progressive disclosure for secondary content
- [ ] Add glass effect to cards and modals
- [ ] Create signature hover states with float animation
- [ ] Implement glow effects on primary CTAs
- [ ] Add loading states with wave pattern
- [ ] Test all animations with reduced-motion preference
