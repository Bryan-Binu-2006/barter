import { LocalStorageManager } from '../lib/localStorage';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'barter_request' | 'barter_accepted' | 'barter_rejected' | 'chat_message' | 'system';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async getMyNotifications(): Promise<Notification[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    return LocalStorageManager.getNotifications(currentUser.id);
  }

  async markAsRead(notificationId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const notifications = LocalStorageManager.getNotifications(currentUser.id);
    const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId);

    if (notificationIndex !== -1) {
      notifications[notificationIndex].isRead = true;
      LocalStorageManager.setNotifications(currentUser.id, notifications);
    }
  }

  async markAllAsRead(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const notifications = LocalStorageManager.getNotifications(currentUser.id);
    const updatedNotifications = notifications.map((n: any) => ({ ...n, isRead: true }));
    LocalStorageManager.setNotifications(currentUser.id, updatedNotifications);
  }

  async getUnreadCount(): Promise<number> {
    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) return 0;

    const notifications = LocalStorageManager.getNotifications(currentUser.id);
    return notifications.filter((n: any) => !n.isRead).length;
  }

  // Mock real-time subscription (returns a mock subscription object)
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    // In a real app, this would set up WebSocket or SSE connection
    // For now, we'll just return a mock subscription
    return {
      unsubscribe: () => {
        // Mock unsubscribe
      }
    };
  }
}

export const notificationService = new NotificationService();