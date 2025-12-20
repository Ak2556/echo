// Polyfills for Jest test environment

// TextEncoder/TextDecoder polyfill
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Blob polyfill for file handling tests
global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts || [];
    this.type = options?.type || '';
    this.size = this.parts.join('').length;
  }

  text() {
    return Promise.resolve(this.parts.join(''));
  }

  arrayBuffer() {
    const text = this.parts.join('');
    const buffer = new ArrayBuffer(text.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < text.length; i++) {
      view[i] = text.charCodeAt(i);
    }
    return Promise.resolve(buffer);
  }
};

// File polyfill for upload tests
global.File = class File extends global.Blob {
  constructor(parts, name, options) {
    super(parts, options);
    this.name = name;
    this.lastModified = options?.lastModified || Date.now();
  }
};

// URL polyfill
global.URL = class URL {
  constructor(url) {
    this.href = url;
    this.origin = 'http://localhost:3000';
    this.protocol = 'http:';
    this.host = 'localhost:3000';
    this.hostname = 'localhost';
    this.port = '3000';
    this.pathname = '/';
    this.search = '';
    this.hash = '';
  }

  toString() {
    return this.href;
  }

  static createObjectURL() {
    return 'blob:mock-url';
  }

  static revokeObjectURL() {
    // Mock implementation
  }
};

// DOMRect polyfill for getBoundingClientRect
global.DOMRect = class DOMRect {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.top = y;
    this.left = x;
    this.bottom = y + height;
    this.right = x + width;
  }

  static fromRect(other) {
    return new DOMRect(other.x, other.y, other.width, other.height);
  }

  toJSON() {
    return JSON.stringify(this);
  }
};
