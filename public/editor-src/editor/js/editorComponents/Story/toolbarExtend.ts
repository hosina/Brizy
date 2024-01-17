import { ElementModel } from "visual/component/Elements/Types";
import { t } from "visual/utils/i18n";
import { defaultValueValue } from "visual/utils/onChange";
import { ResponsiveMode } from "visual/utils/responsiveMode";
import { ToolbarItemType } from "../ToolbarItemType";

export function getItems({
  v,
  device
}: {
  v: ElementModel;
  device: ResponsiveMode;
}): ToolbarItemType[] {
  const dvv = (key: string): unknown => defaultValueValue({ v, key, device });

  return [
    {
      id: "toolbarAutoplay",
      type: "popover",
      config: {
        icon: "nc-play",
        title: t("Autoplay")
      },
      position: 70,
      options: [
        {
          id: "sliderAutoPlayGroup",
          type: "group",
          devices: "desktop",
          options: [
            {
              id: "sliderAutoPlay",
              label: t("Autoplay"),
              type: "switch"
            },
            {
              id: "sliderAutoPlaySpeed",
              label: t("Speed"),
              type: "slider",
              disabled: dvv("sliderAutoPlay") !== "on",
              config: {
                min: 1,
                max: 6,
                step: 0.1,
                units: [{ value: "s", title: "s" }]
              }
            }
          ]
        },
        {
          id: "sliderLoop",
          label: t("Loop"),
          type: "switch",
          devices: "desktop",
          disabled: dvv("sliderAutoPlay") !== "on"
        }
      ]
    }
  ];
}
