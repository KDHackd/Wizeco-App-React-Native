import { PermissionResult } from "@/services/PermissionService";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface PermissionContextType {
  permissionResult: PermissionResult | null;
  setPermissionResult: (result: PermissionResult) => void;
  hasLocationPermission: boolean;
  hasNotificationPermission: boolean;
  expoToken: string | null;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
  initialResult: PermissionResult | null;
}

export function PermissionProvider({
  children,
  initialResult,
}: PermissionProviderProps) {
  const [permissionResult, setPermissionResult] =
    useState<PermissionResult | null>(initialResult);

  const hasLocationPermission = permissionResult?.location ?? false;
  const hasNotificationPermission = permissionResult?.notifications ?? false;
  const expoToken = permissionResult?.expoToken ?? null;

  const value: PermissionContextType = {
    permissionResult,
    setPermissionResult,
    hasLocationPermission,
    hasNotificationPermission,
    expoToken,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
