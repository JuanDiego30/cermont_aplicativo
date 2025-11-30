/**
 * Ariba Integration Types
 * For SES and Invoice management with SAP Ariba
 */

// Ariba SES (Service Entry Sheet) types
export interface AribaSES {
  id: string;
  sesNumber: string;
  purchaseOrderNumber: string;
  vendorId: string;
  vendorName: string;
  description: string;
  totalAmount: number;
  currency: string;
  serviceStartDate: Date;
  serviceEndDate: Date;
  status: AribaSESStatus;
  lineItems: AribaSESLineItem[];
  attachments: AribaAttachment[];
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
}

export type AribaSESStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'POSTED'
  | 'CANCELLED';

export interface AribaSESLineItem {
  id: string;
  lineNumber: number;
  description: string;
  serviceCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  costCenter?: string;
  glAccount?: string;
}

export interface AribaAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// Ariba Invoice types
export interface AribaInvoice {
  id: string;
  invoiceNumber: string;
  sesNumber: string;
  purchaseOrderNumber: string;
  vendorId: string;
  vendorName: string;
  vendorTaxId: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  status: AribaInvoiceStatus;
  paymentTerms: string;
  lineItems: AribaInvoiceLineItem[];
  attachments: AribaAttachment[];
  createdAt: Date;
  submittedAt?: Date;
  paidAt?: Date;
}

export type AribaInvoiceStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED';

export interface AribaInvoiceLineItem {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

// Ariba API response types
export interface AribaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Ariba connection config
export interface AribaConfig {
  apiUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  tokenExpiresAt?: Date;
}

// Mapping from internal order to Ariba SES
export interface OrderToSESMapping {
  orderId: string;
  orderNumber: string;
  sesId?: string;
  sesNumber?: string;
  mappedAt?: Date;
  syncStatus: 'pending' | 'synced' | 'error';
  lastError?: string;
}
