<script lang="ts">
  import {
    createCombobox,
    melt,
    type ComboboxFilterFunction,
  } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { countriesInfo } from "../stores/countries-info";
  import type { Country } from "../data/shapes";

  let validCountries: Country[] = [];

  onMount(async () => {
    await countriesInfo.fetch();
    updateItems(() => $countriesInfo.languages)
  });

  const filterFunction: ComboboxFilterFunction<string> = (item, inputValue) => {
    const normalize = (str: string) => str.normalize().toLowerCase();
    const normalizedInput = normalize(inputValue);
    return (
      normalizedInput === "" ||
      normalize(item.toLowerCase()).includes(normalizedInput)
    );
  };

  const {
    elements: { menu, input, item },
    states: { open, filteredItems},
    helpers: {updateItems}
  } = createCombobox({
    filterFunction,
    items: $countriesInfo.languages,
    itemToString: (item) => item,
    forceVisible: true,
    onValueChange: ({ next: selectedLanguage }) => {
      const selectedLanguageLowered = selectedLanguage?.toLocaleLowerCase();

      validCountries = $countriesInfo.countries.filter((c) =>
        c.languageDetails.languages.some(
          (l) => l?.name?.toLowerCase() === selectedLanguageLowered
        )
      );

      return undefined;
    },
  });
</script>

<main class="p-8 grid gap-4">
  <h1 class="text-4xl text-center">Language Reach</h1>

  <p class="text-xl text-center p-4">Where can a language be useful?</p>

  <div class="flex flex-col gap-1 items-center"> <!-- Center the search field -->
    <div class="relative">
      <input
        use:melt={$input}
        class="flex h-10 items-center justify-between rounded-md bg-white
          px-3 pr-12"
        placeholder="English"
      />
    </div>
  </div>

  {#if $open}
    <ul
      class="z-10 max-h-[300px] overflow-y-auto bg-white rounded-md shadow-lg"
      use:melt={$menu}
      transition:fly={{ duration: 150, y: -5 }}
    >
      <div class="flex flex-col gap-2 p-2">
        {#each $filteredItems as language, index (index)}
          <li
            use:melt={$item({
              index,
              item: language,
            })}
            class="relative cursor-pointer rounded-md py-1 pl-8 pr-4 text-neutral-800
              data-[highlighted]:bg-magnum-100
              data-[disabled]:opacity-50"
          >
            <span class="block text-sm opacity-70">{language}</span>
          </li>
        {/each}
      </div>
    </ul>
  {/if}

  <ul class="grid grid-cols-1 md:grid-cols-3 gap-4"> <!-- Display three tiles in one line on larger screens -->
    {#each validCountries as country (country.name)}
      <li class="border rounded-lg overflow-hidden">
        <figure class="md:flex p-2 md:p-4 space-x-4">
          <div class="flex-grow">
            <p class="text-lg font-semibold">{country.name}</p>
            <p class="text-sm text-gray-600">
              {country.languageDetails.languages.map(l => l.name).join(", ")}
            </p>
          </div>
          <img
            class="w-48 h-30 rounded-xl"
            src={country.countryFlagUrl}
            alt={`Flag of ${country.name}`}
          />
        </figure>
      </li>
    {/each}
  </ul>
</main>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
