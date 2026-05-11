import { useEffect, useState } from "react";

import { getBackendHealth } from "@shared/api/system";
import type { BackendHealth } from "@shared/types/backend";

interface BackendHealthState {
  readonly data: BackendHealth | null;
  readonly error: string | null;
  readonly isLoading: boolean;
}

export function useBackendHealth(): BackendHealthState {
  const [state, setState] = useState<BackendHealthState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    getBackendHealth()
      .then((data) => {
        if (isActive) {
          setState({ data, error: null, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "No se pudo contactar con Rust.",
            isLoading: false,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
