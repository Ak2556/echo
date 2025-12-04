'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Password change
export async function changePassword(data: PasswordChangeRequest): Promise<void> {
  try {
    await apiCall('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to change password');
  }
}

// Enable 2FA
export async function enable2FA(): Promise<TwoFactorSetupResponse> {
  try {
    return await apiCall<TwoFactorSetupResponse>('/api/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to enable 2FA');
  }
}

// Verify 2FA code
export async function verify2FA(code: string): Promise<void> {
  try {
    await apiCall('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Invalid verification code');
  }
}

// Disable 2FA
export async function disable2FA(password: string): Promise<void> {
  try {
    await apiCall('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to disable 2FA');
  }
}

// Delete account
export async function deleteAccount(password: string): Promise<void> {
  try {
    await apiCall('/api/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete account');
  }
}

// Get active sessions
export async function getActiveSessions(): Promise<any[]> {
  try {
    return await apiCall<any[]>('/api/auth/sessions', {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return [];
  }
}

// Revoke session
export async function revokeSession(sessionId: string): Promise<void> {
  try {
    await apiCall(`/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to revoke session');
  }
}
