import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
    const queryClient = useQueryClient();
    const { data: session, isLoading } = useQuery({
        queryKey: ['session'],
        queryFn: () => API.get('/auth/session').then(res => res.data),
        retry: false,
    });


    const refetchSession = () => queryClient.invalidateQueries(['session']);

    return (
        <SessionContext.Provider value={{ session, isLoading, refetchSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export const useSession = () => useContext(SessionContext);
