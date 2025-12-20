'use client';
// Premium Messages UI with enhanced styling
// Version 2.0 - Complete premium redesign

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type MediaType = 'image' | 'video' | 'gif' | 'voice' | 'file';

type Thread = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type?: 'group' | 'individual';
  verified?: boolean;
  isTyping?: boolean;
  lastSeen?: string;
  pinned?: boolean;
  muted?: boolean;
};

type Message = {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  thumbnail?: string;
  at: number;
  status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  replyTo?: Message;
  reactions?: { emoji: string; users: string[] }[];
  edited?: boolean;
  deleted?: boolean;
  forwarded?: boolean;
};

type Call = {
  active: boolean;
  type: 'voice' | 'video';
  participant: Thread | null;
  duration: number;
  muted: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
};

type ContextMenu = {
  show: boolean;
  x: number;
  y: number;
  message: Message | null;
};

// Message Bubble Component (memoized for performance)
const MessageBubble = memo(
  ({
    message,
    activeThread,
    onReply,
    onEdit,
    onDelete,
    onReact,
    onContextMenu,
  }: {
    message: Message;
    activeThread: Thread | undefined;
    onReply: (msg: Message) => void;
    onEdit: (msg: Message) => void;
    onDelete: (msgId: string) => void;
    onReact: (msgId: string, emoji: string) => void;
    onContextMenu: (e: React.MouseEvent, msg: Message) => void;
  }) => {
    if (message.deleted) {
      return (
        <div
          className={`message-wrapper ${message.sender === 'me' ? 'sent' : 'received'}`}
        >
          <div className="message-bubble deleted-message">
            <p className="deleted-text">🚫 This message was deleted</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        className={`message-wrapper ${message.sender === 'me' ? 'sent' : 'received'}`}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        onContextMenu={(e) => onContextMenu(e, message)}
      >
        {message.sender === 'them' && (
          <Image
            src={activeThread?.avatar || ''}
            alt=""
            width={32}
            height={32}
            className="message-avatar"
          />
        )}

        <div className="message-bubble-wrapper">
          {message.replyTo && (
            <div className="reply-preview">
              <div className="reply-line"></div>
              <div className="reply-content">
                <span className="reply-name">
                  {message.replyTo.sender === 'me' ? 'You' : activeThread?.name}
                </span>
                <p className="reply-text">
                  {message.replyTo.text || '📎 Media'}
                </p>
              </div>
            </div>
          )}

          {message.forwarded && (
            <div className="forwarded-badge">
              <span>↪️ Forwarded</span>
            </div>
          )}

          <motion.div
            className={`message-bubble ${message.sender === 'me' ? 'bubble-sent' : 'bubble-received'} ${
              message.status === 'failed' ? 'message-failed' : ''
            }`}
          >
            {message.mediaUrl && (
              <div className="message-media">
                {message.mediaType === 'image' ||
                message.mediaType === 'gif' ? (
                  <Image
                    src={message.mediaUrl}
                    alt="Media"
                    width={300}
                    height={200}
                    className="media-image"
                  />
                ) : message.mediaType === 'video' ? (
                  <video
                    src={message.mediaUrl}
                    controls
                    className="media-video"
                  />
                ) : message.mediaType === 'voice' ? (
                  <div className="voice-message">
                    <audio
                      src={message.mediaUrl}
                      controls
                      className="voice-audio-player"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {message.text && <p className="message-text">{message.text}</p>}

            {message.reactions && message.reactions.length > 0 && (
              <div className="message-reactions">
                {message.reactions.map((reaction, idx) => (
                  <motion.span
                    key={idx}
                    className="reaction-bubble"
                    title={reaction.users.join(', ')}
                  >
                    {reaction.emoji}{' '}
                    {reaction.users.length > 1 && reaction.users.length}
                  </motion.span>
                ))}
                <button
                  className="add-reaction-btn"
                  onClick={() => onReact(message.id, '❤️')}
                >
                  +
                </button>
              </div>
            )}
          </motion.div>

          <div className="message-meta">
            <span className="message-time">
              {new Date(message.at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            {message.edited && <span className="edited-badge">edited</span>}
            {message.sender === 'me' && (
              <span className="message-status">
                {message.status === 'sending' && '🕐'}
                {message.status === 'sent' && '✓'}
                {message.status === 'delivered' && '✓✓'}
                {message.status === 'seen' && (
                  <span className="seen-checkmark">✓✓</span>
                )}
                {message.status === 'failed' && '❌'}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="message-actions">
            <button onClick={() => onReply(message)} title="Reply">
              ↩️
            </button>
            {message.sender === 'me' && (
              <>
                <button onClick={() => onEdit(message)} title="Edit">
                  ✏️
                </button>
                <button onClick={() => onDelete(message.id)} title="Delete">
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

export default function ProductionMessagesPage() {
  const { t } = useLanguage();
  const { colorMode } = useTheme();

  // State
  const [selectedThread, setSelectedThread] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [query, setQuery] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    show: false,
    x: 0,
    y: 0,
    message: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'online' | 'offline' | 'connecting'
  >('online');
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');

  // Call state
  const [call, setCall] = useState<Call>({
    active: false,
    type: 'voice',
    participant: null,
    duration: 0,
    muted: false,
    videoEnabled: true,
    screenSharing: false,
    connectionQuality: 'excellent',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // WebRTC refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // Enhanced threads
  const threads: Thread[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=b6e3f4',
      lastMessage: '',
      time: '',
      unread: 0,
      online: true,
      verified: true,
      isTyping: false,
      lastSeen: 'online',
      pinned: true,
    },
    {
      id: 2,
      name: 'Arjun Singh',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=c0aede',
      lastMessage: '',
      time: '',
      unread: 0,
      online: true,
      verified: true,
      lastSeen: 'online',
    },
    {
      id: 3,
      name: 'Design Team',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Team&backgroundColor=ffd5dc',
      lastMessage: '',
      time: '',
      unread: 0,
      online: false,
      type: 'group',
      lastSeen: 'last seen 1h ago',
      muted: false,
    },
    {
      id: 4,
      name: 'Ravi Kumar',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi&backgroundColor=ffdfbf',
      lastMessage: '',
      time: '',
      unread: 0,
      online: false,
      lastSeen: 'last seen 2h ago',
    },
  ];

  // Messages state (empty by default)
  const [messagesByThread, setMessagesByThread] = useState<
    Record<number, Message[]>
  >({});

  // Popular GIFs
  const popularGifs = [
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/d2Z4i1TGqCunWBW0/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  ];

  // Emojis
  const quickEmojis = [
    '😊',
    '😂',
    '❤️',
    '👍',
    '🔥',
    '🎉',
    '😍',
    '🤔',
    '👏',
    '🙌',
    '💯',
    '✨',
  ];

  const activeThread = threads.find((t) => t.id === selectedThread);
  const messages = messagesByThread[selectedThread] || [];

  const filteredThreads = useMemo(() => {
    if (!query) return threads;
    return threads.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // WebRTC call functions
  const startCall = async (type: 'voice' | 'video') => {
    try {
      setConnectionStatus('connecting');
      const constraints = {
        audio: true,
        video:
          type === 'video'
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user',
              }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const remoteStream = stream.clone();
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current && type === 'video') {
        remoteVideoRef.current.srcObject = remoteStream;
      }

      setCall({
        active: true,
        type,
        participant: activeThread || null,
        duration: 0,
        muted: false,
        videoEnabled: type === 'video',
        screenSharing: false,
        connectionQuality: 'excellent',
      });
      setConnectionStatus('online');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      setConnectionStatus('offline');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCall({
      active: false,
      type: 'voice',
      participant: null,
      duration: 0,
      muted: false,
      videoEnabled: true,
      screenSharing: false,
      connectionQuality: 'excellent',
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = call.muted;
        setCall((prev) => ({ ...prev, muted: !prev.muted }));
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !call.videoEnabled;
        setCall((prev) => ({ ...prev, videoEnabled: !prev.videoEnabled }));
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!call.screenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = screenStream;
        }
        setCall((prev) => ({ ...prev, screenSharing: true }));
      } else {
        if (remoteStreamRef.current && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
        setCall((prev) => ({ ...prev, screenSharing: false }));
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  // Call duration timer
  useEffect(() => {
    if (call.active) {
      const interval = setInterval(() => {
        setCall((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [call.active]);

  // Recording timer (audio and video)
  useEffect(() => {
    if (isRecording || isVideoRecording) {
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRecordingTime(0);
    }
  }, [isRecording, isVideoRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        const voiceMessage: Message = {
          id: Math.random().toString(36).slice(2),
          sender: 'me',
          mediaType: 'voice',
          mediaUrl: audioUrl,
          at: Date.now(),
          status: 'sending',
        };

        setMessagesByThread((prev) => ({
          ...prev,
          [selectedThread]: [...(prev[selectedThread] || []), voiceMessage],
        }));

        setTimeout(() => {
          setMessagesByThread((prev) => ({
            ...prev,
            [selectedThread]: prev[selectedThread].map((msg) =>
              msg.id === voiceMessage.id ? { ...msg, status: 'delivered' } : msg
            ),
          }));
        }, 1000);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioChunksRef.current = [];
    }
  };

  // Video message recording
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      videoStreamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        videoChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, {
          type: 'video/webm',
        });
        const videoUrl = URL.createObjectURL(videoBlob);

        const videoMessage: Message = {
          id: Math.random().toString(36).slice(2),
          sender: 'me',
          mediaType: 'video',
          mediaUrl: videoUrl,
          at: Date.now(),
          status: 'sending',
        };

        setMessagesByThread((prev) => ({
          ...prev,
          [selectedThread]: [...(prev[selectedThread] || []), videoMessage],
        }));

        setTimeout(() => {
          setMessagesByThread((prev) => ({
            ...prev,
            [selectedThread]: prev[selectedThread].map((msg) =>
              msg.id === videoMessage.id ? { ...msg, status: 'delivered' } : msg
            ),
          }));
        }, 1000);

        stream.getTracks().forEach((track) => track.stop());
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsVideoRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isVideoRecording) {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      setRecordingTime(0);
    }
  };

  const cancelVideoRecording = () => {
    if (mediaRecorderRef.current && isVideoRecording) {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      setRecordingTime(0);
      videoChunksRef.current = [];
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
      }
    }
  };

  // Message handlers
  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (editingMessage) {
        // Edit existing message
        setMessagesByThread((prev) => ({
          ...prev,
          [selectedThread]: prev[selectedThread].map((msg) =>
            msg.id === editingMessage.id
              ? { ...msg, text: messageInput, edited: true }
              : msg
          ),
        }));
        setEditingMessage(null);
        setMessageInput('');
        return;
      }

      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const mediaMessage: Message = {
            id: Math.random().toString(36).slice(2),
            sender: 'me',
            mediaType: selectedFile.type.startsWith('video')
              ? 'video'
              : 'image',
            mediaUrl: event.target?.result as string,
            text: messageInput,
            at: Date.now(),
            status: 'sending',
            replyTo: replyingTo || undefined,
          };
          setMessagesByThread((prev) => ({
            ...prev,
            [selectedThread]: [...(prev[selectedThread] || []), mediaMessage],
          }));
          setTimeout(() => {
            setMessagesByThread((prev) => ({
              ...prev,
              [selectedThread]: prev[selectedThread].map((msg) =>
                msg.id === mediaMessage.id
                  ? { ...msg, status: 'delivered' }
                  : msg
              ),
            }));
          }, 1000);
        };
        reader.readAsDataURL(selectedFile);
        setSelectedFile(null);
        setPreviewUrl(null);
        setMessageInput('');
        setReplyingTo(null);
      } else if (messageInput.trim()) {
        const newMessage: Message = {
          id: Math.random().toString(36).slice(2),
          sender: 'me',
          text: messageInput,
          at: Date.now(),
          status: 'sending',
          replyTo: replyingTo || undefined,
        };
        setMessagesByThread((prev) => ({
          ...prev,
          [selectedThread]: [...(prev[selectedThread] || []), newMessage],
        }));
        setMessageInput('');
        setReplyingTo(null);

        setTimeout(() => {
          setMessagesByThread((prev) => ({
            ...prev,
            [selectedThread]: prev[selectedThread].map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
            ),
          }));
        }, 1000);
      }
    },
    [messageInput, selectedFile, replyingTo, editingMessage, selectedThread]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendGif = (gifUrl: string) => {
    const gifMessage: Message = {
      id: Math.random().toString(36).slice(2),
      sender: 'me',
      mediaType: 'gif',
      mediaUrl: gifUrl,
      at: Date.now(),
      status: 'sending',
    };
    setMessagesByThread((prev) => ({
      ...prev,
      [selectedThread]: [...(prev[selectedThread] || []), gifMessage],
    }));
    setShowGifPicker(false);

    setTimeout(() => {
      setMessagesByThread((prev) => ({
        ...prev,
        [selectedThread]: prev[selectedThread].map((msg) =>
          msg.id === gifMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
    }, 1000);
  };

  // Message actions
  const handleReply = (message: Message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setMessageInput(message.text || '');
    messageInputRef.current?.focus();
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Delete this message?')) {
      setMessagesByThread((prev) => ({
        ...prev,
        [selectedThread]: prev[selectedThread].map((msg) =>
          msg.id === messageId ? { ...msg, deleted: true } : msg
        ),
      }));
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessagesByThread((prev) => ({
      ...prev,
      [selectedThread]: prev[selectedThread].map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find((r) => r.emoji === emoji);

          if (existingReaction) {
            // Add user to existing reaction
            return {
              ...msg,
              reactions: reactions.map((r) =>
                r.emoji === emoji ? { ...r, users: [...r.users, 'You'] } : r
              ),
            };
          } else {
            // Create new reaction
            return {
              ...msg,
              reactions: [...reactions, { emoji, users: ['You'] }],
            };
          }
        }
        return msg;
      }),
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  const copyMessage = () => {
    if (contextMenu.message?.text) {
      navigator.clipboard.writeText(contextMenu.message.text);
    }
    setContextMenu({ show: false, x: 0, y: 0, message: null });
  };

  const forwardMessage = () => {
    // Implement forward logic
    setContextMenu({ show: false, x: 0, y: 0, message: null });
  };

  const downloadMedia = () => {
    if (contextMenu.message?.mediaUrl) {
      const link = document.createElement('a');
      link.href = contextMenu.message.mediaUrl;
      link.download = `media-${Date.now()}`;
      link.click();
    }
    setContextMenu({ show: false, x: 0, y: 0, message: null });
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowGifPicker(false);
        setShowEmojiPicker(false);
        setReplyingTo(null);
        setEditingMessage(null);
        setContextMenu({ show: false, x: 0, y: 0, message: null });
        setShowNewMessage(false);
        setNewMessageRecipient('');
      }

      // Ctrl/Cmd + F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearchInChat(!showSearchInChat);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearchInChat]);

  // Click outside to close context menu
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, message: null });
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu.show]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedThread]);

  return (
    <div
      className={`production-messages-page ${colorMode === 'dark' ? 'dark-mode' : ''}`}
    >
      {/* Connection Status Banner */}
      <AnimatePresence>
        {connectionStatus !== 'online' && (
          <motion.div
            className="connection-banner"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            {connectionStatus === 'connecting'
              ? '🔄 Connecting...'
              : '⚠️ No internet connection'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Overlay */}
      <AnimatePresence>
        {call.active && (
          <motion.div
            className="call-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="call-container">
              {call.type === 'video' && call.videoEnabled ? (
                <div className="video-call-layout">
                  <video
                    ref={remoteVideoRef}
                    className="remote-video"
                    autoPlay
                    playsInline
                  />
                  <motion.div
                    className="local-video-pip"
                    drag
                    dragConstraints={{
                      left: 0,
                      right: 300,
                      top: 0,
                      bottom: 300,
                    }}
                  >
                    <video
                      ref={localVideoRef}
                      className="local-video"
                      autoPlay
                      playsInline
                      muted
                    />
                  </motion.div>
                  <div className="call-info-overlay">
                    <div className="call-participant-name">
                      {call.participant?.name}
                    </div>
                    <div className="call-meta">
                      <span className="call-duration">
                        {formatDuration(call.duration)}
                      </span>
                      <span
                        className={`connection-quality quality-${call.connectionQuality}`}
                      >
                        {call.connectionQuality === 'excellent' && '📶'}
                        {call.connectionQuality === 'good' && '📶'}
                        {call.connectionQuality === 'poor' && '📶'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="audio-call-layout">
                  <div className="audio-call-avatar">
                    <Image
                      src={call.participant?.avatar || ''}
                      alt={call.participant?.name || ''}
                      width={180}
                      height={180}
                      className="avatar-large"
                    />
                  </div>
                  <h2 className="call-name">{call.participant?.name}</h2>
                  <p className="call-status">
                    {call.duration > 0
                      ? formatDuration(call.duration)
                      : 'Connecting...'}
                  </p>
                  <span
                    className={`connection-quality-text quality-${call.connectionQuality}`}
                  >
                    Connection: {call.connectionQuality}
                  </span>
                </div>
              )}

              <div className="call-controls-bar">
                <motion.button
                  className={`control-btn ${call.muted ? 'muted' : ''}`}
                  onClick={toggleMute}
                >
                  <span className="control-icon">
                    {call.muted ? '🔇' : '🎤'}
                  </span>
                  <span className="control-label">
                    {call.muted ? 'Unmute' : 'Mute'}
                  </span>
                </motion.button>

                {call.type === 'video' && (
                  <>
                    <motion.button
                      className={`control-btn ${!call.videoEnabled ? 'disabled' : ''}`}
                      onClick={toggleVideo}
                    >
                      <span className="control-icon">
                        {call.videoEnabled ? '📹' : '📷'}
                      </span>
                      <span className="control-label">
                        {call.videoEnabled ? 'Stop Video' : 'Start Video'}
                      </span>
                    </motion.button>

                    <motion.button
                      className={`control-btn ${call.screenSharing ? 'active' : ''}`}
                      onClick={toggleScreenShare}
                    >
                      <span className="control-icon">🖥️</span>
                      <span className="control-label">
                        {call.screenSharing ? 'Stop Share' : 'Share Screen'}
                      </span>
                    </motion.button>
                  </>
                )}

                <motion.button
                  className="control-btn end-call-btn"
                  onClick={endCall}
                >
                  <span className="control-icon">📞</span>
                  <span className="control-label">End Call</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.show && (
          <motion.div
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <button onClick={() => handleReply(contextMenu.message!)}>
              <span>↩️</span> Reply
            </button>
            {contextMenu.message?.text && (
              <button onClick={copyMessage}>
                <span>📋</span> Copy
              </button>
            )}
            <button onClick={forwardMessage}>
              <span>↪️</span> Forward
            </button>
            {contextMenu.message?.mediaUrl && (
              <button onClick={downloadMedia}>
                <span>⬇️</span> Download
              </button>
            )}
            {contextMenu.message?.sender === 'me' && (
              <>
                <button onClick={() => handleEdit(contextMenu.message!)}>
                  <span>✏️</span> Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(contextMenu.message!.id);
                    setContextMenu({ show: false, x: 0, y: 0, message: null });
                  }}
                  className="delete-btn"
                >
                  <span>🗑️</span> Delete
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="drag-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="drag-content">
              <span className="drag-icon">📁</span>
              <h3>Drop files to send</h3>
              <p>Images and videos only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            className="new-message-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewMessage(false)}
          >
            <motion.div
              className="new-message-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="new-message-header">
                <h2>New Message</h2>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowNewMessage(false)}
                >
                  ✕
                </button>
              </div>

              <div className="new-message-search">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search for people..."
                  value={newMessageRecipient}
                  onChange={(e) => setNewMessageRecipient(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="suggested-users">
                <p className="section-label">Suggested</p>
                {threads
                  .filter(
                    (thread) =>
                      newMessageRecipient === '' ||
                      thread.name
                        .toLowerCase()
                        .includes(newMessageRecipient.toLowerCase())
                  )
                  .map((thread) => (
                    <motion.div
                      key={thread.id}
                      className="suggested-user-item"
                      onClick={() => {
                        setSelectedThread(thread.id);
                        setShowNewMessage(false);
                        setNewMessageRecipient('');
                        messageInputRef.current?.focus();
                      }}
                    >
                      <Image
                        src={thread.avatar}
                        alt={thread.name}
                        width={44}
                        height={44}
                        className="suggested-user-avatar"
                      />
                      <div className="suggested-user-info">
                        <span className="suggested-user-name">
                          {thread.name}
                          {thread.verified && (
                            <span className="verified-icon">✓</span>
                          )}
                        </span>
                        <span className="suggested-user-status">
                          {thread.online ? 'Active now' : thread.lastSeen}
                        </span>
                      </div>
                      {thread.online && <span className="online-indicator" />}
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Messages Interface */}
      <div className="messages-layout">
        {/* Sidebar */}
        <motion.div
          className="messages-sidebar"
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="sidebar-header">
            <h1 className="sidebar-title">Messages</h1>
            <div className="header-actions">
              <motion.button
                className="compose-btn"
                title="New message"
                onClick={() => setShowNewMessage(true)}
              >
                ✏️
              </motion.button>
            </div>
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="threads-container">
            <AnimatePresence>
              {filteredThreads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  className={`thread-item ${thread.id === selectedThread ? 'active' : ''} ${
                    thread.pinned ? 'pinned' : ''
                  }`}
                  onClick={() => setSelectedThread(thread.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="thread-avatar-wrapper">
                    <Image
                      src={thread.avatar}
                      alt={thread.name}
                      width={56}
                      height={56}
                      className="thread-avatar"
                    />
                    {thread.online && (
                      <motion.span
                        className="online-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      />
                    )}
                    {thread.unread > 0 && (
                      <motion.span
                        className="unread-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {thread.unread}
                      </motion.span>
                    )}
                  </div>

                  <div className="thread-content">
                    <div className="thread-top">
                      <h3 className="thread-name">
                        {thread.pinned && <span className="pin-icon">📌</span>}
                        {thread.name}
                        {thread.verified && (
                          <span className="verified-icon">✓</span>
                        )}
                        {thread.muted && <span className="muted-icon">🔕</span>}
                      </h3>
                      <span className="thread-time">{thread.time}</span>
                    </div>
                    <div className="thread-bottom">
                      {thread.isTyping ? (
                        <motion.span
                          className="typing-indicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-text">typing</span>
                        </motion.span>
                      ) : (
                        <p className="thread-preview">{thread.lastMessage}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Chat Area */}
        <div
          className="chat-area"
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="header-avatar-wrapper">
                <Image
                  src={activeThread?.avatar || ''}
                  alt={activeThread?.name || ''}
                  width={44}
                  height={44}
                  className="header-avatar"
                />
                {activeThread?.online && <span className="online-dot" />}
              </div>
              <div className="header-info">
                <h2 className="chat-title">
                  {activeThread?.name}
                  {activeThread?.verified && (
                    <span className="verified-badge-small">✓</span>
                  )}
                </h2>
                <p className="chat-status">
                  {activeThread?.isTyping ? (
                    <span className="typing-text-header">typing...</span>
                  ) : activeThread?.online ? (
                    <span className="online-text">Active now</span>
                  ) : (
                    <span className="offline-text">
                      {activeThread?.lastSeen}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="chat-header-actions">
              <motion.button
                className="header-action-btn"
                onClick={() => setShowSearchInChat(!showSearchInChat)}
                title="Search in conversation (Ctrl+F)"
              >
                🔍
              </motion.button>
              <motion.button
                className="header-action-btn"
                onClick={() => startCall('voice')}
                title="Voice call"
              >
                📞
              </motion.button>
              <motion.button
                className="header-action-btn"
                onClick={() => startCall('video')}
                title="Video call"
              >
                📹
              </motion.button>
              <motion.button className="header-action-btn" title="More options">
                ⋮
              </motion.button>
            </div>
          </div>

          {/* Search in Chat */}
          <AnimatePresence>
            {showSearchInChat && (
              <motion.div
                className="search-in-chat-bar"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
              >
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-in-chat-input"
                  autoFocus
                />
                <button onClick={() => setShowSearchInChat(false)}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Container */}
          <div className="messages-container" ref={scrollRef}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                activeThread={activeThread}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>

          {/* Reply Preview */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                className="reply-preview-bar"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
              >
                <div className="reply-preview-content">
                  <div className="reply-line-vert"></div>
                  <div>
                    <div className="reply-to-name">
                      Replying to{' '}
                      {replyingTo.sender === 'me'
                        ? 'yourself'
                        : activeThread?.name}
                    </div>
                    <div className="reply-to-text">
                      {replyingTo.text || '📎 Media'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="reply-cancel"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Preview */}
          <AnimatePresence>
            {editingMessage && (
              <motion.div
                className="edit-preview-bar"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
              >
                <div className="edit-preview-content">
                  <span className="edit-icon">✏️</span>
                  <span>Editing message</span>
                </div>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setMessageInput('');
                  }}
                  className="edit-cancel"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Preview */}
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                className="file-preview-bar"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
              >
                <div className="preview-content">
                  {selectedFile?.type.startsWith('image') ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={60}
                      height={60}
                      className="preview-thumb"
                    />
                  ) : (
                    <div className="preview-video-icon">📹</div>
                  )}
                  <div className="preview-info">
                    <span className="preview-filename">
                      {selectedFile?.name}
                    </span>
                    <span className="preview-size">
                      {selectedFile &&
                        (selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
                      MB
                    </span>
                  </div>
                </div>
                <motion.button
                  className="preview-remove"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  ✕
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Recording */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                className="recording-bar"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
              >
                <div className="recording-content">
                  <motion.span
                    className="recording-icon"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🔴
                  </motion.span>
                  <span className="recording-time">
                    {formatDuration(recordingTime)}
                  </span>
                  <div className="recording-waveform">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="recording-wave-bar"
                        animate={{ height: ['20%', '100%', '20%'] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="recording-actions">
                  <button
                    onClick={cancelRecording}
                    className="recording-cancel"
                  >
                    ✕
                  </button>
                  <button onClick={stopRecording} className="recording-send">
                    ➤
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Recording */}
          <AnimatePresence>
            {isVideoRecording && (
              <motion.div
                className="video-recording-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="video-recording-container">
                  <video
                    ref={videoPreviewRef}
                    className="video-preview"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="video-recording-controls">
                    <motion.span
                      className="recording-indicator"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      🔴 REC
                    </motion.span>
                    <span className="video-recording-time">
                      {formatDuration(recordingTime)}
                    </span>
                  </div>
                  <div className="video-recording-actions">
                    <motion.button
                      onClick={cancelVideoRecording}
                      className="video-cancel-btn"
                    >
                      ✕
                    </motion.button>
                    <motion.button
                      onClick={stopVideoRecording}
                      className="video-send-btn"
                    >
                      ➤
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GIF Picker */}
          <AnimatePresence>
            {showGifPicker && (
              <motion.div
                className="gif-picker-panel"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
              >
                <div className="gif-picker-header">
                  <h4>Choose a GIF</h4>
                  <button onClick={() => setShowGifPicker(false)}>✕</button>
                </div>
                <div className="gif-grid">
                  {popularGifs.map((gifUrl, index) => (
                    <motion.img
                      key={index}
                      src={gifUrl}
                      alt="GIF"
                      className="gif-item"
                      onClick={() => sendGif(gifUrl)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                className="emoji-picker-panel"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                {quickEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    className="emoji-btn"
                    onClick={() => {
                      setMessageInput(messageInput + emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />

            <div className="input-actions-left">
              <motion.button
                className="input-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                📎
              </motion.button>
              <motion.button
                className="input-btn"
                onClick={() => setShowGifPicker(!showGifPicker)}
                title="Send GIF"
              >
                GIF
              </motion.button>
              <motion.button
                className={`input-btn ${isRecording ? 'recording-active' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isRecording) cancelRecording();
                }}
                title={isRecording ? 'Stop recording' : 'Record voice message'}
              >
                🎤
              </motion.button>
              <motion.button
                className={`input-btn ${isVideoRecording ? 'recording-active' : ''}`}
                onClick={
                  isVideoRecording ? stopVideoRecording : startVideoRecording
                }
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isVideoRecording) cancelVideoRecording();
                }}
                title={
                  isVideoRecording
                    ? 'Stop video recording'
                    : 'Record video message'
                }
              >
                🎬
              </motion.button>
            </div>

            <form onSubmit={handleSend} className="message-form">
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={
                  editingMessage
                    ? 'Edit message...'
                    : replyingTo
                      ? 'Type a reply...'
                      : 'Type a message...'
                }
                className="message-input-field"
              />
            </form>

            <div className="input-actions-right">
              <motion.button
                className="input-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Emoji"
              >
                😊
              </motion.button>
              <motion.button
                className="send-btn"
                onClick={handleSend}
                disabled={!messageInput.trim() && !selectedFile}
                title="Send"
              >
                {editingMessage ? '✓' : '➤'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .production-messages-page {
          height: 100vh;
          background: linear-gradient(
            135deg,
            #fdf2f8 0%,
            #faf5ff 50%,
            #f5f3ff 100%
          ) !important;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .production-messages-page.dark-mode {
          background: linear-gradient(
            135deg,
            #0f0a1f 0%,
            #1a0b2e 50%,
            #16213e 100%
          ) !important;
        }

        /* Smooth Scroll */
        * {
          scroll-behavior: smooth;
        }

        /* Production Quality Transitions */
        button,
        input,
        .thread-item,
        .message-bubble {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Connection Banner */
        .connection-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff3b30;
          color: white;
          padding: 12px;
          text-align: center;
          font-weight: 600;
          z-index: 10001;
        }

        .dark-mode .connection-banner {
          background: #ff453a;
        }

        /* Call Overlay - Same as before */
        .call-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.98);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .call-container {
          width: 100%;
          max-width: 1200px;
          height: 100%;
          max-height: 800px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 40px;
        }

        .video-call-layout {
          flex: 1;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .local-video-pip {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 200px;
          height: 150px;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.3);
          cursor: move;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .local-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .call-info-overlay {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          padding: 12px 20px;
          border-radius: 30px;
          color: white;
        }

        .call-participant-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .call-meta {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .call-duration {
          font-size: 14px;
        }

        .connection-quality {
          font-size: 14px;
        }

        .quality-excellent {
          opacity: 1;
        }
        .quality-good {
          opacity: 0.7;
        }
        .quality-poor {
          opacity: 0.4;
        }

        .audio-call-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }

        .audio-call-avatar {
          position: relative;
        }

        .avatar-large {
          border-radius: 50%;
          border: 6px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .call-name {
          font-size: 36px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .call-status {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .connection-quality-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .call-controls-bar {
          display: flex;
          justify-content: center;
          gap: 20px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 60px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .control-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .control-btn.muted,
        .control-btn.disabled,
        .control-btn.active {
          background: rgba(255, 59, 48, 0.3);
        }

        .end-call-btn {
          background: rgba(255, 59, 48, 0.8);
        }

        .end-call-btn:hover {
          background: rgba(255, 59, 48, 1);
        }

        .control-icon {
          font-size: 28px;
        }

        .control-label {
          font-size: 14px;
          font-weight: 500;
        }

        /* Context Menu */
        .context-menu {
          position: fixed;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          padding: 8px;
          z-index: 1000;
          min-width: 180px;
        }

        .context-menu button {
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          text-align: left;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          transition: background 0.2s ease;
        }

        .context-menu button:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .context-menu button.delete-btn:hover {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }

        /* Drag Overlay */
        .drag-overlay {
          position: fixed;
          inset: 0;
          background: rgba(102, 126, 234, 0.95);
          backdrop-filter: blur(10px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drag-content {
          text-align: center;
          color: white;
        }

        .drag-icon {
          font-size: 80px;
          display: block;
          margin-bottom: 20px;
        }

        .drag-content h3 {
          font-size: 28px;
          margin: 0 0 12px 0;
        }

        .drag-content p {
          font-size: 16px;
          opacity: 0.9;
        }

        /* New Message Modal */
        .new-message-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .new-message-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .new-message-modal {
          background: rgba(30, 20, 50, 0.98);
        }

        .new-message-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .new-message-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .dark-mode .new-message-header h2 {
          color: #f8fafc;
        }

        .close-modal-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(139, 92, 246, 0.1);
          color: #6b7280;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-modal-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }

        .new-message-search {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .new-message-search .search-icon {
          font-size: 18px;
          opacity: 0.5;
        }

        .new-message-search input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          color: #1a1a1a;
          outline: none;
        }

        .dark-mode .new-message-search input {
          color: #f8fafc;
        }

        .new-message-search input::placeholder {
          color: #9ca3af;
        }

        .suggested-users {
          padding: 16px 0;
          overflow-y: auto;
          max-height: 400px;
        }

        .section-label {
          padding: 0 24px 12px 24px;
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
        }

        .suggested-user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggested-user-item:hover {
          background: rgba(139, 92, 246, 0.08);
        }

        .suggested-user-avatar {
          border-radius: 50%;
          border: 2px solid rgba(139, 92, 246, 0.2);
        }

        .suggested-user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .suggested-user-name {
          font-weight: 600;
          font-size: 15px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dark-mode .suggested-user-name {
          color: #f8fafc;
        }

        .suggested-user-name .verified-icon {
          font-size: 12px;
          color: #8b5cf6;
        }

        .suggested-user-status {
          font-size: 13px;
          color: #6b7280;
        }

        .online-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
        }

        /* Main Layout */
        .messages-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          height: 100vh;
          gap: 0;
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        /* Sidebar - Premium design */
        .messages-sidebar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(139, 92, 246, 0.15);
          box-shadow: 2px 0 20px rgba(139, 92, 246, 0.08);
          height: 100%;
          overflow: hidden;
        }

        .dark-mode .messages-sidebar {
          background: rgba(30, 20, 50, 0.95);
          border-right: 1px solid rgba(167, 139, 250, 0.2);
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
        }

        .sidebar-header {
          padding: 20px 20px 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(139, 92, 246, 0.1);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }

        .dark-mode .sidebar-header {
          border-bottom-color: rgba(167, 139, 250, 0.15);
          background: rgba(30, 20, 50, 0.8);
        }

        .sidebar-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          color: #000;
          letter-spacing: -1px;
        }

        .dark-mode .sidebar-title {
          color: #fff;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .compose-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 4px 15px rgba(102, 126, 234, 0.4),
            0 2px 6px rgba(118, 75, 162, 0.3);
          transform: scale(1);
          position: relative;
        }

        .compose-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0)
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.5;
        }

        .compose-btn:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          transform: scale(1.1);
          box-shadow:
            0 6px 20px rgba(102, 126, 234, 0.5),
            0 4px 10px rgba(118, 75, 162, 0.4);
        }

        .compose-btn:active {
          transform: scale(0.96);
          transition-duration: 0.15s;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }

        .dark-mode .compose-btn {
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
          box-shadow:
            0 4px 15px rgba(167, 139, 250, 0.4),
            0 2px 6px rgba(139, 92, 246, 0.3);
        }

        .dark-mode .compose-btn:hover {
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          box-shadow:
            0 6px 20px rgba(167, 139, 250, 0.5),
            0 4px 10px rgba(139, 92, 246, 0.4);
        }

        .search-container {
          padding: 12px 16px 16px 16px;
          flex-shrink: 0;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          font-size: 16px;
          opacity: 0.4;
          pointer-events: none;
        }

        .dark-mode .search-icon {
          opacity: 0.5;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          font-size: 15px;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.02) 0%,
            rgba(0, 0, 0, 0.04) 100%
          );
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.04),
            inset 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .search-input:focus {
          outline: none;
          border-color: #8b5cf6;
          background: white;
          box-shadow:
            0 3px 8px rgba(139, 92, 246, 0.15),
            0 2px 4px rgba(139, 92, 246, 0.1),
            inset 0 1px 2px rgba(139, 92, 246, 0.05);
          transform: translateY(-1px);
        }

        .search-input:hover:not(:focus) {
          border-color: rgba(0, 0, 0, 0.12);
          background: rgba(0, 0, 0, 0.04);
        }

        .dark-mode .search-input {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(255, 255, 255, 0.06) 100%
          );
          border-color: rgba(255, 255, 255, 0.1);
          color: #fff;
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .dark-mode .search-input:focus {
          border-color: #a78bfa;
          background: rgba(255, 255, 255, 0.1);
          box-shadow:
            0 3px 8px rgba(167, 139, 250, 0.2),
            0 2px 4px rgba(167, 139, 250, 0.12),
            inset 0 1px 2px rgba(167, 139, 250, 0.08);
        }

        .dark-mode .search-input:hover:not(:focus) {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.08);
        }

        .threads-container {
          flex: 1;
          overflow-y: auto;
          padding: 4px 12px 12px 12px;
          min-height: 0;
        }

        .thread-item {
          display: flex;
          gap: 12px;
          padding: 14px;
          cursor: pointer;
          border-radius: 14px;
          margin-bottom: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          transform: translateX(0) scale(1);
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .thread-item:hover {
          background: #ffffff;
          transform: translateX(4px) scale(1.02);
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.08),
            0 2px 8px rgba(0, 0, 0, 0.04);
          border-color: rgba(139, 92, 246, 0.08);
        }

        .thread-item:active {
          transform: translateX(2px) scale(0.98);
          transition-duration: 0.15s;
        }

        .thread-item.active {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.08) 0%,
            rgba(139, 92, 246, 0.04) 100%
          );
          transform: translateX(0) scale(1);
          box-shadow:
            0 4px 20px rgba(139, 92, 246, 0.12),
            0 2px 8px rgba(139, 92, 246, 0.08);
          border: 1.5px solid rgba(139, 92, 246, 0.2);
        }

        .dark-mode .thread-item {
          background: rgba(42, 42, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.04);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .thread-item:hover {
          background: #2a2a2a;
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.3);
          border-color: rgba(167, 139, 250, 0.15);
        }

        .dark-mode .thread-item.active {
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.12) 0%,
            rgba(167, 139, 250, 0.06) 100%
          );
          box-shadow:
            0 4px 20px rgba(167, 139, 250, 0.2),
            0 2px 8px rgba(167, 139, 250, 0.15);
          border: 1.5px solid rgba(167, 139, 250, 0.3);
        }

        .thread-item.pinned {
          background: rgba(255, 215, 0, 0.05);
        }

        .thread-avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .thread-avatar-wrapper::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 50%,
            #f093fb 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .thread-item:hover .thread-avatar-wrapper::before {
          opacity: 1;
        }

        .thread-avatar {
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            0 4px 12px rgba(139, 92, 246, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .thread-item:hover .thread-avatar {
          border-color: rgba(255, 255, 255, 1);
          box-shadow:
            0 6px 20px rgba(139, 92, 246, 0.25),
            0 3px 10px rgba(0, 0, 0, 0.12);
          transform: scale(1.08);
        }

        .dark-mode .thread-avatar {
          border-color: rgba(30, 20, 50, 0.9);
          box-shadow:
            0 4px 12px rgba(167, 139, 250, 0.2),
            0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .thread-item:hover .thread-avatar {
          border-color: rgba(30, 20, 50, 1);
          box-shadow:
            0 6px 20px rgba(167, 139, 250, 0.35),
            0 3px 10px rgba(0, 0, 0, 0.4);
        }

        .online-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow:
            0 0 0 0 rgba(52, 199, 89, 0.6),
            0 2px 6px rgba(52, 199, 89, 0.4);
          animation: onlinePulse 2s ease-in-out infinite;
        }

        @keyframes onlinePulse {
          0%,
          100% {
            box-shadow:
              0 0 0 0 rgba(52, 199, 89, 0.6),
              0 2px 6px rgba(52, 199, 89, 0.4);
          }
          50% {
            box-shadow:
              0 0 0 4px rgba(52, 199, 89, 0),
              0 2px 8px rgba(52, 199, 89, 0.5);
          }
        }

        .dark-mode .online-badge {
          background: linear-gradient(135deg, #30d158 0%, #2ecc40 100%);
          border-color: #1a1a1a;
          box-shadow:
            0 0 0 0 rgba(48, 209, 88, 0.7),
            0 2px 6px rgba(48, 209, 88, 0.5);
        }

        @keyframes onlinePulseDark {
          0%,
          100% {
            box-shadow:
              0 0 0 0 rgba(48, 209, 88, 0.7),
              0 2px 6px rgba(48, 209, 88, 0.5);
          }
          50% {
            box-shadow:
              0 0 0 4px rgba(48, 209, 88, 0),
              0 2px 8px rgba(48, 209, 88, 0.6);
          }
        }

        .dark-mode .online-badge {
          animation: onlinePulseDark 2s ease-in-out infinite;
        }

        .unread-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 24px;
          height: 24px;
          padding: 0 7px;
          background: #ff3b30;
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dark-mode .unread-badge {
          background: #ff453a;
        }

        .thread-content {
          flex: 1;
          min-width: 0;
        }

        .thread-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .thread-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #1a1a1a;
        }

        .dark-mode .thread-name {
          color: #f5f5f5;
        }

        .pin-icon {
          font-size: 12px;
        }

        .verified-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: #8b5cf6;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
        }

        .dark-mode .verified-icon {
          background: #a78bfa;
        }

        .muted-icon {
          font-size: 14px;
          opacity: 0.6;
        }

        .thread-time {
          font-size: 13px;
          color: #8e8e93;
          font-weight: 500;
        }

        .dark-mode .thread-time {
          color: #8e8e93;
        }

        .thread-bottom {
          display: flex;
          align-items: center;
        }

        .thread-preview {
          margin: 0;
          font-size: 14px;
          color: #6c6c70;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dark-mode .thread-preview {
          color: #98989d;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #8b5cf6;
          font-size: 14px;
          font-weight: 500;
        }

        .dark-mode .typing-indicator {
          color: #a78bfa;
        }

        .typing-dot {
          width: 7px;
          height: 7px;
          background: #8b5cf6;
          border-radius: 50%;
          animation: typingBounce 1.4s ease-in-out infinite;
        }

        .dark-mode .typing-dot {
          background: #a78bfa;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px) scale(1.1);
            opacity: 1;
          }
        }

        /* Chat Area - Premium design */
        .chat-area {
          background: linear-gradient(
            180deg,
            rgba(253, 242, 248, 0.6) 0%,
            rgba(250, 245, 255, 0.6) 100%
          );
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: inset 2px 0 4px rgba(139, 92, 246, 0.05);
          height: 100vh;
          overflow: hidden;
        }

        .dark-mode .chat-area {
          background: linear-gradient(
            180deg,
            rgba(15, 10, 31, 0.8) 0%,
            rgba(26, 11, 46, 0.8) 100%
          );
          box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.5);
        }

        .chat-header {
          padding: 18px 28px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(250, 245, 255, 0.9) 100%
          );
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }

        .dark-mode .chat-header {
          background: linear-gradient(
            180deg,
            rgba(30, 20, 50, 0.9) 0%,
            rgba(26, 11, 46, 0.9) 100%
          );
          border-bottom-color: rgba(167, 139, 250, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .header-avatar-wrapper {
          position: relative;
        }

        .header-avatar-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0.6;
        }

        .header-avatar {
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
          position: relative;
          z-index: 1;
        }

        .dark-mode .header-avatar {
          border-color: rgba(30, 20, 50, 0.9);
        }

        .online-dot {
          position: absolute;
          bottom: 2px;
          right: 0;
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          border: 2px solid white;
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
        }

        .dark-mode .online-dot {
          border-color: rgba(30, 20, 50, 0.9);
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .chat-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #1a1a1a;
        }

        .dark-mode .chat-title {
          color: #f5f5f5;
        }

        .verified-badge-small {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: #8b5cf6;
          color: white;
          border-radius: 50%;
          font-size: 9px;
        }

        .dark-mode .verified-badge-small {
          background: #a78bfa;
        }

        .chat-status {
          font-size: 13px;
          margin: 0;
        }

        .online-text {
          color: #34c759;
          font-weight: 500;
        }

        .dark-mode .online-text {
          color: #30d158;
        }

        .offline-text {
          color: #8e8e93;
        }

        .dark-mode .offline-text {
          color: #8e8e93;
        }

        .typing-text-header {
          color: #667eea;
          font-weight: 500;
        }

        .chat-header-actions {
          display: flex;
          gap: 8px;
        }

        .header-action-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.08) 0%,
            rgba(139, 92, 246, 0.12) 100%
          );
          border: 1px solid rgba(139, 92, 246, 0.1);
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: scale(1);
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.08);
        }

        .header-action-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(139, 92, 246, 0.25) 100%
          );
          border-color: rgba(139, 92, 246, 0.2);
          transform: scale(1.1);
          box-shadow: 0 3px 10px rgba(139, 92, 246, 0.15);
        }

        .header-action-btn:active {
          transform: scale(0.94);
          transition-duration: 0.15s;
          box-shadow: 0 1px 4px rgba(139, 92, 246, 0.12);
        }

        .dark-mode .header-action-btn {
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.12) 0%,
            rgba(167, 139, 250, 0.18) 100%
          );
          border-color: rgba(167, 139, 250, 0.15);
          box-shadow: 0 2px 6px rgba(167, 139, 250, 0.12);
        }

        .dark-mode .header-action-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.2) 0%,
            rgba(167, 139, 250, 0.3) 100%
          );
          border-color: rgba(167, 139, 250, 0.25);
          box-shadow: 0 3px 10px rgba(167, 139, 250, 0.2);
        }

        /* Search in Chat */
        .search-in-chat-bar {
          padding: 12px 24px;
          background: rgba(102, 126, 234, 0.1);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-in-chat-input {
          flex: 1;
          padding: 10px 16px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-size: 14px;
        }

        .search-in-chat-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .search-in-chat-bar button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Messages Container */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 28px 36px;
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
          min-height: 0;
        }

        .dark-mode .messages-container {
          background: transparent;
        }

        .message-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          position: relative;
        }

        .message-wrapper.sent {
          justify-content: flex-end;
        }

        .message-avatar {
          border-radius: 50%;
          flex-shrink: 0;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            0 3px 10px rgba(139, 92, 246, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .message-wrapper:hover .message-avatar {
          transform: scale(1.05);
          box-shadow:
            0 4px 14px rgba(139, 92, 246, 0.25),
            0 3px 6px rgba(0, 0, 0, 0.1);
        }

        .dark-mode .message-avatar {
          border-color: rgba(30, 20, 50, 0.9);
          box-shadow:
            0 3px 10px rgba(167, 139, 250, 0.2),
            0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .dark-mode .message-wrapper:hover .message-avatar {
          box-shadow:
            0 4px 14px rgba(167, 139, 250, 0.35),
            0 3px 6px rgba(0, 0, 0, 0.4);
        }

        .message-bubble-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 65%;
          position: relative;
        }

        .message-actions {
          position: absolute;
          top: -8px;
          right: -8px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: none;
          gap: 4px;
          padding: 4px;
        }

        .message-wrapper:hover .message-actions {
          display: flex;
        }

        .message-actions button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.1);
          border: none;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform: scale(1);
        }

        .message-actions button:hover {
          background: rgba(139, 92, 246, 0.2);
          transform: scale(1.15);
        }

        .message-actions button:active {
          transform: scale(0.9);
          transition-duration: 0.1s;
        }

        .dark-mode .message-actions button {
          background: rgba(167, 139, 250, 0.15);
        }

        .dark-mode .message-actions button:hover {
          background: rgba(167, 139, 250, 0.25);
        }

        .reply-preview {
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
        }

        .reply-line {
          width: 3px;
          background: #8b5cf6;
          border-radius: 2px;
        }

        .dark-mode .reply-line {
          background: #a78bfa;
        }

        .reply-content {
          flex: 1;
        }

        .reply-name {
          font-size: 12px;
          font-weight: 600;
          color: #667eea;
          display: block;
          margin-bottom: 2px;
        }

        .reply-text {
          font-size: 13px;
          color: #666;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .forwarded-badge {
          font-size: 12px;
          color: #666;
          font-style: italic;
          margin-bottom: 4px;
        }

        .message-bubble {
          padding: 12px 18px;
          border-radius: 20px;
          position: relative;
          word-wrap: break-word;
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.06),
            0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 15px;
          line-height: 1.5;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .message-bubble:hover {
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.1),
            0 2px 6px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .bubble-received {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(248, 250, 252, 0.95) 100%
          );
          border-bottom-left-radius: 6px;
          border-color: rgba(139, 92, 246, 0.1);
          box-shadow:
            0 2px 8px rgba(139, 92, 246, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .bubble-received:hover {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(245, 243, 255, 1) 100%
          );
          box-shadow:
            0 4px 12px rgba(139, 92, 246, 0.12),
            0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .dark-mode .bubble-received {
          background: linear-gradient(
            135deg,
            rgba(40, 30, 60, 0.95) 0%,
            rgba(30, 20, 50, 0.95) 100%
          );
          border-color: rgba(167, 139, 250, 0.15);
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.3),
            0 1px 3px rgba(167, 139, 250, 0.1);
        }

        .dark-mode .bubble-received:hover {
          background: linear-gradient(
            135deg,
            rgba(50, 40, 70, 0.95) 0%,
            rgba(40, 30, 60, 0.95) 100%
          );
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.4),
            0 2px 6px rgba(167, 139, 250, 0.15);
        }

        .bubble-sent {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 6px;
          border-color: rgba(102, 126, 234, 0.3);
          box-shadow:
            0 4px 12px rgba(102, 126, 234, 0.3),
            0 2px 4px rgba(118, 75, 162, 0.2);
        }

        .bubble-sent:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          box-shadow:
            0 6px 20px rgba(102, 126, 234, 0.4),
            0 3px 8px rgba(118, 75, 162, 0.3);
        }

        .dark-mode .bubble-sent {
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
          box-shadow:
            0 4px 12px rgba(167, 139, 250, 0.3),
            0 2px 4px rgba(139, 92, 246, 0.2);
        }

        .dark-mode .bubble-sent:hover {
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          box-shadow:
            0 6px 20px rgba(167, 139, 250, 0.4),
            0 3px 8px rgba(139, 92, 246, 0.3);
        }

        .message-failed {
          opacity: 0.5;
          border: 2px solid #ff3b30;
        }

        .deleted-message {
          background: rgba(0, 0, 0, 0.05);
          font-style: italic;
        }

        .deleted-text {
          margin: 0;
          color: #999;
        }

        .message-media {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .media-image {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 12px;
        }

        .media-video {
          width: 100%;
          border-radius: 12px;
        }

        .voice-message {
          display: flex;
          align-items: center;
          padding: 4px;
          min-width: 200px;
        }

        .voice-audio-player {
          width: 100%;
          height: 40px;
          border-radius: 20px;
        }

        .voice-audio-player::-webkit-media-controls-panel {
          background: rgba(255, 255, 255, 0.1);
        }

        .bubble-sent .voice-audio-player {
          filter: brightness(1.2);
        }

        .bubble-sent
          .voice-audio-player::-webkit-media-controls-current-time-display,
        .bubble-sent
          .voice-audio-player::-webkit-media-controls-time-remaining-display {
          color: white;
        }

        .message-text {
          margin: 0;
          font-size: 15px;
          line-height: 1.5;
        }

        .message-reactions {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .reaction-bubble {
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .add-reaction-btn {
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.05);
          border: 1px dashed rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          opacity: 0.6;
        }

        .add-reaction-btn:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.1);
        }

        .message-meta {
          display: flex;
          gap: 6px;
          align-items: center;
          font-size: 12px;
          color: #666;
          padding: 0 4px;
        }

        .message-wrapper.sent .message-meta {
          justify-content: flex-end;
        }

        .edited-badge {
          font-size: 11px;
          font-style: italic;
        }

        .message-status {
          color: #667eea;
        }

        .seen-checkmark {
          color: #10b981;
        }

        /* Bars */
        .reply-preview-bar,
        .edit-preview-bar,
        .file-preview-bar,
        .recording-bar {
          padding: 12px 24px;
          background: rgba(102, 126, 234, 0.1);
          border-top: 1px solid rgba(102, 126, 234, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .reply-preview-content,
        .edit-preview-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reply-line-vert {
          width: 3px;
          height: 40px;
          background: #8b5cf6;
          border-radius: 2px;
        }

        .dark-mode .reply-line-vert {
          background: #a78bfa;
        }

        .reply-to-name {
          font-size: 13px;
          font-weight: 600;
          color: #667eea;
        }

        .reply-to-text {
          font-size: 14px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .edit-icon {
          font-size: 18px;
        }

        .reply-cancel,
        .edit-cancel {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 59, 48, 0.1);
          border: none;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff3b30;
        }

        .preview-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .preview-thumb {
          border-radius: 8px;
          object-fit: cover;
        }

        .preview-video-icon {
          font-size: 40px;
        }

        .preview-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .preview-filename {
          font-size: 14px;
          font-weight: 500;
        }

        .preview-size {
          font-size: 12px;
          color: #666;
        }

        .preview-remove {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 59, 48, 0.1);
          border: none;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff3b30;
        }

        .recording-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .recording-icon {
          font-size: 20px;
        }

        .recording-time {
          font-size: 16px;
          font-weight: 600;
          color: #ff3b30;
        }

        .recording-waveform {
          display: flex;
          gap: 2px;
          align-items: center;
          height: 30px;
        }

        .recording-wave-bar {
          width: 3px;
          background: #8b5cf6;
          border-radius: 2px;
        }

        .dark-mode .recording-wave-bar {
          background: #a78bfa;
        }

        .recording-actions {
          display: flex;
          gap: 8px;
        }

        .recording-cancel,
        .recording-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recording-cancel {
          background: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
        }

        .recording-send {
          background: #8b5cf6;
          color: white;
        }

        .dark-mode .recording-send {
          background: #a78bfa;
        }

        /* Video Recording Overlay */
        .video-recording-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-recording-container {
          position: relative;
          width: 100%;
          max-width: 640px;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .video-preview {
          width: 100%;
          height: auto;
          display: block;
          transform: scaleX(-1);
        }

        .video-recording-controls {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.6);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .recording-indicator {
          color: #ff3b30;
          font-weight: 600;
          font-size: 14px;
        }

        .video-recording-time {
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .video-recording-actions {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
        }

        .video-cancel-btn,
        .video-send-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .video-cancel-btn {
          background: rgba(255, 59, 48, 0.8);
          color: white;
        }

        .video-cancel-btn:hover {
          background: rgba(255, 59, 48, 1);
        }

        .video-send-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .video-send-btn:hover {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        /* GIF Picker */
        .gif-picker-panel {
          position: absolute;
          bottom: 80px;
          left: 24px;
          width: 400px;
          max-height: 400px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 100;
        }

        .gif-picker-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gif-picker-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .gif-picker-header button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gif-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          padding: 12px;
          max-height: 340px;
          overflow-y: auto;
        }

        .gif-item {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 12px;
          cursor: pointer;
        }

        /* Emoji Picker */
        .emoji-picker-panel {
          position: absolute;
          bottom: 80px;
          right: 80px;
          padding: 16px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          z-index: 100;
        }

        .emoji-btn {
          width: 44px;
          height: 44px;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .emoji-btn:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        /* Input Area - Premium */
        .chat-input-area {
          padding: 20px 28px 24px 28px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(250, 245, 255, 0.98) 100%
          );
          border-top: 1px solid rgba(139, 92, 246, 0.15);
          display: flex;
          gap: 12px;
          align-items: center;
          box-shadow: 0 -4px 20px rgba(139, 92, 246, 0.08);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }

        .dark-mode .chat-input-area {
          background: linear-gradient(
            180deg,
            rgba(30, 20, 50, 0.95) 0%,
            rgba(26, 11, 46, 0.98) 100%
          );
          border-top: 1px solid rgba(167, 139, 250, 0.2);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }

        .input-actions-left,
        .input-actions-right {
          display: flex;
          gap: 8px;
        }

        .input-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.08) 0%,
            rgba(139, 92, 246, 0.12) 100%
          );
          border: 1px solid rgba(139, 92, 246, 0.1);
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          transform: scale(1);
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.08);
        }

        .input-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(139, 92, 246, 0.25) 100%
          );
          border-color: rgba(139, 92, 246, 0.2);
          transform: scale(1.1);
          box-shadow: 0 3px 10px rgba(139, 92, 246, 0.15);
        }

        .input-btn:active {
          transform: scale(0.94);
          transition-duration: 0.15s;
          box-shadow: 0 1px 4px rgba(139, 92, 246, 0.12);
        }

        .dark-mode .input-btn {
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.12) 0%,
            rgba(167, 139, 250, 0.18) 100%
          );
          border-color: rgba(167, 139, 250, 0.15);
          box-shadow: 0 2px 6px rgba(167, 139, 250, 0.12);
        }

        .dark-mode .input-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.2) 0%,
            rgba(167, 139, 250, 0.3) 100%
          );
          border-color: rgba(167, 139, 250, 0.25);
          box-shadow: 0 3px 10px rgba(167, 139, 250, 0.2);
        }

        .input-btn.recording-active {
          background: rgba(255, 59, 48, 0.2);
          animation: recordingPulse 1.5s infinite;
        }

        @keyframes recordingPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .message-form {
          flex: 1;
        }

        .message-input-field {
          width: 100%;
          padding: 16px 24px;
          border: 2px solid #e0e0e0;
          border-radius: 28px;
          font-size: 15px;
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.04),
            inset 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .dark-mode .message-input-field {
          background: linear-gradient(135deg, #2c2c2e 0%, #242426 100%);
          border-color: #3a3a3c;
          color: #fff;
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .message-input-field:focus {
          outline: none;
          border-color: #8b5cf6;
          background: #ffffff;
          box-shadow:
            0 4px 16px rgba(139, 92, 246, 0.2),
            0 2px 8px rgba(139, 92, 246, 0.1),
            inset 0 1px 2px rgba(139, 92, 246, 0.05);
          transform: translateY(-2px);
        }

        .dark-mode .message-input-field:focus {
          border-color: #a78bfa;
          background: #2c2c2e;
          box-shadow:
            0 4px 16px rgba(167, 139, 250, 0.25),
            0 2px 8px rgba(167, 139, 250, 0.15),
            inset 0 1px 2px rgba(167, 139, 250, 0.1);
        }

        .message-input-field:hover:not(:focus) {
          border-color: #c8c8cc;
          box-shadow:
            0 3px 8px rgba(0, 0, 0, 0.06),
            inset 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .dark-mode .message-input-field:hover:not(:focus) {
          border-color: #48484a;
          box-shadow:
            0 3px 8px rgba(0, 0, 0, 0.4),
            inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .message-input-field::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }

        .dark-mode .message-input-field::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .send-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 4px 12px rgba(102, 126, 234, 0.3),
            0 2px 6px rgba(118, 75, 162, 0.2);
          transform: scale(1);
          position: relative;
        }

        .send-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.4),
            rgba(255, 255, 255, 0)
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.6;
        }

        .dark-mode .send-btn {
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
          box-shadow:
            0 4px 12px rgba(167, 139, 250, 0.35),
            0 2px 6px rgba(139, 92, 246, 0.25);
        }

        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          transform: scale(1.12);
          box-shadow:
            0 6px 20px rgba(102, 126, 234, 0.45),
            0 3px 10px rgba(118, 75, 162, 0.3);
        }

        .dark-mode .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          box-shadow:
            0 6px 20px rgba(167, 139, 250, 0.5),
            0 3px 10px rgba(139, 92, 246, 0.35);
        }

        .send-btn:active:not(:disabled) {
          transform: scale(0.96);
          transition-duration: 0.15s;
          box-shadow:
            0 2px 8px rgba(102, 126, 234, 0.35),
            0 1px 4px rgba(118, 75, 162, 0.25);
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: scale(0.95);
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.15);
        }

        /* Scrollbar - Production Quality */
        .threads-container::-webkit-scrollbar,
        .messages-container::-webkit-scrollbar,
        .gif-grid::-webkit-scrollbar {
          width: 8px;
        }

        .threads-container::-webkit-scrollbar-track,
        .messages-container::-webkit-scrollbar-track,
        .gif-grid::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }

        .threads-container::-webkit-scrollbar-thumb,
        .messages-container::-webkit-scrollbar-thumb,
        .gif-grid::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: background 0.2s ease;
        }

        .dark-mode .threads-container::-webkit-scrollbar-thumb,
        .dark-mode .messages-container::-webkit-scrollbar-thumb,
        .dark-mode .gif-grid::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          background-clip: padding-box;
        }

        .threads-container::-webkit-scrollbar-thumb:hover,
        .messages-container::-webkit-scrollbar-thumb:hover,
        .gif-grid::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.35);
          background-clip: padding-box;
        }

        .dark-mode .threads-container::-webkit-scrollbar-thumb:hover,
        .dark-mode .messages-container::-webkit-scrollbar-thumb:hover,
        .dark-mode .gif-grid::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
          background-clip: padding-box;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .messages-layout {
            grid-template-columns: 1fr;
          }

          .messages-sidebar {
            display: none;
          }

          .message-bubble-wrapper {
            max-width: 80%;
          }

          .local-video-pip {
            width: 120px;
            height: 90px;
          }
        }
      `}</style>
    </div>
  );
}
