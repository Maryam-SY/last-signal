/** DOM ids shared between pages and components (deep links, focus return). */
export const anchors = {
  machineCard: (machineId: string) => `machine-card-${machineId}`,
  mission: (missionId: string) => `mission-${missionId}`,
} as const
