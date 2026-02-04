/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by tracking errors and temporarily disabling
 * operations that are failing repeatedly.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests are rejected immediately
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms to wait before trying again (half-open state) */
  resetTimeout: number;
  /** Number of successful calls in half-open state to close circuit */
  successThreshold: number;
  /** Optional name for logging */
  name?: string;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 2,
};

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private readonly options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    this.maybeTransitionToHalfOpen();
    return this.state;
  }

  /**
   * Get circuit statistics
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number | null;
  } {
    return {
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.maybeTransitionToHalfOpen();

    if (this.state === "OPEN") {
      throw new CircuitOpenError(
        this.options.name
          ? `Circuit breaker '${this.options.name}' is open`
          : "Circuit breaker is open"
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Record a successful call
   */
  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.reset();
        this.log("Circuit closed after successful recovery");
      }
    }
    // In CLOSED state, we don't track successes
  }

  /**
   * Record a failed call
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      // Single failure in half-open state opens the circuit again
      this.state = "OPEN";
      this.successCount = 0;
      this.log("Circuit opened again after failure in half-open state");
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      this.log(`Circuit opened after ${this.failureCount} failures`);
    }
  }

  /**
   * Check if we should transition from OPEN to HALF_OPEN
   */
  private maybeTransitionToHalfOpen(): void {
    if (this.state === "OPEN" && this.lastFailureTime) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure >= this.options.resetTimeout) {
        this.state = "HALF_OPEN";
        this.successCount = 0;
        this.log("Circuit half-open, testing recovery");
      }
    }
  }

  /**
   * Reset circuit to closed state
   */
  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  /**
   * Force circuit open (for manual intervention)
   */
  forceOpen(): void {
    this.state = "OPEN";
    this.lastFailureTime = Date.now();
    this.log("Circuit manually opened");
  }

  private log(message: string): void {
    const prefix = this.options.name ? `[CircuitBreaker:${this.options.name}]` : "[CircuitBreaker]";
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitOpenError";
  }
}

/**
 * Create a circuit breaker for a specific service
 */
export function createCircuitBreaker(
  name: string,
  options?: Partial<CircuitBreakerOptions>
): CircuitBreaker {
  return new CircuitBreaker({ name, ...options });
}
