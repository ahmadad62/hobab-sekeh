declare module 'stylis' {
  export function prefixer(property: string, value: string): string;
  export function stringify(property: string, value: string): string;
  export function compile(selector: string, properties: string): string;
  
  interface StylisElement {
    type: string;
    value: string;
    props: string[];
    children: StylisElement[];
    parent: StylisElement | null;
    line: number;
    column: number;
    length: number;
    return: string;
  }

  type MiddlewareCallback = (element: StylisElement) => void;
  type MiddlewareFunction = (element: StylisElement, index: number, children: StylisElement[], callback: MiddlewareCallback) => void;

  export function middleware(middleware: MiddlewareFunction): void;
  export function use(middleware: MiddlewareFunction): void;
  export function set(options: { prefix?: boolean }): void;
} 