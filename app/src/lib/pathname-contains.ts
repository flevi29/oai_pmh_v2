const TRIM_REGEX = /^[./]+|[./]+$/g;

export function pathnameContains(
  pathname: string,
  pathSegment: string,
): boolean {
  if (pathSegment === "/") {
    return pathname === pathSegment;
  }

  return pathname.indexOf(pathSegment.replace(TRIM_REGEX, "")) !== -1;
}
