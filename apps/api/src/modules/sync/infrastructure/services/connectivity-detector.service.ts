import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom, timeout, catchError } from "rxjs";
import { of } from "rxjs";

export interface ConnectivityStatus {
  isOnline: boolean;
  lastCheck: Date;
  latencyMs?: number;
  serverReachable: boolean;
  internetReachable: boolean;
}

/**
 * Connectivity Detector Service
 * Detects network connectivity status for sync operations
 */
@Injectable()
export class ConnectivityDetectorService {
  private readonly logger = new Logger(ConnectivityDetectorService.name);
  private _lastStatus: ConnectivityStatus | null = null;
  private readonly CHECK_TIMEOUT_MS = 5000;
  private readonly CACHE_TTL_MS = 10000; // Cache status for 10 seconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check if we have connectivity to the server
   */
  async checkConnectivity(forceCheck = false): Promise<ConnectivityStatus> {
    // Return cached status if recent enough
    if (
      !forceCheck &&
      this._lastStatus &&
      Date.now() - this._lastStatus.lastCheck.getTime() < this.CACHE_TTL_MS
    ) {
      return this._lastStatus;
    }

    const startTime = Date.now();
    let serverReachable = false;
    let internetReachable = false;
    let latencyMs: number | undefined;

    try {
      // First, check if we can reach our own server's health endpoint
      const serverUrl = this.configService.get<string>(
        "API_URL",
        "http://localhost:4000",
      );
      const healthResponse = await firstValueFrom(
        this.httpService
          .get(`${serverUrl}/api/health`, {
            timeout: this.CHECK_TIMEOUT_MS,
          })
          .pipe(
            timeout(this.CHECK_TIMEOUT_MS),
            catchError(() => of({ data: null, status: 0 })),
          ),
      );

      serverReachable = healthResponse.status === 200;
      latencyMs = Date.now() - startTime;

      // If server is reachable, we assume internet is available
      if (serverReachable) {
        internetReachable = true;
      } else {
        // Try to reach an external endpoint to verify internet connectivity
        const externalResponse = await firstValueFrom(
          this.httpService
            .get("https://dns.google/resolve?name=example.com", {
              timeout: this.CHECK_TIMEOUT_MS,
            })
            .pipe(
              timeout(this.CHECK_TIMEOUT_MS),
              catchError(() => of({ data: null, status: 0 })),
            ),
        );
        internetReachable = externalResponse.status === 200;
      }
    } catch (error) {
      this.logger.debug("Connectivity check failed", error);
      serverReachable = false;
      internetReachable = false;
    }

    const status: ConnectivityStatus = {
      isOnline: serverReachable,
      lastCheck: new Date(),
      latencyMs,
      serverReachable,
      internetReachable,
    };

    this._lastStatus = status;

    if (!status.isOnline) {
      this.logger.warn("Connectivity check: OFFLINE", {
        serverReachable,
        internetReachable,
      });
    } else {
      this.logger.log("Connectivity check: ONLINE ✅", {
        latencyMs,
      });
    }

    return status;
  }

  /**
   * Quick check - returns cached status or performs fast check
   */
  isOnline(): boolean {
    if (
      this._lastStatus &&
      Date.now() - this._lastStatus.lastCheck.getTime() < this.CACHE_TTL_MS
    ) {
      return this._lastStatus.isOnline;
    }
    // Don't wait for check, just return last known status or assume offline
    this.checkConnectivity().catch(() => {}); // Fire and forget
    return this._lastStatus?.isOnline ?? false;
  }

  /**
   * Get last known status
   */
  getLastStatus(): ConnectivityStatus | null {
    return this._lastStatus;
  }

  /**
   * Clear cached status
   */
  clearCache(): void {
    this._lastStatus = null;
  }
}
