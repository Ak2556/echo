'use client';

import React, { useState } from 'react';
import { X, Plus, Bookmark, Grid, Lock, Globe, Users } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';

interface Collection {
  id: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private' | 'followers';
  postCount: number;
  coverImages: string[]; // Up to 4 images for grid cover
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  postImage?: string;
  onAddToCollection?: (collectionId: string) => Promise<boolean>;
  onCreateCollection?: (name: string, description: string, privacy: 'public' | 'private' | 'followers') => Promise<string | null>;
}

const sampleCollections: Collection[] = [
  {
    id: 'col_1',
    name: 'Travel Inspiration',
    description: 'Beautiful places I want to visit someday',
    privacy: 'public',
    postCount: 23,
    coverImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop'
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-11-10')
  },
  {
    id: 'col_2',
    name: 'Recipe Ideas',
    description: 'Delicious recipes to try at home',
    privacy: 'private',
    postCount: 15,
    coverImages: [
      'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=300&fit=crop'
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-11-08')
  },
  {
    id: 'col_3',
    name: 'Tech Articles',
    description: 'Interesting tech reads and tutorials',
    privacy: 'followers',
    postCount: 42,
    coverImages: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop'
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-11-12')
  },
  {
    id: 'col_4',
    name: 'Art & Design',
    description: 'Creative inspiration and design ideas',
    privacy: 'public',
    postCount: 8,
    coverImages: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300&h=300&fit=crop'
    ],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-05')
  }
];

export default function CollectionsModal({
  isOpen,
  onClose,
  postId,
  postImage,
  onAddToCollection,
  onCreateCollection
}: CollectionsModalProps) {
  const toast = useToast();
  const [collections, setCollections] = useState<Collection[]>(sampleCollections);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionPrivacy, setNewCollectionPrivacy] = useState<'public' | 'private' | 'followers'>('public');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());

  const handleAddToCollection = async (collectionId: string) => {
    if (!postId) return;

    try {
      const success = onAddToCollection ? await onAddToCollection(collectionId) : true;
      if (success) {
        const collection = collections.find(c => c.id === collectionId);
        if (collection) {
          // Update collection post count
          setCollections(prev => prev.map(c => 
            c.id === collectionId 
              ? { ...c, postCount: c.postCount + 1, updatedAt: new Date() }
              : c
          ));
          
          // Add to selected collections
          setSelectedCollections(prev => new Set([...prev, collectionId]));
          
          toast.success(`Added to "${collection.name}"`);
        }
      } else {
        toast.error('Failed to add to collection');
      }
    } catch (error) {
      toast.error('Failed to add to collection');
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    setIsCreating(true);

    try {
      const collectionId = onCreateCollection 
        ? await onCreateCollection(newCollectionName.trim(), newCollectionDescription.trim(), newCollectionPrivacy)
        : `col_${Date.now()}`;

      if (collectionId) {
        const newCollection: Collection = {
          id: collectionId,
          name: newCollectionName.trim(),
          description: newCollectionDescription.trim() || undefined,
          privacy: newCollectionPrivacy,
          postCount: postId ? 1 : 0,
          coverImages: postImage ? [postImage] : [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setCollections(prev => [newCollection, ...prev]);
        
        if (postId) {
          setSelectedCollections(prev => new Set([...prev, collectionId]));
        }

        setNewCollectionName('');
        setNewCollectionDescription('');
        setNewCollectionPrivacy('public');
        setShowCreateForm(false);
        
        toast.success(`Collection "${newCollection.name}" created!`);
      } else {
        toast.error('Failed to create collection');
      }
    } catch (error) {
      toast.error('Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'private': return <Lock size={14} />;
      case 'followers': return <Users size={14} />;
      default: return <Globe size={14} />;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'private': return 'Private';
      case 'followers': return 'Followers only';
      default: return 'Public';
    }
  };

  const renderCollectionCover = (collection: Collection) => {
    const { coverImages } = collection;
    
    if (coverImages.length === 0) {
      return (
        <div style={{
          width: '100%',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.5rem'
        }}>
          📚
        </div>
      );
    }

    if (coverImages.length === 1) {
      return (
        <Image
          src={coverImages[0]}
          alt={collection.name}
          width={200}
          height={80}
          style={{
            width: '100%',
            height: '80px',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Grid layout for multiple images
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: coverImages.length === 2 ? '1fr 1fr' : '1fr 1fr',
        gridTemplateRows: coverImages.length <= 2 ? '1fr' : '1fr 1fr',
        gap: '1px',
        width: '100%',
        height: '80px',
        background: '#f0f0f0'
      }}>
        {coverImages.slice(0, 4).map((image, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Image
              src={image}
              alt={`${collection.name} ${index + 1}`}
              width={100}
              height={40}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {index === 3 && coverImages.length > 4 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                +{coverImages.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: '20px',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bookmark size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: 700,
              color: 'var(--fg)'
            }}>
              {postId ? 'Save to Collection' : 'My Collections'}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Create New Collection Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px dashed var(--border)',
              background: 'var(--surface)',
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: 'var(--accent)',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Plus size={20} />
            Create New Collection
          </button>
        )}

        {/* Create Collection Form */}
        {showCreateForm && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--fg)'
            }}>
              Create New Collection
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--fg)'
              }}>
                Collection Name *
              </label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g., Travel Inspiration"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--fg)'
              }}>
                Description (optional)
              </label>
              <textarea
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Brief description of this collection..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '60px',
                  maxHeight: '100px',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--fg)'
              }}>
                Privacy
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { value: 'public', label: 'Public', icon: <Globe size={16} /> },
                  { value: 'followers', label: 'Followers', icon: <Users size={16} /> },
                  { value: 'private', label: 'Private', icon: <Lock size={16} /> }
                ].map((option) => (
                  <label
                    key={option.value}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      border: `2px solid ${newCollectionPrivacy === option.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: newCollectionPrivacy === option.value ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--bg)'
                    }}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value={option.value}
                      checked={newCollectionPrivacy === option.value}
                      onChange={(e) => setNewCollectionPrivacy(e.target.value as any)}
                      style={{ display: 'none' }}
                    />
                    {option.icon}
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                  setNewCollectionPrivacy('public');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--fg)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim() || isCreating}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  background: newCollectionName.trim() && !isCreating ? 'var(--accent)' : 'rgba(0, 0, 0, 0.1)',
                  color: newCollectionName.trim() && !isCreating ? 'white' : 'var(--muted)',
                  borderRadius: '8px',
                  cursor: newCollectionName.trim() && !isCreating ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isCreating ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creating...
                  </>
                ) : (
                  'Create Collection'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Collections List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {collections.map((collection) => {
            const isSelected = selectedCollections.has(collection.id);
            
            return (
              <div
                key={collection.id}
                style={{
                  border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: postId ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  background: isSelected ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--bg)'
                }}
                onClick={() => postId && !isSelected && handleAddToCollection(collection.id)}
                onMouseEnter={(e) => {
                  if (postId && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (postId && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Collection Cover */}
                <div style={{ position: 'relative' }}>
                  {renderCollectionCover(collection)}
                  
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      width: '24px',
                      height: '24px',
                      background: 'var(--accent)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </div>

                {/* Collection Info */}
                <div style={{ padding: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--fg)'
                    }}>
                      {collection.name}
                    </h4>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: 'var(--muted)',
                      fontSize: '0.8rem'
                    }}>
                      {getPrivacyIcon(collection.privacy)}
                      <span>{getPrivacyLabel(collection.privacy)}</span>
                    </div>
                  </div>

                  {collection.description && (
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.85rem',
                      color: 'var(--muted)',
                      lineHeight: 1.4
                    }}>
                      {collection.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--muted)'
                  }}>
                    <Grid size={12} />
                    <span>{collection.postCount} posts</span>
                    <span>•</span>
                    <span>Updated {collection.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {collections.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--muted)'
          }}>
            <Bookmark size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>
              No collections yet
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Create your first collection to organize your saved posts
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}