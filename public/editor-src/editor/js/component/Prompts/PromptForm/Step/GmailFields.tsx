import React, { Component, ReactElement } from "react";
import { IS_PRO } from "visual/utils/env";
import { t } from "visual/utils/i18n";
import { Context } from "../../common/GlobalApps/Context";
import {
  BaseIntegrationContext,
  FormField
} from "../../common/GlobalApps/type";
import { HelperCopy } from "./common/HelperToolip";
import Smtp from "./common/Smtp";

const helper = {
  helper(fields: FormField[]): ReactElement {
    return (
      <HelperCopy
        descriptions={t("You can use these shortcodes in your email:")}
        fields={fields}
      />
    );
  }
};

const apiKeys = [
  {
    name: "emailTo",
    title: t("Email To"),
    required: true,
    helper: `<p class="brz-p">${t(
      "If you need to have multiple emails you can separate them by commas"
    )}:</p><p class="brz-p"><span class="brz-span">me@email.com,</span> <span class="brz-span">hi@email.com</span></p>`
  },
  {
    name: "subject",
    title: t("Subject"),
    ...(IS_PRO ? helper : {})
  },
  {
    name: "fromEmail",
    title: t("From Email")
  },
  {
    name: "fromName",
    title: t("From Name")
  },
  {
    name: "replayTo",
    title: t("Reply-To"),
    ...(IS_PRO ? helper : {})
  },
  {
    name: "cc",
    title: t("Cc")
  },
  {
    name: "bcc",
    title: t("Bcc")
  },
  {
    name: "metaData",
    title: t("Meta Data"),
    type: "search",
    multiple: true,
    choices: [
      { title: t("TIME"), value: "time" },
      { title: t("Page URL"), value: "pageUrl" },
      { title: t("User Agent"), value: "userAgent" },
      { title: t("Remote IP"), value: "remoteIp" },
      { title: t("Credit"), value: "credit" }
    ]
  },
  { name: "username", title: t("Username"), required: true },
  { name: "password", title: t("Password"), required: true }
];

type Props = {
  onClose: () => void;
};

class GmailFields extends Component<
  Props,
  Record<string, never>,
  BaseIntegrationContext
> {
  static contextType = Context;

  render(): ReactElement {
    return <Smtp {...this.props} {...this.context} apiKeys={apiKeys} />;
  }
}

export default GmailFields;
