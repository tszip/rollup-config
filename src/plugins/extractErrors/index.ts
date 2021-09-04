import { extractErrors, ExtractErrorOptions } from "./extractErrors";

export const errorExtraction = async (errorCodeOpts: ExtractErrorOptions) => {
  const findAndRecordErrorCodes = await extractErrors(errorCodeOpts);

  return {
    name: 'Extract errors',
    async transform(code: string) {
      try {
        await findAndRecordErrorCodes(code);
      } catch (e) {
        return null;
      }
      return { code, map: null };
    },
  };
}