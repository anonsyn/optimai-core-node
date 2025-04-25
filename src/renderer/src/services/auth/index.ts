import axiosClient from '@/libs/axios'
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
} from '@/services/auth/type'

export const authService = {
  signUp(request: SignUpRequest) {
    return axiosClient.post('/auth/signup', request)
  },
  signIn(request: SignInRequest) {
    return axiosClient.post<SignInResponse>('/auth/signin', request)
  },
  signInV2(request: SignInRequestV2) {
    return axiosClient.post<SignInResponse>('/auth/signin-v1.1', request)
  },
  exchangeToken(request: ExchangeTokenRequest) {
    return axiosClient.post<ExchangeTokenResponse>('/auth/token', request)
  },
  refreshToken(request: RefreshTokenRequest) {
    return axiosClient.post<RefreshTokenResponse>('/auth/refresh', request)
  },
  getCurrentUser() {
    return axiosClient.get<GetCurrentUserResponse>('/auth/me', {
      params: {
        platforms: 'all',
      },
    })
  },
  verifyEmail(params: VerifyEmailParams) {
    return axiosClient.get('/auth/verify-email', {
      params,
    })
  },
  resendVerifyEmail(request: ResendVerifyEmailRequest) {
    return axiosClient.post('/auth/resend-email', request)
  },
  changePassword(request: ChangePasswordRequest) {
    return axiosClient.post('/auth/change-password', request)
  },
  forgotPassword(request: ForgotPasswordRequest) {
    return axiosClient.post('/auth/reset-password', request)
  },
  resetPassword(request: ResetPasswordRequest) {
    return axiosClient.post('/auth/reset-password/confirm', request)
  },
  signOut() {
    return axiosClient.post('/auth/signout')
  },
  generateNonce(params: GenerateNonceParams) {
    return axiosClient.get<GenerateNonceResponse>('/auth/nonce', {
      params,
    })
  },
  changeDisplayName(request: ChangeDisplayNameRequest) {
    return axiosClient.post('/auth/change-display-name', request)
  },
  linkWallet(request: LinkWalletRequest) {
    return axiosClient.post('/auth/link-wallet', request)
  },
  unlinkWallet(request: UnlinkWalletRequest) {
    return axiosClient.post('/auth/unlink-wallet', request)
  },
  getTwitterAuthUrl() {
    return axiosClient.get<GetTwitterAuthUrlResponse>('/auth/twitter/connect')
  },
  getTwitterAuthUrlV2(params: GetTwitterAuthUrlV2Params) {
    return axiosClient.get<GetTwitterAuthUrlResponse>('/auth/twitter/connect-v1.1', {
      params,
    })
  },
  checkExists(params: CheckExistsParams) {
    return axiosClient.get<CheckExistsResponse>('/auth/check-exists', {
      params,
    })
  },
  connectTelegram(request: ConnectTelegramRequest) {
    return axiosClient.post('/auth/telegram/auth', request)
  },
}

export * from './type'
