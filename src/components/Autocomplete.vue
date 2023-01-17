<script lang="tsx">
import { Fragment, defineComponent, ref, computed, watch } from "vue";

import { pipe } from "ramda";

import { createFillWith, uniqBy } from "../functions";
import { articlesPlugin } from "../plugins/articlesPlugin";
import { brandsPlugin } from "../plugins/brandsPlugin";
import { categoriesPlugin } from "../plugins/categoriesPlugin.vue";
import { faqPlugin } from "../plugins/faqPlugin.vue";
import { popularCategoriesPlugin } from "../plugins/popularCategoriesPlugin";
import { popularPlugin } from "../plugins/popularPlugin";
import { productsPlugin } from "../components/ProductItem.vue";
import { querySuggestionsPlugin } from "../plugins/querySuggestionsPlugin";
import { quickAccessPlugin } from "../plugins/quickAccessPlugin";
import { recentSearchesPlugin } from "../plugins/recentSearchesPlugin";
import { cx, hasSourceActiveItem, isDetached } from "../utils";

import "@algolia/autocomplete-theme-classic";
import { createAutocomplete } from "@algolia/autocomplete-core";
import { SearchIcon, ClearIcon } from "./Icons";

const removeDuplicates = uniqBy(({ source, item }) => {
  const sourceIds = ["recentSearchesPlugin", "querySuggestionsPlugin"];
  if (sourceIds.indexOf(source.sourceId) === -1) {
    return item;
  }

  return source.sourceId === "querySuggestionsPlugin" ? item.query : item.label;
});

const fillWith = createFillWith({
  mainSourceId: "querySuggestionsPlugin",
  limit: isDetached() ? 6 : 10,
});

const combine = pipe(removeDuplicates, fillWith);

export const Autocomplete = defineComponent({
  props: ["brand", "categories", "images", "name", "objectID", "url"],
  setup(props) {
    const { brand, categories, images, name, objectID, url } = props;
    const autoCompleteState = ref({
      collections: [],
      completion: null,
      context: {},
      isOpen: false,
      query: "",
      activeItemId: null,
      status: "idle",
    });
    const autocomplete = computed(() =>
      createAutocomplete({
        onStateChange({ state }) {
          autoCompleteState.value = state;
        },
        autoFocus: true,
        openOnFocus: true,
        plugins: [
          recentSearchesPlugin,
          querySuggestionsPlugin,
          categoriesPlugin,
          brandsPlugin,
          faqPlugin,
          productsPlugin,
          articlesPlugin,
          popularPlugin,
          quickAccessPlugin,
          popularCategoriesPlugin,
        ],
        reshape({ sourcesBySourceId, sources, state }) {
          const {
            recentSearchesPlugin: recentSearches,
            querySuggestionsPlugin: querySuggestions,
            categoriesPlugin: categories,
            brandsPlugin: brands,
            faqPlugin: faq,
            popularPlugin: popular,
            popularCategoriesPlugin: popularCategories,
            ...rest
          } = sourcesBySourceId;

          const sourceIdsToExclude = [
            "popularPlugin",
            "popularCategoriesPlugin",
          ];
          const shouldDisplayPopularCategories = sources.every((source) => {
            if (sourceIdsToExclude.indexOf(source.sourceId) !== -1) {
              return true;
            }
            return source.getItems().length === 0;
          });

          return [
            combine(recentSearches, querySuggestions, categories, brands, faq),
            [
              !state.query && popular,
              ...Object.values(rest),
              shouldDisplayPopularCategories && popularCategories,
            ].filter(Boolean),
          ];
        },
        ...props,
      })
    );

    const inputRef = ref(null);
    const formRef = ref(null);
    const panelRef = ref(null);
    // const { getEnvironmentProps } = autocomplete;

    const sourceIdsToExclude = ["popularPlugin", "popularCategoriesPlugin"];
    const hasResults =
      autoCompleteState.value.collections
        .filter(
          ({ source }) => sourceIdsToExclude.indexOf(source.sourceId) === -1
        )
        .reduce((prev, curr) => prev + curr.items.length, 0) > 0;

    watch([getEnvironmentProps, autoCompleteState.value.isOpen], () => {
      if (!formRef || !panelRef || !inputRef) {
        return undefined;
      }
      const { onTouchStart, onTouchMove, onMouseDown } = getEnvironmentProps({
        formElement: formRef,
        panelElement: panelRef,
        inputElement: inputRef,
      });

      window.addEventListener("touchstart", onTouchStart);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("mousedown", onMouseDown);

      return () => {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("mousedown", onMouseDown);
      };
    });

    return (
      <div className="aa-Autocomplete" {...autocomplete.getRootProps({})}>
        <form
          ref={formRef}
          className="aa-Form"
          {...autocomplete.getFormProps({ inputElement: inputRef.current })}
        >
          <div className="aa-InputWrapperPrefix">
            <label className="aa-Label" {...autocomplete.getLabelProps({})}>
              <button className="aa-SubmitButton" type="submit" title="Submit">
                <SearchIcon />
              </button>
            </label>
          </div>
          <div className="aa-InputWrapper">
            <input
              className="aa-Input"
              ref={inputRef}
              {...autocomplete.getInputProps({
                inputElement: inputRef.current,
              })}
            />
          </div>
          <div className="aa-InputWrapperSuffix">
            <button className="aa-ClearButton" title="Clear" type="reset">
              <ClearIcon />
            </button>
          </div>
        </form>

        {autoCompleteState.value.isOpen && (
          <div
            ref={panelRef}
            className={[
              "aa-Panel",
              "aa-Panel--desktop",
              autoCompleteState.value.status === "stalled" &&
                "aa-Panel--stalled",
            ]
              .filter(Boolean)
              .join(" ")}
            {...autocomplete.getPanelProps({})}
          >
            <div className="aa-PanelLayout aa-Panel--scrollable">
              {!hasResults && (
                <div className="aa-NoResultsQuery">
                  No results for "{autoCompleteState.value.query}".
                </div>
              )}

              <div className="aa-PanelSections">
                <div className="aa-PanelSection--left">
                  {hasResults ? (
                    (!autoCompleteState.value.query && recentSearchesPlugin && (
                      <Fragment>
                        <div className="aa-SourceHeader">
                          <span className="aa-SourceHeaderTitle">
                            Recent searches
                          </span>
                          <div className="aa-SourceHeaderLine" />
                        </div>
                        {recentSearchesPlugin}
                      </Fragment>
                    )) ||
                    (autoCompleteState.value.query && (
                      <Fragment>
                        <div className="aa-SourceHeader">
                          <span className="aa-SourceHeaderTitle">
                            Suggestions
                          </span>
                          <div className="aa-SourceHeaderLine" />
                        </div>

                        <div className="aa-PanelSectionSources">
                          {recentSearchesPlugin}
                          {querySuggestionsPlugin}
                          {categoriesPlugin}
                          {brandsPlugin}
                          {faqPlugin}
                        </div>
                      </Fragment>
                    ))
                  ) : (
                    <div className="aa-NoResultsAdvices">
                      <ul className="aa-NoResultsAdvicesList">
                        <li>Double-check your spelling</li>
                        <li>Use fewer keywords</li>
                        <li>Search for a less specific item</li>
                        <li>
                          Try navigate using on the of the popular categories
                        </li>
                      </ul>
                    </div>
                  )}

                  {!autoCompleteState.value.query && (
                    <div className="aa-PanelSection--popular">
                      {popularPlugin}
                    </div>
                  )}
                </div>
                <div className="aa-PanelSection--right">
                  {productsPlugin && (
                    <div className="aa-PanelSection--products">
                      <div className="aa-PanelSectionSource">
                        {productsPlugin}
                      </div>
                    </div>
                  )}
                  {articlesPlugin && (
                    <div className="aa-PanelSection--articles">
                      <div className="aa-PanelSectionSource">
                        {articlesPlugin}
                      </div>
                    </div>
                  )}

                  {quickAccessPlugin && (
                    <div
                      className={cx(
                        "aa-PanelSection--quickAccess aa-PanelSection--zoomable",
                        hasSourceActiveItem(
                          "quickAccessPlugin",
                          autoCompleteState
                        ) && "aa-PanelSection--active"
                      )}
                    >
                      {quickAccessPlugin}
                    </div>
                  )}

                  {!hasResults && (
                    <div
                      className={cx(
                        "aa-PanelSection--popularCategories aa-PanelSection--zoomable",
                        hasSourceActiveItem(
                          "popularCategoriesPlugin",
                          autoCompleteState
                        ) && "aa-PanelSection--active"
                      )}
                    >
                      {popularCategoriesPlugin}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
    return <div>Hello World</div>;
  },
});

export default Autocomplete;
</script>
