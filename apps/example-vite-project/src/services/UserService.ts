import { wrappedSpan, wrappedObject, logger } from '@notjustcoders/one-logger-client-sdk';

// Example class to demonstrate wrappedObject functionality
export class UserService {
  private users: { id: string; name: string }[] = [];

  async createUser(name: string): Promise<{ id: string; name: string }> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    
    const user = { id: Math.random().toString(36).substr(2, 9), name };
    this.users.push(user);
    logger.info('👤 User created successfully', { userId: user.id, name });
    return user;
  }

  getUser(id: string): { id: string; name: string } | undefined {
    const user = this.users.find(user => user.id === id);
    if (user) {
      logger.info('🔍 User found', { userId: id, name: user.name });
    } else {
      logger.warn('⚠️ User not found', { userId: id });
    }
    return user;
  }

  getAllUsers(): { id: string; name: string }[] {
    logger.info('📋 Retrieved all users', { count: this.users.length });
    return [...this.users];
  }

  async updateUser(id: string, name: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 25));
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      const oldName = this.users[userIndex].name;
      this.users[userIndex].name = name;
      logger.info('✏️ User updated successfully', { userId: id, oldName, newName: name });
      return true;
    }
    logger.error('❌ Failed to update user - not found', { userId: id });
    return false;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      const deletedUser = this.users.splice(index, 1)[0];
      logger.info('🗑️ User deleted successfully', { userId: id, name: deletedUser.name });
      return true;
    }
    logger.error('❌ Failed to delete user - not found', { userId: id });
    return false;
  }
}

// Demonstration function for wrappedObject
export const demonstrateWrappedObject = wrappedSpan(
  'demonstrateWrappedObject',
  async () => {
    logger.info('🎭 Starting wrapped object demonstration');
    
    const userService = new UserService();
    
    // Wrap the entire object - all methods will be traced
    const tracedUserService = wrappedObject(
      'UserService',
      userService,
      (methodName, ...args) => ({
        method: methodName,
        argsCount: args.length,
        args: args,
        timestamp: new Date().toISOString(),
        layer: 'service'
      })
    );

    // All these method calls will be automatically traced
    const user1 = await tracedUserService.createUser('Alice');
    const user2 = await tracedUserService.createUser('Bob');
    const user3 = await tracedUserService.createUser('Charlie');
    
    const foundUser = tracedUserService.getUser(user1.id);
    const allUsers = tracedUserService.getAllUsers();
    
    await tracedUserService.updateUser(user2.id, 'Robert');
    const deleted = tracedUserService.deleteUser(user3.id);
    
    const finalUsers = tracedUserService.getAllUsers();
    
    logger.info('🎉 Wrapped object demonstration completed', {
      totalOperations: 8,
      finalUserCount: finalUsers.length,
      deletedUser: deleted
    });
    
    return {
      demonstrationType: 'wrapped-object',
      operationsPerformed: [
        'createUser (Alice)',
        'createUser (Bob)', 
        'createUser (Charlie)',
        'getUser',
        'getAllUsers',
        'updateUser (Bob → Robert)',
        'deleteUser (Charlie)',
        'getAllUsers (final)'
      ],
      finalUsers,
      totalUsers: finalUsers.length
    };
  },
  { demonstrationType: 'wrapped-object', layer: 'demo' }
);