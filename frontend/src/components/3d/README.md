# 3D Components

This directory contains Three.js-powered 3D components for the Echo platform.

## ProductViewer3D

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
