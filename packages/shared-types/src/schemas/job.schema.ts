import { z } from "zod";

export const RunJobsSchema = z.object({}).strict().default({});

export type RunJobsInput = z.infer<typeof RunJobsSchema>;
