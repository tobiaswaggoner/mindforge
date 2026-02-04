import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  VerifyTokenResponse,
  MeResponse,
} from "@mindforge/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:4000";

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || "Ein Fehler ist aufgetreten",
      data.details
    );
  }

  return data as T;
}

export const authApi = {
  /**
   * Register a new account
   */
  register: (data: RegisterRequest) =>
    request<RegisterResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Verify email address
   */
  verifyEmail: (data: VerifyEmailRequest) =>
    request<{ message: string }>("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Login
   */
  login: (data: LoginRequest) =>
    request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Verify token (for app startup)
   */
  verifyToken: (token: string) =>
    request<VerifyTokenResponse>("/api/v1/auth/verify-token", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  /**
   * Get current user
   */
  me: (token: string) =>
    request<MeResponse>("/api/v1/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  /**
   * Request password reset
   */
  forgotPassword: (data: ForgotPasswordRequest) =>
    request<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Reset password with token
   */
  resetPassword: (data: ResetPasswordRequest) =>
    request<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Resend verification email
   */
  resendVerification: (data: ResendVerificationRequest) =>
    request<{ message: string }>("/api/v1/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export { ApiError };
