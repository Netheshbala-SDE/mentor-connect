import { Document } from 'mongoose';

/**
 * Transforms MongoDB document _id to id and removes MongoDB-specific fields
 */
export function transformDocument<T extends Document>(doc: T | null): any {
  if (!doc) return null;
  
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  
  return {
    id: _id?.toString() || _id,
    ...rest
  };
}

/**
 * Transforms an array of MongoDB documents
 */
export function transformDocuments<T extends Document>(docs: T[]): any[] {
  return docs.map(doc => transformDocument(doc));
}

/**
 * Transforms nested populated fields (owner, mentor, etc.)
 */
export function transformPopulatedFields(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformPopulatedFields(item));
  }
  
  const { _id, __v, ...rest } = obj;
  const transformed: any = { ...rest };
  
  // Transform _id to id if it exists
  if (_id) {
    transformed.id = _id.toString ? _id.toString() : _id;
  }
  
  // Recursively transform nested objects
  for (const key in transformed) {
    if (transformed[key] && typeof transformed[key] === 'object') {
      if (Array.isArray(transformed[key])) {
        transformed[key] = transformed[key].map((item: any) => transformPopulatedFields(item));
      } else if (transformed[key]._id || transformed[key].constructor?.name === 'ObjectId') {
        transformed[key] = transformPopulatedFields(transformed[key]);
      }
    }
  }
  
  return transformed;
}

