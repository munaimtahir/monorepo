/**
 * Query key factories for operator / LIMS data. Use with TanStack Query.
 */

export const operatorKeys = {
  all: ['operator'] as const,
  patients: () => [...operatorKeys.all, 'patients'] as const,
  patientList: (query?: string) => [...operatorKeys.patients(), 'list', query] as const,
  patient: (id: string) => [...operatorKeys.patients(), id] as const,
  encounters: () => [...operatorKeys.all, 'encounters'] as const,
  encounterList: (params?: { page?: number; type?: string; status?: string }) =>
    [...operatorKeys.encounters(), 'list', params] as const,
  encounter: (id: string) => [...operatorKeys.encounters(), id] as const,
  verificationQueue: () => [...operatorKeys.all, 'lab', 'verification-queue'] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  me: () => [...adminKeys.all, 'me'] as const,
  overview: () => [...adminKeys.all, 'overview'] as const,
  features: () => [...adminKeys.all, 'features'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  user: (userId: string) => [...adminKeys.users(), userId] as const,
  catalog: () => [...adminKeys.all, 'catalog'] as const,
  tests: () => [...adminKeys.catalog(), 'tests'] as const,
  test: (testId: string) => [...adminKeys.tests(), testId] as const,
  testParameters: (testId: string) => [...adminKeys.catalog(), 'test-parameters', testId] as const,
};
