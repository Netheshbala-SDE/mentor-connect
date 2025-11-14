import { useState, useCallback } from 'react';
import apiService, { ApiResponse } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiFunction(...args);
        
        if (response.success && response.data) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
          return response.data;
        } else {
          throw new Error(response.message || 'API request failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific hooks for common operations
export function useMentors() {
  const apiFn = useCallback((params?: Parameters<typeof apiService.getMentors>[0]) => {
    return apiService.getMentors(params);
  }, []);
  return useApi(apiFn);
}

export function useProjects() {
  const apiFn = useCallback((params?: Parameters<typeof apiService.getProjects>[0]) => {
    return apiService.getProjects(params);
  }, []);
  return useApi(apiFn);
}

export function useUserProfile() {
  const apiFn = useCallback((id: string) => apiService.getUserProfile(id), []);
  return useApi(apiFn);
}

export function useUserProjects() {
  const apiFn = useCallback((
    id: string,
    type?: Parameters<typeof apiService.getUserProjects>[1],
    page?: Parameters<typeof apiService.getUserProjects>[2],
    limit?: Parameters<typeof apiService.getUserProjects>[3]
  ) => apiService.getUserProjects(id, type, page, limit), []);
  return useApi(apiFn);
}

export function useTopMentors() {
  const apiFn = useCallback((limit?: Parameters<typeof apiService.getTopMentors>[0]) => {
    return apiService.getTopMentors(limit);
  }, []);
  return useApi(apiFn);
}

export function useHomeContent() {
  const apiFn = useCallback(() => apiService.getHomeContent(), []);
  return useApi(apiFn);
}