'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Micro3DShape =
  | 'cube'
  | 'sphere'
  | 'torus'
  | 'cone'
  | 'cylinder'
  | 'octahedron'
  | 'dodecahedron';
type AnimationType = 'rotate' | 'float' | 'pulse' | 'bounce' | 'spin' | 'none';

interface Micro3DProps {
  shape?: Micro3DShape;
  color?: string;
  size?: number;
  animation?: AnimationType;
  speed?: number;
  wireframe?: boolean;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  autoStart?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Micro3D - Lightweight 3D elements for UI enhancement
 * Perfect for adding subtle 3D touches throughout your webapp
 */
export default function Micro3D({
  shape = 'cube',
  color = '#4dabf7',
  size = 80,
  animation = 'rotate',
  speed = 1,
  wireframe = false,
  metalness = 0.5,
  roughness = 0.5,
  opacity = 1,
  autoStart = true,
  style,
  className,
}: Micro3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    // Create geometry based on shape
    let geometry: THREE.BufferGeometry;
    switch (shape) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 24, 24);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.7, 0.3, 16, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.8, 1.5, 24);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 24);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(1);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(0.9);
        break;
      case 'cube':
      default:
        geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        break;
    }

    // Material
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
      wireframe: wireframe,
      transparent: opacity < 1,
      opacity: opacity,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Animation loop
    const animate = () => {
      if (
        !sceneRef.current ||
        !cameraRef.current ||
        !rendererRef.current ||
        !meshRef.current
      )
        return;

      animationIdRef.current = requestAnimationFrame(animate);

      timeRef.current += 0.01 * speed;

      if (autoStart) {
        switch (animation) {
          case 'rotate':
            meshRef.current.rotation.x += 0.01 * speed;
            meshRef.current.rotation.y += 0.01 * speed;
            break;
          case 'float':
            meshRef.current.position.y = Math.sin(timeRef.current) * 0.2;
            meshRef.current.rotation.y += 0.005 * speed;
            break;
          case 'pulse':
            const scale = 1 + Math.sin(timeRef.current * 2) * 0.1;
            meshRef.current.scale.set(scale, scale, scale);
            break;
          case 'bounce':
            meshRef.current.position.y =
              Math.abs(Math.sin(timeRef.current)) * 0.3;
            meshRef.current.rotation.y += 0.02 * speed;
            break;
          case 'spin':
            meshRef.current.rotation.y += 0.02 * speed;
            break;
          case 'none':
            // Static
            break;
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      rendererRef.current?.dispose();
    };
  }, [
    shape,
    color,
    size,
    animation,
    speed,
    wireframe,
    metalness,
    roughness,
    opacity,
    autoStart,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        ...style,
      }}
    />
  );
}

// Preset components for common use cases
export function FloatingCube(props: Partial<Micro3DProps>) {
  return <Micro3D shape="cube" animation="float" {...props} />;
}

export function SpinningSphere(props: Partial<Micro3DProps>) {
  return <Micro3D shape="sphere" animation="spin" {...props} />;
}

export function PulsingTorus(props: Partial<Micro3DProps>) {
  return <Micro3D shape="torus" animation="pulse" {...props} />;
}

export function BouncingCone(props: Partial<Micro3DProps>) {
  return <Micro3D shape="cone" animation="bounce" {...props} />;
}

export function WireframeOctahedron(props: Partial<Micro3DProps>) {
  return <Micro3D shape="octahedron" wireframe animation="rotate" {...props} />;
}
