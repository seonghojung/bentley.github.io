// @ 게시글 상세 페이지 로더
// BEGIN: 마크다운 게시글 로드 및 파싱
(function() {
  "use strict";

  // BEGIN: URL 파라미터에서 파일명 추출 함수
  function getFileNameFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("file");
    } catch (error) {
      console.error("URL 파라미터 추출 중 오류 발생:", error);
      return null;
    }
  }
  // END: URL 파라미터에서 파일명 추출 함수

  // BEGIN: Front Matter 파싱 함수
  function parseFrontMatter(content) {
    try {
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      let metadata = {};
      let postContent = content;

      if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1];
        postContent = frontMatterMatch[2];

        // - Front Matter 라인 파싱
        const lines = frontMatter.split("\n");
        lines.forEach(function(line) {
          const colonIndex = line.indexOf(":");
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();

            // - 따옴표 제거
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }

            // - 배열 파싱 (tags)
            if (key === "tags" && value.startsWith("[") && value.endsWith("]")) {
              try {
                value = JSON.parse(value);
              } catch {
                value = value
                  .slice(1, -1)
                  .split(",")
                  .map(function(tag) {
                    return tag.trim().replace(/^['"]|['"]$/g, "");
                  });
              }
            }

            metadata[key] = value;
          }
        });
      }

      return {
        metadata: metadata,
        content: postContent
      };
    } catch (error) {
      console.error("Front Matter 파싱 중 오류 발생:", error);
      return {
        metadata: {},
        content: content
      };
    }
  }
  // END: Front Matter 파싱 함수

  // BEGIN: 날짜 포맷팅 함수
  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
    } catch (error) {
      console.error("날짜 포맷팅 중 오류 발생:", error);
      return dateString;
    }
  }
  // END: 날짜 포맷팅 함수

  // BEGIN: 태그 렌더링 함수
  function renderTags(tags) {
    try {
      if (!tags || tags.length === 0) {
        return "";
      }

      let tagsHtml = "";
      tags.forEach(function(tag) {
        tagsHtml += '<span class="tag">' + tag + "</span>";
      });
      return '<div class="post-tags">' + tagsHtml + "</div>";
    } catch (error) {
      console.error("태그 렌더링 중 오류 발생:", error);
      return "";
    }
  }
  // END: 태그 렌더링 함수

  // BEGIN: 마크다운을 HTML로 변환 함수
  function convertMarkdownToHtml(markdown) {
    try {
      if (typeof marked === "undefined") {
        console.error("marked.js가 로드되지 않았습니다.");
        return markdown;
      }

      // - marked.js 설정
      marked.setOptions({
        breaks: true,
        gfm: true
      });

      return marked.parse(markdown);
    } catch (error) {
      console.error("마크다운 변환 중 오류 발생:", error);
      return markdown;
    }
  }
  // END: 마크다운을 HTML로 변환 함수

  // BEGIN: 코드 하이라이팅 적용 함수
  function applyCodeHighlighting() {
    try {
      if (typeof Prism !== "undefined") {
        Prism.highlightAll();
      }
    } catch (error) {
      console.error("코드 하이라이팅 적용 중 오류 발생:", error);
    }
  }
  // END: 코드 하이라이팅 적용 함수

  // BEGIN: Giscus 댓글 로드 함수
  function loadGiscus() {
    try {
      const container = document.getElementById("giscusContainer");
      if (!container) {
        return;
      }

      // - 기존 스크립트 제거
      const existingScript = document.querySelector("script[src*='giscus']");
      if (existingScript) {
        existingScript.remove();
      }

      // - Giscus 스크립트 생성
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.setAttribute("data-repo", "{your_github_username}/{your_github_username}.github.io");
      script.setAttribute("data-repo-id", "YOUR_REPO_ID");
      script.setAttribute("data-category", "General");
      script.setAttribute("data-category-id", "YOUR_CATEGORY_ID");
      script.setAttribute("data-mapping", "pathname");
      script.setAttribute("data-strict", "0");
      script.setAttribute("data-reactions-enabled", "1");
      script.setAttribute("data-emit-metadata", "1");
      script.setAttribute("data-input-position", "bottom");
      script.setAttribute("data-theme", "preferred_color_scheme");
      script.setAttribute("data-lang", "ko");
      script.setAttribute("crossorigin", "anonymous");
      script.async = true;

      container.appendChild(script);
    } catch (error) {
      console.error("Giscus 로드 중 오류 발생:", error);
    }
  }
  // END: Giscus 댓글 로드 함수

  // BEGIN: 게시글 렌더링 함수
  function renderPost(metadata, htmlContent) {
    try {
      const container = document.getElementById("postContainer");
      if (!container) {
        return;
      }

      const title = metadata.title || "제목 없음";
      const date = metadata.date ? formatDate(metadata.date) : "";
      const category = metadata.category || "";
      const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
      const tagsHtml = renderTags(tags);
      const categoryHtml = category ? '<span class="post-category">' + category + "</span>" : "";

      // - 페이지 제목 업데이트
      document.title = title + " - 블로그";

      // - 게시글 HTML 생성
      const postHtml = (
        '<div class="post-header">' +
        '<h1>' + title + "</h1>" +
        '<div class="post-meta">' +
        (date ? '<span class="post-date">' + date + "</span>" : "") +
        categoryHtml +
        "</div>" +
        tagsHtml +
        "</div>" +
        '<div class="post-content">' + htmlContent + "</div>"
      );

      container.innerHTML = postHtml;

      // - 코드 하이라이팅 적용
      applyCodeHighlighting();

      // - Giscus 댓글 로드
      loadGiscus();
    } catch (error) {
      console.error("게시글 렌더링 중 오류 발생:", error);
      const container = document.getElementById("postContainer");
      if (container) {
        container.innerHTML = '<div class="empty-state"><p>게시글을 불러오는 중 오류가 발생했습니다.</p></div>';
      }
    }
  }
  // END: 게시글 렌더링 함수

  // BEGIN: 마크다운 파일 로드 함수
  function loadPost() {
    try {
      const fileName = getFileNameFromUrl();
      if (!fileName) {
        const container = document.getElementById("postContainer");
        if (container) {
          container.innerHTML = '<div class="empty-state"><p>게시글 파일명이 지정되지 않았습니다.</p></div>';
        }
        return;
      }

      const filePath = "pages/" + fileName;

      fetch(filePath)
        .then(function(response) {
          if (!response.ok) {
            throw new Error("게시글을 불러올 수 없습니다: " + response.status);
          }
          return response.text();
        })
        .then(function(content) {
          // - Front Matter 파싱
          const parsed = parseFrontMatter(content);

          // - 마크다운을 HTML로 변환
          const htmlContent = convertMarkdownToHtml(parsed.content);

          // - 게시글 렌더링
          renderPost(parsed.metadata, htmlContent);
        })
        .catch(function(error) {
          console.error("게시글 로드 중 오류 발생:", error);
          const container = document.getElementById("postContainer");
          if (container) {
            container.innerHTML = '<div class="empty-state"><p>게시글을 불러올 수 없습니다.</p></div>';
          }
        });
    } catch (error) {
      console.error("게시글 로드 함수 실행 중 오류 발생:", error);
    }
  }
  // END: 마크다운 파일 로드 함수

  // BEGIN: DOM 로드 시 초기화
  document.addEventListener("DOMContentLoaded", function() {
    try {
      loadPost();
    } catch (error) {
      console.error("게시글 로더 초기화 중 오류 발생:", error);
    }
  });
  // END: DOM 로드 시 초기화
})();
// END: 마크다운 게시글 로드 및 파싱

