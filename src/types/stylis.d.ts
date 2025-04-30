declare module 'stylis' {
  export function prefixer(property: string, value: string): string;
  export function stringify(property: string, value: string): string;
  export function compile(selector: string, properties: string): string;
  export function middleware(middleware: Function): void;
  export function use(middleware: Function): void;
  export function set(options: { prefix?: boolean }): void;
} 