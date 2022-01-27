/**
 * Get the depth level of a table by parsing the reference text.
 *
 * Example:
 * For `foo.bar.foo` method will return: `3`
 * @param tableExpr a string containing the full table expression: `foo.bar.foo`
 * @returns
 */
export function tableDepthLevel(tableExpr: string): number {
    return tableExpr ? tableExpr.replace(/\.$/, "").split(".").length + 1 : 0;
}
