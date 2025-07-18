import { LocalStorageManager } from '../lib/localStorage';
import { User, LoginCredentials, SignupCredentials, AuthResponse } from '../types/auth';

class AuthService {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = LocalStorageManager.getUsers();
    const user = users.find((u: any) => 
      u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    const authUser: User = userWithoutPassword;

    LocalStorageManager.setCurrentUser(authUser);

    return {
      user: authUser,
      token: 'mock-token-' + user.id
    };
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = LocalStorageManager.getUsers();
    const existingUser = users.find((u: any) => u.email === credentials.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: this.generateId(),
      email: credentials.email,
      name: credentials.name,
      password: credentials.password,
      isProfileComplete: false,
      createdAt: new Date().toISOString()
    };

    LocalStorageManager.addUser(newUser);

    const { password, ...userWithoutPassword } = newUser;
    const authUser: User = userWithoutPassword;

    LocalStorageManager.setCurrentUser(authUser);

    return {
      user: authUser,
      token: 'mock-token-' + newUser.id
    };
  }

  async getCurrentUser(): Promise<User | null> {
    return LocalStorageManager.getCurrentUser();
  }

  async logout(): Promise<void> {
    LocalStorageManager.clearCurrentUser();
  }
}

export const authService = new AuthService();