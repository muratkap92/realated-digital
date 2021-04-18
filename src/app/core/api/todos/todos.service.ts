import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Todos } from './todos.model';

@Injectable({
  providedIn: 'root'
})
export class TodosService {

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todos[]>{
    return this.http.get<Todos[]>(environment.apiUrl + 'todos');
  }

  removeUser(id: number): Observable<Todos> {
    return this.http.delete<Todos>(`${environment.apiUrl}todos/${id}`)
  }

  patchUser(todos: Todos): Observable<Todos> {
    return this.http.patch<Todos>(`${environment.apiUrl}todos/${todos.id}`, {todos})
  }
}
