import { pipe } from "@/utils/fp/pipe";
import { Num, Obj, Str } from "@brizy/readers";
import { flatten, uniq, upperFirst } from "lodash";
import {
  APIPopup,
  BlockWithThumbs,
  Categories,
  CustomTemplatePage,
  DefaultBlock,
  DefaultBlockWithID,
  Kit,
  KitDataResult,
  KitType,
  LayoutDataResult,
  LayoutsAPI,
  LayoutsPageAPI,
  LayoutTemplateWithThumbs
} from "../types/DefaultTemplate";

const PRO = "PRO";

type CatTypes = Kit | APIPopup;

export const getUniqueKitCategories = (collections: CatTypes[]): Categories[] =>
  pipe(
    (collections: CatTypes[]) =>
      collections.map((collection: CatTypes) => collection.categories),
    (categories) => categories.map((category) => category.split(",")),
    flatten,
    (categories2) => categories2.map((category2) => category2.trim()),
    uniq,
    (allCats) => allCats.filter((cat) => cat && cat.length),
    (cats) =>
      cats.map((cat) => ({
        title: upperFirst(cat),
        slug: cat,
        id: cat
      }))
  )(collections);

export const getUniqueKitTypes = (collections: Kit[]): KitType[] =>
  pipe(
    (collections: Kit[]) => collections.map((collection) => collection.theme),
    (types) => types.map((type) => type.split(",")),
    flatten,
    (types2) => types2.map((type2) => type2.toLowerCase()),
    uniq,
    (allTypes) => allTypes.filter((type) => type && type.length),
    (uni) =>
      uni.map((u) => ({
        title: upperFirst(u),
        id: u,
        name: u,
        icon: u === "light" ? "nc-light" : "nc-dark"
      }))
  )(collections);

export const converterKit = (
  kit: Kit[],
  url: string,
  kitId: string
): {
  blocks: BlockWithThumbs[];
  categories: Categories[];
  types: KitType[];
} => {
  const categories = getUniqueKitCategories(kit);
  const types = getUniqueKitTypes(kit);

  const blocks: BlockWithThumbs[] = kit.map(
    ({
      slug,
      categories,
      pro,
      thumbnail,
      keywords,
      thumbnailWidth,
      thumbnailHeight,
      blank,
      theme
    }) => ({
      id: slug,
      cat: categories.split(",").map((item) => item.trim().toLowerCase()),
      title: slug,
      type: theme
        .split(",")
        .map((item) => item.trim())
        .map((i1) => i1.toLowerCase()),
      keywords: keywords ?? "",
      thumbnailHeight,
      thumbnailWidth,
      thumbnailSrc: `${url}${thumbnail}`,
      pro: pro === PRO,
      kitId,
      blank
    })
  );

  return {
    blocks,
    categories,
    types
  };
};

export const convertLayouts = (
  collections: LayoutsAPI[],
  thumbUrl: string
): LayoutTemplateWithThumbs[] =>
  collections.map(
    ({
      title,
      categories,
      pagesCount,
      pro,
      keywords,
      thumbnailWidth,
      thumbnailHeight,
      thumbnail,
      slug
    }) => ({
      name: title,
      cat: categories.split(",").map((item) => item.trim().toLowerCase()),
      pagesCount: Num.read(pagesCount) ?? 0,
      pro: pro === PRO,
      keywords,
      thumbnailWidth,
      thumbnailHeight,
      thumbnailSrc: `${thumbUrl}${thumbnail}`,
      layoutId: slug
    })
  );

export const convertLayoutPages = (
  layouts: LayoutsPageAPI[],
  templatesImageUrl: string,
  id: string
): CustomTemplatePage[] =>
  layouts.map(
    ({
      slug,
      title,
      thumbnailHeight,
      thumbnailWidth,
      thumbs
    }: LayoutsPageAPI) => ({
      id: slug,
      title,
      thumbnailWidth,
      thumbnailHeight,
      thumbnailSrc: `${templatesImageUrl}${thumbs}`,
      layoutId: id
    })
  );

export const convertToCategories = (
  obj: { slug: string; title: string }[]
): Categories[] =>
  obj.map((item) => ({
    ...item,
    id: item.title.toLowerCase()
  }));

export const isKitDataResult = (obj: unknown): obj is KitDataResult => {
  return (
    Obj.isObject(obj) &&
    Obj.hasKey("collection", obj) &&
    Array.isArray(obj.collection) &&
    obj.collection.every(
      (item: unknown) =>
        Obj.isObject(item) &&
        Obj.hasKey("pageData", item) &&
        typeof item.pageData === "string"
    )
  );
};

export const isDefaultBlock = (obj: unknown): obj is DefaultBlock => {
  return (
    Obj.isObject(obj) &&
    Obj.hasKey("type", obj) &&
    Str.is(obj.type) &&
    Obj.hasKey("value", obj) &&
    Obj.isObject(obj.value)
  );
};

export const isDefaultBlockWithID = (
  obj: unknown
): obj is DefaultBlockWithID => {
  return Obj.isObject(obj) && Obj.hasKey("blockId", obj) && isDefaultBlock(obj);
};

export const isDefaultBlockWithIDArray = (
  obj: unknown
): obj is DefaultBlockWithID[] => {
  return Array.isArray(obj) && obj.every((item) => isDefaultBlockWithID(item));
};

export const isLayoutDataResult = (obj: unknown): obj is LayoutDataResult => {
  return (
    Array.isArray(obj) &&
    obj.every(
      (item) =>
        Obj.isObject(item) &&
        Obj.hasKey("pageData", item) &&
        Str.is(item.pageData)
    )
  );
};
