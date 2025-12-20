# 3D Components

This directory contains Three.js-powered 3D components for the Echo platform. From full product viewers to micro 3D elements that add subtle depth throughout your webapp.

---

## 🎨 Micro 3D Elements

### Micro3D

Lightweight 3D shapes perfect for UI enhancement - icons, badges, decorations.

**Features:**
- 7 built-in shapes (cube, sphere, torus, cone, cylinder, octahedron, dodecahedron)
- 5 animation types (rotate, float, pulse, bounce, spin)
- Customizable colors, materials, and opacity
- Minimal performance impact
- Responsive sizing

**Usage:**

```tsx
import Micro3D, {
  FloatingCube,
  SpinningSphere,
  PulsingTorus
} from '@/components/3d/Micro3D';

// Basic usage
<Micro3D
  shape="cube"
  color="#4dabf7"
  size={80}
  animation="rotate"
/>

// Preset components
<FloatingCube size={60} color="#51cf66" />
<SpinningSphere size={50} color="#ff6b6b" speed={2} />
<PulsingTorus size={70} color="#ffd43b" />

// Custom wireframe
<Micro3D
  shape="octahedron"
  wireframe
  color="#845ef7"
  animation="spin"
  metalness={0.8}
/>
```

**Props:**
- `shape`: cube | sphere | torus | cone | cylinder | octahedron | dodecahedron
- `color`: Hex color string (default: '#4dabf7')
- `size`: Number in pixels (default: 80)
- `animation`: rotate | float | pulse | bounce | spin | none (default: 'rotate')
- `speed`: Animation speed multiplier (default: 1)
- `wireframe`: Boolean (default: false)
- `metalness`: 0-1 (default: 0.5)
- `roughness`: 0-1 (default: 0.5)
- `opacity`: 0-1 (default: 1)

---

### HoverCard3D

Adds 3D tilt effect to cards on hover - perfect for product cards, feature cards, profile cards.

**Features:**
- Realistic 3D tilt based on mouse position
- Optional glow effect
- Smooth transitions
- Configurable intensity
- Works with any content

**Usage:**

```tsx
import HoverCard3D from '@/components/3d/HoverCard3D';

<HoverCard3D
  intensity={15}
  glowColor="rgba(77, 171, 247, 0.3)"
  enableGlow={true}
>
  <div style={{
    padding: '2rem',
    background: 'white',
    borderRadius: '12px'
  }}>
    <h3>Your Card Content</h3>
    <p>Hover to see the 3D effect!</p>
  </div>
</HoverCard3D>
```

**Props:**
- `intensity`: Rotation angle in degrees (default: 15)
- `perspective`: Perspective distance (default: 1000)
- `glowColor`: RGBA color for glow effect
- `enableGlow`: Boolean (default: true)

---

### FloatingShapes

Animated background 3D shapes - perfect for hero sections, feature sections.

**Features:**
- Multiple floating shapes with physics
- Customizable colors, count, and speed
- Auto-boundary detection and bouncing
- Performance optimized
- Non-interactive (pointer-events: none)

**Usage:**

```tsx
import FloatingShapes from '@/components/3d/FloatingShapes';

// As a background
<div style={{ position: 'relative', minHeight: '100vh' }}>
  <FloatingShapes
    count={20}
    colors={['#4dabf7', '#51cf66', '#ff6b6b', '#ffd43b']}
    speed={0.5}
    opacity={0.6}
  />

  <div style={{ position: 'relative', zIndex: 1 }}>
    <h1>Your Content Here</h1>
  </div>
</div>
```

**Props:**
- `count`: Number of shapes (default: 20)
- `colors`: Array of hex colors
- `speed`: Animation speed multiplier (default: 0.5)
- `size`: Shape size (default: 0.3)
- `opacity`: Shape opacity 0-1 (default: 0.6)

---

## 🛍️ ProductViewer3D

An interactive 3D product viewer component with rotation, zoom, and pan controls.

### Features

- **Interactive Controls**: Drag to rotate, scroll to zoom
- **Auto-rotation**: Optional automatic rotation
- **Touch Support**: Full mobile/tablet touch support
- **Responsive**: Adapts to any container size
- **Customizable**: Configurable colors, dimensions, and controls

### Basic Usage

```tsx
import ProductViewer3D from '@/components/3d/ProductViewer3D';

function ProductPage() {
  return (
    <div>
      <h1>My Product</h1>
      <ProductViewer3D
        productColor="#4dabf7"
        width="600px"
        height="400px"
        autoRotate={true}
        showControls={true}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelUrl` | `string` | - | Optional URL to custom 3D model (GLTF/GLB format) |
| `productColor` | `string` | `'#4dabf7'` | Color of the product mesh |
| `width` | `number \| string` | `'100%'` | Container width |
| `height` | `number \| string` | `'400px'` | Container height |
| `autoRotate` | `boolean` | `true` | Enable automatic rotation |
| `showControls` | `boolean` | `true` | Show control buttons |

### Controls

- **Reset**: Reset camera position and rotation
- **Zoom In/Out**: Adjust camera distance
- **Auto-rotate Toggle**: Enable/disable automatic rotation
- **Drag**: Rotate the model manually
- **Scroll**: Zoom in/out (desktop)
- **Pinch**: Zoom in/out (mobile)

### Custom 3D Models

To use custom 3D models, export your models in GLTF or GLB format and pass the URL:

```tsx
<ProductViewer3D
  modelUrl="/models/my-product.glb"
  productColor="#ff6b6b"
/>
```

**Recommended Tools for 3D Models:**
- [Blender](https://www.blender.org/) (Free, open-source)
- [SketchUp](https://www.sketchup.com/)
- [Spline](https://spline.design/)

### Performance Tips

1. Keep model poly count under 50k triangles
2. Use compressed textures (WebP, KTX2)
3. Optimize lighting (fewer lights = better performance)
4. Consider using LOD (Level of Detail) for complex models

### Extending the Component

The component can be extended with:
- Custom geometries (spheres, cylinders, custom shapes)
- Material variations (glass, metal, wood textures)
- Animations and transitions
- Environment maps for realistic reflections
- Post-processing effects (bloom, SSAO)

### Future Enhancements

- [ ] GLTF/GLB model loader
- [ ] Environment map support
- [ ] Material presets (glass, metal, plastic)
- [ ] Screenshot/export functionality
- [ ] AR mode support (WebXR)

---

## 💡 Usage Ideas Throughout Your Webapp

### Navigation & Headers
```tsx
// Animated logo
<FloatingCube size={40} color="#4dabf7" speed={0.5} />

// Section icons
<SpinningSphere size={30} color="#51cf66" />
```

### Product Cards
```tsx
<HoverCard3D intensity={12} enableGlow>
  <ProductCard product={product} />
</HoverCard3D>
```

### Hero Sections
```tsx
<section style={{ position: 'relative', height: '100vh' }}>
  <FloatingShapes count={15} opacity={0.4} />
  <div style={{ position: 'relative', zIndex: 1 }}>
    <h1>Welcome to Echo</h1>
  </div>
</section>
```

### Loading States
```tsx
<PulsingTorus size={60} color="#845ef7" />
```

### Status Indicators
```tsx
// Success
<Micro3D shape="sphere" color="#51cf66" animation="pulse" size={24} />

// Loading
<Micro3D shape="torus" color="#4dabf7" animation="spin" size={24} />

// Error
<Micro3D shape="octahedron" color="#ff6b6b" animation="bounce" size={24} />
```

### Decorative Elements
```tsx
// Corners, section dividers, etc.
<Micro3D
  shape="dodecahedron"
  wireframe
  color="#845ef7"
  size={100}
  opacity={0.3}
/>
```

### Feature Cards
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
  {features.map(feature => (
    <HoverCard3D key={feature.id}>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <FloatingCube size={60} color={feature.color} />
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </div>
    </HoverCard3D>
  ))}
</div>
```

---

## ⚡ Performance Tips

1. **Limit Active Elements**: Don't render too many 3D elements at once (max 10-20 Micro3D elements visible)
2. **Use Opacity Wisely**: Lower opacity = less visual weight
3. **Reduce Geometry**: Simpler shapes = better performance
4. **Lazy Load**: Only render 3D elements when visible
5. **Disable on Mobile**: Consider disabling some effects on low-end devices

```tsx
const isMobile = window.innerWidth < 768;

{!isMobile && <FloatingShapes />}
```

---

## 🎨 Color Palette Suggestions

```tsx
// Echo Brand Colors
const brandColors = {
  primary: '#4dabf7',
  success: '#51cf66',
  warning: '#ffd43b',
  danger: '#ff6b6b',
  purple: '#845ef7',
};

// Pastel Theme
const pastelColors = ['#a8dadc', '#f1faee', '#e63946', '#457b9d', '#1d3557'];

// Neon Theme
const neonColors = ['#00ff88', '#00aaff', '#ff00ff', '#ffff00', '#ff0055'];

// Monochrome
const monoColors = ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080'];
```
