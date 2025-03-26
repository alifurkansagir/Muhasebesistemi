import { IStorage } from "./interface";
import { PaymentMemStorage } from "./memory/payments";

// This is our final storage implementation that inherits from all the specific implementations
class MemStorage extends PaymentMemStorage implements IStorage {}

// Create and export a singleton instance
export const storage = new MemStorage();

// Re-export the interface for use elsewhere
export { IStorage } from "./interface";