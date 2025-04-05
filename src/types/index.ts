export type SignInFormTypes = {
    email: string;
    password: string;
}

export type ForgotPasswordFormTypes = {
    email: string;
}

export type RequestNewVerificationCodeTypes = {
    email: string;
}

export type ChangePasswordFormTypes = {
    newPassword: string;
    token?: string
}

export type VerifyTokenFormTypes = {
    email: string;
    code: string;
}

export type SignUpFormTypes = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export type UserProfileType = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    parkId: string;
  }