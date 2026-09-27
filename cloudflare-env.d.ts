declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    PMSV_DISPATCH_SECRET?: string;
    BUCKET?: R2Bucket;
  }
}
