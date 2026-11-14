export declare class CustomizationService {
    getCustomizationOptions(): {
        boxSizes: {
            id: string;
            name: string;
            slots: number;
            price: number;
            badge: string;
            image: string;
            description: string;
        }[];
        sleeves: {
            id: string;
            name: string;
            subtitle: string;
            color: string;
        }[];
        ribbons: {
            id: string;
            name: string;
            hex: string;
        }[];
        flavors: {
            id: string;
            name: string;
            category: string;
            cocoa: string;
            image: string;
            accent: string;
            color: string;
        }[];
    };
}
