export {};

declare global {
  namespace Express {
    interface Req {
      files?: any;
    }
  }
}
