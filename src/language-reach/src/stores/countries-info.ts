import { writable } from 'svelte/store';
import axios from 'axios';
import type { Country } from '../data/shapes';

const createCountriesInfoStore = () => {
  const { subscribe, update } = writable<{ countries: Country[], languages: string[] }>({ countries: [], languages: [] });

  const fetch = async () => {
    try {
      const mutation = `
        mutation allCountriesDetails {
          details: CountryInfoService_CountryInfoService_CountryInfoServiceSoap12_FullCountryInfoAllCountries(FullCountryInfoAllCountries: {

          }) {
            result: FullCountryInfoAllCountriesResult {
              countries: tCountryInfo {
                name: sName
                countryFlagUrl: sCountryFlag
                languageDetails: Languages {
                  languages: tLanguage {
                    name: sName
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post('/graphql', { query: mutation });

      const allLanguages: string[] = response.data.data.details.result.countries.reduce((accumulator: string[], currentCountry: Country) => [
        ...accumulator,
        ...(currentCountry.languageDetails.languages || []).map(l => l?.name).filter(p => p !== undefined)
      ], [])

      const distinctLanguages = [...new Set(allLanguages)];

      if (response.data.data && response.data.data.details) {
        update(_ => ({
          countries: response.data.data.details.result.countries,
          languages: distinctLanguages
        }));
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  return {
    subscribe,
    fetch
  };
};

// Create and export the store
export const countriesInfo = createCountriesInfoStore();
