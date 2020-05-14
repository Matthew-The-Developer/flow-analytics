import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`Companies/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async emailSignin(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
      .then(response => { this.router.navigate([ '/map' ]); })
      .catch(error => { console.log(error); });
  }

  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }
}
