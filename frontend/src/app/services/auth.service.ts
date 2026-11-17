import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRole, UserSession } from '../models/delivery.model';

const STORAGE_KEY = 'dropslot_user_session';

const DEMO_ACCOUNTS: Record<UserRole, UserSession> = {
  admin: {
    username: 'Central Dispatch Hub Admin',
    email: 'admin@dropslot.com',
    role: 'admin',
    token: 'jwt-dropslot-demo-admin-token-xyz'
  },
  partner: {
    username: 'Rajesh Sharma',
    email: 'rajesh.delivery@dropslot.com',
    role: 'partner',
    partnerId: 1,
    token: 'jwt-dropslot-demo-partner-token-xyz'
  },
  customer: {
    username: 'Manikanta Reddy',
    email: 'manikanta@gmail.com',
    role: 'customer',
    customerPhone: '9876501234',
    token: 'jwt-dropslot-demo-customer-token-xyz'
  }
};

function getInitialSession(): UserSession {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Fallback
      }
    }
  }
  return DEMO_ACCOUNTS.admin;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentSessionSubject = new BehaviorSubject<UserSession | null>(getInitialSession());
  public currentSession$: Observable<UserSession | null> = this.currentSessionSubject.asObservable();
  public currentSessionSignal = signal<UserSession | null>(getInitialSession());

  public get currentSession(): UserSession | null {
    return this.currentSessionSubject.value;
  }

  public get isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  public get userRole(): UserRole | null {
    return this.currentSession ? this.currentSession.role : null;
  }

  public loginWithDemo(role: UserRole): UserSession {
    const session = DEMO_ACCOUNTS[role];
    this.saveSession(session);
    return session;
  }

  public login(email: string, role: UserRole): UserSession {
    let session = DEMO_ACCOUNTS[role];
    if (email) {
      session = { ...session, email };
    }
    this.saveSession(session);
    return session;
  }

  public switchRole(role: UserRole): UserSession {
    return this.loginWithDemo(role);
  }

  public logout(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    this.currentSessionSubject.next(null);
    this.currentSessionSignal.set(null);
  }

  private saveSession(session: UserSession): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    this.currentSessionSubject.next(session);
    this.currentSessionSignal.set(session);
  }
}
