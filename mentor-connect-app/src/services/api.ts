const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'engineer' | 'student';
  skills: string[];
  experience: string;
  avatar?: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  student: User;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  owner: User;
  student?: User;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  duration: string;
  budget?: number;
  githubUrl?: string;
  liveUrl?: string;
  images: string[];
  applications?: Application[];
  createdAt: string;
  updatedAt: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

export interface HomeStat {
  id: string;
  label: string;
  value: number | string;
}

export interface RecentActivityItem {
  id: string;
  type: 'owned' | 'mentored' | 'project';
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
  };
}

export interface ProfileStatistics {
  ownedProjects: number;
  mentoredProjects: number;
  completedProjects: number;
  inProgressProjects: number;
}

export interface ProfileResponse {
  user: User;
  projects: Project[];
  statistics: ProfileStatistics;
  recentActivity: RecentActivityItem[];
}

export interface HomeContent {
  stats: HomeStat[];
  features: Feature[];
  testimonials: Testimonial[];
  highlights: {
    topMentors: User[];
    recentProjects: Project[];
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'engineer' | 'student';
  skills: string[];
  experience: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  budget?: number;
  githubUrl?: string;
  liveUrl?: string;
}

export interface UpdateUserData {
  name?: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  skills?: string[];
  experience?: string;
  isAvailable?: boolean;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('mentorConnectToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response, endpoint?: string, url?: string): Promise<ApiResponse<T>> {
    // Try to parse as JSON, but handle HTML/plain text responses gracefully
    let data: ApiResponse<T>;
    
    try {
      const text = await response.text();
      
      // Check if response looks like HTML (common error pages)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        let errorMessage = 'Server returned an HTML error page instead of JSON';
        
        if (response.status === 404) {
          errorMessage = `Endpoint not found: ${endpoint || url || 'unknown'}. Please check if the API server is running and the route exists.`;
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please check the backend server logs for more details.';
        } else if (response.status >= 400) {
          errorMessage = `Request failed with status ${response.status} for endpoint: ${endpoint || 'unknown'}. The server may be experiencing issues.`;
        }
        
        console.error('HTML response received:', {
          status: response.status,
          endpoint,
          url,
          responsePreview: text.substring(0, 200)
        });
        
        throw new Error(errorMessage);
      }
      
      // Try to parse as JSON
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // If JSON parsing fails, provide helpful error
        console.error('JSON parse error:', {
          endpoint,
          url,
          responsePreview: text.substring(0, 200)
        });
        throw new Error(`Invalid JSON response from server for ${endpoint || 'endpoint'}. Please check if the API server is running correctly.`);
      }
    } catch (error) {
      // Re-throw if it's already our custom error
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, wrap in a generic error
      throw new Error(`Failed to process server response for ${endpoint || 'endpoint'}. Please check if the API server is running.`);
    }
    
    if (!response.ok) {
      // Handle validation errors
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const errorMessages = data.errors.map((err: any) => 
          err.msg || err.message || JSON.stringify(err)
        ).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || data.error || 'An error occurred');
    }
    
    return data;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response, endpoint, url);
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Handle network errors (server not reachable, CORS issues, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to the server at ${API_BASE_URL}. Please check if the API server is running on port 5000.`);
      }
      
      // Re-throw if it's already a custom error
      if (error instanceof Error) {
        throw error;
      }
      
      // Otherwise, wrap in a generic error
      throw new Error(`An unexpected error occurred while requesting ${endpoint}. Please try again later.`);
    }
  }

  // Authentication
  async register(userData: RegisterData): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(loginData: LoginData): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Users
  async getUsers(params?: {
    role?: string;
    skills?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ data: User[]; count: number; total: number; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.skills) params.skills.forEach(skill => searchParams.append('skills', skill));
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return this.request<{ data: User[]; count: number; total: number; pagination: any }>(
      `/users${queryString ? `?${queryString}` : ''}`
    );
  }

  async getUser(id: string): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(`/users/${id}`);
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Mentors
  async getMentors(params?: {
    skills?: string[];
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ data: User[]; count: number; total: number; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params?.skills) params.skills.forEach(skill => searchParams.append('skills', skill));
    if (params?.location) searchParams.append('location', params.location);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return this.request<{ data: User[]; count: number; total: number; pagination: any }>(
      `/mentors${queryString ? `?${queryString}` : ''}`
    );
  }

  async getMentor(id: string): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(`/mentors/${id}`);
  }

  async getTopMentors(limit: number = 5): Promise<ApiResponse<{ data: User[]; count: number }>> {
    return this.request<{ data: User[]; count: number }>(`/mentors/top/rated?limit=${limit}`);
  }

  async searchMentorsBySkills(skills: string[], page: number = 1, limit: number = 10): Promise<ApiResponse<{ data: User[]; count: number; total: number; pagination: any }>> {
    const searchParams = new URLSearchParams();
    skills.forEach(skill => searchParams.append('skills', skill));
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    return this.request<{ data: User[]; count: number; total: number; pagination: any }>(
      `/mentors/search/skills?${searchParams.toString()}`
    );
  }

  async updateMentorAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(`/mentors/${id}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ isAvailable }),
    });
  }

  // Projects
  async getProjects(params?: {
    status?: string;
    difficulty?: string;
    skills?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ data: Project[]; count: number; total: number; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
    if (params?.skills) params.skills.forEach(skill => searchParams.append('skills', skill));
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return this.request<{ data: Project[]; count: number; total: number; pagination: any }>(
      `/projects${queryString ? `?${queryString}` : ''}`
    );
  }

  async getProject(id: string): Promise<ApiResponse<{ data: Project }>> {
    return this.request<{ data: Project }>(`/projects/${id}`);
  }

  async createProject(projectData: CreateProjectData): Promise<ApiResponse<{ data: Project }>> {
    return this.request<{ data: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: Partial<CreateProjectData>): Promise<ApiResponse<{ data: Project }>> {
    return this.request<{ data: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async applyToProject(projectId: string, message?: string): Promise<ApiResponse<{ data: Project }>> {
    return this.request<{ data: Project }>(`/projects/${projectId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getProjectApplications(projectId: string): Promise<ApiResponse<{ data: Application[] }>> {
    return this.request<{ data: Application[] }>(`/projects/${projectId}/applications`);
  }

  async updateApplication(projectId: string, applicationId: string, action: 'accept' | 'reject'): Promise<ApiResponse<{ data: Project }>> {
    return this.request<{ data: Project }>(`/projects/${projectId}/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  }

  async assignStudentToProject(projectId: string, studentId: string): Promise<ApiResponse<{ data: Project }>> {
    return this.request<{ data: Project }>(`/projects/${projectId}/assign-student`, {
      method: 'PUT',
      body: JSON.stringify({ studentId }),
    });
  }

  // Students endpoints
  async getStudents(params?: {
    skills?: string[];
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ data: User[]; count: number; total: number; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params?.skills) params.skills.forEach(skill => searchParams.append('skills', skill));
    if (params?.location) searchParams.append('location', params.location);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return this.request<{ data: User[]; count: number; total: number; pagination: any }>(
      `/students${queryString ? `?${queryString}` : ''}`
    );
  }

  async getStudent(id: string): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(`/students/${id}`);
  }

  async searchStudentsBySkills(skills: string[], page: number = 1, limit: number = 10): Promise<ApiResponse<{ data: User[]; count: number; total: number; pagination: any }>> {
    const searchParams = new URLSearchParams();
    skills.forEach(skill => searchParams.append('skills', skill));
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    return this.request<{ data: User[]; count: number; total: number; pagination: any }>(
      `/students/search/skills?${searchParams.toString()}`
    );
  }

  // Profiles
  async getUserProfile(id: string): Promise<ApiResponse<{ data: ProfileResponse }>> {
    return this.request<{ data: ProfileResponse }>(`/profiles/${id}`);
  }

  async updateProfile(id: string, userData: UpdateUserData): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserProjects(id: string, type: 'all' | 'owned' | 'mentored' = 'all', page: number = 1, limit: number = 10): Promise<ApiResponse<{ data: Project[]; count: number; total: number; pagination: any }>> {
    const searchParams = new URLSearchParams();
    searchParams.append('type', type);
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    return this.request<{ data: Project[]; count: number; total: number; pagination: any }>(
      `/profiles/${id}/projects?${searchParams.toString()}`
    );
  }

  async getUserStats(id: string): Promise<ApiResponse<{ data: any }>> {
    return this.request<{ data: any }>(`/profiles/${id}/stats`);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<ApiResponse<{ data: User }>> {
    return this.request<{ data: User }>(`/profiles/${id}/avatar`, {
      method: 'PUT',
      body: JSON.stringify({ avatar: avatarUrl }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
    return this.request<{ status: string; message: string; timestamp: string }>('/health');
  }

  // Dashboard
  async getHomeContent(): Promise<ApiResponse<HomeContent>> {
    return this.request<HomeContent>('/dashboard/home');
  }
}

export const apiService = new ApiService();
export default apiService;
