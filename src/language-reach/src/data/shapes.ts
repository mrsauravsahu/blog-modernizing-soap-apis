export interface Country {
    name: string;
    countryFlagUrl: string;
    languageDetails: {
        languages: {
            name: string;
        }[];
    };
}
