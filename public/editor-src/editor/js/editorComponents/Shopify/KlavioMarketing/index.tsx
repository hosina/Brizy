import React, { ReactNode } from "react";
import { ElementModel } from "visual/component/Elements/Types";
import Placeholder from "visual/component/Placeholder";
import Toolbar from "visual/component/Toolbar";
import EditorComponent from "visual/editorComponents/EditorComponent";
import { Wrapper } from "../../tools/Wrapper";
import defaultValue from "./defaultValue.json";
import * as sidebar from "./sidebar";
import * as toolbar from "./toolbar";

export interface Value extends ElementModel {
  formID: string;
}

export class KlavyioMarketing extends EditorComponent<ElementModel> {
  static get componentId(): "KlavyioMarketing" {
    return "KlavyioMarketing";
  }

  static defaultValue = defaultValue;

  renderForEdit(v: Value): ReactNode {
    const { formID } = v;

    return (
      <Toolbar {...this.makeToolbarPropsFromConfig2(toolbar, sidebar)}>
        <Wrapper
          {...this.makeWrapperProps({
            className: "brz-shopify-klavyio-marketing"
          })}
        >
          {IS_PREVIEW ? (
            <div
              data-pf-type="Klaviyo"
              dangerouslySetInnerHTML={{ __html: formID }}
            />
          ) : (
            <Placeholder icon="img" />
          )}
        </Wrapper>
      </Toolbar>
    );
  }
}
