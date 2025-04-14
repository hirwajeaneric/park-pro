// types.ts
export type SignInFormTypes = {
  email: string;
  password: string;
};

export type ForgotPasswordFormTypes = {
  email: string;
};

export type RequestNewVerificationCodeTypes = {
  email: string;
};

export type ChangePasswordFormTypes = {
  newPassword: string;
  token?: string;
};

export type VerifyTokenFormTypes = {
  email: string;
  code: string;
};

export type SignUpFormTypes = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  parkId?: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
  age: number;
  passportNationalId?: string | null;
  nationality?: string | null;
  isActive: boolean;
};

export type UpdateProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
  age?: number;
  passportNationalId?: string | null;
  nationality?: string | null;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
  passportNationalId?: string | null;
  nationality?: string | null;
  age: number;
  role: 'VISITOR' | 'ADMIN' | 'FINANCE_OFFICER' | 'PARK_MANAGER' | 'GOVERNMENT_OFFICER' | 'AUDITOR';
  parkId?: string | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type Park = {
  id: string;
  name: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'VISITOR' | 'ADMIN' | 'FINANCE_OFFICER' | 'PARK_MANAGER' | 'GOVERNMENT_OFFICER' | 'AUDITOR';
};

export type UpdateUserForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: 'VISITOR' | 'ADMIN' | 'FINANCE_OFFICER' | 'PARK_MANAGER' | 'GOVERNMENT_OFFICER' | 'AUDITOR';
  parkId?: string | null;
  isActive: boolean
};

export type CreateParkForm = {
  name: string;
  location: string;
  description: string;
};

export type UpdateParkForm = {
  name: string;
  location: string;
  description: string;
};

export type Budget = {
  id: string;
  parkId: string;
  fiscalYear: number;
  totalAmount: number;
  balance: number;
  status: "DRAFT" | "APPROVED" | "REJECTED";
  createdBy: string;
  approvedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBudgetForm = {
  fiscalYear: number;
  totalAmount: number;
  status: "DRAFT" | "APPROVED" | "REJECTED"
}

export type UpdateBudgetForm = {
  fiscalYear: number;
  totalAmount: number;
  status: "DRAFT" | "APPROVED" | "REJECTED"
}

export type BudgetCategory = {
  id: string;
  budgetId: string;
  name: string;
  allocatedAmount: number;
  usedAmount: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateBudgetCategoryForm = {
  name: string;
  allocatedAmount: number;
}

export type UpdateBudgetCategoryForm = {
  name: string;
  allocatedAmount: number;
}

