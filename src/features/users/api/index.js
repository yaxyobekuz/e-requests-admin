import { usersAPI } from "@/shared/api/http";
import { useAppQuery, useAppMutation, usersKeys } from "@/shared/lib/query";

// ─── Queries ───────────────────────────────────────────────────────────

/**
 * Fetches a paginated/filtered list of users.
 *
 * @param {Record<string, unknown>} [params] - Query/filter parameters (page, search, etc.).
 * @param {object} [options] - Extra useAppQuery options.
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export const useUsers = (params, options = {}) => {
  return useAppQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersAPI.getAll(params),
    ...options,
  });
};

/**
 * Fetches a single user by ID.
 *
 * @param {string | number} id - User ID.
 * @param {object} [options] - Extra useAppQuery options.
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export const useUser = (id, options = {}) => {
  return useAppQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersAPI.getById(id),
    enabled: !!id,
    ...options,
  });
};

// ─── Mutations ─────────────────────────────────────────────────────────

/**
 * Creates a new user. Invalidates user lists on success.
 *
 * @param {object} [options] - Extra useAppMutation options (onSuccess, onError, etc.).
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useCreateUser = (options = {}) => {
  return useAppMutation({
    mutationFn: (data) => usersAPI.create(data),
    invalidateKeys: [usersKeys.lists()],
    ...options,
  });
};

/**
 * Updates an existing user. Invalidates user lists and the specific detail cache.
 *
 * @param {object} [options] - Extra useAppMutation options.
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useUpdateUser = (options = {}) => {
  return useAppMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    invalidateKeys: [usersKeys.lists(), usersKeys.details()],
    ...options,
  });
};

/**
 * Deletes a user by ID. Invalidates user lists on success.
 *
 * @param {object} [options] - Extra useAppMutation options.
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useDeleteUser = (options = {}) => {
  return useAppMutation({
    mutationFn: (id) => usersAPI.delete(id),
    invalidateKeys: [usersKeys.lists()],
    ...options,
  });
};

/**
 * Resets a user's password. No cache invalidation needed.
 *
 * @param {object} [options] - Extra useAppMutation options.
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export const useResetUserPassword = (options = {}) => {
  return useAppMutation({
    mutationFn: ({ id, data }) => usersAPI.resetPassword(id, data),
    ...options,
  });
};
