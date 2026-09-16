const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'smart_uni_auth_token';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ success: boolean; data?: T; message: string }> {
  try {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Do not set Content-Type for FormData so browser sets multipart boundary automatically
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (options.data) {
      config.body = JSON.stringify(options.data);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        message: json?.message || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data: json?.data as T,
      message: json?.message || 'Success',
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error).message ||
        'Unable to communicate with the server. Please check your network connection.',
    };
  }
}
