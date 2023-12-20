import classnames from "classnames";
import React, { FC, HTMLAttributes } from "react";

export interface Props {
  display: "inline" | "block";
  className?: string;
  attr?: HTMLAttributes<HTMLDivElement>;
}

export const Main: FC<Props> = (props) => {
  const { className: _className, attr, display, children } = props;
  const className = classnames(
    "brz-ed-option__prompt-popup",
    `brz-ed-option__${display}`,
    _className,
    attr?.className
  );

  return (
    <div {...attr} className={className}>
      {children}
    </div>
  );
};
