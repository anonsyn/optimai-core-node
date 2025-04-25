export type User = {
  id: string
  display_name?: string
  wallet_address?: string
  email: string
  has_nodes?: boolean
  joined_at: string
  encrypted_private_key?: string
  telegram?: {
    first_name: string
    last_name: string
    photo_url: string
  }
  twitter?: {
    id: string
    name: string
    username: string
  }
}

export type SignUpRequest = {
  email: string
  password: string
  referral_code?: string
  turnstile_token?: string
  encrypted_private_key?: string
  wallet_address?: string
}

export type SignInRequest = {
  email: string
  password: string
  code_challenge: string
  code_challenge_method: 'S256'
  turnstile_token?: string
}

export type SignInRequestV2 = {
  email: string
  password: string
  code_challenge: string
  code_challenge_method: 'S256'
}

export type SignInResponse = {
  authorization_code: string
}

export type ExchangeTokenRequest = {
  grant_type: 'authorization_code'
  code: string
  code_verifier: string
}

export type ExchangeTokenResponse = {
  access_token: string
  refresh_token: string
}

export type RefreshTokenRequest = {
  refresh_token: string
}

export type RefreshTokenResponse = {
  access_token: string
}

export type GetCurrentUserResponse = {
  user: User
}

export type VerifyEmailParams = {
  token: string
  email: string
}

export type ResendVerifyEmailRequest = {
  email: string
}

export type ChangePasswordRequest = {
  old_password: string
  new_password: string
  encrypted_private_key: string
  wallet_address: string
}

export type ForgotPasswordRequest = {
  email: string
  turnstile_token: string
}

export type ResetPasswordRequest = {
  email: string
  token: string
  new_password: string
  encrypted_private_key: string
  wallet_address: string
}

export type GenerateNonceParams = {
  address: string
}

export type GenerateNonceResponse = {
  nonce: string
}

export type ChangeDisplayNameRequest = {
  display_name: string
}

export type LinkWalletRequest = {
  address: string
  signature: string
  nonce: string
  message: string
}

export type UnlinkWalletRequest = {
  address: string
  signature: string
  nonce: string
  message: string
}

export type GetTwitterAuthUrlV2Params = {
  redirect_uri: string
}

export type GetTwitterAuthUrlResponse = {
  url: string
}

export type CheckExistsParams = {
  email?: string
  referral_code?: string
}

export type CheckExistsResponse = {
  email_exists: boolean
  referral_code_exists: boolean
}

export type ConnectTelegramRequest = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  auth_date?: number
  hash?: string
  photo_url?: string
}
