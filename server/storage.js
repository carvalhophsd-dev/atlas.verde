import { createClient } from "@supabase/supabase-js";

export function createObjectStorage() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "atlas-vectors";

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      enabled: false,
      provider: "local",
      async uploadGeoJson() {
        return null;
      }
    };
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return {
    enabled: true,
    provider: "supabase",
    async uploadGeoJson({ id, filename, buffer }) {
      const storagePath = `bases/${id}/${filename}`;
      const { error } = await client.storage.from(bucket).upload(storagePath, buffer, {
        contentType: "application/geo+json",
        upsert: true
      });

      if (error) throw error;

      const { data } = client.storage.from(bucket).getPublicUrl(storagePath);
      return {
        bucket,
        path: storagePath,
        publicUrl: data.publicUrl
      };
    }
  };
}
