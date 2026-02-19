import type { ReactNode } from 'react';

type FeatureGateProps = {
  featureKey: string;
  enabled?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Stub gate for backend-authoritative feature flags.
 * TODO: replace `enabled` fallback with /me/features resolution.
 */
export function FeatureGate({ featureKey, enabled = true, fallback = null, children }: FeatureGateProps) {
  void featureKey;
  if (!enabled) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
