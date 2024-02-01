import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  styles: [`
    div {
      margin-bottom: 20px;
    }
    h2 {
      color: darkblue;
    }
    h3 {
      color: #333;
    }
    p {
      color: #666;
    }
  `],
  selector: 'app-data',
  standalone: true,
  imports: [
    NgIf, NgFor
  ],
  template: `
    <div *ngIf="data.length > 0; else loading">
      <ng-container *ngFor="let userData of data">
        <h2>User {{ userData.userId }}'s Posts:</h2>
        <div *ngFor="let post of userData.posts">
          <h3>{{ post.title }}</h3>
          <p>{{ post.body }}</p>
        </div>
        <hr />
      </ng-container>
    </div>
    <ng-template #loading>
      <p>Loading posts...</p>
    </ng-template>
  `,

})
export class DataComponent implements OnInit {

  data: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUsersAndTheirPosts();
  }

  fetchUsersAndTheirPosts(): void {
    this.http.get<any[]>('https://jsonplaceholder.typicode.com/users').subscribe(users => {
      const limitedUsers = users.slice(0, 5);
      const postsRequests = limitedUsers.map(user =>
        this.http.get(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`).pipe(
          map(posts => ({
            userId: user.id,
            posts: posts
          }))
        )
      );

      forkJoin(postsRequests).subscribe(results => {
        this.data = results;
      }, error => {
        console.error('Error fetching posts for users:', error);
      });
    }, error => {
      console.error('Error fetching users:', error);
    });
  }
}
