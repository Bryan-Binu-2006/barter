export class LocalStorageManager {
  // Clear all app data on startup for fresh start
  static clearAllAppData() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('baarter_')) {
        localStorage.removeItem(key);
      }
    });
  }

  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`baarter_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`baarter_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // User management
  static getCurrentUser() {
    return this.getItem('currentUser', null);
  }

  static setCurrentUser(user: any) {
    this.setItem('currentUser', user);
  }

  static clearCurrentUser() {
    localStorage.removeItem('baarter_currentUser');
  }

  static getUsers() {
    return this.getItem('users', []);
  }

  static setUsers(users: any[]) {
    this.setItem('users', users);
  }

  static addUser(user: any) {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  }

  // Communities management
  static getCommunities() {
    return this.getItem('communities', []);
  }

  static setCommunities(communities: any[]) {
    this.setItem('communities', communities);
  }

  static addCommunity(community: any) {
    const communities = this.getCommunities();
    communities.push(community);
    this.setCommunities(communities);
  }

  // Community members
  static getCommunityMembers(communityId: string) {
    return this.getItem(`members_${communityId}`, []);
  }

  static setCommunityMembers(communityId: string, members: any[]) {
    this.setItem(`members_${communityId}`, members);
  }

  static addCommunityMember(communityId: string, member: any) {
    const members = this.getCommunityMembers(communityId);
    members.push(member);
    this.setCommunityMembers(communityId, members);
  }

  // Listings management
  static getListings() {
    return this.getItem('listings', []);
  }

  static setListings(listings: any[]) {
    this.setItem('listings', listings);
  }

  static addListing(listing: any) {
    const listings = this.getListings();
    listings.push(listing);
    this.setListings(listings);
  }

  // Barter requests
  static getBarterRequests() {
    return this.getItem('barterRequests', []);
  }

  static setBarterRequests(requests: any[]) {
    this.setItem('barterRequests', requests);
  }

  static addBarterRequest(request: any) {
    const requests = this.getBarterRequests();
    requests.push(request);
    this.setBarterRequests(requests);
  }

  // Notifications
  static getNotifications(userId: string) {
    return this.getItem(`notifications_${userId}`, []);
  }

  static setNotifications(userId: string, notifications: any[]) {
    this.setItem(`notifications_${userId}`, notifications);
  }

  static addNotification(userId: string, notification: any) {
    const notifications = this.getNotifications(userId);
    notifications.push(notification);
    this.setNotifications(userId, notifications);
  }

  // Trust scores
  static getUserStats(userId: string) {
    return this.getItem(`user_stats_${userId}`, {
      completedExchanges: 0,
      totalRating: 0,
      ratingCount: 0,
      disputes: 0,
      endorsements: 0,
      verifications: { email: true, phone: false, id: false, address: false },
      responseRate: 1.0,
      ruleViolations: 0,
      lastLogin: new Date().toISOString()
    });
  }

  static setUserStats(userId: string, stats: any) {
    this.setItem(`user_stats_${userId}`, stats);
  }
}