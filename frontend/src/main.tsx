import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { client } from './apollo'
import { OrganizationProvider } from './context/OrganizationContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <OrganizationProvider>
        <App />
      </OrganizationProvider>
    </ApolloProvider>
  </StrictMode>,
)
