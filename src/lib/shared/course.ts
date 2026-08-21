export const COURSES = ['appetizer', 'main', 'dessert'] as const;
export type RecipeCourse = (typeof COURSES)[number];

export const COURSE_LABELS: Record<RecipeCourse, string> = {
	appetizer: 'Appetizer',
	main: 'Main Course',
	dessert: 'Dessert'
};
