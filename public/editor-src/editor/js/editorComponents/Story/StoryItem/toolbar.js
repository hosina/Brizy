import Config from "visual/global/Config";
import { DCTypes } from "visual/global/Config/types/DynamicContent";
import { hexToRgba } from "visual/utils/color";
import { isPro } from "visual/utils/env";
import { t } from "visual/utils/i18n";
import { ImageType } from "visual/utils/image/types";
import {
  MaskPositions,
  MaskRepeat,
  MaskShapes,
  MaskSizes
} from "visual/utils/mask/Mask";
import { defaultValueValue } from "visual/utils/onChange";
import {
  getDynamicContentOption,
  getOptionColorHexByPalette
} from "visual/utils/options";
import { read as readString } from "visual/utils/reader/string";
import { HOVER, NORMAL } from "visual/utils/stateMode";
import { isBackgroundPointerEnabled } from "visual/global/Config/types/configs/featuresValue";

export function getItems({ v, component, device, context }) {
  const dvv = (key) => defaultValueValue({ v, key, device });

  const { hex: bgColorHex } = getOptionColorHexByPalette(
    dvv("bgColorHex"),
    dvv("bgColorPalette")
  );
  const imageDynamicContentChoices = getDynamicContentOption({
    options: context.dynamicContent.config,
    type: DCTypes.image
  });

  const config = Config.getAll();
  const customVideo = isPro(config)
    ? [
        {
          title: t("Custom Video"),
          value: "bgVideoCustom"
        }
      ]
    : [];

  const videoMedia = dvv("media") !== "video";
  const videoType = dvv("bgVideoType");

  const youtubeType = videoType === "youtube";
  const vimeoType = videoType === "vimeo";
  const customType = videoType === "bgVideoCustom";
  const urlType = videoType === "url";

  const maskShape = readString(dvv("maskShape")) ?? "none";
  const maskPosition = readString(dvv("maskPosition")) ?? "center center";
  const maskSize = readString(dvv("maskSize")) ?? "cover";
  const maskScaleSuffix = readString(dvv("maskScaleSuffix")) ?? "%";
  const maskCustomUploadImageSrc = readString(dvv("maskCustomUploadImageSrc"));
  const disableMaskTab = dvv("media") !== "image";
  const maskShapeIsDisabled =
    maskShape === "none" ||
    (maskShape === "custom" && !maskCustomUploadImageSrc) ||
    disableMaskTab;

  const isExternalImage = dvv("bgImageType") !== ImageType.Internal;
  const isPointerEnabled = isBackgroundPointerEnabled(config, "story");

  return [
    {
      id: "toolbarCurrentElement",
      type: "popover",
      config: {
        icon: "nc-background",
        title: t("Background")
      },
      position: 80,
      options: [
        {
          id: "tabsCurrentElement",
          type: "tabs",
          tabs: [
            {
              id: "tabCurrentElement",
              label: t("Background"),
              options: [
                {
                  id: "media",
                  label: t("Type"),
                  type: "radioGroup",
                  devices: "desktop",
                  choices: [
                    { value: "image", icon: "nc-media-image" },
                    { value: "video", icon: "nc-media-video" },
                    { value: "map", icon: "nc-media-map" }
                  ]
                },
                {
                  label: t("Image"),
                  id: "bg",
                  type: "imageUpload",
                  disabled: dvv("media") !== "image",
                  population: imageDynamicContentChoices,
                  config: {
                    disableSizes: isExternalImage,
                    pointer: !isExternalImage && isPointerEnabled
                  }
                },
                {
                  id: "bgVideoType",
                  label: t("Video type"),
                  type: "select",
                  devices: "desktop",
                  disabled: videoMedia,
                  choices: [
                    { title: t("Youtube"), value: "youtube" },
                    { title: t("Vimeo"), value: "vimeo" },
                    ...customVideo,
                    { title: t("URL"), value: "url" }
                  ]
                },
                {
                  id: "bgVideo",
                  label: t("Link"),
                  type: "inputText",
                  devices: "desktop",
                  disabled: videoMedia || customType,
                  placeholder: youtubeType
                    ? t("YouTube")
                    : vimeoType
                      ? t("Vimeo")
                      : t("https://"),
                  helper: {
                    content: urlType
                      ? t("This is .mp4 URL.")
                      : youtubeType
                        ? t(
                            "Use the regular video links generated by YouTube. The 'feature=share' parameter is not a valid or recognized parameter by the YouTube platform."
                          )
                        : ""
                  }
                },
                {
                  id: "bgVideoCustom",
                  label: t("File"),
                  type: "fileUpload",
                  config: {
                    allowedExtensions: ["video/*"]
                  },
                  devices: "desktop",
                  disabled: videoMedia || !customType
                },
                {
                  id: "bgVideoLoop",
                  label: t("Loop"),
                  type: "switch",
                  devices: "desktop",
                  disabled: dvv("media") !== "video"
                },
                {
                  id: "bgVideoStart",
                  type: "number",
                  label: t("Start"),
                  devices: "desktop",
                  disabled: dvv("media") !== "video",
                  config: {
                    size: "short",
                    spinner: false,
                    max: 99999
                  },
                  helper: {
                    content: t("Specify a start time (in seconds)")
                  }
                },
                {
                  id: "bgMapAddress",
                  label: t("Address"),
                  type: "inputText",
                  placeholder: t("Enter address"),
                  devices: "desktop",
                  disabled: dvv("media") !== "map"
                },
                {
                  id: "bgMapZoom",
                  label: t("Zoom"),
                  devices: "desktop",
                  type: "slider",
                  disabled: dvv("media") !== "map",
                  config: {
                    min: 1,
                    max: 21
                  }
                }
              ]
            },
            {
              id: "tabMask",
              label: t("Mask"),
              position: 110,
              options: [
                {
                  id: "maskShape",
                  label: t("Shape"),
                  devices: "desktop",
                  type: "select",
                  choices: MaskShapes,
                  disabled: disableMaskTab
                },
                {
                  id: "maskCustomUpload",
                  type: "imageUpload",
                  devices: "desktop",
                  label: t("Image"),
                  config: {
                    pointer: false,
                    disableSizes: true,
                    acceptedExtensions: ["png", "svg"]
                  },
                  helper: {
                    content: t("Upload only [ .png or .svg ]")
                  },
                  disabled: maskShape !== "custom" || disableMaskTab
                },
                {
                  id: "groupSize",
                  type: "group",
                  disabled: maskShapeIsDisabled,
                  options: [
                    {
                      id: "maskSize",
                      label: t("Size"),
                      type: "select",
                      choices: MaskSizes
                    },
                    {
                      id: "maskScale",
                      type: "slider",
                      disabled: maskSize !== "custom",
                      config: {
                        min: 1,
                        max: maskScaleSuffix === "px" ? 500 : 100,
                        units: [
                          { value: "%", title: "%" },
                          { value: "px", title: "px" }
                        ]
                      }
                    }
                  ]
                },
                {
                  id: "groupPosition",
                  type: "group",
                  disabled: maskShapeIsDisabled,
                  options: [
                    {
                      id: "maskPosition",
                      type: "select",
                      label: t("Position"),
                      choices: MaskPositions
                    },
                    {
                      id: "maskPositionx",
                      label: t("X"),
                      type: "slider",
                      disabled: maskPosition !== "custom",
                      config: {
                        min: 1,
                        max: 100,
                        units: [{ value: "%", title: "%" }]
                      }
                    },
                    {
                      id: "maskPositiony",
                      label: t("Y"),
                      type: "slider",
                      disabled: maskPosition !== "custom",
                      config: {
                        min: 1,
                        max: 100,
                        units: [{ value: "%", title: "%" }]
                      }
                    }
                  ]
                },
                {
                  id: "maskRepeat",
                  label: t("Repeat"),
                  type: "select",
                  disabled: maskShapeIsDisabled || maskSize === "cover",
                  choices: MaskRepeat
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "toolbarColor",
      type: "popover",
      config: {
        size: "auto",
        title: t("Colors"),
        icon: {
          style: {
            backgroundColor: hexToRgba(bgColorHex, dvv("bgColorOpacity"))
          }
        }
      },
      position: 90,
      devices: "desktop",
      options: [
        {
          id: "tabsColor",
          type: "tabs",
          tabs: [
            {
              id: "tabOverlay",
              label: t("Overlay"),
              options: [
                {
                  id: "",
                  type: "backgroundColor"
                }
              ]
            },
            {
              id: "tabBorder",
              label: t("Border"),
              options: [
                {
                  id: "border",
                  type: "border"
                }
              ]
            },
            {
              id: "tabDropShadow",
              label: t("Shadow"),
              options: [
                {
                  id: "maskShadow",
                  type: "textShadow",
                  states: [NORMAL, HOVER],
                  disabled: maskShapeIsDisabled
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "makeItSaved",
      type: "savedBlock",
      devices: "desktop",
      position: 90,
      disabled: true,
      config: {
        icon: "nc-save-section",
        blockType: "normal",
        title: t("Save"),
        tooltipContent: t("Saved"),
        blockId: component.getId()
      }
    },

    {
      id: "advancedSettings",
      type: "advancedSettings",
      devices: "desktop",
      roles: ["admin"],
      position: 110
    }
  ];
}
