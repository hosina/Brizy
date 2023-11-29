import React, { ReactNode } from "react";
import { ToastNotification } from "visual/component/Notifications";
import Toolbar from "visual/component/Toolbar";
import EditorComponent from "visual/editorComponents/EditorComponent";
import { DynamicContentHelper } from "visual/editorComponents/WordPress/common/DynamicContentHelper";
import { Wrapper } from "visual/editorComponents/tools/Wrapper";
import Config from "visual/global/Config";
import { updateEkklesiaFields } from "visual/utils/api/common";
import { makePlaceholder } from "visual/utils/dynamicContent";
import { EkklesiaMessages } from "../utils/helpers";
import defaultValue from "./defaultValue.json";
import * as toolbarConfig from "./toolbarConfig";
import { Props, Value } from "./types";

export class MinistryBrandsFormWidget extends EditorComponent<Value, Props> {
  static get componentId(): "MinistryBrandsFormWidget" {
    return "MinistryBrandsFormWidget";
  }
  static defaultValue = defaultValue;
  static experimentalDynamicContent = true;

  async componentDidMount(): Promise<void> {
    const toolbarExtend = this.makeToolbarPropsFromConfig2(
      toolbarConfig,
      undefined,
      {
        allowExtend: false,
        allowExtendFromThirdParty: true,
        thirdPartyExtendId: `${this.getComponentId()}Parent`
      }
    );

    this.props.extendParentToolbar(toolbarExtend);

    const { form } = this.getValue();
    const config = Config.getAll();

    const changedKeys = await updateEkklesiaFields(config, {
      fields: [{ value: { form }, module: { key: "forms" } }]
    });
    if (changedKeys) {
      ToastNotification.warn(EkklesiaMessages["form_widget"]);
      this.patchValue(changedKeys);
    }
  }

  renderForEdit(v: Value): ReactNode {
    const { form } = v;
    const placeholder = makePlaceholder({
      content: "{{ekk_form}}",
      attr: { form }
    });

    return (
      <Toolbar
        {...this.makeToolbarPropsFromConfig2(toolbarConfig, undefined, {
          allowExtend: false
        })}
      >
        <Wrapper
          {...this.makeWrapperProps({
            className: "brz-formWidget__container brz-ministryBrands"
          })}
        >
          <DynamicContentHelper
            placeholder={placeholder}
            blocked={false}
            props={{ className: "brz-formWidget" }}
            tagName="div"
          />
        </Wrapper>
      </Toolbar>
    );
  }
}
