import React from "react";
import Select from "visual/component/Controls/Select";
import SelectItem from "visual/component/Controls/Select/SelectItem";
import { t } from "visual/utils/i18n";

export default function Showing(props) {
  const { value: triggerValue = "", onChange = () => {} } = props;

  return (
    <React.Fragment>
      <Select
        className="brz-control__select--light"
        itemHeight={30}
        defaultValue={triggerValue.value}
        onChange={(value) => onChange({ ...triggerValue, value })}
      >
        <SelectItem key="views" value="views">
          {t("viewed pages")}
        </SelectItem>
        <SelectItem key="sessions" value="sessions">
          {t("Sessions")}
        </SelectItem>
      </Select>
      <Select
        className="brz-control__select--light"
        itemHeight={30}
        defaultValue={triggerValue.type}
        onChange={(type) => onChange({ ...triggerValue, type })}
      >
        <SelectItem key="is fewer" value="is fewer">
          {t("is fewer than")}
        </SelectItem>
        <SelectItem key="equals" value="equals">
          {t("equals")}
        </SelectItem>
        <SelectItem key="is more" value="is more">
          {t("is more than")}
        </SelectItem>
      </Select>
      <div className="brz-control__select">
        <input
          className="brz-input"
          type="number"
          placeholder={t("Number of")}
          value={triggerValue[triggerValue.value]}
          onChange={({ target: { value } }) =>
            onChange({ ...triggerValue, [triggerValue.value]: value })
          }
        />
      </div>
    </React.Fragment>
  );
}
