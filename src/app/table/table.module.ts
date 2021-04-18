import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { FormsModule } from '@angular/forms';
import { ActionDialogComponent } from './action-dialog/action-dialog.component';
import { MaterialModule } from 'src/shared/material.module';


@NgModule({
  declarations: [
    TableComponent,
    ActionDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
  ],
  entryComponents: [
    ActionDialogComponent
  ],
})
export class TableModule { }
