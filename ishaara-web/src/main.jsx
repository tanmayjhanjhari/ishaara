import './styles/tokens.css'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import App from './App.jsx'

// Restore auth state from localStorage before React renders
useAuthStore.getState().initialize()


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          5 * 60 * 1000,
      gcTime:             10 * 60 * 1000,
      retry:              1,
      refetchOnWindowFocus: false,
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
