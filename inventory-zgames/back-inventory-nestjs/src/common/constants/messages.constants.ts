export const Messages = {
  // General messages
  GENERAL: {
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
  },

  // Authentication messages
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid credentials',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_CHANGED: 'Password changed successfully',
    ACCOUNT_LOCKED: 'Account is locked',
    INVALID_TOKEN: 'Invalid or expired token',
    SESSION_EXPIRED: 'Session has expired',
    USER_INACTIVE: 'User account is inactive',
  },

  // User messages
  USER: {
    STATUS_TOGGLED: 'User status toggled successfully',
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already exists',
    USERNAME_EXISTS: 'Username already exists',
    RETRIEVED: 'User retrieved successfully',
    LIST_RETRIEVED: 'Users retrieved successfully',
    PERMISSIONS_RETRIEVED: 'User permissions retrieved successfully',
    MODULES_PERMISSIONS_RETRIEVED:
      'User modules and permissions retrieved successfully',
    ROLE_PERMISSIONS_RETRIEVED:
      'User role and permissions retrieved successfully',
  },

  // Role messages
  ROLE: {
    CREATED: 'Role created successfully',
    UPDATED: 'Role updated successfully',
    DELETED: 'Role deleted successfully',
    STATUS_UPDATED: 'Role status updated successfully',
    NOT_FOUND: 'Role not found',
    NAME_EXISTS: 'Role name already exists',
    RETRIEVED: 'Role retrieved successfully',
    LIST_RETRIEVED: 'Roles retrieved successfully',
  },

  // Module messages
  MODULE: {
    CREATED: 'Module created successfully',
    UPDATED: 'Module updated successfully',
    DELETED: 'Module deleted successfully',
    STATUS_UPDATED: 'Module status updated successfully',
    NOT_FOUND: 'Module not found',
    NAME_EXISTS: 'Module name already exists',
    RETRIEVED: 'Module retrieved successfully',
    LIST_RETRIEVED: 'Modules retrieved successfully',
  },

  // Permission messages
  PERMISSION: {
    CREATED: 'Permission created successfully',
    UPDATED: 'Permission updated successfully',
    DELETED: 'Permission deleted successfully',
    STATUS_UPDATED: 'Permission status updated successfully',
    NOT_FOUND: 'Permission not found',
    NAME_EXISTS: 'Permission name already exists',
    RETRIEVED: 'Permission retrieved successfully',
    LIST_RETRIEVED: 'Permissions retrieved successfully',
  },

  // Product messages
  PRODUCT: {
    CREATED: 'Product created successfully',
    UPDATED: 'Product updated successfully',
    DELETED: 'Product deleted successfully',
    STATUS_UPDATED: 'Product status updated successfully',
    NOT_FOUND: 'Product not found',
    NAME_EXISTS: 'Product name already exists',
    RETRIEVED: 'Product retrieved successfully',
    LIST_RETRIEVED: 'Products retrieved successfully',
    LOW_STOCK_RETRIEVED: 'Low stock products retrieved successfully',
    STOCK_MOVEMENT_CREATED: 'Stock movement created successfully',
  },

  // Inventory Movement messages
  INVENTORY_MOVEMENT: {
    CREATED: 'Movement created successfully',
    UPDATED: 'Movement updated successfully',
    DELETED: 'Movement deleted successfully',
    NOT_FOUND: 'Movement not found',
    RETRIEVED: 'Movement retrieved successfully',
    LIST_RETRIEVED: 'Movements retrieved successfully',
    PRODUCT_MOVEMENTS_RETRIEVED: 'Product movements retrieved successfully',
    STATS_RETRIEVED: 'Movement statistics retrieved successfully',
  },

  // Company messages
  COMPANY: {
    CREATED: 'Company created successfully',
    UPDATED: 'Company updated successfully',
    DELETED: 'Company deleted successfully',
    STATUS_UPDATED: 'Company status updated successfully',
    NOT_FOUND: 'Company not found',
    NAME_EXISTS: 'Company name already exists',
    RETRIEVED: 'Company retrieved successfully',
    LIST_RETRIEVED: 'Companies retrieved successfully',
  },

  // Category messages
  CATEGORY: {
    CREATED: 'Category created successfully',
    UPDATED: 'Category updated successfully',
    DELETED: 'Category deleted successfully',
    STATUS_UPDATED: 'Category status updated successfully',
    NOT_FOUND: 'Category not found',
    NAME_EXISTS: 'Category name already exists',
    RETRIEVED: 'Category retrieved successfully',
    LIST_RETRIEVED: 'Categories retrieved successfully',
  },

  ROLE_PERMISSION: {
    CREATED: 'permission created successfully',
    ASSIGNED: 'Permission assigned to role successfully',
    REMOVED: 'Permission removed from role successfully',
    ALREADY_ASSIGNED: 'Permission already assigned to this role',
    NOT_ASSIGNED: 'Permission not assigned to this role',
    TOGGLED: 'Permission status toggled for role successfully',
    RETRIEVED: 'Role permission retrieved successfully',
    UPDATED: 'Role permission updated successfully',
    LIST_RETRIEVED: 'Role permissions list retrieved successfully',
    DELETED: 'Role permission deleted successfully',
  },
  ROLE_MODULE: {
    ASSIGNED: 'Module assigned to role successfully',
    REMOVED: 'Module removed from role successfully',
    ALREADY_ASSIGNED: 'Module already assigned to this role',
    NOT_ASSIGNED: 'Module not assigned to this role',
    TOGGLED: 'Module status toggled for role successfully',
  },
};
