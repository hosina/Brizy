import React, { ReactElement, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import Radio, { RadioItem } from "visual/component/Controls/Radio";
import Fixed from "visual/component/Prompts/Fixed";
import { reducer } from "visual/component/Prompts/PromptPageArticle/reducer";
import {
  setBlog,
  setLayout,
  setTitle
} from "visual/component/Prompts/PromptPageArticle/types/Setters";
import { EmptyContentWithDefaults } from "visual/component/Prompts/common/PromptPage/EmptyContent";
import { HeaderFooterField } from "visual/component/Prompts/common/PromptPage/HeaderFooterField";
import {
  cancel,
  save,
  switchTab
} from "visual/component/Prompts/common/states/Classic/types/Actions";
import { useStateReducer } from "visual/component/Prompts/common/states/Classic/useStateReducer";
import {
  getChoices,
  getTabsByItemsNumber
} from "visual/component/Prompts/utils";
import Config from "visual/global/Config";
import { isCloud, isShopify } from "visual/global/Config/types/configs/Cloud";
import {
  ShopifyTemplate,
  getShopifyTemplate
} from "visual/global/Config/types/shopify/ShopifyTemplate";
import { updatePageLayout, updatePageTitle } from "visual/redux/actions2";
import {
  getPageRelations,
  shopifyBlogItems,
  shopifySyncArticle
} from "visual/utils/api";
import { isNonEmptyArray } from "visual/utils/array/types";
import { t } from "visual/utils/i18n";
import { Button } from "../common/Button";
import { Content } from "../common/Content";
import { Header } from "../common/Header";
import { Input } from "../common/PromptPage/Input";
import { Tabs } from "../common/PromptPage/types";
import { Props, Valid } from "./types";

export const PromptPageArticle = (props: Props): ReactElement => {
  const _config = Config.getAll();

  const templateType = useMemo(() => {
    return getShopifyTemplate(_config) ?? ShopifyTemplate.Product;
  }, [_config]);

  const {
    headTitle,
    pageTitle,
    opened,
    selectedLayout,
    onClose,
    onSave,
    onAfterSave
  } = props;

  const { value } = selectedLayout || { value: undefined };

  const dispatch = useDispatch();

  const handleSave = useCallback(
    ({ selected, title, layout }: Valid): Promise<void> => {
      dispatch(updatePageLayout(layout));
      dispatch(updatePageTitle(title));

      return onSave()
        .then(() => {
          return shopifySyncArticle(selected.id, selected.title, title).then(
            () => {
              if (typeof onAfterSave === "function") {
                onAfterSave();
              }
            }
          );
        })
        .then(() => undefined);
    },
    [dispatch, onSave, onAfterSave]
  );
  const getData = useCallback(async () => {
    const config = Config.getAll();
    if (isCloud(config) && isShopify(config)) {
      const selectedP = getPageRelations(config).then((is) =>
        is.map((i) => i.blog_id || i.id)
      );
      const itemsP = shopifyBlogItems();

      const [items, selected] = await Promise.all([itemsP, selectedP]);
      const layouts = getChoices(config);

      if (isNonEmptyArray(layouts)) {
        return {
          items,
          layouts,
          selected: items.find((i) => i.id === selected[0]),
          title: pageTitle,
          layout: value ?? layouts[0].id,
          error: undefined
        };
      }
    }

    return Promise.reject();
  }, [pageTitle, value]);

  const [state, dispatchS] = useStateReducer(
    reducer,
    getData,
    handleSave,
    onClose
  );

  const footer = (
    <>
      <Button
        size={3}
        loading={state.type === "Canceling"}
        onClick={(): void => dispatchS(cancel())}
      >
        {t("Cancel")}
      </Button>
      <Button
        color="teal"
        size={3}
        loading={state.type === "Saving"}
        onClick={(): void => dispatchS(save())}
      >
        {t("Save")}
      </Button>
    </>
  );

  const content: () => ReactElement = () => {
    switch (state.type) {
      case "Loading":
        return <Content head={headTitle} loading={true} />;
      case "Err":
        return <Content head={headTitle} error={state.payload.message} />;
      case "Ready":
      case "Saving":
      case "Canceling":
      case "Canceled": {
        const { items } = state.payload;

        switch (state.payload.activeTab) {
          case Tabs.settings:
            if (!items.length) {
              return <EmptyContentWithDefaults type={templateType} />;
            }

            return (
              <Content
                head={headTitle}
                error={state.payload.error}
                inlineFooter={true}
                footer={footer}
              >
                <Input
                  value={state.payload.title ?? ""}
                  onChange={(s): void => dispatchS(setTitle(s))}
                  placeholder={t("Page title")}
                />
                <HeaderFooterField
                  value={state.payload.layout}
                  layouts={state.payload.layouts}
                  onChange={(v): void => dispatchS(setLayout(v))}
                />
                <Radio
                  className="brz-ed-popup-integrations-option__radio"
                  defaultValue={state.payload.selected?.id}
                  onChange={(v: string): void => dispatchS(setBlog(v))}
                >
                  {items.map(({ title, id }) => {
                    return (
                      <RadioItem checkIcon="active" value={id} key={id}>
                        {title}
                      </RadioItem>
                    );
                  })}
                </Radio>
              </Content>
            );
        }
      }
    }
  };

  const tabs = getTabsByItemsNumber(state);

  return (
    <Fixed opened={opened} onClose={onClose}>
      <div className="brz-ed-popup-wrapper">
        <Header
          tabs={tabs.map((tab) => ({
            ...tab,
            active: tab.id === state.payload.activeTab,
            onClick: (): void => dispatchS(switchTab(tab.id))
          }))}
          onClose={onClose}
        />
        {content()}
      </div>
    </Fixed>
  );
};
