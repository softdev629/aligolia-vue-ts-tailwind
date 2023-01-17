/** @jsxRuntime classic */
/** @jsx h */
import {
  AutocompletePlugin,
  getAlgoliaResults,
} from '@algolia/autocomplete-js';
import { SearchResponse } from '@algolia/client-search';
import { h } from 'vue';

import { ALGOLIA_PRODUCTS_INDEX_NAME } from '../constants';
import { searchClient } from '../searchClient';
import { QuickAccessHit } from '../types';
import { cx, intersperse } from '../utils';

export const quickAccessPlugin: AutocompletePlugin<QuickAccessHit, {}> = {
  getSources({ query }) {
    if (query) {
      return [];
    }

    return [
      {
        sourceId: 'quickAccessPlugin',
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: ALGOLIA_PRODUCTS_INDEX_NAME,
                query,
                params: {
                  hitsPerPage: 0,
                  ruleContexts: ['quickAccess'],
                },
              },
            ],
            transformResponse({ results }) {
              return (
                (results as SearchResponse[])?.[0].userData?.[0]?.items || []
              );
            },
          });
        },
        templates: {
          header({ Fragment }) {
            return (
              <Fragment>
                <span class="aa-SourceHeaderTitle">Quick access</span>
                <div class="aa-SourceHeaderLine" />
              </Fragment>
            );
          },
          item({ item }) {
            return <QuickAccessItem hit={item} />;
          },
        },
      },
    ];
  },
};

type QuickAccessItemProps = {
  hit: QuickAccessHit;
};

function QuickAccessItem({ hit }: QuickAccessItemProps) {
  return (
    <a
      href={hit.href}
      class={cx(
        'aa-ItemLink aa-QuickAccessItem',
        `aa-QuickAccessItem--${hit.template}`
      )}
    >
      <div class="aa-ItemContent">
        {hit.image && (
          <div class="aa-ItemPicture">
            <img src={hit.image} alt={hit.title} />
          </div>
        )}

        <div class="aa-ItemContentBody">
          {hit.date && <div class="aa-ItemContentDate">{hit.date}</div>}
          <div class="aa-ItemContentTitle">
            {intersperse(hit.title.split('\n'), <br />)}
          </div>
          {hit.subtitle && (
            <div class="aa-ItemContentSubTitle">
              {intersperse(hit.subtitle.split('\n'), <br />)}
            </div>
          )}

          {hit.links && (
            <ul>
              {hit.links.map((link) => (
                <li key={link.text}>
                  <a href={link.href}>{link.text}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </a>
  );
}
