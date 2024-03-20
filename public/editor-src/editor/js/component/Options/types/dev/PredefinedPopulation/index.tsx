import produce from "immer";
import React, { useCallback } from "react";
import * as Str from "visual/utils/reader/string";
import { auto } from "visual/utils/string/specs";
import { read as readLiteral } from "visual/utils/types/Literal";
import Select from "../../common/Population/Select";
import type { Value } from "../../common/Population/types/Value";
import { findDCChoiceByPlaceholder } from "../../common/Population/utils";
import type { Props } from "./types";

export const PredefinedPopulation: React.FC<Props> = (props) => {
  const { config, onChange } = props;
  const { activeChoice } = config ?? {};

  const handleChange = useCallback(
    (data: Value) =>
      onChange(
        produce(data, (draft) => {
          if (draft.population === "") {
            draft.population = activeChoice;
          }
        })
      ),
    [onChange, activeChoice]
  );

  if (!config || !activeChoice) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Could not find active choice. Check config.contentDefault"
      );
    }

    return <></>;
  }

  const { value } = props;
  const { population, populationEntityType, populationEntityId } = value;

  const _value = Str.readNoEmpty(population) ?? activeChoice;

  const _entityType = Str.read(populationEntityType) ?? auto;
  const _entityId = readLiteral(populationEntityId) ?? "";
  const currentDCChoice = findDCChoiceByPlaceholder({
    placeholder: _value,
    choices: config.choices
  });

  return (
    <Select<string>
      choices={[]}
      showChoices={false}
      value={_value}
      entityType={_entityType}
      entityId={_entityId}
      currentDCChoice={currentDCChoice}
      onChange={handleChange}
    />
  );
};
