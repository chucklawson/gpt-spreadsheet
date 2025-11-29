import { useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

/**
 * Custom hook to create and memoize an Amplify Data client
 * Ensures a single client instance is used per component lifecycle
 */
export function useAmplifyClient() {
  return useMemo(() => generateClient<Schema>(), []);
}
