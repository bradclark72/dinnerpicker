import { EventEmitter } from 'events';
import { type FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// This is a typed event emitter.
declare interface AppEventEmitter {
  on<TEv extends keyof AppEvents>(event: TEv, listener: AppEvents[TEv]): this;
  off<TEv extends keyof AppEvents>(event: TEv, listener: AppEvents[TEv]): this;
  once<TEv extends keyof AppEvents>(event: TEv, listener: AppEvents[TEv]): this;
  emit<TEv extends keyof AppEvents>(
    event: TEv,
    ...args: Parameters<AppEvents[TEv]>
  ): boolean;
}

class AppEventEmitter extends EventEmitter {}

export const errorEmitter = new AppEventEmitter();
