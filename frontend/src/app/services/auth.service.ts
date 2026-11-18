import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { UserRole, UserSession } from '../models/delivery.model';

const STORAGE_KEY = 'dropslot_user_session';

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'ROLE_ADMIN' | 'ROLE_PARTNER' | 'ROLE_CUSTOMER';
  vehicleType?: string;
  serviceZone?: string;
}

export interface AuthBackendResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'ROLE_ADMIN' | 'ROLE_PARTNER' | 'ROLE_CUSTOMER';
  partnerId?: number;
  token: string;
  message: string;
}

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
      }
    }
  }
  return DEMO_ACCOUNTS.admin;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8088/api/auth';

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

  public realSignUp(payload: SignUpPayload): Observable<UserSession> {
    return this.http.post<AuthBackendResponse>(`${this.apiUrl}/signup`, payload).pipe(
      map(res => {
        const role = this.mapBackendRole(res.role);
        const session: UserSession = {
          username: res.fullName,
          email: res.email,
          role: role,
          token: res.token,
          partnerId: res.partnerId,
          customerPhone: res.phone
        };
        this.saveSession(session);
        return session;
      })
    );
  }

  public realLogin(email: string, password: string): Observable<UserSession> {
    return this.http.post<AuthBackendResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => {
        const role = this.mapBackendRole(res.role);
        const session: UserSession = {
          username: res.fullName,
          email: res.email,
          role: role,
          token: res.token,
          partnerId: res.partnerId,
          customerPhone: res.phone
        };
        this.saveSession(session);
        return session;
      })
    );
  }

  private mapBackendRole(role: string): UserRole {
    if (role === 'ROLE_ADMIN') return 'admin';
    if (role === 'ROLE_PARTNER') return 'partner';
    return 'customer';
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
