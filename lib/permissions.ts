// Define what each role can access
const permissions: Record<string, string[]> = {
  VIEWER: ["/", "/dashboard", "/analytics"],
  ANALYST: ["/", "/dashboard", "/analytics", "/predict"],
  ADMIN: ["/", "/dashboard", "/analytics", "/predict", "/admin"],
}

/**
 * Check if a user role can access a route
 * @param role User role
 * @param route Route path to check
 * @returns true if user can access the route
 */
export function can(role: string | null, route: string): boolean {
  if (!role) return false
  return permissions[role]?.some((allowedRoute) => route.startsWith(allowedRoute)) ?? false
}

/**
 * Get all allowed routes for a role
 * @param role User role
 * @returns Array of allowed routes
 */
export function getAllowedRoutes(role: string): string[] {
  return permissions[role] || []
}
