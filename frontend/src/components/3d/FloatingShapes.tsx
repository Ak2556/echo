'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FloatingShapesProps {
  count?: number;
  colors?: string[];
  speed?: number;
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * FloatingShapes - Background animated 3D shapes
 * Perfect for hero sections, feature sections, etc.
 */
export default function FloatingShapes({
  count = 20,
  colors = ['#4dabf7', '#51cf66', '#ff6b6b', '#ffd43b', '#845ef7'],
  speed = 0.5,
  size = 0.3,
  opacity = 0.6,
  style,
  className,
}: FloatingShapesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shapesRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create floating shapes
    const shapes: THREE.Mesh[] = [];
    const geometries = [
      new THREE.BoxGeometry(size, size, size),
      new THREE.SphereGeometry(size * 0.6, 16, 16),
      new THREE.TorusGeometry(size * 0.4, size * 0.15, 8, 16),
      new THREE.OctahedronGeometry(size * 0.6),
      new THREE.DodecahedronGeometry(size * 0.5),
    ];

    for (let i = 0; i < count; i++) {
      const geometry =
        geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        metalness: 0.3,
        roughness: 0.6,
        transparent: true,
        opacity: opacity,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random position
      mesh.position.x = (Math.random() - 0.5) * 10;
      mesh.position.y = (Math.random() - 0.5) * 10;
      mesh.position.z = (Math.random() - 0.5) * 10;

      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;

      // Store velocity for animation
      (mesh as any).velocity = {
        x: (Math.random() - 0.5) * 0.02 * speed,
        y: (Math.random() - 0.5) * 0.02 * speed,
        z: (Math.random() - 0.5) * 0.02 * speed,
        rotationX: (Math.random() - 0.5) * 0.02 * speed,
        rotationY: (Math.random() - 0.5) * 0.02 * speed,
      };

      scene.add(mesh);
      shapes.push(mesh);
    }

    shapesRef.current = shapes;

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current)
        return;

      animationIdRef.current = requestAnimationFrame(animate);

      // Animate shapes
      shapes.forEach((shape) => {
        const velocity = (shape as any).velocity;

        shape.position.x += velocity.x;
        shape.position.y += velocity.y;
        shape.position.z += velocity.z;

        shape.rotation.x += velocity.rotationX;
        shape.rotation.y += velocity.rotationY;

        // Boundary check and bounce
        const boundary = 5;
        if (Math.abs(shape.position.x) > boundary) velocity.x *= -1;
        if (Math.abs(shape.position.y) > boundary) velocity.y *= -1;
        if (Math.abs(shape.position.z) > boundary) velocity.z *= -1;
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      shapes.forEach((shape) => {
        if (shape.geometry) shape.geometry.dispose();
        if (shape.material) (shape.material as THREE.Material).dispose();
      });
      geometries.forEach((geo) => geo.dispose());
      rendererRef.current?.dispose();
    };
  }, [count, colors, speed, size, opacity]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
