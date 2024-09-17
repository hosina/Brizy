import classNames from "classnames";
import React, { ReactElement, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  BoxShadow as ShadowControl,
  Props as ShadowProps
} from "visual/component/Controls/BoxShadow";
import { TypeObject } from "visual/component/Controls/BoxShadow/types";
import * as Option from "visual/component/Options/Type";
import GlobalConfig from "visual/global/Config";
import { LeftSidebarOptionsIds } from "visual/global/Config/types/configs/ConfigCommon";
import { updateUI } from "visual/redux/actions2";
import { WithClassName, WithConfig } from "visual/types/attributes";
import { getColorPaletteColors } from "visual/utils/color";
import * as Hex from "visual/utils/color/Hex";
import * as Blur from "visual/utils/cssProps/Blur";
import * as Opacity from "visual/utils/cssProps/opacity";
import { pipe } from "visual/utils/fp";
import { Config } from "visual/utils/options/BoxShadow/entities/Config";
import * as Type from "visual/utils/options/BoxShadow/entities/Type";
import { Value } from "visual/utils/options/BoxShadow/entities/Value";
import { Meta } from "visual/utils/options/BoxShadow/meta";
import {
  setBlur,
  setHex,
  setHorizontal,
  setPalette,
  setSpread,
  setType,
  setVertical
} from "visual/utils/options/BoxShadow/model";
import {
  getTypesItems,
  _setOpacity
} from "visual/utils/options/BoxShadow/utils";
import { paletteHex } from "visual/utils/options/ColorPicker/utils";

export interface Props
  extends Option.Props<Value>,
    Option.Meta<Meta>,
    WithConfig<Config>,
    WithClassName {}

export const BoxShadow = ({
  onChange,
  value,
  className,
  config
}: Props): ReactElement => {
  const dispatch = useDispatch();
  const _className = classNames("brz-ed-option__boxShadow", className);

  const { type, opacity } = config ?? {};

  const types: TypeObject[] = useMemo(
    () =>
      pipe(
        () => type,
        Type.read,
        (t): Type.Type[] => (t ? ["none", t] : Type.types),
        getTypesItems
      )(),
    [type]
  );

  const onValueChange = useCallback<ShadowProps["onChange"]>(
    (m, meta) => {
      const isChanging = !!meta?.isChanging;

      switch (meta.isChanged) {
        case "opacity": {
          const opacity = Opacity.fromNumber(m.opacity);
          opacity !== undefined &&
            onChange(_setOpacity(opacity, value, !!meta.isChanged), {
              isChanging
            });
          break;
        }
        case "type": {
          onChange(setType(m.type, value));
          break;
        }
        case "blur": {
          const blur = Blur.fromNumber(m.blur);
          blur && onChange(setBlur(blur, value));
          break;
        }
        case "hex": {
          const hex = Hex.fromString(m.hex);
          hex && onChange(setHex(hex, value), { isChanging });
          break;
        }
        case "spread": {
          onChange(setSpread(m.spread, value));
          break;
        }
        case "palette": {
          onChange(setPalette(m.palette, value));
          break;
        }
        case "horizontal": {
          onChange(setHorizontal(m.horizontal, value));
          break;
        }
        case "vertical": {
          onChange(setVertical(m.vertical, value));
          break;
        }
      }
    },
    [onChange, value]
  );
  const openPaletteSidebar = useCallback(
    () =>
      dispatch(
        updateUI("leftSidebar", {
          isOpen: true,
          drawerContentType: LeftSidebarOptionsIds.globalStyle
        })
      ),
    [dispatch]
  );

  const enableGlobalStyle = useMemo((): boolean => {
    const config = GlobalConfig.getAll();
    const { bottomTabsOrder = [], topTabsOrder = [] } =
      config.ui?.leftSidebar ?? {};

    return [...bottomTabsOrder, ...topTabsOrder].includes(
      LeftSidebarOptionsIds.globalStyle
    );
  }, []);

  const palette = getColorPaletteColors();
  const _value: Value = {
    ...value,
    hex: paletteHex(value.palette, palette) ?? value.hex
  };

  return (
    <ShadowControl
      opacity={opacity ?? true}
      className={_className}
      value={_value}
      onChange={onValueChange}
      types={types}
      palette={getColorPaletteColors()}
      paletteOpenSettings={enableGlobalStyle ? openPaletteSidebar : undefined}
    />
  );
};
