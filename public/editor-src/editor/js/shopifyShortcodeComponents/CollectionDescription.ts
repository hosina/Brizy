import { ConfigCommon } from "visual/global/Config/types/configs/ConfigCommon";
import { ElementTypes } from "visual/global/Config/types/configs/ElementTypes";
import { t } from "visual/utils/i18n";

export default function (config: ConfigCommon) {
  return {
    id: "CollectionDescription",
    title: t("Description"),
    icon: "nc-wp-post-content",
    resolve: {
      type: "Wrapper",
      value: {
        _styles: ["wrapper"],
        items: [
          {
            type: "WPPostContent",
            value: {
              _styles: ["WPPostContent", "CollectionDescription"],
              ...config.contentDefaults?.[ElementTypes.CollectionDescription]
            }
          }
        ]
      }
    }
  };
}
