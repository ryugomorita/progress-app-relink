// src/hooks/useTaskMutate.ts
import { useSWRConfig } from "swr";

export const useTaskMutate = () => {
    const { mutate } = useSWRConfig();
    return () => mutate("/api/tasks/hierarchy", undefined, { revalidate: true });
};