import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Root from './Root';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Root />
  </QueryClientProvider>
);
