import { hideToolbar } from "visual/component/Toolbar";
import { detectOS } from "visual/utils/dom/detectOS";
import { t } from "visual/utils/i18n";

const os = detectOS();
const isMac = os === "MacOS";

export default itemIndex => ({
  getItems: getItems(itemIndex)
});

const getItems = itemIndex => (v, component) => {
  const copiedElement = component.getCurrentCopiedElement();

  return [
    {
      id: "main",
      type: "group",
      items: [
        {
          id: "copy",
          type: "button",
          title: t("Copy"),
          helperText: () => (isMac ? "⌘ + C" : "ctrl + C"),
          onChange: () => component.copy(itemIndex)
        },
        {
          id: "paste",
          type: "button",
          title: t("Paste"),
          helperText: () => (isMac ? "⌘ + V" : "ctrl + V"),
          inactive: !copiedElement || copiedElement.type === "SectionMegaMenu",
          onChange: () => component.paste(itemIndex)
        },
        {
          id: "pasteStyles",
          type: "button",
          title: t("Paste Styles"),
          helperText: () => (isMac ? "⌘ + ⇧ + V" : "ctrl + ⇧ + V"),
          inactive: !copiedElement,
          onChange: () => component.pasteStyles(itemIndex)
        },
        {
          id: "duplicate",
          type: "button",
          title: t("Duplicate"),
          helperText: () => (isMac ? "⌘ + D" : "ctrl + D"),
          onChange: () => {
            component.cloneItem(itemIndex);
          }
        },
        {
          id: "remove",
          type: "button",
          title: t("Delete"),
          helperText: () => (isMac ? "⌘ + delete" : "ctrl + delete"),
          onChange: () => {
            hideToolbar();
            component.removeItem(itemIndex);
          }
        }
      ]
    }
  ];
};
