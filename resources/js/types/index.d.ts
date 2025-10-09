export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface User {
    id: number;
    name: string;
    email: string;
    type: string;
};

export interface Category {
    id: number;
    name: string;
    description: string;
    created_at: string;
};

export interface Brand {
    id: number;
    name: string;
    description: string;
    slug: string;
    logo_url?: string;
    logo?: File | null;
    website_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
