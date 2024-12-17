/* eslint-disable @typescript-eslint/no-unused-vars */
function cleanUndefined(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined || value !== null,
    ),
  );
}

export { cleanUndefined };
