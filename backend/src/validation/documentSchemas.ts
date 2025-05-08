import { z } from 'zod';

/**
 * Validation schema for Customer object within documents
 */
export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Customer name is required"),
  company: z.string().optional().default(""),
  location: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().email("Invalid email format").optional().nullable(),
  type: z.enum(["person", "business"]).default("business"),
  updated: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Validation schema for LineItem (products/services) in documents
 */
export const LineItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
  total: z.number().nonnegative("Total cannot be negative")
});

/**
 * Validation schema for PaymentMethod in documents
 */
export const PaymentMethodSchema = z.object({
  id: z.string().uuid().optional(),
  bank: z.string().optional(),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
  accountType: z.string().optional(),
  isYappy: z.boolean().optional(),
  yappyLogo: z.string().optional(),
  yappyPhone: z.string().optional()
});

/**
 * Base document schema with common fields for both creation and updates
 */
export const BaseDocumentSchema = z.object({
  documentNumber: z.string(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  customer: CustomerSchema,
  items: z.array(LineItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().nonnegative("Subtotal cannot be negative"),
  tax: z.number().nonnegative("Tax cannot be negative"),
  total: z.number().nonnegative("Total cannot be negative"),
  status: z.enum(["draft", "pending", "approved", "paid", "overdue", "cancelled", "rejected"]),
  type: z.enum(["quote", "invoice"]),
  validDays: z.number().int().positive("Valid days must be a positive integer"),
  termsAndConditions: z.array(z.string()).optional().default([]),
  paymentMethods: z.array(PaymentMethodSchema).optional().default([])
});

/**
 * Schema for document creation
 */
export const CreateDocumentSchema = BaseDocumentSchema;

/**
 * Schema for document updates - all fields are optional
 */
export const UpdateDocumentSchema = BaseDocumentSchema.partial().refine(
  data => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided for update"
  }
);

/**
 * Schema for validating document ID parameter
 */
export const DocumentIdSchema = z.object({
  id: z.string().uuid("Invalid document ID format")
});

/**
 * Validation function for document creation
 */
export function validateCreateDocument(input: unknown) {
  return CreateDocumentSchema.safeParse(input);
}

/**
 * Validation function for document updates
 */
export function validateUpdateDocument(input: unknown) {
  return UpdateDocumentSchema.safeParse(input);
}

/**
 * Validation function for document ID
 */
export function validateDocumentId(input: unknown) {
  return DocumentIdSchema.safeParse(input);
}