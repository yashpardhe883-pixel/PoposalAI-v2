// Dummy type definitions to satisfy the standard TypeScript compiler (VS Code TS Server)
// when the Deno extension is not active or improperly configured.

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "npm:@google/generative-ai" {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(options: any): any;
  }
}

declare module "https://esm.sh/stripe@12.0.0" {
  const Stripe: any;
  export default Stripe;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export const createClient: any;
}

