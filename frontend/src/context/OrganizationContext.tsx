import React, { createContext, useContext, useState, useEffect } from 'react';

interface Organization {
    id: string;
    name: string;
    slug: string;
}

interface OrganizationContextType {
    organization: Organization | null;
    setOrganization: (org: Organization) => void;
    isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [organization, setOrganizationState] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedOrg = localStorage.getItem('currentOrganization');
        if (savedOrg) {
            try {
                setOrganizationState(JSON.parse(savedOrg));
            } catch (e) {
                console.error("Failed to parse organization from storage", e);
            }
        } else {
            const defaultOrg = { id: '1', name: 'Demo Corp', slug: 'demo-corp' };
            setOrganizationState(defaultOrg);
            localStorage.setItem('currentOrganization', JSON.stringify(defaultOrg));
            localStorage.setItem('organizationSlug', defaultOrg.slug);
        }
        setIsLoading(false);
    }, []);

    const setOrganization = (org: Organization) => {
        setOrganizationState(org);
        localStorage.setItem('currentOrganization', JSON.stringify(org));
        localStorage.setItem('organizationSlug', org.slug);
    };

    return (
        <OrganizationContext.Provider value={{ organization, setOrganization, isLoading }}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};
