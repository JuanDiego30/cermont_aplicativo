export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    color: 'primary' | 'secondary' | 'success' | 'warning';
}
