/**
 * Axios API 클라이언트 모듈
 *
 * JWT 인터셉터와 자동 토큰 갱신 로직을 포함합니다.
 * 모든 API 호출은 이 모듈을 통해 이루어져야 합니다.
 */
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import type {
  CohortStats,
  ConsentHistoryRecord,
  ConsentTypeInfo,
  Course,
  Enrollment,
  Intervention,
  InterventionCreateRequest,
  LearnerSnapshot,
  LoginRequest,
  TokenResponse,
  UserProfile,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// 토큰 저장 키
const ACCESS_TOKEN_KEY = "uai_access_token";
const REFRESH_TOKEN_KEY = "uai_refresh_token";

// 토큰 저장/로드 유틸리티
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// 갱신 중 중복 요청 방지
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onRefreshComplete(newToken: string): void {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: Authorization 헤더 자동 첨부
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터: 401 시 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 갱신 중이면 대기 후 재시도
        return new Promise<unknown>((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<TokenResponse>(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );
        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);
        onRefreshComplete(access_token);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        isRefreshing = false;
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------
// 인증 API
// -----------------------------------------------
export const authApi = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>(
      "/auth/login",
      credentials
    );
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
    clearTokens();
  },

  getAccessToken,
  setTokens,
  clearTokens,
};

// -----------------------------------------------
// 사용자 API
// -----------------------------------------------
export const userApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>("/users/me");
    return data;
  },

  getUserById: async (userId: string): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>(`/users/${userId}`);
    return data;
  },

  updateMyProfile: async (displayName: string): Promise<UserProfile> => {
    const { data } = await apiClient.patch<UserProfile>("/users/me", {
      display_name: displayName,
    });
    return data;
  },
};

// -----------------------------------------------
// 강좌 API
// -----------------------------------------------
export const courseApi = {
  listCourses: async (params?: {
    institution_code?: string;
    semester?: string;
    skip?: number;
    limit?: number;
  }): Promise<Course[]> => {
    const { data } = await apiClient.get<Course[]>("/courses", { params });
    return data;
  },

  getCourse: async (courseId: string): Promise<Course> => {
    const { data } = await apiClient.get<Course>(`/courses/${courseId}`);
    return data;
  },

  getCourseEnrollments: async (courseId: string): Promise<Enrollment[]> => {
    const { data } = await apiClient.get<Enrollment[]>(
      `/courses/${courseId}/enrollments`
    );
    return data;
  },
};

// -----------------------------------------------
// 동의 관리 API
// -----------------------------------------------
export const consentApi = {
  getConsentTypes: async (): Promise<ConsentTypeInfo[]> => {
    const { data } = await apiClient.get<ConsentTypeInfo[]>("/consent/types");
    return data;
  },

  grantConsent: async (
    consentType: string,
    consentVersion: string = "1.0"
  ): Promise<ConsentHistoryRecord> => {
    const { data } = await apiClient.post<ConsentHistoryRecord>(
      "/consent/grant",
      { consent_type: consentType, consent_version: consentVersion }
    );
    return data;
  },

  revokeConsent: async (
    consentType: string
  ): Promise<ConsentHistoryRecord> => {
    const { data } = await apiClient.post<ConsentHistoryRecord>(
      "/consent/revoke",
      { consent_type: consentType, consent_version: "1.0" }
    );
    return data;
  },

  getConsentHistory: async (): Promise<ConsentHistoryRecord[]> => {
    const { data } =
      await apiClient.get<ConsentHistoryRecord[]>("/consent/history");
    return data;
  },
};

// -----------------------------------------------
// 학습 분석 API
// -----------------------------------------------
export const analyticsApi = {
  getLearnerAnalytics: async (
    pseudoStudentId: string
  ): Promise<LearnerSnapshot> => {
    const { data } = await apiClient.get<LearnerSnapshot>(
      `/analytics/learner/${pseudoStudentId}`
    );
    return data;
  },

  getCohortAnalytics: async (courseId: string): Promise<CohortStats> => {
    const { data } = await apiClient.get<CohortStats>(
      `/analytics/cohort/${courseId}`
    );
    return data;
  },
};

// -----------------------------------------------
// 개입 관리 API
// -----------------------------------------------
export const interventionApi = {
  listInterventions: async (params?: {
    status_filter?: string;
    skip?: number;
    limit?: number;
  }): Promise<Intervention[]> => {
    const { data } = await apiClient.get<Intervention[]>("/interventions", {
      params,
    });
    return data;
  },

  createIntervention: async (
    body: InterventionCreateRequest
  ): Promise<Intervention> => {
    const { data } = await apiClient.post<Intervention>(
      "/interventions",
      body
    );
    return data;
  },

  approveIntervention: async (
    interventionId: string,
    note?: string
  ): Promise<Intervention> => {
    const { data } = await apiClient.post<Intervention>(
      `/interventions/${interventionId}/approve`,
      { note }
    );
    return data;
  },

  rejectIntervention: async (
    interventionId: string,
    note?: string
  ): Promise<Intervention> => {
    const { data } = await apiClient.post<Intervention>(
      `/interventions/${interventionId}/reject`,
      { note }
    );
    return data;
  },
};

export default apiClient;
