import {
  cssStyleBgColor,
  cssStyleBgGradient,
  cssStyleBorder,
  cssStyleBorderRadius,
  cssStyleColor,
  cssStyleDisplayFlex,
  cssStyleFlexColumnHorizontalAlign,
  cssStyleSpacing,
  cssStyleTextAlign,
  getAllCssStyleTypography
} from "visual/utils/cssStyle";
import * as Num from "visual/utils/math/number";
import { CSSValue } from "visual/utils/style2/types";
import { defaultValueValue } from "../onChange";
import { ACTIVE } from "../stateMode";
import { cssStyleBoxShadow } from "./cssStyleBoxShadow";

// Title
export function cssStyleElementOfMinistryBrandsTitleTypography({
  v,
  device,
  state
}: CSSValue): string {
  return getAllCssStyleTypography({
    v,
    device,
    state,
    prefix: "titleTypography"
  });
}

// Date
export function cssStyleElementOfMinistryBrandsDateTypography({
  v,
  device,
  state
}: CSSValue): string {
  return getAllCssStyleTypography({
    v,
    device,
    state,
    prefix: "dateTypography"
  });
}

export function cssStyleElementOfMinistryBrandsDateColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleColor({ v, device, state, prefix: "dateColor" });
}

export function cssStyleElementOfMinistryBrandsTitleColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleColor({ v, device, state, prefix: "titleColor" });
}

export function cssStyleElementOfMinistryBrandsMetaColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleColor({ v, device, state, prefix: "metaColor" });
}

// Links
export function cssStyleElementOfMinistryBrandsMetaLinksTypography({
  v,
  device,
  state
}: CSSValue): string {
  return getAllCssStyleTypography({
    v,
    device,
    state,
    prefix: "metaLinksTypography"
  });
}

export function cssStyleElementOfMinistryBrandsMetaLinksColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleColor({ v, device, state, prefix: "metaLinksColor" });
}

export function cssStyleElementOfMinistryBrandsMetaLinksBgColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBgColor({ v, device, state, prefix: "metaLinksBg" });
}

export function cssStyleElementOfMinistryBrandsMetaLinksBgGradient({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBgGradient({ v, device, state, prefix: "metaLinks" });
}

// Preview
export function cssStyleElementOfMinistryBrandsPreviewTypography({
  v,
  device,
  state
}: CSSValue): string {
  return getAllCssStyleTypography({
    v,
    device,
    state,
    prefix: "previewTypography"
  });
}

export function cssStyleElementOfMinistryBrandsPreviewColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleColor({ v, device, state, prefix: "previewColor" });
}

// Pagination
export function cssStyleElementOfMinistryBrandsPaginationTypography({
  v,
  device,
  state
}: CSSValue): string {
  return getAllCssStyleTypography({
    v,
    device,
    state,
    prefix: "paginationTypography"
  });
}

export function cssStyleElementOfMinistryBrandsPaginationColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleColor({ v, device, state, prefix: "paginationColor" });
}

export function cssStyleElementOfMinistryBrandsPaginationColorActive({
  v,
  device
}: CSSValue): string {
  return cssStyleColor({ v, device, state: ACTIVE, prefix: "paginationColor" });
}

export function cssStyleMinistryElementFiltersBgColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBgColor({
    v,
    device,
    state,
    prefix: "filterBg"
  });
}

//
export function cssStyleMinistryElementFiltersInputBgColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBgColor({
    v,
    device,
    state,
    prefix: "inputBg"
  });
}

export function cssStyleMinistryElementFiltersInputColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleColor({
    v,
    device,
    state,
    prefix: "input"
  });
}

export function cssStyleMinistryElementFiltersTypography({
  v,
  device,
  state
}: CSSValue): string {
  return getAllCssStyleTypography({
    v,
    device,
    state,
    prefix: "filterTypography"
  });
}

export function cssStyleElementOfMinistryBrandsColumnsNumber({
  v,
  device,
  state
}: CSSValue): string {
  const dvv = (key: string): unknown =>
    defaultValueValue({ v, key, device, state });

  const columnNumber = Num.read(dvv("columnNumber")) ?? 3;
  const columnSize = 100 / columnNumber;
  const _columnSize =
    columnNumber === 1 ? columnSize : `calc(${columnSize}% - 15px)`;

  const delta = columnNumber === 1 ? 0 : 15 / (columnNumber - 1);
  const gap = delta ? delta * columnNumber : 0;

  return `--columnCount: ${columnNumber};--columnSize: ${_columnSize}; column-gap:${gap}px; row-gap:15px;`;
}

export function cssStyleElementOfMinistryBrandsColumnsNumberWithSpacing({
  v,
  device,
  state
}: CSSValue): string {
  const dvv = (key: string): unknown =>
    defaultValueValue({ v, key, device, state });

  const itemSpacing = Num.read(dvv("itemSpacing")) ?? 15;
  const columnNumber = Num.read(dvv("columnNumber")) ?? 3;
  const columnSize = 100 / columnNumber;
  const _columnSize =
    columnNumber === 1 ? columnSize : `calc(${columnSize}% - ${itemSpacing}px)`;

  const delta = columnNumber === 1 ? 0 : itemSpacing / (columnNumber - 1);
  const gap = delta ? delta * columnNumber : 0;

  return `--columnCount: ${columnNumber};--columnSize: ${_columnSize}; column-gap:${gap}px; row-gap:${itemSpacing}px;`;
}

export function cssStyleElementOfMinistryBrandsHorizontalAlign({
  v,
  device,
  state
}: CSSValue): string {
  const textAlign = cssStyleTextAlign({ v, device, state, prefix: "item" });
  const alignItems = cssStyleFlexColumnHorizontalAlign({
    v,
    device,
    state,
    prefix: "item"
  });
  const flex = cssStyleDisplayFlex();

  return `${flex}${alignItems}${textAlign} flex-direction:column;`;
}

export function cssStyleElementOfMinistryBrandsSpacing({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleSpacing({
    v,
    device,
    state,
    prefix: "item",
    direction: "bottom"
  });
}

export const cssStylementOfMinistryBrandsParentBgColor = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBgColor({ v, device, state, prefix: "parentBg" });
};

export const cssStylementOfMinistryBrandsParentBgGradient = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBgGradient({ v, device, state, prefix: "parent" });
};

export const cssStylementOfMinistryBrandsParentBorder = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBorder({ v, device, state, prefix: "parent" });
};

export const cssStylementOfMinistryBrandsParentBoxShadow = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBoxShadow({ v, device, state, prefix: "parent" });
};

export function cssStyleMinistryElementFiltersBgGradient({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBgGradient({
    v,
    device,
    state,
    prefix: "filter"
  });
}

export function cssStyleMinistryElementFiltersBorder({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBorder({
    v,
    device,
    state,
    prefix: "input"
  });
}

export function cssStyleMinistryElementFiltersInputGradientColor({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBgGradient({
    v,
    device,
    state,
    prefix: "input"
  });
}

export function cssStyleMinistryElementFiltersBorderRadius({
  v,
  device,
  state
}: CSSValue): string {
  return cssStyleBorderRadius({
    v,
    device,
    state,
    prefix: "filter"
  });
}

export const cssStyleMinistryElementMediaBorderRadius = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBorderRadius({
    v,
    device,
    state,
    prefix: "media"
  });
};

export const cssStyleElementMinistryBrandsButtonsTypography = ({
  v,
  device,
  state
}: CSSValue): string => {
  return getAllCssStyleTypography({
    v,
    device,
    state,
    prefix: "detailButtonTypography"
  });
};

export const cssStyleElementMinistryBrandsButtonsBgColor = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBgColor({
    v,
    device,
    state,
    prefix: "detailButtonBg"
  });
};

export const cssStyleElementMinistryBrandsButtonsBgGradient = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBgGradient({
    v,
    device,
    state,
    prefix: "detailButton"
  });
};

export const cssStyleElementMinistryBrandsButtonsColor = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleColor({
    v,
    device,
    state,
    prefix: "detailButtonColor"
  });
};

export const cssStyleElementMinistryBrandsButtonsBoxShadow = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBoxShadow({
    v,
    device,
    state,
    prefix: "detailButton"
  });
};

export const cssStyleElementMinistryBrandsButtonsBorder = ({
  v,
  device,
  state
}: CSSValue): string => {
  return cssStyleBorder({
    v,
    device,
    state,
    prefix: "detailButton"
  });
};
