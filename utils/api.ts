
import Constants from 'expo-constants';

// Get backend URL from app.json configuration
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || '';

console.log('[API] Backend URL configured:', BACKEND_URL);

// Helper function for API calls with error handling
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`[API] Response:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Request failed:`, error);
    throw error;
  }
}

// Day API functions
export interface Day {
  id: string;
  date: string;
  wakeTime: string;
  sleepTime: string;
  targetCigarettes: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  dayId: string;
  time: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export const dayApi = {
  // Get all days
  getAll: () => apiCall<Day[]>('/api/days'),

  // Get day by date (YYYY-MM-DD format)
  getByDate: (date: string) => apiCall<Day>(`/api/days/${date}`),

  // Create a new day with auto-generated reminders
  create: (data: {
    date: string;
    wakeTime: string;
    sleepTime: string;
    targetCigarettes: number;
  }) => apiCall<Day>('/api/days', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update a day and regenerate reminders
  update: (id: string, data: {
    wakeTime?: string;
    sleepTime?: string;
    targetCigarettes?: number;
  }) => apiCall<Day>(`/api/days/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const reminderApi = {
  // Get reminders for a specific day
  getByDayId: (dayId: string) => apiCall<Reminder[]>(`/api/reminders/day/${dayId}`),

  // Mark a reminder as completed
  complete: (id: string) => apiCall<Reminder>(`/api/reminders/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify({}),
  }),

  // Delete a reminder
  delete: (id: string) => apiCall<{ success: boolean }>(`/api/reminders/${id}`, {
    method: 'DELETE',
  }),
};
