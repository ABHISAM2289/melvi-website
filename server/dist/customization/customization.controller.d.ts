import { CustomizationService } from './customization.service';
export declare class CustomizationController {
    private readonly customizationService;
    constructor(customizationService: CustomizationService);
    getOptions(): {
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
        flavors: any[];
    };
}
