import React, { ReactElement, useMemo } from "react";
import { WithId } from "visual/types/attributes";
import { Item } from "./Item";

export interface Props<T> extends WithId<T> {
  src: string;
  onRemove?: (id: T) => void;
}

export function Thumbnail<T>({
  id,
  onRemove,
  src
}: Props<T>): ReactElement<Props<T>> {
  const style = useMemo(() => ({ backgroundImage: `url("${src}")` }), [src]);
  return (
    <Item<T>
      id={id}
      className="brz-ed-control__gallery__item--thumbnail"
      onRemove={onRemove}
    >
      <span
        style={style}
        className={"brz-ed-control__gallery__item--thumbnail__image"}
      />
    </Item>
  );
}
