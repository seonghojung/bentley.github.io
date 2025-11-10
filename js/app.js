// @ 메인 애플리케이션 로직
// BEGIN: 게시글 목록 렌더링 및 초기화
(function() {
  "use strict";

  // @ 전역 변수
  let posts = [];

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

  // BEGIN: 게시글 카드 생성 함수
  function createPostCard(post) {
    try {
      const postUrl = "post.html?file=" + encodeURIComponent(post.file);
      const tagsHtml = renderTags(post.tags);
      const categoryHtml = post.category ? '<span class="post-category">' + post.category + "</span>" : "";

      return (
        '<a href="' + postUrl + '" class="post-card">' +
        '<h2>' + post.title + "</h2>" +
        '<div class="post-meta">' +
        '<span class="post-date">' + formatDate(post.date) + "</span>" +
        categoryHtml +
        "</div>" +
        tagsHtml +
        '<p class="post-excerpt">' + post.excerpt + "</p>" +
        "</a>"
      );
    } catch (error) {
      console.error("게시글 카드 생성 중 오류 발생:", error);
      return "";
    }
  }
  // END: 게시글 카드 생성 함수

  // BEGIN: 게시글 목록 렌더링 함수
  function renderPosts(postsToRender) {
    try {
      const container = document.getElementById("postsContainer");
      if (!container) {
        return;
      }

      if (!postsToRender || postsToRender.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>게시글이 없습니다.</p></div>';
        return;
      }

      let html = "";
      postsToRender.forEach(function(post) {
        html += createPostCard(post);
      });

      container.innerHTML = html;
    } catch (error) {
      console.error("게시글 목록 렌더링 중 오류 발생:", error);
      const container = document.getElementById("postsContainer");
      if (container) {
        container.innerHTML = '<div class="empty-state"><p>게시글을 불러오는 중 오류가 발생했습니다.</p></div>';
      }
    }
  }
  // END: 게시글 목록 렌더링 함수

  // BEGIN: posts.json 로드 함수
  function loadPosts() {
    try {
      fetch("posts.json")
        .then(function(response) {
          if (!response.ok) {
            throw new Error("posts.json을 불러올 수 없습니다: " + response.status);
          }
          return response.json();
        })
        .then(function(data) {
          posts = data;
          renderPosts(posts);

          // - 검색 기능 초기화
          if (typeof initSearch === "function") {
            initSearch(posts);
          }
        })
        .catch(function(error) {
          console.error("게시글 로드 중 오류 발생:", error);
          const container = document.getElementById("postsContainer");
          if (container) {
            container.innerHTML = '<div class="empty-state"><p>게시글을 불러올 수 없습니다.</p></div>';
          }
        });
    } catch (error) {
      console.error("게시글 로드 함수 실행 중 오류 발생:", error);
    }
  }
  // END: posts.json 로드 함수

  // BEGIN: 전역 함수로 export
  window.renderPosts = renderPosts;
  // END: 전역 함수로 export

  // BEGIN: DOM 로드 시 초기화
  document.addEventListener("DOMContentLoaded", function() {
    try {
      loadPosts();
    } catch (error) {
      console.error("애플리케이션 초기화 중 오류 발생:", error);
    }
  });
  // END: DOM 로드 시 초기화
})();
// END: 게시글 목록 렌더링 및 초기화

