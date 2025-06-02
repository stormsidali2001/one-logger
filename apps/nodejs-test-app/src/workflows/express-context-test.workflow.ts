import { logger, wrappedClass } from '@notjustcoders/one-logger-client-sdk';

// Repository layer - data access
class UserRepository {
  async findById(id: string): Promise<any> {
    logger.info('🗄️ Repository: Finding user by ID', { userId: id });
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  }

  async findAll(): Promise<any[]> {
    logger.info('🗄️ Repository: Finding all users');
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      { id: '1', name: 'User 1', email: 'user1@example.com' },
      { id: '2', name: 'User 2', email: 'user2@example.com' }
    ];
  }

  async create(userData: any): Promise<any> {
    logger.info('🗄️ Repository: Creating user', { userData });
    await new Promise(resolve => setTimeout(resolve, 200));
    return { id: Date.now().toString(), ...userData };
  }

  async update(id: string, userData: any): Promise<any> {
    logger.info('🗄️ Repository: Updating user', { userId: id, userData });
    await new Promise(resolve => setTimeout(resolve, 120));
    return { id, ...userData };
  }
}

// Use case layer - business logic (this is where we wrap with spans)
class UserUseCase {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string): Promise<any> {
    logger.info('💼 UseCase: Getting user by ID', { userId: id });
    const user = await this.userRepository.findById(id);
    logger.info('💼 UseCase: User retrieved successfully', { user });
    return user;
  }

  async getAllUsers(): Promise<any[]> {
    logger.info('💼 UseCase: Getting all users');
    const users = await this.userRepository.findAll();
    logger.info('💼 UseCase: All users retrieved', { count: users.length });
    return users;
  }

  async createUser(userData: any): Promise<any> {
    logger.info('💼 UseCase: Creating new user', { userData });
    // Simulate validation
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required');
    }
    const user = await this.userRepository.create(userData);
    logger.info('💼 UseCase: User created successfully', { user });
    return user;
  }

  async updateUser(id: string, userData: any): Promise<any> {
    logger.info('💼 UseCase: Updating user', { userId: id, userData });
    // First get the existing user
    const existingUser = await this.userRepository.findById(id);
    // Then update
    const updatedUser = await this.userRepository.update(id, userData);
    logger.info('💼 UseCase: User updated successfully', { updatedUser });
    return updatedUser;
  }
}

// Express route handlers (simulated)
class UserController {
  constructor(private userUseCase: UserUseCase) {}

  async getUser(req: { params: { id: string } }): Promise<any> {
    logger.info('🌐 Route: GET /users/:id', { userId: req.params.id });
    try {
      const user = await this.userUseCase.getUserById(req.params.id);
      logger.info('🌐 Route: User retrieved successfully');
      return { status: 200, data: user };
    } catch (error) {
      logger.error('🌐 Route: Error getting user', { error: (error as Error).message });
      return { status: 500, error: (error as Error).message };
    }
  }

  async getUsers(): Promise<any> {
    logger.info('🌐 Route: GET /users');
    try {
      const users = await this.userUseCase.getAllUsers();
      logger.info('🌐 Route: Users retrieved successfully');
      return { status: 200, data: users };
    } catch (error) {
      logger.error('🌐 Route: Error getting users', { error: (error as Error).message });
      return { status: 500, error: (error as Error).message };
    }
  }

  async createUser(req: { body: any }): Promise<any> {
    logger.info('🌐 Route: POST /users', { body: req.body });
    try {
      const user = await this.userUseCase.createUser(req.body);
      logger.info('🌐 Route: User created successfully');
      return { status: 201, data: user };
    } catch (error) {
      logger.error('🌐 Route: Error creating user', { error: (error as Error).message });
      return { status: 400, error: (error as Error).message };
    }
  }

  async updateUser(req: { params: { id: string }, body: any }): Promise<any> {
    logger.info('🌐 Route: PUT /users/:id', { userId: req.params.id, body: req.body });
    try {
      const user = await this.userUseCase.updateUser(req.params.id, req.body);
      logger.info('🌐 Route: User updated successfully');
      return { status: 200, data: user };
    } catch (error) {
      logger.error('🌐 Route: Error updating user', { error: (error as Error).message });
      return { status: 400, error: (error as Error).message };
    }
  }
}

  
  // Wrap the UseCase class with spans - this is where tracing happens
  const WrappedUserUseCase = wrappedClass(
    'UserUseCase',
    UserUseCase,
    (methodName, ...args) => ({
      method: methodName,
      layer: 'usecase',
      argsCount: args.length,
      operation: methodName
    })
  );
  const WrappedUserRepository = wrappedClass(
    'UserRepository',
    UserRepository,
    (methodName,...args) => ({
      method: methodName,
      layer: 'repository',
      argsCount: args.length,
      operation: methodName
    })
  )
  const WrappedUserController = wrappedClass(
    'UserController',
    UserController,
    (methodName,...args) => ({
      method: methodName,
      layer: 'controller',
      argsCount: args.length,
      operation: methodName
    })
  );

  // Setup dependencies
  const userRepository = new WrappedUserRepository();
  
  const userUseCase = new WrappedUserUseCase(userRepository);
  const userController = new WrappedUserController(userUseCase);
export async function expressContextTestWorkflow(): Promise<void> {
  console.log('\n🏗️ Test: Express-like Context Propagation with 3-Layer Architecture');
  
  
  console.log('\n📋 Testing 4 different Express routes with nested spans:');
  
  // Route 1: GET /users/:id
  console.log('\n1️⃣ Route 1: GET /users/123');
  await userController.getUser({ params: { id: '123' } });
  
  // Route 2: GET /users
  console.log('\n2️⃣ Route 2: GET /users');
  await userController.getUsers();
  
  // Route 3: POST /users
  console.log('\n3️⃣ Route 3: POST /users');
  await userController.createUser({ 
    body: { name: 'John Doe', email: 'john@example.com' } 
  });
  
  // Route 4: PUT /users/:id
  console.log('\n4️⃣ Route 4: PUT /users/456');
  await userController.updateUser({ 
    params: { id: '456' }, 
    body: { name: 'Jane Doe Updated', email: 'jane.updated@example.com' } 
  });
  
  console.log('\n✅ Express-like context propagation test completed');
  console.log('\n📊 Expected behavior:');
  console.log('   - Each route should create a separate span at the UseCase level');
  console.log('   - Repository calls should be nested under UseCase spans');
  console.log('   - Multiple repository calls in updateUser should be properly nested');
  console.log('   - Context should be preserved across async operations');
}