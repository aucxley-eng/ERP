import { z } from "zod";
import { COUNTIES, LISTING_TYPES, PROPERTY_TYPES } from "./constants";

const propertyTypeValues = PROPERTY_TYPES.map((t) => t.value) as [string, ...string[]];
const listingTypeValues = LISTING_TYPES.map((t) => t.value) as [string, ...string[]];

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().max(30).optional().or(z.literal("")),
  role: z.enum(["BUYER", "AGENT"]).default("BUYER"),
  company: z.string().max(120).optional().or(z.literal("")),
});

export const propertySchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(20),
  listingType: z.enum(listingTypeValues),
  propertyType: z.enum(propertyTypeValues),
  price: z.coerce.number().positive(),
  pricePeriod: z.string().max(30).optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  sizeSqft: z.coerce.number().positive().optional(),
  sizeAcres: z.coerce.number().positive().optional(),
  hasTitleDeed: z.coerce.boolean().default(false),
  county: z.string().min(2),
  town: z.string().min(2),
  address: z.string().max(200).optional().or(z.literal("")),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  amenities: z.string().optional().or(z.literal("")),
});

export const inquirySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().min(10).max(2000),
});

export const countyValues = COUNTIES as readonly string[];

export type PropertyInput = z.infer<typeof propertySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
