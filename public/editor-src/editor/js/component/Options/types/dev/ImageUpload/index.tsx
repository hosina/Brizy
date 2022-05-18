import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import { ImageSetter } from "visual/component/Controls/ImageSetter";
import { t } from "visual/utils/i18n";
import Config from "visual/global/Config";
import { Image } from "./model";
import { Component } from "./Types";
import {
  DEFAULT_VALUE,
  fromElementModel,
  toElementModel,
  configSizeToSize
} from "./utils";

export const ImageUpload: Component = ({ onChange, value, config, label }) => {
  const className = classNames(
    "brz-ed-option__focal-point",
    "brz-ed-option__inline"
  );

  const disableSizes = config?.disableSizes ?? false;
  const sizes = useMemo(
    () => [
      {
        value: "custom",
        label: t("Custom")
      },
      ...(Config.getAll().imageSizes ?? []).map(configSizeToSize)
    ],
    []
  );

  const onImageChange = useCallback(
    (v: Image, meta: { isChanged: "image" | "pointer" }): void => {
      switch (meta.isChanged) {
        case "image":
          {
            onChange({
              imageSrc: v.src,
              imageExtension: v.extension,
              imageWidth: v.width,
              imageHeight: v.height
            });
          }
          break;
        case "pointer":
          {
            onChange({
              positionX: v.x,
              positionY: v.y
            });
          }
          break;
      }
    },
    [onChange]
  );

  const onTypeChange = useCallback(
    (sizeType: string) => onChange({ sizeType }),
    [onChange]
  );

  return (
    <>
      {label}
      <ImageSetter<string>
        className={className}
        onlyPointer={!(config?.edit ?? true)}
        showPointer={
          value.sizeType === "custom" &&
          value.extension !== "svg" &&
          (config?.pointer ?? true)
        }
        extension={value.extension}
        x={value.x}
        y={value.y}
        width={value.width}
        height={value.height}
        src={value.src}
        onChange={onImageChange}
        size={value.sizeType}
        sizes={!disableSizes && value.extension !== "svg" ? sizes : undefined}
        onSizeChange={onTypeChange}
      />
    </>
  );
};

ImageUpload.fromElementModel = fromElementModel;

ImageUpload.toElementModel = toElementModel;

ImageUpload.defaultValue = DEFAULT_VALUE;
