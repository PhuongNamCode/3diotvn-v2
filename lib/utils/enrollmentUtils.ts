/**
 * Utility functions for enrollment display
 */

/**
 * Calculate fake enrollment count for display
 * Logic: enrolledCount + 50 + (days since course creation * 3)
 * This creates a natural growth pattern that increases by 3 students per day
 * Stops growing when total (real + fake) reaches 6000
 */
export function calculateFakeEnrollmentCount(enrolledCount: number, createdAt: string | Date): number {
  const baseFakeCount = 50; // Base fake count
  const growthPerDay = 3; // Increase by 3 students per day
  const maxTotalEnrollment = 6000; // Stop fake growth when total reaches 6000
  
  try {
    const courseCreatedAt = new Date(createdAt);
    const now = new Date();
    
    // Calculate days since course creation
    const timeDiff = now.getTime() - courseCreatedAt.getTime();
    const daysSinceCreation = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Calculate fake enrollment count
    const fakeCount = enrolledCount + baseFakeCount + (daysSinceCreation * growthPerDay);
    
    // Ensure minimum display of enrolledCount + 50
    const minDisplay = enrolledCount + baseFakeCount;
    const calculatedDisplay = Math.max(minDisplay, fakeCount);
    
    // Stop fake growth if total enrollment exceeds 6000
    if (calculatedDisplay > maxTotalEnrollment) {
      return maxTotalEnrollment;
    }
    
    return calculatedDisplay;
  } catch (error) {
    console.error('Error calculating fake enrollment count:', error);
    // Fallback to simple calculation
    return enrolledCount + baseFakeCount;
  }
}

