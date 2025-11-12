import { EventEmitter } from 'events';

export const errorEmitter = new EventEmitter();

type FirestoreOperation = 'get' | 'list' | 'create' | 'update' | 'delete';

type FirestorePermissionErrorOptions = {
  path: string;
  operation: FirestoreOperation;
  requestData?: Record<string, any>;
};

export class FirestorePermissionError extends Error {
  path: string;
  operation: FirestoreOperation;
  requestData?: Record<string, any>;

  constructor(options: FirestorePermissionErrorOptions) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
{
  "auth": {},
  "method": "${options.operation}",
  "path": "/databases/(default)/documents${options.path}"
}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.path = options.path;
    this.operation = options.operation;
    this.requestData = options.requestData;
  }
}
