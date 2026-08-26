import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { r2, R2_BUCKET, publicUrlFor } from "@/lib/r2/client";
import { getUser } from "@/lib/supabase/auth";

const ALLOWED = ["image/webp", "image/jpeg", "image/png"] as const;

const bodySchema = z.object({
  files: z
    .array(
      z.object({
        contentType: z.enum(ALLOWED),
        variant: z.enum(["photo", "thumb"]),
      }),
    )
    .min(1)
    .max(6),
});

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const results = await Promise.all(
    parsed.data.files.map(async ({ contentType, variant }) => {
      const ext = contentType.split("/")[1];
      const key = `reports/${user.id}/${crypto.randomUUID()}-${variant}.${ext}`;

      const uploadUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          ContentType: contentType,
        }),
        { expiresIn: 60 * 5 },
      );

      return { key, uploadUrl, publicUrl: publicUrlFor(key), variant };
    }),
  );

  return NextResponse.json({ files: results });
}
