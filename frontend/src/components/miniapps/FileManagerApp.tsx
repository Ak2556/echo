'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified: number;
  parent: string | null;
  content?: string;
  fileType?: string;
}

interface FileManagerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
};

const formatDate = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const getFileIcon = (name: string, type: string): string => {
  if (type === 'folder') return '📁';
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'txt':
    case 'md':
      return '📄';
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
      return '💻';
    case 'json':
      return '📋';
    case 'css':
    case 'scss':
      return '🎨';
    case 'html':
      return '🌐';
    case 'png':
    case 'jpg':
    case 'gif':
      return '🖼️';
    case 'pdf':
      return '📕';
    case 'zip':
    case 'rar':
      return '📦';
    default:
      return '📄';
  }
};

export default function FileManagerApp({
  isVisible,
  onClose,
}: FileManagerAppProps) {
  const colors = useThemeColors();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState<
    'new-file' | 'new-folder' | 'rename' | 'edit' | 'delete' | null
  >(null);
  const [dialogValue, setDialogValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('file_manager_files');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: '1',
        name: 'Documents',
        type: 'folder',
        size: 0,
        modified: Date.now() - 172800000,
        parent: null,
      },
      {
        id: '2',
        name: 'Pictures',
        type: 'folder',
        size: 0,
        modified: Date.now() - 604800000,
        parent: null,
      },
      {
        id: '3',
        name: 'Projects',
        type: 'folder',
        size: 0,
        modified: Date.now() - 86400000,
        parent: null,
      },
      {
        id: '4',
        name: 'README.txt',
        type: 'file',
        size: 156,
        modified: Date.now() - 3600000,
        parent: null,
        content: 'Welcome to File Manager!',
      },
      {
        id: '5',
        name: 'notes.txt',
        type: 'file',
        size: 89,
        modified: Date.now() - 7200000,
        parent: '1',
        content: 'My notes...',
      },
      {
        id: '6',
        name: 'app.tsx',
        type: 'file',
        size: 2048,
        modified: Date.now() - 1800000,
        parent: '3',
        content: '// App code',
      },
      {
        id: '7',
        name: 'styles.css',
        type: 'file',
        size: 1024,
        modified: Date.now() - 3600000,
        parent: '3',
        content: '/* Styles */',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('file_manager_files', JSON.stringify(files));
  }, [files]);

  const currentFiles = files.filter((f) => f.parent === currentFolderId);
  const filteredFiles = searchQuery
    ? currentFiles.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFiles;

  // Storage analytics
  const stats = useMemo(() => {
    const totalSize = files
      .filter((f) => f.type === 'file')
      .reduce((acc, f) => acc + f.size, 0);
    const fileCount = files.filter((f) => f.type === 'file').length;
    const folderCount = files.filter((f) => f.type === 'folder').length;

    const typeBreakdown: Record<string, { count: number; size: number }> = {};
    files
      .filter((f) => f.type === 'file')
      .forEach((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase() || 'other';
        if (!typeBreakdown[ext]) typeBreakdown[ext] = { count: 0, size: 0 };
        typeBreakdown[ext].count++;
        typeBreakdown[ext].size += f.size;
      });

    return { totalSize, fileCount, folderCount, typeBreakdown };
  }, [files]);

  const getCurrentPath = useCallback(() => {
    if (!currentFolderId) return 'Home';
    const path: string[] = [];
    let id: string | null = currentFolderId;
    while (id) {
      const folder = files.find((f) => f.id === id);
      if (folder) {
        path.unshift(folder.name);
        id = folder.parent;
      } else break;
    }
    return 'Home / ' + path.join(' / ');
  }, [currentFolderId, files]);

  const handleFileClick = useCallback(
    (file: FileItem) => {
      if (file.type === 'folder') {
        setCurrentFolderId(file.id);
        setSelectedFile(null);
      } else {
        setSelectedFile(selectedFile === file.id ? null : file.id);
      }
    },
    [selectedFile]
  );

  const handleBack = useCallback(() => {
    if (currentFolderId) {
      const currentFolder = files.find((f) => f.id === currentFolderId);
      setCurrentFolderId(currentFolder?.parent || null);
      setSelectedFile(null);
    }
  }, [currentFolderId, files]);

  const handleNewFile = useCallback(() => {
    if (!dialogValue.trim()) return;
    setFiles([
      ...files,
      {
        id: Date.now().toString(),
        name: dialogValue.trim(),
        type: 'file',
        size: 0,
        modified: Date.now(),
        parent: currentFolderId,
        content: '',
      },
    ]);
    setShowDialog(null);
    setDialogValue('');
  }, [dialogValue, currentFolderId, files]);

  const handleNewFolder = useCallback(() => {
    if (!dialogValue.trim()) return;
    setFiles([
      ...files,
      {
        id: Date.now().toString(),
        name: dialogValue.trim(),
        type: 'folder',
        size: 0,
        modified: Date.now(),
        parent: currentFolderId,
      },
    ]);
    setShowDialog(null);
    setDialogValue('');
  }, [dialogValue, currentFolderId, files]);

  const handleDelete = useCallback(() => {
    if (!selectedFile) return;
    const deleteRecursive = (id: string): string[] => {
      const item = files.find((f) => f.id === id);
      if (!item) return [];
      if (item.type === 'file') return [id];
      const childIds = files
        .filter((f) => f.parent === id)
        .flatMap((f) => deleteRecursive(f.id));
      return [id, ...childIds];
    };
    setFiles(
      files.filter((f) => !deleteRecursive(selectedFile).includes(f.id))
    );
    setSelectedFile(null);
    setShowDialog(null);
  }, [selectedFile, files]);

  const handleEditFile = useCallback(() => {
    if (!selectedFile) return;
    setFiles(
      files.map((f) =>
        f.id === selectedFile
          ? {
              ...f,
              content: dialogValue,
              size: new Blob([dialogValue]).size,
              modified: Date.now(),
            }
          : f
      )
    );
    setShowDialog(null);
    setDialogValue('');
  }, [selectedFile, dialogValue, files]);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles([
          ...files,
          {
            id: Date.now().toString(),
            name: file.name,
            type: 'file',
            size: file.size,
            modified: Date.now(),
            parent: currentFolderId,
            content: event.target?.result as string,
          },
        ]);
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [currentFolderId, files]
  );

  const handleDownload = useCallback(() => {
    if (!selectedFile) return;
    const file = files.find((f) => f.id === selectedFile);
    if (!file || file.type !== 'file') return;
    const blob = new Blob([file.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedFile, files]);

  const openDialog = useCallback(
    (type: typeof showDialog) => {
      const file = selectedFile
        ? files.find((f) => f.id === selectedFile)
        : null;
      if (type === 'rename' && file) setDialogValue(file.name);
      else if (type === 'edit' && file?.type === 'file')
        setDialogValue(file.content || '');
      else setDialogValue('');
      setShowDialog(type);
    },
    [selectedFile, files]
  );

  const selectedFileObj = selectedFile
    ? files.find((f) => f.id === selectedFile)
    : null;

  if (!isVisible) return null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>📁</span> File Manager Pro
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Storage analytics & file management
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          style={{
            background: showStats
              ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          📊 Analytics
        </button>
      </div>

      {/* Storage Analytics */}
      {showStats && (
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'colors.brand.primary',
                }}
              >
                {formatSize(stats.totalSize)}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Total Size
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#2ed573',
                }}
              >
                {stats.fileCount}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Files
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#ffa502',
                }}
              >
                {stats.folderCount}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Folders
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              marginBottom: '8px',
            }}
          >
            File Type Breakdown
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(stats.typeBreakdown).map(([ext, data]) => (
              <div
                key={ext}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ fontWeight: '600' }}>.{ext}</span>
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginLeft: '4px',
                  }}
                >
                  ({data.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={handleBack}
          disabled={!currentFolderId}
          style={{
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: currentFolderId ? 'pointer' : 'not-allowed',
            opacity: currentFolderId ? 1 : 0.5,
            fontSize: '0.85rem',
          }}
        >
          ← Back
        </button>
        <div
          style={{
            flex: 1,
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.6)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getCurrentPath()}
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          style={{
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {viewMode === 'list' ? '⊞' : '☰'}
        </button>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => openDialog('new-file')}
          style={{
            padding: '8px 12px',
            background:
              'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600',
          }}
        >
          + File
        </button>
        <button
          onClick={() => openDialog('new-folder')}
          style={{
            padding: '8px 12px',
            background:
              'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600',
          }}
        >
          + Folder
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          📤 Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.8rem',
            width: '150px',
            outline: 'none',
          }}
        />
      </div>

      {/* File List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {filteredFiles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📁</div>
            <div>{searchQuery ? 'No files found' : 'This folder is empty'}</div>
          </div>
        ) : (
          <div
            style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns:
                viewMode === 'grid'
                  ? 'repeat(auto-fill, minmax(100px, 1fr))'
                  : undefined,
              flexDirection: viewMode === 'list' ? 'column' : undefined,
              gap: '8px',
            }}
          >
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                style={{
                  display: 'flex',
                  flexDirection: viewMode === 'grid' ? 'column' : 'row',
                  alignItems: viewMode === 'grid' ? 'center' : 'center',
                  gap: '8px',
                  padding: '12px',
                  background:
                    selectedFile === file.id
                      ? 'rgba(102, 126, 234, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedFile === file.id ? 'rgba(102, 126, 234, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: viewMode === 'grid' ? 'center' : 'left',
                }}
              >
                <div
                  style={{ fontSize: viewMode === 'grid' ? '2rem' : '1.2rem' }}
                >
                  {getFileIcon(file.name, file.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: viewMode === 'grid' ? '0.75rem' : '0.85rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: viewMode === 'grid' ? 'normal' : 'nowrap',
                      wordBreak: viewMode === 'grid' ? 'break-word' : 'normal',
                    }}
                  >
                    {file.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {file.type === 'file' && (
                      <span>{formatSize(file.size)} • </span>
                    )}
                    <span>{formatDate(file.modified)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected File Actions */}
      {selectedFileObj && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)',
            flexWrap: 'wrap',
          }}
        >
          {selectedFileObj.type === 'file' && (
            <>
              <button
                onClick={() => openDialog('edit')}
                style={{
                  padding: '8px 12px',
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Edit
              </button>
              <button
                onClick={handleDownload}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Download
              </button>
            </>
          )}
          <button
            onClick={() => openDialog('rename')}
            style={{
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Rename
          </button>
          <button
            onClick={() => openDialog('delete')}
            style={{
              padding: '8px 12px',
              background: 'rgba(255, 71, 87, 0.3)',
              border: '1px solid rgba(255, 71, 87, 0.5)',
              borderRadius: '8px',
              color: '#ff4757',
              cursor: 'pointer',
              fontSize: '0.8rem',
              marginLeft: 'auto',
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Dialogs */}
      {showDialog && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowDialog(null)}
        >
          <div
            style={{
              background: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
              {showDialog === 'new-file' && 'New File'}
              {showDialog === 'new-folder' && 'New Folder'}
              {showDialog === 'rename' && 'Rename'}
              {showDialog === 'edit' && 'Edit File'}
              {showDialog === 'delete' && 'Delete'}
            </h3>

            {showDialog === 'delete' ? (
              <div>
                <p
                  style={{
                    marginBottom: '16px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                  }}
                >
                  Delete &quot;{selectedFileObj?.name}&quot;?
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => setShowDialog(null)}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: '10px 16px',
                      background: '#ff4757',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : showDialog === 'edit' ? (
              <div>
                <textarea
                  value={dialogValue}
                  onChange={(e) => setDialogValue(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    marginBottom: '16px',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => setShowDialog(null)}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditFile}
                    style={{
                      padding: '10px 16px',
                      background:
                        'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={dialogValue}
                  onChange={(e) => setDialogValue(e.target.value)}
                  placeholder={
                    showDialog === 'new-file' ? 'filename.txt' : 'Folder name'
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    marginBottom: '16px',
                    outline: 'none',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => setShowDialog(null)}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (showDialog === 'new-file') handleNewFile();
                      else if (showDialog === 'new-folder') handleNewFolder();
                      else if (showDialog === 'rename') {
                        if (selectedFile && dialogValue.trim()) {
                          setFiles(
                            files.map((f) =>
                              f.id === selectedFile
                                ? { ...f, name: dialogValue.trim() }
                                : f
                            )
                          );
                          setShowDialog(null);
                          setDialogValue('');
                        }
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      background:
                        'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {showDialog === 'rename' ? 'Rename' : 'Create'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
