<script lang="tsx">
/** @jsxRuntime classic */
/** @jsx h */
import {
  AutocompleteComponents,
  AutocompletePlugin,
  getAlgoliaResults,
} from "@algolia/autocomplete-js";
import { defineComponent, h } from "vue";

import { GridIcon } from "../components/Icons";
import Breadcrumb from "../components/Breadcrumb.vue";
import { ALGOLIA_PRODUCTS_INDEX_NAME } from "../constants";
import { searchClient } from "../searchClient";
import { CategoryHit } from "../types";

export const categoriesPlugin: AutocompletePlugin<CategoryHit, {}> = {
  getSources({ query }): any {
    if (!query) {
      return [];
    }

    return [
      {
        sourceId: "categoriesPlugin",
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: ALGOLIA_PRODUCTS_INDEX_NAME,
                query,
                params: {
                  hitsPerPage: 1,
                },
              },
            ],
          });
        },
        getItemInputValue({ item }) {
          return item.list_categories[item.list_categories.length - 1];
        },
        templates: {
          item({ item, components }) {
            return <CategoryItem hit={item} components={components} />;
          },
        },
      },
    ];
  },
};

export const CategoryItem = defineComponent({
  props: ["hit", "components"],
  setup(props) {
    const { hit, components } = props;
    return (
      <div className="aa-ItemWrapper aa-CategoryItem">
        <div className="aa-ItemContent">
          <div className="aa-ItemIcon aa-ItemIcon--noBorder">
            <GridIcon />
          </div>
          <div className="aa-ItemContentBody">
            <div className="aa-ItemContentTitle">
              <components.ReverseHighlight
                hit={hit}
                attribute={[
                  "list_categories",
                  `${hit.list_categories.length - 1}`,
                ]}
              />
            </div>
          </div>
        </div>
        <Breadcrumb
          items={hit.list_categories.slice(0, -1).map((_, index) => (
            <components.Highlight
              key={index}
              hit={hit}
              attribute={["list_categories", `${index}`]}
            />
          ))}
        />
      </div>
    );
  },
});

export default categoriesPlugin;
</script>
