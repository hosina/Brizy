import React, { ReactElement, useCallback } from "react";
import {
  Props as RadioGroup2Props,
  RadioGroup2
} from "visual/component/Controls/RadioGroup2";
import { Item } from "visual/component/Controls/RadioGroup2/Item";
import {
  Props as OptionProps,
  SimpleValue
} from "visual/component/Options/Type";
import { WithClassName } from "visual/types/attributes";
import * as L from "visual/utils/types/Literal";
import { Literal } from "visual/utils/types/Literal";
import { Choice } from "./Choice";

export type Props = OptionProps<SimpleValue<Literal>> &
  WithClassName & {
    choices: Choice[];
  };

export const RadioGroup = ({
  value: { value },
  choices,
  onChange,
  label
}: Props): ReactElement => {
  const _onChange = useCallback<RadioGroup2Props<Literal>["onChange"]>(
    (value) => onChange({ value }),
    [onChange]
  );

  return (
    <>
      {label}
      <RadioGroup2<Literal> onChange={_onChange}>
        {choices.map(({ value: v, icon, title }, i) => (
          <Item
            title={title ?? ""}
            key={i}
            icon={icon}
            value={v}
            active={L.eq(v, value)}
          />
        ))}
      </RadioGroup2>
    </>
  );
};
