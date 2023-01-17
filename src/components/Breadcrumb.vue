<script lang="tsx">
import { defineComponent } from "vue";
import { intersperse } from "../utils";
import { ChevronRightIcon } from "./Icons";

export default defineComponent({
  name: "Breadcrumb",
  props: ["items"],
  setup(props) {
    return () => (
      <div class="aa-Breadcrumb">
        {intersperse(
          props.items,
          <div className="aa-ItemIcon aa-ItemIcon--noBorder aa-FavoriteIcon">
            <ChevronRightIcon />
          </div>
        )}
      </div>
    );
  },
});
</script>
