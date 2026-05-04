declare module 'cookie-cutter' {
  interface CookieOptions {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }

  const cookieCutter: {
    set: (name: string, value: string, options?: CookieOptions) => void;
    get: (name: string) => string | undefined;
    remove: (name: string, options?: CookieOptions) => void;
  };

  export default cookieCutter;
}