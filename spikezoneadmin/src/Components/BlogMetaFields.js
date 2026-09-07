/**
 * The fields around a blog post that are not the post itself: the card image,
 * the summary, the search-result description and whether it is live yet.
 *
 * Shared by Blogs.js (create) and EditBlog.js (edit) so the two screens cannot
 * drift apart - they had already diverged once over the CKEditor config.
 *
 * Every field is optional. A post saved with all of them blank behaves exactly
 * as it did before these fields existed: the API derives the excerpt and the
 * meta description from the content.
 */
import { useEffect, useState } from "react";
import { FaImage, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

const EXCERPT_MAX = 300;
const META_MAX = 160;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // matches BlogImageUploadView
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function BlogMetaFields({
  title,
  imageFile,
  imageUrl,
  onImageChange,
  excerpt,
  onExcerptChange,
  metaDescription,
  onMetaDescriptionChange,
  status,
  onStatusChange,
  onError,
}) {
  const [preview, setPreview] = useState(null);

  // A freshly picked file has no URL yet, so read it locally for the preview
  // and revoke it afterwards - without the cleanup every re-pick leaks a blob.
  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const shown = preview || imageUrl || null;

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Checked here as well as on the server so the editor says why straight
    // away instead of after an upload that was going to be rejected.
    if (!IMAGE_TYPES.includes(file.type)) {
      onError("Please choose a JPG, PNG, WEBP or GIF image.");
      e.target.value = "";
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      onError("That image is larger than 5 MB. Please pick a smaller one.");
      e.target.value = "";
      return;
    }
    onImageChange(file);
  };

  const clearImage = () => {
    onImageChange(null);
  };

  const metaFallback = (excerpt || "").slice(0, META_MAX);

  return (
    <div className="blog-meta-grid">
      {/* ---------- featured image ---------- */}
      <div className="blog-meta-card">
        <label className="blog-meta-label">
          <FaImage /> Featured image
        </label>
        <p className="blog-meta-help">
          Shown on the Blogs page card and when the post is shared on WhatsApp
          or Facebook. Landscape works best. Optional.
        </p>

        {shown ? (
          <div className="blog-featured-preview">
            <img src={shown} alt="Featured" />
            <button
              type="button"
              className="blog-featured-remove"
              onClick={clearImage}
              title="Remove image"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <label className="blog-featured-drop">
            <FaImage />
            <span>Choose an image</span>
            <input
              type="file"
              accept={IMAGE_TYPES.join(",")}
              onChange={handleFile}
              hidden
            />
          </label>
        )}

        {shown && (
          <label className="blog-featured-replace">
            Replace image
            <input
              type="file"
              accept={IMAGE_TYPES.join(",")}
              onChange={handleFile}
              hidden
            />
          </label>
        )}
      </div>

      {/* ---------- excerpt + meta description ---------- */}
      <div className="blog-meta-card">
        <label className="blog-meta-label" htmlFor="blog-excerpt">
          Short summary
        </label>
        <p className="blog-meta-help">
          The two lines under the title on the Blogs page. Leave it blank and
          the start of the post is used.
        </p>
        <textarea
          id="blog-excerpt"
          className="blog-meta-input"
          rows={3}
          maxLength={EXCERPT_MAX}
          value={excerpt}
          placeholder="e.g. Pigeons on the balcony railing? Here is what actually keeps them off, and what only looks like it does."
          onChange={(e) => onExcerptChange(e.target.value)}
        />
        <div className="blog-meta-count">
          {excerpt.length}/{EXCERPT_MAX}
        </div>

        <label className="blog-meta-label mt-3" htmlFor="blog-meta-desc">
          Google description
        </label>
        <p className="blog-meta-help">
          The grey text under the link in Google results. Blank means the
          summary above is used.
        </p>
        <textarea
          id="blog-meta-desc"
          className="blog-meta-input"
          rows={2}
          maxLength={META_MAX}
          value={metaDescription}
          placeholder={metaFallback || "Describe the post in one sentence."}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
        />
        <div
          className={
            metaDescription.length > META_MAX - 10
              ? "blog-meta-count blog-meta-count-warn"
              : "blog-meta-count"
          }
        >
          {metaDescription.length}/{META_MAX}
        </div>

        {/* what the result actually looks like */}
        <div className="blog-serp-preview">
          <div className="blog-serp-url">spikezone.in › blogs</div>
          <div className="blog-serp-title">{title || "Blog title"}</div>
          <div className="blog-serp-desc">
            {metaDescription ||
              metaFallback ||
              "A description will be taken from the start of the post."}
          </div>
        </div>
      </div>

      {/* ---------- draft / published ---------- */}
      <div className="blog-meta-card">
        <label className="blog-meta-label">Visibility</label>
        <p className="blog-meta-help">
          A draft is saved but stays off the website. Nobody can reach it, even
          with the direct link.
        </p>
        <div className="blog-status-toggle">
          <button
            type="button"
            className={
              status === "published"
                ? "blog-status-btn is-active"
                : "blog-status-btn"
            }
            onClick={() => onStatusChange("published")}
          >
            <FaEye /> Published
          </button>
          <button
            type="button"
            className={
              status === "draft" ? "blog-status-btn is-active" : "blog-status-btn"
            }
            onClick={() => onStatusChange("draft")}
          >
            <FaEyeSlash /> Draft
          </button>
        </div>
      </div>
    </div>
  );
}
