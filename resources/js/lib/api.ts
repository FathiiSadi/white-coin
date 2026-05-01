const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (res.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/';
    }
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw error;
    }
    return res.json();
  },
  put: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('API Error');
    return res;
  },
  streamPost: async (endpoint: string, data: any, onChunk: (text: string) => void) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw error;
    }
    
    if (!res.body) throw new Error('ReadableStream not yet supported in this browser.');
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        if (buffer.includes('"error":')) {
            try {
                const parsedError = JSON.parse(buffer);
                throw new Error(parsedError.error?.message || 'OpenAI API Error');
            } catch (e) {
                if (e.message !== 'Unexpected token') {
                   console.error("OpenAI Error:", buffer);
                }
            }
        }

        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                    const parsed = JSON.parse(line.substring(6));
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        onChunk(content);
                    }
                } catch (e) {
                    console.error("Failed to parse line:", line, e);
                }
            }
        }
    }
  },
};
