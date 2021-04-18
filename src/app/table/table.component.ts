import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Todos } from '../core/api/todos/todos.model';
import { TodosService } from '../core/api/todos/todos.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UsersService } from '../core/api/users/users.service';
import { User } from '../core/api/users/users.model';
import { forkJoin, Observable, ReplaySubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { scaleIn400ms } from 'src/shared/animations/scale-in.animation';
import { stagger40ms } from 'src/shared/animations/stagger.animation';
import { fadeInRight400ms } from 'src/shared/animations/fade-in-right.animation';
import { fadeInUp400ms } from 'src/shared/animations/fade-in-up.animation';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActionDialogComponent } from './action-dialog/action-dialog.component';
import Swal from 'sweetalert2/src/sweetalert2.js'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [fadeInUp400ms, fadeInRight400ms, stagger40ms, scaleIn400ms],
})
export class TableComponent implements OnInit, OnDestroy, AfterViewInit {

  subject$: ReplaySubject<any[]> = new ReplaySubject<[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  loading = false;
  todosList: Todos[];
  usersList: User[];

  columns = [
    { label: '#', property: 'id', visible: true },
    { label: 'Title', property: 'title', visible: true },
    { label: 'Assignee', property: 'assignee', visible: true },
    { label: 'Status', property: 'status', visible: true },
    { label: 'Actions', property: 'actions', visible: true },
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<any> | null;
  searchCtrl = new FormControl();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  deleteDialogRef: MatDialogRef<any>;

  constructor(
    private todosService: TodosService,
    private usersService: UsersService,
    private dialog : MatDialog,
  ) {
    this.tableData();
  }

  ngOnInit(): void {
    // Fetch lead data
    this.dataSource = new MatTableDataSource();

    // Attach data filter pipe
    this.data$.pipe(
      filter<[]>(Boolean)
    ).subscribe(data => {
      this.todosList = data;
      this.dataSource.data = data;
    });

    // Listen for search
    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this),
      debounceTime(150)
    ).subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  
  tableData() {
    this.loading = true;
    const combined = forkJoin([
      this.todosService.getTodos(),
      this.usersService.getUsers()
    ])

    combined.subscribe((responses: [Todos[], User[]]) => {
      this.todosList = responses[0];
      this.usersList = responses[1];

      this.subject$.next(this.todosList);
    }).add(() => this.loading = false);
  }

  getUser(userId: number): User {
    return this.usersList.find(user => user.id === userId);
  }

  trackByProperty<T>(column: any) {
    return column.property;
  }

  deleteTodo(data: Todos) {

    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete action?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        this.todosService.removeUser(data.id).subscribe(response => {
          this.todosList = this.todosList.filter(todo => todo !== data);
          this.subject$.next(this.todosList);
        });
       }
    });
  }

  openDialog(data: Todos): void {
      const dialogRef = this.dialog.open(ActionDialogComponent, {
          data,

        }).addPanelClass('cdk-full-overlay');

        dialogRef.afterClosed().subscribe(result => {
          if (result.status) {
            let objIndex = this.todosList.findIndex((obj => obj.id == result.id));
            this.todosList[objIndex].title = result.title;
            this.todosList[objIndex].completed = result.completed;
          } 
        });
  }

  ngOnDestroy() { }

}
