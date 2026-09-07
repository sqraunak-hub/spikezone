// URL slug helpers.
//
// Categories have no `slug` column in the API yet (only `category_id` and
// `category_name`), so the storefront derives one from the name. Once the
// backend gains a real slug field these helpers should prefer `cat.slug`
// and fall back to the derived value.

// "Combos & Kits" -> "combos-kits"
export const slugify = (text) =>
  (text || "")
    .toString()
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Slug for a category object, tolerating both the current and future shape.
export const categorySlug = (category) =>
  category ? category.slug || slugify(category.category_name) : "";

// Strips every separator so legacy URLs still resolve:
// "Bird Spikes", "BirdSpikes" and "bird-spikes" all collapse to "birdspikes".
const loose = (text) =>
  (text || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");

export const findCategoryBySlug = (categories, slug) =>
  (categories || []).find(
    (cat) => loose(categorySlug(cat)) === loose(slug)
  ) || null;

// Matches a product's `category_name` against a slug from the URL.
export const productInCategory = (product, slug) =>
  loose(product?.category_name) === loose(slug);
