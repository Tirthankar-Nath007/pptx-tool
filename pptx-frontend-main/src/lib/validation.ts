import { z } from "zod";

export const MAX_CHARS = {
  change: 40,
  brief: 84,
  impact: 75,
  effort: 2,
  eta: 10,
  remarks: 54,
} as const;

export const rowSchema = z.object({
  change: z.string().min(1, "Change is required").max(MAX_CHARS.change, `Max ${MAX_CHARS.change} characters`),
  brief: z.string().min(1, "Brief about change is required").max(MAX_CHARS.brief, `Max ${MAX_CHARS.brief} characters`),
  impact: z.string().min(1, "What is the impact is required").max(MAX_CHARS.impact, `Max ${MAX_CHARS.impact} characters`),
  effort: z.string().min(1, "Dev effort is required").max(MAX_CHARS.effort, `Max ${MAX_CHARS.effort} characters`),
  eta: z.string().min(1, "Gone Live/ETA is required").max(MAX_CHARS.eta, `Max ${MAX_CHARS.eta} characters`),
  remarks: z.string().min(1, "Remarks are required").max(MAX_CHARS.remarks, `Max ${MAX_CHARS.remarks} characters`),
  status: z.string().min(1, "Status is required"),
});

export type RowValidationErrors = {
  [K in keyof typeof MAX_CHARS]?: string;
} & Record<string, string | undefined>;

export const validateRow = (row: z.infer<typeof rowSchema>): RowValidationErrors => {
  const result = rowSchema.safeParse(row);
  const errors: Record<string, string | undefined> = {};

  if (!result.success) {
    result.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      errors[field] = err.message;
    });
  }

  return errors as RowValidationErrors;
};

export const validateAllRows = (rows: z.infer<typeof rowSchema>[]): RowValidationErrors[] => {
  return rows.map(validateRow);
};

export const hasValidationErrors = (errors: RowValidationErrors[]): boolean => {
  return errors.some((rowErrors) => Object.keys(rowErrors).length > 0);
};
