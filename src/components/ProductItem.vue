<script lang="tsx">
/** @jsxRuntime classic */
/** @jsx h */
import * as autocompleteJs from "@algolia/autocomplete-js";
import { SearchResponse } from "@algolia/client-search";
import { defineComponent, ref, h } from "vue";

import { ALGOLIA_PRODUCTS_INDEX_NAME } from "../constants";
import { searchClient } from "../searchClient";
import { ProductHit } from "../types";
import { cx } from "../utils";
import Blurhash from "./Blurhash.vue";
import { StarIcon, FavoriteIcon } from "./Icons";

export const productsPlugin: autocompleteJs.AutocompletePlugin<ProductHit, {}> =
  {
    getSources({ query }): any {
      if (!query) {
        return [];
      }

      return [
        {
          sourceId: "productsPlugin",
          getItems({ setContext }) {
            return autocompleteJs.getAlgoliaResults<ProductHit>({
              searchClient,
              queries: [
                {
                  indexName: ALGOLIA_PRODUCTS_INDEX_NAME,
                  query,
                  params: {
                    hitsPerPage: 4,
                  },
                },
              ],
              transformResponse({ hits, results }) {
                setContext({
                  nbProducts: (results[0] as SearchResponse<ProductHit>).nbHits,
                });

                return hits;
              },
            });
          },
          onSelect({ setIsOpen }) {
            setIsOpen(true);
          },
          templates: {
            header({ state, Fragment }) {
              return (
                <Fragment>
                  <div class="aa-SourceHeaderTitle">
                    Products for {state.query}
                  </div>
                  <div class="aa-SourceHeaderLine" />
                </Fragment>
              );
            },
            item({ item, components }) {
              return <ProductItem hit={item} components={components} />;
            },
            footer({ state }) {
              return (
                state.context.nbProducts > 4 && (
                  <div style={{ textAlign: "center" }}>
                    <a
                      href="https://example.org/"
                      target="_blank"
                      rel="noreferrer noopener"
                      class="aa-SeeAllBtn"
                    >
                      See All Products ({state.context.nbProducts})
                    </a>
                  </div>
                )
              );
            },
          },
        },
      ];
    },
  };

function formatPrice(value: number, currency: string) {
  return value.toLocaleString("en-US", { style: "currency", currency });
}

const ProductItem = defineComponent({
  props: ["hit", "components"],
  setup(props) {
    const loaded = ref(false);
    const favorite = ref(false);
    const { hit, components } = { ...props };

    return (
      <a
        href="https://example.org/"
        target="_blank"
        rel="noreferrer noopener"
        class="aa-ItemLink aa-ProductItem"
      >
        <div class="aa-ItemContent">
          <div class={cx("aa-ItemPicture", loaded && "aa-ItemPicture--loaded")}>
            <div class="aa-ItemPicture--blurred">
              <Blurhash
                hash={hit.image_blurred}
                width={32}
                height={32}
                punch={1}
              />
            </div>
            <img
              src={hit.image_urls[0]}
              alt={hit.name}
              onLoad={() => (loaded.value = true)}
            />
          </div>

          <div class="aa-ItemContentBody">
            <div>
              {hit.brand && (
                <div class="aa-ItemContentBrand">
                  <components.Highlight hit={hit} attribute="brand" />
                </div>
              )}
              <div class="aa-ItemContentTitleWrapper">
                <div class="aa-ItemContentTitle">
                  <components.Highlight hit={hit} attribute="name" />
                </div>
              </div>
            </div>
            <div>
              <div class="aa-ItemContentPrice">
                <div class="aa-ItemContentPriceCurrent">
                  {formatPrice(hit.price.value, hit.price.currency)}
                </div>
                {hit.price.on_sales && (
                  <div class="aa-ItemContentPriceDiscounted">
                    {formatPrice(
                      hit.price.discounted_value,
                      hit.price.currency
                    )}
                  </div>
                )}
              </div>
              <div class="aa-ItemContentRating">
                <ul>
                  {Array(5)
                    .fill(null)
                    .map((_, index) => (
                      <li key={index}>
                        <div
                          class={cx(
                            "aa-ItemIcon aa-ItemIcon--noBorder aa-StarIcon",
                            index >= hit.reviews.rating && "aa-StarIcon--muted"
                          )}
                        >
                          <StarIcon />
                        </div>
                      </li>
                    ))}
                </ul>
                <span class="aa-ItemContentRatingReviews">
                  ({hit.reviews.count})
                </span>
              </div>
            </div>
          </div>

          <button
            class="aa-ItemFavorite"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              favorite.value = !favorite.value;
            }}
          >
            <div class="aa-ItemIcon aa-ItemIcon--noBorder aa-FavoriteIcon">
              <FavoriteIcon
                class={cx(!favorite && "aa-FavoriteIcon--outlined")}
              />
            </div>
          </button>
        </div>
      </a>
    );
  },
});

export default productsPlugin;
</script>
