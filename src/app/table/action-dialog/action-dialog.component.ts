import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Todos } from 'src/app/core/api/todos/todos.model';
import { TodosService } from 'src/app/core/api/todos/todos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.scss']
})
export class ActionDialogComponent implements OnInit {
  @Output() modifyData: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;

  constructor(
    private todosService: TodosService,
    private dialogref: MatDialogRef<ActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Todos,
    private formBuilder: FormBuilder
  ) {
    this.initForm();
   }

  ngOnInit(): void { }

  initForm() {
    this.form = this.formBuilder.group({
      title: [this.data.title, Validators.required],
      status: [this.data.completed]
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      const request = {
        id: this.data.id,
        title: this.form.get('title').value,
        completed: this.form.get('status').value,
        userId: this.data.userId,
      }
      Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to save changes?",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Save'
      }).then((result) => {
        if (result.value) {
          this.todosService.patchUser(request).subscribe(res => {
            this.dialogref.close({
              status: true,
              title: this.form.get('title').value,
              id: this.data.id,
              completed: this.form.get('status').value
            });
          });
         }
      });
    }
  }

}
