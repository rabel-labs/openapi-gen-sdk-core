import z, { ZodType } from 'zod';

type TransformFunc<T extends ZodType> = Parameters<T['transform']>[0];
type TransformFuncArgs<T extends ZodType> = Parameters<TransformFunc<T>>;

type TransformPass<T extends ZodType> = {
  success: true;
  result: z.output<T>;
};

type TransformFail<T extends ZodType> = {
  success: false;
  error: {
    message: string;
  };
};

type TransformCheckFunc<T extends ZodType> = (
  value: TransformFuncArgs<T>[0],
  ctx?: TransformFuncArgs<T>[1],
) => TransformPass<T> | TransformFail<T>;

type TransformValidatorFunc<T extends ZodType> = (value: TransformFuncArgs<T>[0]) => boolean;

export const zodWithTransformativeCheck = <T extends ZodType>(
  schema: T,
  transformers: TransformCheckFunc<T>[],
  validator?: TransformValidatorFunc<T>,
) => {
  let vanillaSchema = schema;
  let transformedValue: T['_output'];
  //# Transform
  return vanillaSchema.transform((value, ctx) => {
    transformedValue = value;
    //# If validator is present, try to validate
    if (validator) {
      if (validator(transformedValue)) {
        return transformedValue;
      }
    }
    //# Else apply all transformers
    transformers.forEach((check) => {
      const checkResult = check(transformedValue, ctx);
      if (!checkResult.success) {
        ctx.addIssue({
          code: 'custom',
          message: checkResult.error.message,
        });
      } else {
        transformedValue = checkResult.result;
      }
    });
    return transformedValue;
  });
};
