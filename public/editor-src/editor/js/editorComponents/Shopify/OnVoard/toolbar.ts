import { t } from "visual/utils/i18n";
import { ToolbarItemType } from "../../ToolbarItemType";

export function getItems(): ToolbarItemType[] {
  return [
    {
      id: "toolbarJudgeReview",
      type: "popover",
      position: 10,
      devices: "desktop",
      config: {
        icon: "nc-shopify-logo",
        title: t("Notification")
      },
      options: [
        {
          id: "widgetType",
          type: "select",
          label: t("Widget"),
          helper: {
            content: t(
              "This element should stay inside a Product Details Component"
            )
          },
          choices: [
            { title: "Button", value: "button" },
            { title: "Text", value: "text" }
          ]
        },
        {
          id: "embedCode",
          label: t("Short Code"),
          type: "inputText",
          placeholder: "Insert code here..."
        }
      ]
    }
  ];
}
