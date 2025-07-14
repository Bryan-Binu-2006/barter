import { LocalStorageManager } from '../lib/localStorage';
import { User, LoginCredentials, SignupCredentials, AuthResponse } from '../types/auth';

class AuthService {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get all users from localStorage
    const users = LocalStorageManager.getItem('users', []);
    
    // Find user by email and password
    const user = users.find((u: any) => 
      u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    const authUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    LocalStorageManager.setCurrentUser(authUser);

    return {
      user: authUser,
      token: 'mock-token-' + user.id
    };
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get all users from localStorage
    const users = LocalStorageManager.getItem('users', []);
    
    // Check if user already exists
    const existingUser = users.find((u: any) => u.email === credentials.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: this.generateId(),
      email: credentials.email,
      name: credentials.name,
      password: credentials.password, // In real app, this would be hashed
      createdAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    LocalStorageManager.setItem('users', users);

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    const authUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt
    };

    LocalStorageManager.setCurrentUser(authUser);

    return {
      user: authUser,
      token: 'mock-token-' + newUser.id
    };
  }

  async verifyToken(token: string): Promise<User> {
    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser || !token.includes(currentUser.id)) {
      throw new Error('Invalid token');
    }
    return currentUser;
  }

  async getCurrentUser(): Promise<User | null> {
    return LocalStorageManager.getCurrentUser();
  }

  async logout(): Promise<void> {
    LocalStorageManager.clearCurrentUser();
  }
}

export const authService = new AuthService();