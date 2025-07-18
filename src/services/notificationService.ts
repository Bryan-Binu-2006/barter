import { LocalStorageManager } from '../lib/localStorage';
import { Notification } from '../types/barter';

class NotificationService {
  async getMyNotifications(): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    return LocalStorageManager.getNotifications(currentUser.id);
  }

  async markAsRead(notificationId: string): Promise<void> {
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
}

export const notificationService = new NotificationService();