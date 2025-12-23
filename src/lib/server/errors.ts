export class AppError extends Error {
	constructor(
		public code: App.Error['code'],
		message: string,
		public statusCode: number = 500,
		public details?: unknown
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * Thrown when a requested entity is not found in the database.
 */
export class NotFoundError extends AppError {
	constructor(entity: string, id: number | string) {
		super('NOT_FOUND', `${entity} with id ${id} not found`, 404);
	}
}

/**
 * Thrown when input validation fails or business rules are violated.
 */
export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super('VALIDATION_ERROR', message, 400, details);
	}
}

/**
 * Thrown when a user lacks permission to perform an action.
 */
export class PermissionError extends AppError {
	constructor(message = 'Insufficient permissions') {
		super('PERMISSION_DENIED', message, 403);
	}
}

/**
 * Thrown when required configuration is missing or invalid.
 */
export class ConfigurationError extends AppError {
	constructor(message: string) {
		super('CONFIGURATION_ERROR', message, 500);
	}
}
