// Store passwords as plain text (for testing only)

// Hash a password - returns password as-is for testing
export async function hashPassword(password: string): Promise<string> {
  return password;
}

// Compare password with stored password
export async function comparePassword(password: string, storedPassword: string): Promise<boolean> {
  return password === storedPassword;
}

// Generate a random password
export function generateRandomPassword(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
