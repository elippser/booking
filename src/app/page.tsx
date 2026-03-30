import { redirect } from "next/navigation";

const CONTEXT_PARAMS = [
  "companyId",
  "propertyId",
  "token",
  "spaceId",
  "theme",
  "accent",
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const k of CONTEXT_PARAMS) {
    const v = params[k];
    if (v && typeof v === "string") qs.set(k, v);
  }
  redirect(qs.toString() ? `/panel?${qs}` : "/panel");
}
