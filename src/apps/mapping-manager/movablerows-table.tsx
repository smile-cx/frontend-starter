import { Component, ComponentInterface, Element, Event, EventEmitter, Fragment, State, h } from '@stencil/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { CellComponent, ColumnDefinition, RowComponent, Tabulator } from 'tabulator-tables';
import { starter } from '../../di/containers';
import { CSVJSONItems, Model } from './mapping.interface';

@Component({
  tag: 'movable-rows-table',
  styleUrl: 'movablerows-table.scss',
  shadow: true,
  assetsDirs: ['assets'], // <— important when packaging as a library
})
export class MovableRowsTable implements ComponentInterface {
  @State() tableData: { name: string; entityType?: string; [key: string]: unknown }[] = [];
  @State() csvFields: CSVJSONItems[] = [];
  @State() userModel: Model | null = null;
  @Event() changePage!: EventEmitter<string>;

  // @State() initialized = false;

  // Subscription management
  private subscriptions: Subscription[] = [];

  @Element() el!: HTMLElement;

  private table?: Tabulator;
  private tableContainer?: HTMLDivElement;

  private columns: ColumnDefinition[] = [
    { title: 'CSV Fields', field: 'name' },
    { title: 'type', field: 'entityType', visible: false },
    {
      title: 'Rename field',
      field: 'renameField',
      width: 200,
      minWidth: 200,
      formatter: (cell: CellComponent) => {
        // Set value if present
        const value = cell.getValue() || '';
        // Use name for input id
        const rowIndex = cell.getRow().getPosition(); // Get row index for unique ID
        const inputId = `rename-input-${rowIndex}`;
        return `<sl-input class="my-input" id="${inputId}" value="${value}" placeholder="Rename field" style="--sl-input-height-medium:auto;width:100%;box-sizing:border-box;overflow:hidden;"></sl-input>`;
      },
    },
    this.checkboxColumn('ID', 'id'),
    this.checkboxColumn('Phone', 'landline'),
    this.checkboxColumn('Mobile', 'mobile'),
    this.checkboxColumn('E-mail', 'email'),
    this.checkboxColumn('Recency (R)', 'recency'),
    this.checkboxColumn('Monetary (M)', 'monetary'),
    this.checkboxColumn('Frequency (F)', 'frequency'),
    this.checkboxColumn('Mandatory', 'mandatory'),
    this.checkboxColumn('Hidden', 'hidden'),
  ];

  async componentWillLoad() {
    const service = starter.mappingService;

    this.ReadcsvJson()
      .then((jsonFields) => {
        this.csvFields = jsonFields;
        this.tableData = jsonFields.map((field) => ({
          name: field.name,
          entityType: field.entityType,
        }));
        console.log('tableData:', this.tableData);
        // If Tabulator is already initialized, update its data
        if (this.table) {
          this.table.replaceData(this.tableData);
        }
      })
      .catch((error) => {
        console.log('Failed to load CSV fields:', error);
      });

    this.subscriptions.push(
      service.UserModel$.subscribe((model) => {
        this.userModel = model;
      })
    );
    /*  // Subscribe to mappings
    this.subscriptions.push(
      service.mappings$.subscribe((mappings) => {
        this.mapping = mappings[0] || { id: '', campaignId: '', mappingItems: [] };
      })
    );

    // Subscribe to mapping items
    this.subscriptions.push(
      service.mappingItems$.subscribe((mappingItems) => {
        this.mappingItems = mappingItems;
      })
    ); */

    /*     // Subscribe to csvFields
    this.subscriptions.push(
      service.JSONFields$.subscribe((csvFields) => {
        this.csvFields = csvFields;
        // Update table data based on new CSV fields
        this.tableData = csvFields.map((field) => ({ fieldName: field.name, entityType: field.entityType }));
      })
    ); */
  }

  async componentDidLoad() {
    if (!this.tableContainer) return;

    // Dynamic import of Tabulator - it exports as default
    const tabulatorModule = await import('tabulator-tables');

    const TabulatorClass = (tabulatorModule.default ?? tabulatorModule) as unknown as typeof Tabulator;

    if (!TabulatorClass) {
      console.error('Tabulator constructor not found');
      return;
    }

    this.table = new TabulatorClass(this.tableContainer, {
      layout: 'fitColumns',
      movableRows: true,
      rowHeader: {
        headerSort: true,
        resizable: false,
        minWidth: 30,
        width: 30,
        rowHandle: true,
        formatter: () => {
          return '<sl-icon name="cv-drag-circle" class="drag-handle"></sl-icon>';
        },
      },
      data: this.tableData,
      columns: this.columns,
    });

    this.table.on('dataProcessed', () => {
      this.table?.getRows().forEach((row) => {
        const data = (row as RowComponent).getData() as { name: string; entityType?: string; [key: string]: unknown };

        // Set checkbox state based on entityTyp
        const type = data.entityType;

        if (type) {
          // Find the cell whose field matches the entitytype
          const cell = row.getCell(type);
          if (cell) {
            // setValue(value, mutate) → mutate=true avoids triggering an edit event
            cell.setValue(true);
          }
        }

        // Handle renameField input synchronization for Shoelace sl-input
        const cell2 = row.getCell('renameField');
        if (!cell2) return;

        const slInput = cell2.getElement().querySelector('sl-input.my-input');
        if (!slInput) return;

        // Attach event listener once
        if (!(slInput as { _bound?: boolean })._bound) {
          slInput.addEventListener('sl-change', (event: Event) => {
            const target = event.target as HTMLInputElement;
            const value = target.value;
            const rowData = row.getData() as { name: string; entityType?: string; [key: string]: unknown };
            rowData.renameField = value;
            row.update(rowData);
            // Optionally, keep Tabulator's cell value in sync
            if (cell2.getValue() !== value) {
              cell2.setValue(value); // true = silent
            }
            console.log(`Row data after rename input:`, rowData);
          });
          (slInput as { _bound?: boolean })._bound = true;
        }
      });
    });
  }

  private checkboxColumn(title: string, field: string): ColumnDefinition {
    // const field = title.toLowerCase().replace(/\s+/g, '_');
    return {
      title,
      field,
      headerSort: true,
      hozAlign: 'center',
      formatter: (cell: CellComponent) => {
        const checked = cell.getValue() === true ? 'checked' : '';
        return `<div class="checkbox-container"><sl-checkbox ${checked}></sl-checkbox></div>`;
      },
      cellClick: (_e: unknown, cell: CellComponent) => {
        const current = cell.getValue();
        const row = cell.getRow();
        const rowData = row.getData() as { name: string; entityType?: string; [key: string]: unknown };
        // Toggle checked state
        const newChecked = !current;
        cell.setValue(newChecked);
        // Add or remove attribute with the column header (title) to rowData
        if (newChecked) {
          rowData[field] = true;
        } else {
          rowData[field] = undefined;
        }
        row.update(rowData); // update row data to reflect the change
        console.log(`Row data after ${title} toggle:`, rowData);
      },
    };
  }

  disconnectedCallback() {
    if (this.table) {
      this.table.destroy();
    }
  }

  /** Read CSV and load into Tabulator */
  private async ReadcsvJson(): Promise<CSVJSONItems[]> {
    // Read JSON from a constant file (e.g., sample.json)
    const filePath = '../../assets/data/leads-schema.json'; // Adjust path as needed
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error('Failed to fetch JSON file');
      const jsonText = await response.text();
      const service = starter.mappingService;
      const jsonFields = await service.loadMappingFields(jsonText);
      return jsonFields;
    } catch (error) {
      console.error('Failed to load mapping fields from constant file:', error);
      return [];
    }
  }

  private saveMappings() {
    if (!this.table) return;

    // Get model name from state
    const modelName = this.userModel?.name?.trim();
    if (!modelName) {
      alert('Please enter a model name.');
      return;
    }

    const tableData = this.table.getData() as { name: string; entityType?: string; [key: string]: unknown }[];
    // Update jsonFields with latest row data based on fieldName
    this.csvFields = this.csvFields.map((field) => {
      const row = tableData.find((r) => r.name === field.name);
      return row ? { ...field, ...row } : field;
    });

    console.log('Updated csvFields:', this.csvFields);

    const service = starter.mappingService;
    service.saveMapping(this.csvFields);
    this.changePage.emit('scoring');
  }

  render() {
    return (
      <div class="vertical-cards-container">
        <Fragment>
          <sl-card>
            <div class="card-body">
              <div class="card-body__div">
                <div class="model-inputs-row">
                  <sl-input
                    name="modelName"
                    label="Model Name"
                    placeholder="Model customer Outband"
                    required
                    style={{ width: '80%' }}
                    value={this.userModel?.name || ''}
                    onInput={(event: Event) =>
                      (this.userModel = { ...this.userModel, name: (event.target as HTMLInputElement).value } as Model)
                    }
                  ></sl-input>
                  <sl-input
                    name="modelFile"
                    type="text"
                    placeholder="Upload model file"
                    style={{ width: '20%' }}
                    value={this.userModel?.fileName || ''}
                    // readonly
                  ></sl-input>
                </div>
              </div>
            </div>
          </sl-card>
          <sl-card class="card-header">
            <div slot="header" class="card-header__header">
              <div class="card-header__content">
                <sl-icon name="cv-sort-cx-card" class="cv-sort-cx-card"></sl-icon>
                <h4>Field Mapping Configuration</h4>
              </div>
            </div>
            <div class="card-body">
              <div class="card-body__div">
                <div class="table-container" ref={(el) => (this.tableContainer = el)}></div>
                <div class="save-button">
                  <sl-button onClick={() => this.saveMappings()}>Save</sl-button>
                </div>
              </div>
            </div>
          </sl-card>
        </Fragment>
      </div>
    );
  }
}
