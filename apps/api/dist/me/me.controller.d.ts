export declare class MeController {
    getMe(): {
        id: string;
        name: string;
        email: string;
    };
    getFeatures(): {
        lims: boolean;
        billing: boolean;
        documents: boolean;
    };
}
