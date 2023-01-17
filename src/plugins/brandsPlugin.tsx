/** @jsxRuntime classic */
/** @jsx h */
import {
  AutocompleteComponents,
  AutocompletePlugin,
  getAlgoliaFacets,
} from '@algolia/autocomplete-js';
import { h } from 'vue';

import { TagIcon } from '../components/Icons';
import { ALGOLIA_PRODUCTS_INDEX_NAME } from '../constants';
import { searchClient } from '../searchClient';
import { BrandHit } from '../types';

export const brandsPlugin: AutocompletePlugin<BrandHit, {}> = {
  getSources({ query }):any {
    if (!query) {
      return [];
    }

    return [
      {
        sourceId: 'brandsPlugin',
        getItems() {
          return getAlgoliaFacets({
            searchClient,
            queries: [
              {
                indexName: ALGOLIA_PRODUCTS_INDEX_NAME,
                facet: 'brand',
                params: {
                  facetQuery: query,
                  maxFacetHits: 2,
                },
              },
            ],
          });
        },
        getItemInputValue({ item }) {
          return item.label;
        },
        templates: {
          item({ item, components }) {
            return <BrandItem hit={item} components={components} />;
          },
        },
      },
    ];
  },
};

type BrandItemProps = {
  hit: BrandHit;
  components: AutocompleteComponents;
};

function BrandItem({ hit, components }: BrandItemProps) {
  return (
    <div class="aa-ItemWrapper">
      <div class="aa-ItemContent">
        <div class="aa-ItemIcon aa-ItemIcon--noBorder">
          <TagIcon />
        </div>
        <div class="aa-ItemContentBody">
          <div class="aa-ItemContentTitle">
            <components.ReverseHighlight hit={hit} attribute="label" />
          </div>
        </div>
      </div>
    </div>
  );
}
