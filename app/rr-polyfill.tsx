import {
  NavLink as RemixNavLink,
  useResolvedPath,
  useTransition,
} from "@remix-run/react";
import { useMemo } from "react";

type ExtractProps<TComponentOrTProps> =
  TComponentOrTProps extends React.ComponentType<infer TProps>
    ? TProps
    : TComponentOrTProps;

export function NavLink({
  className,
  ...props
}: Omit<ExtractProps<typeof RemixNavLink>, "className"> & {
  className?:
    | string
    | ((props: { isActive: boolean; isPending: boolean }) => string);
}) {
  let path = useResolvedPath(props.to);
  let transition = useTransition();

  let end = props.end;
  let isPending = useMemo(() => {
    if (transition && transition.location) {
      if (end) {
        return transition.location.pathname === path.pathname;
      }
      return transition.location.pathname.startsWith(path.pathname);
    }
    return false;
  }, [transition, path, end]);

  return (
    <RemixNavLink
      className={useMemo(() => {
        if (!className || typeof className !== "function") return className;
        return ({ isActive }) => className({ isActive, isPending });
      }, [className, isPending])}
      {...props}
    />
  );
}
