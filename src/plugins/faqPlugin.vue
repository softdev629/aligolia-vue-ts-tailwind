<script lang="tsx">
/** @jsxRuntime classic */
/** @jsx h */
import {
  AutocompletePlugin,
  getAlgoliaResults,
} from "@algolia/autocomplete-js";
import { defineComponent, h } from "vue";

import { InfoIcon } from "../components/Icons";
import Breadcrumb from "../components/Breadcrumb.vue";
import { ALGOLIA_FAQ_INDEX_NAME } from "../constants";
import { searchClient } from "../searchClient";
import { FaqHit } from "../types";

export const faqPlugin: AutocompletePlugin<FaqHit, {}> = {
  getSources({ query }): any {
    if (!query) {
      return [];
    }

    return [
      {
        sourceId: "faqPlugin",
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: ALGOLIA_FAQ_INDEX_NAME,
                query,
                params: {
                  hitsPerPage: 1,
                },
              },
            ],
          });
        },
        getItemInputValue({ item }) {
          return item.title;
        },
        templates: {
          item({ item, components }) {
            return <FaqItem hit={item} components={components} />;
          },
        },
      },
    ];
  },
};

const FaqItem = defineComponent({
  props: ["hit", "components"],
  setup(props) {
    const { hit, components } = props;
    return (
      <div class="aa-ItemWrapper aa-FaqItem">
        <div class="aa-ItemContent">
          <div class="aa-ItemIcon aa-ItemIcon--noBorder">
            <InfoIcon />
          </div>
          <div class="aa-ItemContentBody">
            <div class="aa-ItemContentTitle">
              <components.ReverseHighlight hit={hit} attribute="title" />
            </div>
          </div>
        </div>
        <Breadcrumb
          items={hit.list_categories.map((_, index) => (
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

export default faqPlugin;
</script>
