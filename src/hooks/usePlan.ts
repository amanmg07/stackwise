import { useState, useEffect, useCallback } from "react";
import { PlanId } from "../types";
import {
  getCurrentPlan,
  checkFeature,
  trackUsage,
  canCreateCycle,
  PLAN_CONFIG,
  FeatureGate,
  GateResult,
} from "../services/planService";

export function usePlan() {
  const [plan, setPlanState] = useState<PlanId>("basic");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentPlan().then((p) => {
      setPlanState(p);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const p = await getCurrentPlan();
    setPlanState(p);
  }, []);

  const check = useCallback(async (feature: FeatureGate): Promise<GateResult> => {
    return checkFeature(feature);
  }, []);

  const track = useCallback(async (feature: FeatureGate) => {
    await trackUsage(feature);
  }, []);

  const checkCycle = useCallback(async (activeCycleCount: number): Promise<GateResult> => {
    return canCreateCycle(activeCycleCount);
  }, []);

  const config = PLAN_CONFIG[plan];

  return {
    plan,
    planName: config.name,
    planPrice: config.price,
    limits: config.limits,
    loading,
    refresh,
    check,
    track,
    checkCycle,
  };
}
