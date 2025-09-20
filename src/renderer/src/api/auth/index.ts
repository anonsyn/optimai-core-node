import { apiClient } from '@/libs/axios'
import {
  ChangeDisplayNameRequest,
  ChangePasswordRequest,
  CheckExistsParams,
  CheckExistsResponse,
  ConnectTelegramRequest,
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  ForgotPasswordRequest,
  GenerateNonceParams,
  GenerateNonceResponse,
  GetCurrentUserResponse,
  GetTwitterAuthUrlResponse,
  GetTwitterAuthUrlV2Params,
  LinkWalletRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResendVerifyEmailRequest,
  ResetPasswordRequest,
  SignInRequest,
  SignInRequestV2,
  SignInResponse,
  SignUpRequest,
  UnlinkWalletRequest,
  VerifyEmailParams,
} from '@/api/auth/type'

export const authApi = {
  signUp(request: SignUpRequest) {
    return apiClient.post('/auth/signup', request)
  },
  signIn(request: SignInRequest) {
    return apiClient.post<SignInResponse>('/auth/signin', request)
  },
  signInV2(request: SignInRequestV2) {
    return apiClient.post<SignInResponse>('/auth/signin-v1.1', request)
  },
  exchangeToken(request: ExchangeTokenRequest) {
    return apiClient.post<ExchangeTokenResponse>('/auth/token', request)
  },
  refreshToken(request: RefreshTokenRequest) {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', request)
  },
  getCurrentUser() {
    return apiClient.get<GetCurrentUserResponse>('/auth/me', {
      params: {
        platforms: 'all',
      },
    })
  },
  verifyEmail(params: VerifyEmailParams) {
    return apiClient.get('/auth/verify-email', {
      params,
    })
  },
  resendVerifyEmail(request: ResendVerifyEmailRequest) {
    return apiClient.post('/auth/resend-email', request)
  },
  changePassword(request: ChangePasswordRequest) {
    return apiClient.post('/auth/change-password', request)
  },
  forgotPassword(request: ForgotPasswordRequest) {
    return apiClient.post('/auth/reset-password', request)
  },
  resetPassword(request: ResetPasswordRequest) {
    return apiClient.post('/auth/reset-password/confirm', request)
  },
  signOut() {
    return apiClient.post('/auth/signout')
  },
  generateNonce(params: GenerateNonceParams) {
    return apiClient.get<GenerateNonceResponse>('/auth/nonce', {
      params,
    })
  },
  changeDisplayName(request: ChangeDisplayNameRequest) {
    return apiClient.post('/auth/change-display-name', request)
  },
  linkWallet(request: LinkWalletRequest) {
    return apiClient.post('/auth/link-wallet', request)
  },
  unlinkWallet(request: UnlinkWalletRequest) {
    return apiClient.post('/auth/unlink-wallet', request)
  },
  getTwitterAuthUrl() {
    return apiClient.get<GetTwitterAuthUrlResponse>('/auth/twitter/connect')
  },
  getTwitterAuthUrlV2(params: GetTwitterAuthUrlV2Params) {
    return apiClient.get<GetTwitterAuthUrlResponse>('/auth/twitter/connect-v1.1', {
      params,
    })
  },
  checkExists(params: CheckExistsParams) {
    return apiClient.get<CheckExistsResponse>('/auth/check-exists', {
      params,
    })
  },
  connectTelegram(request: ConnectTelegramRequest) {
    return apiClient.post('/auth/telegram/auth', request)
  },
}

export * from './type'
