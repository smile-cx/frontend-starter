import { Component, ComponentInterface, Element, h } from '@stencil/core';
import type { ColumnDefinition, Tabulator } from 'tabulator-tables';

/**
 * Tabulator Example Component
 *
 * Demonstrates how to use Tabulator with custom styling and sorting.
 *
 * Features:
 * - Custom theme using tabulator-theme mixin
 * - Sortable columns (click headers)
 * - Movable rows (drag and drop)
 * - Sample data with multiple types
 * - Responsive layout
 * - Pagination
 *
 * Usage:
 * ```html
 * <scx-tabulator-example></scx-tabulator-example>
 * ```
 */
@Component({
  tag: 'scx-tabulator-example',
  styleUrl: 'scx-tabulator-example.scss',
  shadow: true,
})
export class ScxTabulatorExample implements ComponentInterface {
  @Element() el!: HTMLElement;

  private table?: Tabulator;
  private tableContainer?: HTMLDivElement;

  /**
   * Sample data for the table
   */
  private tableData = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, department: 'Engineering', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34, department: 'Marketing', status: 'Active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 42, department: 'Sales', status: 'Inactive' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 31, department: 'Engineering', status: 'Active' },
    { id: 5, name: 'Evan Davis', email: 'evan@example.com', age: 26, department: 'Design', status: 'Active' },
    { id: 6, name: 'Fiona Green', email: 'fiona@example.com', age: 38, department: 'Marketing', status: 'Active' },
    { id: 7, name: 'George Wilson', email: 'george@example.com', age: 45, department: 'Sales', status: 'Active' },
    { id: 8, name: 'Hannah Lee', email: 'hannah@example.com', age: 29, department: 'Engineering', status: 'Inactive' },
    { id: 9, name: 'Ian Taylor', email: 'ian@example.com', age: 33, department: 'Design', status: 'Active' },
    { id: 10, name: 'Julia Martinez', email: 'julia@example.com', age: 27, department: 'Marketing', status: 'Active' },
  ];

  /**
   * Column definitions with sorting enabled
   */
  private columns: ColumnDefinition[] = [
    {
      rowHandle: true,
      formatter: () => {
        return '<sl-icon name="cv-drag-circle" class="drag-handle"></sl-icon>';
      },
      headerSort: false,
      frozen: true,
      width: 40,
      minWidth: 40,
      hozAlign: 'center',
      vertAlign: 'middle',
      cssClass: 'row-handle-cell',
    },
    {
      title: 'ID',
      field: 'id',
      width: 80,
      sorter: 'number',
      headerSort: true,
    },
    {
      title: 'Name',
      field: 'name',
      width: 200,
      sorter: 'string',
      headerSort: true,
    },
    {
      title: 'Email',
      field: 'email',
      sorter: 'string',
      headerSort: true,
    },
    {
      title: 'Age',
      field: 'age',
      width: 100,
      sorter: 'number',
      headerSort: true,
      hozAlign: 'center',
    },
    {
      title: 'Department',
      field: 'department',
      width: 150,
      sorter: 'string',
      headerSort: true,
    },
    {
      title: 'Status',
      field: 'status',
      width: 120,
      sorter: 'string',
      headerSort: true,
      formatter: (cell) => {
        const value = cell.getValue() as string;
        const color = value === 'Active' ? 'green' : 'red';
        return `<span style="color: ${color}; font-weight: 600;">${value}</span>`;
      },
    },
  ];

  async componentDidLoad() {
    await this.initializeTable();
  }

  disconnectedCallback() {
    if (this.table) {
      this.table.destroy();
    }
  }

  /**
   * Initialize Tabulator table
   */
  private async initializeTable() {
    if (!this.tableContainer) return;

    try {
      // Dynamic import of Tabulator - it exports as default
      const tabulatorModule = await import('tabulator-tables');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const TabulatorClass = (tabulatorModule as any).default as typeof Tabulator;

      if (!TabulatorClass) {
        console.error('Tabulator constructor not found');
        return;
      }

      this.table = new TabulatorClass(this.tableContainer, {
        data: this.tableData,
        columns: this.columns,
        layout: 'fitColumns',
        height: '400px',
        initialSort: [{ column: 'name', dir: 'asc' }],
        pagination: true,
        paginationMode: 'local',
        paginationSize: 5,
        paginationSizeSelector: [5, 10, 20],
        movableRows: true, // Enable row reordering via drag and drop
      });

      // Log sort events
      this.table.on('dataSorted', (sorters: unknown) => {
        console.log('Table sorted:', sorters);
      });

      // Log row click events
      this.table.on('rowClick', (_e: unknown, row: unknown) => {
        console.log('Row clicked:', (row as { getData: () => unknown }).getData());
      });

      // Handle row moving start - add dragging class
      this.table.on('rowMoving', (_row: unknown) => {
        if (this.tableContainer) {
          this.tableContainer.classList.add('is-dragging');
        }
      });

      // Handle row moved - remove dragging class
      this.table.on('rowMoved', (row: unknown) => {
        if (this.tableContainer) {
          this.tableContainer.classList.remove('is-dragging');
        }
        console.log('Row moved:', (row as { getData: () => unknown }).getData());
        console.log('New order:', this.table?.getData());
      });
    } catch (error) {
      console.error('Failed to initialize Tabulator:', error);
    }
  }

  render() {
    return (
      <div class="tabulator-example-container">
        <div class="table-container" ref={(el) => (this.tableContainer = el)}></div>
      </div>
    );
  }
}
