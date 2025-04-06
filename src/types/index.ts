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

export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    parkId?: string | null;
    phone: string;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    age: number;
    passportNationalId: string;
    nationality: string;
    isActive: boolean;
};

export type BookFormTypes = {
    activityId: string;
    visitDate: string;
    paymentMethodId: string;
};

export type Opportunity = {
    id: string;
    title: string;
    description: string;
    details: string | null;
    type: 'JOB' | 'VOLUNTEER' | 'INVESTMENT' | 'SERVICE';
    status: 'OPEN' | 'CLOSED';
    visibility: 'PUBLIC' | 'PRIVATE';
    createdById: string;
    parkId: string;
    parkName: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type OpportunityApplication = {
    id: string;
    opportunityId: string;
    firstName: string;
    lastName: string;
    email: string;
    applicationLetterUrl: string;
    status: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
  };