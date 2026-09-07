import React, { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import slugify from "slugify";
import { toast } from "react-toastify";
import {
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  Bookmark,
  Code,
  CodeBlock,
  Emoji,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  Fullscreen,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  PageBreak,
  Paragraph,
  PasteFromMarkdownExperimental,
  PasteFromOffice,
  RemoveFormat,
  ShowBlocks,
  SimpleUploadAdapter,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TextTransformation,
  Title,
  TodoList,
  Underline,
  WordCount,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "../Assets/css/blog-editor.css";
import { FaSave } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import { API_BASE_URL } from "../Utils/appConstant";
import BlogMetaFields from "../Components/BlogMetaFields";

function CustomUploadAdapterPlugin(editor) {
  const token = localStorage.getItem("token");
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return {
      upload: () => {
        return loader.file.then((file) => {
          const data = new FormData();
          data.append("image", file);

          return fetch(`${API_BASE_URL}blogUpload/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: data,
          })
            .then((res) => res.json())
            .then((res) => ({
              default: res.image_url,
            }));
        });
      },
    };
  };
}

const LICENSE_KEY = "GPL";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const editorWordCountRef = useRef(null);

  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [featuredImage, setFeaturedImage] = useState(null);   // newly picked file
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imageCleared, setImageCleared] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState("published");

  const showApiErrors = (error) => {
    // A dead session is the most common failure here and the API's own words
    // for it ("Given token not valid for any token type") mean nothing to the
    // person who just lost an hour of writing. Say what actually happened.
    if (error?.response?.status === 401) {
      toast.error(
        "Aapki login session khatam ho gayi. Ye page band mat kijiye - " +
          "nayi tab me admin.spikezone.in/login kholiye (seedha /login), "
          + "login kijiye, phir yahan wapas aakar dobara Save dabaiye.",
        { autoClose: false }
      );
      return;
    }
    if (error?.response?.data) {
      const data = error.response.data;
      Object.keys(data).forEach((key) => {
        const val = data[key];
        if (Array.isArray(val)) {
          val.forEach((msg) => toast.error(`${key}: ${msg}`));
        } else {
          toast.error(`${key}: ${val}`);
        }
      });
    } else if (error?.message) {
      toast.error(error.message);
    } else {
      toast.error("An unknown error occurred.");
    }
  };

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  // Fetch blog data by id
  useEffect(() => {
    async function fetchBlog() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}blogs/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTitle(response.data.title);
        setContent(response.data.content);
        setExistingImageUrl(response.data.featured_image || null);
        // the raw values, not the display_* fallbacks - the editor has to show
        // what was actually typed, otherwise saving would turn a derived
        // excerpt into a stored one
        setExcerpt(response.data.excerpt || "");
        setMetaDescription(response.data.meta_description || "");
        setStatus(response.data.status || "published");
      } catch (error) {
        showApiErrors(error);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) return {};

    return {
      editorConfig: {
        extraPlugins: [CustomUploadAdapterPlugin],
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "sourceEditing",
            "showBlocks",
            "findAndReplace",
            "textPartLanguage",
            "fullscreen",
            "|",
            "heading",
            "style",
            "|",
            "fontSize",
            "fontFamily",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "subscript",
            "superscript",
            "code",
            "removeFormat",
            "|",
            "emoji",
            "specialCharacters",
            "horizontalLine",
            "pageBreak",
            "link",
            "bookmark",
            "insertImage",
            "mediaEmbed",
            "insertTable",
            "highlight",
            "blockQuote",
            "codeBlock",
            "htmlEmbed",
            "|",
            "alignment",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          Autosave,
          BalloonToolbar,
          BlockQuote,
          BlockToolbar,
          Bold,
          Bookmark,
          Code,
          CodeBlock,
          Emoji,
          Essentials,
          FindAndReplace,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          FullPage,
          Fullscreen,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          HorizontalLine,
          HtmlComment,
          HtmlEmbed,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          PageBreak,
          Paragraph,
          PasteFromMarkdownExperimental,
          PasteFromOffice,
          RemoveFormat,
          ShowBlocks,
          SimpleUploadAdapter,
          SourceEditing,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
          Style,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextPartLanguage,
          TextTransformation,
          Title,
          TodoList,
          Underline,
          WordCount,
        ],
        balloonToolbar: [
          "bold",
          "italic",
          "|",
          "link",
          "insertImage",
          "|",
          "bulletedList",
          "numberedList",
        ],
        blockToolbar: [
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "bold",
          "italic",
          "|",
          "link",
          "insertImage",
          "insertTable",
          "|",
          "bulletedList",
          "numberedList",
          "outdent",
          "indent",
        ],
        fontFamily: {
          supportAllValues: true,
        },
        fontSize: {
          options: [10, 12, 14, "default", 18, 20, 22],
          supportAllValues: true,
        },
        fullscreen: {
          onEnterCallback: (container) =>
            container.classList.add(
              "editor-container",
              "editor-container_classic-editor",
              "editor-container_include-style",
              "editor-container_include-block-toolbar",
              "editor-container_include-word-count",
              "editor-container_include-fullscreen",
              "main-container"
            ),
        },
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
            {
              model: "heading5",
              view: "h5",
              title: "Heading 5",
              class: "ck-heading_heading5",
            },
            {
              model: "heading6",
              view: "h6",
              title: "Heading 6",
              class: "ck-heading_heading6",
            },
          ],
        },
        htmlSupport: {
          allow: [
            {
              name: /^.*$/,
              styles: true,
              attributes: true,
              classes: true,
            },
          ],
        },
        image: {
          toolbar: [
            "toggleImageCaption",
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
          ],
        },
        initialData: "",
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
          decorators: {
            toggleDownloadable: {
              mode: "manual",
              label: "Downloadable",
              attributes: {
                download: "file",
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        mention: {
          feeds: [
            {
              marker: "@",
              feed: [],
            },
          ],
        },
        placeholder: "Type or paste your content here!",
        style: {
          definitions: [
            {
              name: "Article category",
              element: "h3",
              classes: ["category"],
            },
            {
              name: "Title",
              element: "h2",
              classes: ["document-title"],
            },
            {
              name: "Subtitle",
              element: "h3",
              classes: ["document-subtitle"],
            },
            {
              name: "Info box",
              element: "p",
              classes: ["info-box"],
            },
            {
              name: "CTA Link Primary",
              element: "a",
              classes: ["button", "button--green"],
            },
            {
              name: "CTA Link Secondary",
              element: "a",
              classes: ["button", "button--black"],
            },
            {
              name: "Marker",
              element: "span",
              classes: ["marker"],
            },
            {
              name: "Spoiler",
              element: "span",
              classes: ["spoiler"],
            },
          ],
        },
        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableProperties",
            "tableCellProperties",
          ],
        },
      },
    };
  }, [isLayoutReady]);

  const handleSave = async () => {
    try {
      const slug = slugify(title, { lower: true, strict: true });
      const fields = {
        title,
        slug,
        content,
        excerpt,
        meta_description: metaDescription,
        status,
      };

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // PATCH rather than PUT: a partial update leaves the existing image
      // alone when none was picked, instead of needing every field resent.
      let payload;
      if (featuredImage) {
        payload = new FormData();
        Object.entries(fields).forEach(([k, v]) => payload.append(k, v));
        payload.append("featured_image", featuredImage);
        delete headers["Content-Type"];
      } else if (imageCleared) {
        payload = { ...fields, featured_image: null };
      } else {
        payload = fields;
      }

      await axios.patch(`${API_BASE_URL}blogs/${id}/`, payload, { headers });
      alert(
        status === "draft"
          ? "Saved as draft — this post is no longer on the website."
          : "Blog updated successfully!"
      );
      navigate("/blogList");
    } catch (error) {
      // was a bare "Failed to update blog." for every cause, including an
      // expired session - which told the person nothing about what to do
      console.error(error);
      showApiErrors(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="main-container">
      <h2 className="text-2xl font-bold mb-3">Edit Blog</h2>
      <input
        type="text"
        placeholder="Enter blog title..."
        className="blog-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div
        className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar editor-container_include-word-count editor-container_include-fullscreen"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor" ref={editorRef}>
          {editorConfig && (
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={content}
            onReady={(editor) => {
              const wordCount = editor.plugins.get("WordCount");
              if (wordCount && editorWordCountRef.current) {
                editorWordCountRef.current.innerHTML = "";
                editorWordCountRef.current.appendChild(
                  wordCount.wordCountContainer
                );
              }
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
            }}
          />
          )}
        </div>
        <div
          className="editor_container__word-count"
          ref={editorWordCountRef}
        ></div>
      </div>
      <BlogMetaFields
        title={title}
        imageFile={featuredImage}
        imageUrl={existingImageUrl}
        onImageChange={(file) => {
          setFeaturedImage(file);
          if (!file) {
            // clearing the picker also means "remove what is on the server"
            setExistingImageUrl(null);
            setImageCleared(true);
          } else {
            setImageCleared(false);
          }
        }}
        excerpt={excerpt}
        onExcerptChange={setExcerpt}
        metaDescription={metaDescription}
        onMetaDescriptionChange={setMetaDescription}
        status={status}
        onStatusChange={setStatus}
        onError={(msg) => alert(msg)}
      />

      <div className="editor-buttons">
        <button onClick={handleSave}>
          <FaSave /> Save Changes
        </button>
      </div>
    </div>
  );
}
