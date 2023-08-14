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
    // Example string normalization function. Replace as needed.
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

<h1>language reach</h1>

<p>where can a language be useful?</p>

<div class="flex flex-col gap-1">
  <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->

  <div class="relative">
    <input
      use:melt={$input}
      class="flex h-10 items-center justify-between rounded-md bg-white
            px-3 pr-12 text-magnum-700"
      placeholder="English"
    />
  </div>
</div>
{#if $open}
  <ul
    class="z-10 flex max-h-[300px] flex-col overflow-hidden rounded-md"
    use:melt={$menu}
    transition:fly={{ duration: 150, y: -5 }}
  >
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      class="flex max-h-full flex-col gap-2 overflow-y-auto bg-white px-2 py-2"
      tabindex="0"
    >
      {#each $filteredItems as language, index (index)}
        <li
          use:melt={$item({
            index,
            item: language,
          })}
          class="relative cursor-pointer rounded-md py-1 pl-8 pr-4 text-neutral-800
                          data-[highlighted]:bg-magnum-100 data-[highlighted]:text-magnum-700
                          data-[disabled]:opacity-50"
        >
          <div>
            <span class="block text-sm opacity-70">{language}</span>
          </div>
        </li>
      {/each}
    </div>
  </ul>
{/if}

<ul>
  {#each validCountries as country (country.name)}
    <li>
      <p>{country.name}</p>
      <img src={country.countryFlagUrl} alt={`Flag of ${country.name}`} />
      <h3>Languages:</h3>
      <ul>
        {#each country.languageDetails.languages as language (language.name)}
          <li>{language.name}</li>
        {/each}
      </ul>
    </li>
  {/each}
</ul>

<style lang="postcss">
  .check {
    @apply absolute left-2 top-1/2 text-magnum-500;
    translate: 0 calc(-50% + 1px);
  }
</style>
