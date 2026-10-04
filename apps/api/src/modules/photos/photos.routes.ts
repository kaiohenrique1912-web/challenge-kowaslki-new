import { Elysia } from "elysia";
import { parsePhotoFileName, renderPlaceholderPhoto } from "./placeholder-photo.ts";

/** GET /static/photos/{room}-{variant}.svg — fotos placeholder dos imóveis do seed. */
export const photosRoutes = new Elysia().get("/static/photos/:file", ({ params, set }) => {
  const parsed = parsePhotoFileName(params.file);
  if (!parsed) {
    set.status = 404;
    return "Foto não encontrada";
  }
  set.headers["content-type"] = "image/svg+xml; charset=utf-8";
  set.headers["cache-control"] = "public, max-age=31536000, immutable";
  return renderPlaceholderPhoto(parsed.room, parsed.variant);
});
