/**
 * ClimatOSCOPE — Base Data Provider
 */

import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { DataProvider, FetchOptions } from '../../types/api';

export abstract class BaseDataProvider implements DataProvider {
  abstract id: string;
  abstract name: string;

  abstract getMetadata(): DatasetMetadata;
  abstract fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]>;

  protected logFetchAttempt(url: string) {
    // Scientific log abstraction without exposing telemetry
  }
}
