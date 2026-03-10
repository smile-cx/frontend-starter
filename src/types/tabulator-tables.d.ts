declare module 'tabulator-tables' {
  export interface TabulatorOptions {
    data?: unknown[];
    columns?: ColumnDefinition[];
    layout?: string;
    height?: string | number;
    initialSort?: { column: string; dir: string }[];
    pagination?: boolean;
    paginationMode?: string;
    paginationSize?: number;
    paginationSizeSelector?: number[];
    movableRows?: boolean;
    [key: string]: unknown;
  }

  export interface CellComponent {
    getValue(): unknown;
    [key: string]: unknown;
  }

  export interface RowComponent {
    getData(): unknown;
    [key: string]: unknown;
  }

  export class Tabulator {
    constructor(element: string | HTMLElement, options?: TabulatorOptions);
    on(event: string, callback: (...args: unknown[]) => void): void;
    destroy(): void;
    getData(): unknown[];
  }

  export class TabulatorFull extends Tabulator {
    constructor(element: string | HTMLElement, options?: TabulatorOptions);
  }

  export interface ColumnDefinition {
    title?: string;
    field?: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    sorter?: string | ((a: unknown, b: unknown) => number);
    formatter?: string | ((cell: CellComponent) => string);
    headerSort?: boolean;
    hozAlign?: 'left' | 'center' | 'right';
    vertAlign?: 'top' | 'middle' | 'bottom';
    rowHandle?: boolean;
    frozen?: boolean;
    cssClass?: string;
    [key: string]: unknown;
  }
}
