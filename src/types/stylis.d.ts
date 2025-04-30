declare module 'stylis' {
  export function prefixer(property: string, value: string): string;
  export function stringify(property: string, value: string): string;
  export function compile(selector: string, properties: string): string;
  export function middleware(middleware: (element: any, index: number, children: any[], callback: (element: any) => void) => void): void;
  export function use(middleware: (element: any, index: number, children: any[], callback: (element: any) => void) => void): void;
  export function set(options: { prefix?: boolean }): void;
} 