// Tuition Marketplace Helper Functions

// 1. Authentication Helper
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  avatar?: string;
  token?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: email.includes('teacher') ? 'teacher' : 'student',
      token: `jwt_${btoa(email)}_${Date.now()}`
    };

    localStorage.setItem('tuition_user', JSON.stringify(user));
    return user;
  },

  signup: async (email: string, password: string, name: string, role: 'student' | 'teacher'): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      role,
      token: `jwt_${btoa(email)}_${Date.now()}`
    };

    localStorage.setItem('tuition_user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('tuition_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('tuition_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('tuition_user');
  }
};

// 2. Payment Helper (Razorpay Integration)
export const paymentService = {
  initializeRazorpay: (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  createOrder: async (amount: number, classId: string): Promise<any> => {
    // Simulate API call to create order
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: `order_${Date.now()}`,
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      classId
    };
  },

  processPayment: async (amount: number, classId: string, className: string): Promise<boolean> => {
    const res = await paymentService.initializeRazorpay();

    if (!res) {
      alert('Razorpay SDK failed to load');
      return false;
    }

    const order = await paymentService.createOrder(amount, classId);

    return new Promise((resolve) => {
      const options = {
        key: 'rzp_test_your_key_here', // Replace with actual key
        amount: order.amount,
        currency: order.currency,
        name: 'Tuition Marketplace',
        description: className,
        order_id: order.id,
        handler: function (response: any) {
          // Save payment details
          const payment = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            classId,
            amount: amount,
            timestamp: new Date().toISOString()
          };

          const payments = JSON.parse(localStorage.getItem('tuition_payments') || '[]');
          payments.push(payment);
          localStorage.setItem('tuition_payments', JSON.stringify(payments));

          resolve(true);
        },
        prefill: {
          name: authService.getCurrentUser()?.name || '',
          email: authService.getCurrentUser()?.email || ''
        },
        theme: {
          color: '#ff4d44'
        },
        modal: {
          ondismiss: function() {
            resolve(false);
          }
        }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  }
};

// 3. Database/API Helper
export const apiService = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',

  get: async (endpoint: string) => {
    // Simulate API call - replace with actual fetch
    const data = localStorage.getItem(`tuition_${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return data ? JSON.parse(data) : [];
  },

  post: async (endpoint: string, data: any) => {
    // Simulate API call - replace with actual fetch
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = localStorage.getItem(`tuition_${endpoint}`) || '[]';
    const items = JSON.parse(existing);
    items.push({ ...data, id: `${endpoint}_${Date.now()}` });
    localStorage.setItem(`tuition_${endpoint}`, JSON.stringify(items));
    return items[items.length - 1];
  },

  put: async (endpoint: string, id: string, data: any) => {
    // Simulate API call - replace with actual fetch
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = localStorage.getItem(`tuition_${endpoint}`) || '[]';
    const items = JSON.parse(existing);
    const index = items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
      localStorage.setItem(`tuition_${endpoint}`, JSON.stringify(items));
      return items[index];
    }
    return null;
  },

  delete: async (endpoint: string, id: string) => {
    // Simulate API call - replace with actual fetch
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = localStorage.getItem(`tuition_${endpoint}`) || '[]';
    const items = JSON.parse(existing);
    const filtered = items.filter((item: any) => item.id !== id);
    localStorage.setItem(`tuition_${endpoint}`, JSON.stringify(filtered));
    return true;
  }
};

// 4. Notification Helper
export const notificationService = {
  sendEmail: async (to: string, subject: string, body: string) => {
    // Simulate email sending - replace with actual email service (SendGrid, etc.)

    await new Promise(resolve => setTimeout(resolve, 500));

    // Log notification
    const notifications = JSON.parse(localStorage.getItem('tuition_notifications') || '[]');
    notifications.push({
      type: 'email',
      to,
      subject,
      body,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('tuition_notifications', JSON.stringify(notifications));

    return true;
  },

  sendSMS: async (to: string, message: string) => {
    // Simulate SMS sending - replace with actual SMS service (Twilio, MSG91, etc.)

    await new Promise(resolve => setTimeout(resolve, 500));

    // Log notification
    const notifications = JSON.parse(localStorage.getItem('tuition_notifications') || '[]');
    notifications.push({
      type: 'sms',
      to,
      message,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('tuition_notifications', JSON.stringify(notifications));

    return true;
  },

  sendClassReminder: async (studentEmail: string, className: string, schedule: string) => {
    const subject = `Reminder: ${className} Class Starting Soon`;
    const body = `Your class "${className}" is scheduled for ${schedule}. Don't forget to join!`;

    await notificationService.sendEmail(studentEmail, subject, body);

    // Also send SMS if phone number available
    // await notificationService.sendSMS(studentPhone, `Class reminder: ${className} at ${schedule}`);
  },

  sendEnrollmentConfirmation: async (studentEmail: string, className: string, amount: number) => {
    const subject = `Enrollment Confirmed: ${className}`;
    const body = `You've successfully enrolled in "${className}" for ₹${amount}. We're excited to have you!`;

    await notificationService.sendEmail(studentEmail, subject, body);
  }
};

// 5. Calendar Helper (Google Calendar Integration)
export const calendarService = {
  initGoogleCalendar: () => {
    // Load Google Calendar API
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    document.body.appendChild(script);
  },

  createCalendarEvent: async (title: string, description: string, startTime: string, endTime: string) => {
    // Simulate calendar event creation
    const event = {
      id: `event_${Date.now()}`,
      title,
      description,
      startTime,
      endTime,
      created: new Date().toISOString()
    };

    const events = JSON.parse(localStorage.getItem('tuition_calendar_events') || '[]');
    events.push(event);
    localStorage.setItem('tuition_calendar_events', JSON.stringify(events));

    // Create .ics file for download
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tuition Marketplace//EN
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startTime.replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endTime.replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

    return {
      event,
      icsContent,
      downloadICS: () => {
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.ics`;
        a.click();
      }
    };
  },

  addToGoogleCalendar: (title: string, description: string, startTime: string, endTime: string) => {
    // Open Google Calendar with pre-filled event
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${startTime.replace(/[-:]/g, '').split('.')[0]}Z/${endTime.replace(/[-:]/g, '').split('.')[0]}Z`;
    window.open(googleCalendarUrl, '_blank');
  }
};

// 6. Analytics Helper
export const analyticsService = {
  trackEvent: (category: string, action: string, label?: string, value?: number) => {
    const event = {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
      userId: authService.getCurrentUser()?.id
    };

    const events = JSON.parse(localStorage.getItem('tuition_analytics_events') || '[]');
    events.push(event);
    localStorage.setItem('tuition_analytics_events', JSON.stringify(events));

    // Send to analytics service (Google Analytics, Mixpanel, etc.)

  },

  trackPageView: (page: string) => {
    analyticsService.trackEvent('PageView', 'View', page);
  },

  trackEnrollment: (classId: string, amount: number) => {
    analyticsService.trackEvent('Enrollment', 'Enroll', classId, amount);
  },

  trackPayment: (amount: number, method: string) => {
    analyticsService.trackEvent('Payment', 'Complete', method, amount);
  },

  getAnalytics: () => {
    const events = JSON.parse(localStorage.getItem('tuition_analytics_events') || '[]');

    // Calculate metrics
    const totalEvents = events.length;
    const enrollments = events.filter((e: any) => e.action === 'Enroll');
    const payments = events.filter((e: any) => e.action === 'Complete');
    const totalRevenue = payments.reduce((sum: number, e: any) => sum + (e.value || 0), 0);

    return {
      totalEvents,
      totalEnrollments: enrollments.length,
      totalPayments: payments.length,
      totalRevenue,
      averageOrderValue: payments.length > 0 ? totalRevenue / payments.length : 0,
      conversionRate: totalEvents > 0 ? (enrollments.length / totalEvents) * 100 : 0
    };
  }
};

// 7. WebRTC Video Helper
export class VideoCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;

  constructor() {
    this.initializePeerConnection();
  }

  private initializePeerConnection() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to remote peer via signaling server

      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };
  }

  async startLocalStream(videoElement: HTMLVideoElement) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      videoElement.srcObject = this.localStream;

      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      return this.localStream;
    } catch (error) {

      throw error;
    }
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // @ts-ignore - cursor is a valid property but not in TypeScript types
          cursor: 'always'
        } as MediaTrackConstraints,
        audio: false
      });

      // Replace video track with screen share track
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');

      if (sender) {
        sender.replaceTrack(videoTrack);
      }

      videoTrack.onended = () => {
        // Restore camera when screen share stops
        if (this.localStream) {
          const cameraTrack = this.localStream.getVideoTracks()[0];
          sender?.replaceTrack(cameraTrack);
        }
      };

      return screenStream;
    } catch (error) {

      throw error;
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  async createOffer() {
    if (!this.peerConnection) return null;

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return null;

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async addAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(answer);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;
    await this.peerConnection.addIceCandidate(candidate);
  }

  stopCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
  }
}
