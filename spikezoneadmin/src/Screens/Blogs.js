// BlogEditor.js using CKEditor 5
import { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import slugify from "slugify";
import { ToastContainer, toast } from "react-toastify";
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
import { FaEye, FaSave, FaEdit, FaListUl } from "react-icons/fa";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";

import { API_BASE_URL } from "../Utils/appConstant";

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
              Authorization: `Bearer ${token}`, // Use the token from localStorage
            },
            body: data,
          })
            .then((res) => res.json())
            .then((res) => ({
              default: res.image_url, // image_url should be returned by Django
            }));
        });
      },
    };
  };
}

const LICENSE_KEY = "GPL";

export default function Blogs() {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const editorWordCountRef = useRef(null);

  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

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
              feed: [
                /* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
              ],
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

  const showApiErrors = (error) => {
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

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.warning("Please enter a blog title first.");
      return;
    }
    if (!content.trim()) {
      toast.warning("Blog content is empty — write something before publishing.");
      return;
    }
    try {
      const slug = slugify(title, { lower: true, strict: true });

      const payload = {
        title: title,
        slug: slug,
        content: content,
      };

      await axios.post(`${API_BASE_URL}blogs/`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Blog published! It is now live on the website.");
      setTitle("");
      setContent("");
      setPreviewMode(false);
    } catch (error) {
      console.error("Error publishing blog:", error);
      showApiErrors(error);
    }
  };

  const slugPreview = title
    ? slugify(title, { lower: true, strict: true })
    : "";

  return (
    <div className="main-container">
      <ToastContainer position="top-center" />

      {/* page header */}
      <div className="blog-page-head">
        <div>
          <h2>Create Blog</h2>
          <p>
            Write your article below and hit <b>Publish</b> — it will instantly
            appear on the website&apos;s Blogs page.
          </p>
        </div>
        <RouterLink to="/blogList" className="blog-head-link">
          <FaListUl /> All Blogs
        </RouterLink>
      </div>

      {/* step 1 — title */}
      <div className="blog-step-card">
        <div className="blog-step-label">
          <span className="blog-step-num">1</span> Blog Title
        </div>
        <input
          type="text"
          placeholder="e.g. 5 Ways to Keep Pigeons Away from Your Balcony"
          className="blog-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {slugPreview && (
          <p className="blog-slug-preview">
            Page link will be:{" "}
            <code>spikezone.in/blogs/{slugPreview}</code>
          </p>
        )}
      </div>

      {/* step 2 — content */}
      <div className="blog-step-label mb-2">
        <span className="blog-step-num">2</span> Blog Content
        <span className="blog-step-hint">
          — use the toolbar for headings, images, lists etc.
        </span>
      </div>

      {!previewMode ? (
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
      ) : (
        <div className="blog-preview">
          <h3>{title}</h3>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}

      {/* step 3 — publish */}
      <div className="editor-buttons">
        <button className="btn-preview" onClick={() => setPreviewMode((prev) => !prev)}>
          {previewMode ? (
            <>
              <FaEdit /> Back to Editing
            </>
          ) : (
            <>
              <FaEye /> Preview
            </>
          )}
        </button>
        <button className="btn-publish" onClick={handlePublish}>
          <FaSave /> Publish Blog
        </button>
      </div>
    </div>
  );
}
