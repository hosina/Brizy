import { t } from "visual/utils/i18n";
import { Switch } from "./types";

export const getAttr = (option: Switch, key: string): string => {
  return option === "on" ? `${key}='1'` : `${key}='0'`;
};

export const getFeatures = (option: Switch, placeholder: string) =>
  option === "on" ? `${placeholder}='${placeholder}'` : "";

export const getDetail = (placeholder: string): string =>
  encodeURI(placeholder);

export function changeContentVisibility({
  items,
  activeClassName,
  direction
}: {
  items: HTMLElement[];
  activeClassName: string;
  direction: "next" | "prev";
}) {
  let currentIndex = 0;

  items.forEach((item, index) => {
    if (item.classList.contains(activeClassName)) {
      switch (direction) {
        case "next": {
          currentIndex = index + 1;
          break;
        }
        case "prev": {
          currentIndex = index - 1;
          break;
        }
      }
      item.classList.remove(activeClassName);
    }
  });

  items[currentIndex].classList.add(activeClassName);
}

export const EkklesiaMessages = {
  event_calendar: t(
    "Ministry Content - Event Calendar - module fields have been updated."
  ),
  event_list: t(
    "Ministry Content - Event List - module fields have been updated."
  ),
  event_layout: t(
    "Ministry Content - Event Layout - module fields have been updated."
  ),
  event_detail: t(
    "Ministry Content - Event Detail - module fields have been updated."
  ),
  event_featured: t(
    "Ministry Content - Event Featured - module fields have been updated."
  ),
  form_widget: t(
    "Ministry Content - Form Widget - module fields have been updated."
  ),
  group_detail: t(
    "Ministry Content - Group Detail - module fields have been updated."
  ),
  group_featured: t(
    "Ministry Content - Group Featured - module fields have been updated."
  ),
  group_list: t(
    "Ministry Content - Group List - module fields have been updated."
  ),
  group_layout: t(
    "Ministry Content - Group Layout - module fields have been updated."
  ),
  group_slider: t(
    "Ministry Content - Group Slider - module fields have been updated."
  ),
  sermon_detail: t(
    "Ministry Content - Sermon Detail - module fields have been updated."
  ),
  sermon_featured: t(
    "Ministry Content - Sermon Featured - module fields have been updated."
  ),
  sermon_list: t(
    "Ministry Content - Sermon List - module fields have been updated."
  ),
  sermon_layout: t(
    "Ministry Content - Sermon Layout - module fields have been updated."
  )
};
