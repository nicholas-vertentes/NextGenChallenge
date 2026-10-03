"use client";

import { useEffect, useState } from "react";
import type { PortfolioResponse } from "@/lib/types";

const API_BASE_URL = "http://localhost:4000";

export type UsePortfolioState =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: PortfolioResponse; error: null }
  | { status: "error"; data: null; error: string };

export function usePortfolio(
  accountId: string,
  scenario?: string,
): UsePortfolioState {
  const [state, setState] = useState<UsePortfolioState>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const url = `${API_BASE_URL}/portfolios/${accountId}${
      scenario ? `?scenario=${encodeURIComponent(scenario)}` : ""
    }`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json() as Promise<PortfolioResponse>;
      })
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          data: null,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      });

    return () => controller.abort();
  }, [accountId, scenario]);

  return state;
}
