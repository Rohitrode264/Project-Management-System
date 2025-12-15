import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
    uri: 'http://localhost:8000/graphql/',
});

const authLink = setContext((_, { headers }) => {
    const orgSlug = localStorage.getItem('organizationSlug');

    return {
        headers: {
            ...headers,
            ...(orgSlug ? { 'X-Organization-Slug': orgSlug } : {}),
        }
    }
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    projects: {
                        merge(_existing, incoming) {
                            return incoming;
                        },
                    },
                    tasks: {
                        merge(_existing, incoming) {
                            return incoming;
                        }
                    }
                },
            },
        },
    }),
});
