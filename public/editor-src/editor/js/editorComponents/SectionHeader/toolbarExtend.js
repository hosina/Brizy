import Config from "visual/global/Config";
import { isCloud, isShopify } from "visual/global/Config/types/configs/Cloud";
import { isWp } from "visual/global/Config/types/configs/WP";
import { t } from "visual/utils/i18n";
import { getAllMembershipChoices } from "visual/utils/membership";
import { getLanguagesChoices } from "visual/utils/multilanguages";
import { defaultValueValue } from "visual/utils/onChange";
import {
  toolbarElementSectionGlobal,
  toolbarElementSectionSaved,
  toolbarShowOnResponsive
} from "visual/utils/toolbar";

export function getItems({ v, device, component }) {
  const config = Config.getAll();

  const dvv = (key) => defaultValueValue({ v, key, device });

  return [
    toolbarShowOnResponsive({
      v,
      device,
      devices: "responsive",
      closeTooltip: true
    }),
    {
      id: "toolbarSticky",
      type: "popover-dev",
      config: {
        icon: "nc-sticky-menu",
        title: t("Menu")
      },
      devices: "desktop",
      position: 10,
      options: [
        {
          id: "type",
          label: t("Header"),
          type: "select-dev",
          devices: "desktop",
          choices: [
            { title: t("Static"), value: "static" },
            { title: t("Fixed"), value: "fixed" },
            { title: t("Sticky"), value: "animated" }
          ]
        },
        {
          id: "groupSettings",
          type: "group-dev",
          options: [
            toolbarElementSectionGlobal({
              device,
              component,
              state: "normal",
              devices: "desktop"
            }),
            {
              id: "gbConditions",
              disabled: !component.props.meta.globalBlockId,
              value: component.props.meta.globalBlockId,
              type: "gbConditions",
              context: "block"
            }
          ]
        },
        {
          id: "membershipGroup",
          type: "group-dev",
          disabled: isCloud(config) && isShopify(config),
          options: [
            {
              id: "membership",
              label: t("Membership"),
              type: "switch-dev"
            },
            {
              id: "membershipRoles",
              label: t("Show to"),
              type: "multiSelect-dev",
              placeholder: "Select",
              disabled: dvv("membership") === "off",
              choices: getAllMembershipChoices(config)
            }
          ]
        },
        {
          id: "translationsGroup",
          type: "group-dev",
          disabled: isWp(config),
          options: [
            {
              id: "translations",
              label: t("Multi-Language"),
              type: "switch-dev"
            },
            {
              id: "translationsLangs",
              label: t("Show If Language"),
              type: "multiSelect-dev",
              placeholder: "Select",
              disabled: dvv("translations") === "off",
              choices: getLanguagesChoices(config)
            }
          ]
        }
      ]
    },
    toolbarElementSectionSaved({
      device,
      component,
      state: "normal",
      devices: "desktop",
      blockType: "normal"
    })
  ];
}
