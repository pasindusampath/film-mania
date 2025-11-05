/**
 * Health check response interfaces
 */
export interface IHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database?: {
    connected: boolean;
    type?: string;
  };
}

export interface IReadyResponse {
  status: string;
  timestamp: string;
}

