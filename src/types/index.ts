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
  parkName: string;
  fiscalYear: number;
  totalAmount: string; // Changed to string for BigDecimal
  balance: string; // Changed to string for BigDecimal
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  approvedBy?: string; // Made optional
  createdAt: string;
  updatedAt: string;
};

export type BudgetResponse = {
  id: string;
  parkId: string;
  parkName: string;
  fiscalYear: number;
  totalAmount: string; // Changed to string for BigDecimal
  balance: string; // Changed to string for BigDecimal
  unallocated?: string; // Added for BudgetByFiscalYearResponseDto
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';

export interface CreateBudgetForm {
  fiscalYear: number;
  totalAmount: number;
  status: BudgetStatus;
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

export type SpendingStrategy = 'EXPENSE' | 'WITHDRAW_REQUEST';

export interface CreateBudgetCategoryForm {
  name: string;
  allocatedAmount: number;
  spendingStrategy: SpendingStrategy;
}

export type UpdateBudgetCategoryForm = {
  name: string;
  allocatedAmount: number;
}

export type UpdateExpenseForm = {
  description: string;
  receiptUrl: string;
}

export type Expense = {
  id: string;
  budgetId: string;
  amount: string;
  description: string;
  budgetCategoryId: string;
  budgetCategoryName: string;
  parkId: string;
  parkName: string;
  createdBy: string;
  auditStatus: 'PASSED' | 'FAILED' | 'UNJUSTIFIED'; // Changed to enum
  receiptUrl: string;
  justification: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string; // Renamed
};

export type CreateExpenseForm = {
  budgetId: string;
  amount: string;
  description: string;
  budgetCategoryId: string;
  parkId: string;
  receiptUrl: string;
}

export type UpdateWithdrawRequest = {
  amount: number; // Updated amount (optional)
  reason: string; // Updated reason (optional)
  description: string; // Updated description (optional)
  receiptUrl: string; // Updated receipt URL (optional)
};

export type WithdrawRequest = {
  id: string; // UUID of the withdraw request
  amount: number; // Amount of the request (decimal, e.g., 1000.50)
  reason: string; // Reason for the request (required)
  description?: string; // Optional detailed description
  requesterId: string; // UUID of the user who created the request
  approverId?: string; // UUID of the user who approved the request, if approved
  budgetCategoryId: string; // UUID of the associated budget category
  budgetCategoryName: string; // Name of the associated budget category
  budgetId: string; // UUID of the associated budget
  receiptUrl?: string; // Optional URL to the receipt
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Current status of the request
  auditStatus: 'PASSED' | 'FAILED' | 'UNJUSTIFIED'; // Audit status of the request
  approvedAt?: string; // ISO timestamp of approval, if approved (e.g., "2025-04-19T12:00:00Z")
  rejectionReason?: string; // Reason for rejection, if rejected
  justification: string | null;
  parkId: string; // UUID of the associated park
  parkName: string; // Park name
  currency: string; // Currency code (e.g., "XAF")
  createdAt: string; // ISO timestamp of creation
  updatedAt: string; // ISO timestamp of last update
};

export type CreateWithdrawRequestForm = {
  amount: number; // Amount of the request (required, e.g., 1000.50)
  reason: string; // Reason for the request (required)
  description?: string; // Optional detailed description
  budgetCategoryId: string; // UUID of the selected budget category
  budgetId: string; // UUID of the selected budget
  parkId: string; // UUID of the associated park
  receiptUrl?: string; // Optional URL to the receipt (e.g., uploaded file)
};

// No fields needed in the body, as approverId and approvedAt are set by the backend
// export type ApproveWithdrawRequest = {};

export type RejectWithdrawRequest = {
  rejectionReason: string; // Reason for rejecting the request (required)
};

export type UpdateWithdrawRequestAuditStatus = {
  auditStatus: 'PASSED' | 'FAILED' | 'UNJUSTIFIED'; // New audit status (required)
};

export type UpdateExpenseAuditStatus = {
  auditStatus: 'PASSED' | 'FAILED' | 'UNJUSTIFIED'; // New audit status (required)
};

export type CreateOpportunityForm = {
  title: string; // Title of the opportunity (required, max 100 characters)
  description: string; // Description of the opportunity (required)
  details?: string; // Optional detailed information
  type: 'JOB' | 'VOLUNTEER' | 'PARTNERSHIP'; // Type of opportunity (required)
  status: 'OPEN' | 'CLOSED'; // Status of opportunity (required)
  visibility: 'PUBLIC' | 'PRIVATE'; // Visibility of opportunity (required)
  parkId: string; // UUID of the associated park (required)
};

export type Opportunity = {
  id: string; // UUID of the opportunity
  title: string; // Title of the opportunity
  description: string; // Description of the opportunity
  details?: string; // Detailed information, if provided
  type: 'JOB' | 'VOLUNTEER' | 'PARTNERSHIP'; // Type of opportunity
  status: 'OPEN' | 'CLOSED'; // Status of opportunity
  visibility: 'PUBLIC' | 'PRIVATE'; // Visibility of opportunity
  createdById: string; // UUID of the user who created the opportunity
  parkId: string; // UUID of the associated park
  parkName: string; // Name of the associated park
  createdAt: string; // ISO timestamp of creation (e.g., "2025-04-19T12:00:00Z")
  updatedAt: string; // ISO timestamp of last update
};

export type BudgetByFiscalYearResponse = {
  budgetId?: string; // Optional if no budget exists
  parkId: string;
  parkName: string;
  fiscalYear: number;
  totalAmount?: string; // Changed to string for BigDecimal
  balance?: string; // Changed to string for BigDecimal
  unallocated?: string; // Added for BigDecimal
  status?: 'DRAFT' | 'APPROVED' | 'REJECTED';
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type IncomeStreamResponse = {
  id: string;
  budgetId: string;
  parkId: string;
  fiscalYear: number;
  name: string;
  percentage: number;
  totalContribution: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type IncomeStreamRequest = {
  name: string;
  percentage: number;
  totalContribution: number;
  parkId: string
};

export type OpportunityApplicationRequest = {
  opportunityId: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationLetterUrl: string;
};

export interface OpportunityApplicationResponse {
  id: string;
  opportunityId: string;
  opportunityName: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationLetterUrl: string;
  status: string;
  approvalMessage: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateActivityRequest = {
  name: string;
  price: number;
  description: string;
  picture: string;
  capacityPerDay: number;
};

export type UpdateActivityRequest = {
  name?: string;
  price?: number;
  description?: string;
  picture?: string;
  capacityPerDay?: number;
};

export type ActivityResponse = {
  id: string;
  name: string;
  parkId: string;
  price: number;
  description?: string;
  picture?: string;
  capacityPerDay?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateDonationRequest = {
  parkId: string;
  amount: string;
  motiveForDonation?: string;
};

export interface OutstandingDonorResponse {
  donorId: string;
  donorName: string;
  totalDonationAmount: number;
  motiveForDonation: string | null;
}

export type DonationResponse = {
  id: string;
  donorId: string;
  donorName: string;
  parkId: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentReference?: string;
  currency: string;
  motiveForDonation?: string;
  fiscalYear: number;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export interface CreateBookingRequest {
  activityId: string;
  visitDate: string; // ISO date string, e.g., "2025-05-01"
}

export interface BookingResponse {
  id: string;
  visitorId: string;
  activityId: string;
  amount: number;
  parkId: string;
  visitDate: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  paymentReference: string;
  currency: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  numberOfTickets: number;
  groupMembers: {
    userId?: string;
    guestName?: string;
    guestEmail?: string;
  }[];
}

export interface FundingRequestResponse {
  id: string;
  parkId: string;
  parkName: string;
  budgetId: string;
  budgetCategoryId: string; // Added
  budgetCategoryName: string; // Added
  requestedAmount: string; // Changed to string for BigDecimal
  approvedAmount: string | null; // Changed to string for BigDecimal
  requestType: 'EXTRA_FUNDS' | 'EMERGENCY_RELIEF';
  reason: string;
  requesterId: string;
  approverId: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Changed to enum
  rejectionReason: string | null;
  approvedAt: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFundingRequestDto {
  parkId: string; // Added
  requestedAmount: number; 
  requestType: 'EXTRA_FUNDS' | 'EMERGENCY_RELIEF';
  reason: string;
  budgetId: string;
  budgetCategoryId: string; // Added
}

export interface AuditResponse {
  id: string
  parkId: string
  parkName: string
  auditYear: number
  percentagePassed: number
  percentageFailed: number
  percentageUnjustified: number
  totalPercentage: number
  auditProgress: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface UpdateAuditProgressRequest {
  auditProgress: string
}

export interface CreateAuditRequest {
  parkId: string
  auditYear: number
}

