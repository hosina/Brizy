import classnames from "classnames";
import React, { ReactNode } from "react";
import Toolbar from "visual/component/Toolbar";
import EditorComponent from "visual/editorComponents/EditorComponent";
import { DynamicContentHelper } from "visual/editorComponents/WordPress/common/DynamicContentHelper";
import { Wrapper } from "visual/editorComponents/tools/Wrapper";
import { css } from "visual/utils/cssStyle";
import * as sidebarConfig from "../sidebar";
import * as sidebarExtendFilters from "../sidebarExtendFilters";
import {
  sidebarMinistryBrandsMetaCategory,
  sidebarMinistryBrandsMetaDate,
  sidebarMinistryBrandsMetaGroup,
  sidebarMinistryBrandsMetaPassage,
  sidebarMinistryBrandsMetaPreacher,
  sidebarMinistryBrandsMetaSeries,
  sidebarMinistryBrandsMetaTitle
} from "../sidebars/sidebars";
import * as toolbarExtendFilters from "../toolbarExtendFilters";
import * as toolbarImage from "../toolbarImage";
import * as toolbarLinksColor from "../toolbarLinksColor";
import * as toolbarMedia from "../toolbarMedia";
import * as toolbarMetaIcons from "../toolbarMetaIcons";
import * as toolbarConfig from "../toolbarMetaTypography";
import * as toolbarPagination from "../toolbarPagination";
import * as toolbarPreview from "../toolbarPreview";
import * as toolbarTitle from "../toolbarTitle";
import defaultValue from "./defaultValue.json";
import { style } from "./styles";
import * as toolbarExtendButtons from "./toolbarExtendButtons";
import * as toolbarExtendParent from "./toolbarExtendParent";
import { Props, Value } from "./types";
import { getPlaceholder } from "./utils/dynamicContent";

export class MinistryBrandsSermonLayout extends EditorComponent<Value, Props> {
  static get componentId(): "MinistryBrandsSermonLayout" {
    return "MinistryBrandsSermonLayout";
  }
  static defaultValue = defaultValue;
  static experimentalDynamicContent = true;

  componentDidMount(): void {
    const toolbarExtend = this.makeToolbarPropsFromConfig2(
      toolbarExtendParent,
      sidebarConfig,
      {
        allowExtend: false,
        allowExtendFromThirdParty: true,
        thirdPartyExtendId: `${this.getComponentId()}Parent`
      }
    );

    this.props.extendParentToolbar(toolbarExtend);
  }

  renderForEdit(v: Value, vs: Value, vd: Value): ReactNode {
    const className = classnames(
      "brz-ministryBrands",
      "brz-sermonLayout",
      css(this.getComponentId(), this.getId(), style(v, vs, vd))
    );

    return (
      <Toolbar
        {...this.makeToolbarPropsFromConfig2(
          toolbarTitle,
          sidebarMinistryBrandsMetaTitle,
          {
            allowExtend: false
          }
        )}
        selector=".brz-ministryBrands__item--meta-title"
      >
        <Toolbar
          {...this.makeToolbarPropsFromConfig2(
            toolbarConfig,
            sidebarMinistryBrandsMetaDate,
            {
              allowExtend: false
            }
          )}
          selector=".brz-ministryBrands__item--meta-date"
        >
          <Toolbar
            {...this.makeToolbarPropsFromConfig2(
              toolbarConfig,
              sidebarMinistryBrandsMetaCategory,
              {
                allowExtend: false
              }
            )}
            selector=".brz-ministryBrands__item--meta-category"
          >
            <Toolbar
              {...this.makeToolbarPropsFromConfig2(
                toolbarConfig,
                sidebarMinistryBrandsMetaGroup,
                {
                  allowExtend: false
                }
              )}
              selector=".brz-ministryBrands__item--meta-group"
            >
              <Toolbar
                {...this.makeToolbarPropsFromConfig2(
                  toolbarConfig,
                  sidebarMinistryBrandsMetaSeries,
                  {
                    allowExtend: false
                  }
                )}
                selector=".brz-ministryBrands__item--meta-series"
              >
                <Toolbar
                  {...this.makeToolbarPropsFromConfig2(
                    toolbarConfig,
                    sidebarMinistryBrandsMetaPreacher,
                    {
                      allowExtend: false
                    }
                  )}
                  selector=".brz-ministryBrands__item--meta-preacher"
                >
                  <Toolbar
                    {...this.makeToolbarPropsFromConfig2(
                      toolbarConfig,
                      sidebarMinistryBrandsMetaPassage,
                      {
                        allowExtend: false
                      }
                    )}
                    selector=".brz-ministryBrands__item--meta-passage"
                  >
                    <Toolbar
                      {...this.makeToolbarPropsFromConfig2(
                        toolbarLinksColor,
                        undefined,
                        {
                          allowExtend: false
                        }
                      )}
                      selector=".brz-sermonLayout__item :not(.brz-sermonLayout__item--meta--title, .brz-sermonLayout__item--detail-button, .brz-sermonLayout__item--media) a"
                    >
                      <Toolbar
                        {...this.makeToolbarPropsFromConfig2(
                          toolbarMedia,
                          undefined,
                          {
                            allowExtend: false
                          }
                        )}
                        selector=".brz-sermonLayout__item--media a"
                      >
                        <Toolbar
                          {...this.makeToolbarPropsFromConfig2(
                            toolbarPreview,
                            undefined,
                            {
                              allowExtend: false
                            }
                          )}
                          selector=".brz-sermonLayout__item--preview"
                        >
                          <Toolbar
                            {...this.makeToolbarPropsFromConfig2(
                              toolbarPagination,
                              undefined,
                              {
                                allowExtend: false
                              }
                            )}
                            selector=".brz-ministryBrands__pagination"
                          >
                            <Toolbar
                              {...this.makeToolbarPropsFromConfig2(
                                toolbarExtendFilters,
                                sidebarExtendFilters,
                                {
                                  allowExtend: false
                                }
                              )}
                              selector=".brz-sermonLayout__filter"
                            >
                              <Toolbar
                                {...this.makeToolbarPropsFromConfig2(
                                  toolbarExtendButtons,
                                  undefined,
                                  {
                                    allowExtend: false
                                  }
                                )}
                                selector=".brz-sermonLayout__item--detail-button"
                              >
                                <Toolbar
                                  {...this.makeToolbarPropsFromConfig2(
                                    toolbarImage,
                                    undefined,
                                    {
                                      allowExtend: false
                                    }
                                  )}
                                  selector=".brz-ministryBrands__item--media"
                                >
                                  <Toolbar
                                    {...this.makeToolbarPropsFromConfig2(
                                      toolbarMetaIcons,
                                      undefined,
                                      {
                                        allowExtend: false
                                      }
                                    )}
                                    selector=".brz-ministryBrands__meta--icons"
                                  >
                                    <Wrapper
                                      {...this.makeWrapperProps({
                                        className: "brz-sermonLayout__wrapper"
                                      })}
                                    >
                                      <DynamicContentHelper
                                        placeholder={getPlaceholder(v)}
                                        props={{ className }}
                                        blocked={false}
                                        tagName="div"
                                      />
                                    </Wrapper>
                                  </Toolbar>
                                </Toolbar>
                              </Toolbar>
                            </Toolbar>
                          </Toolbar>
                        </Toolbar>
                      </Toolbar>
                    </Toolbar>
                  </Toolbar>
                </Toolbar>
              </Toolbar>
            </Toolbar>
          </Toolbar>
        </Toolbar>
      </Toolbar>
    );
  }
}
