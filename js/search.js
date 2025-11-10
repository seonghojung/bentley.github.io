// @ 검색 및 태그 필터 기능
// BEGIN: 검색 및 필터 초기화
(function() {
  "use strict";

  // @ 전역 변수
  let allPosts = [];
  let allTags = [];
  let currentFilter = {
    search: "",
    tags: []
  };

  // BEGIN: 검색 입력 핸들러
  function handleSearchInput(event) {
    try {
      const searchTerm = event.target.value.toLowerCase().trim();
      currentFilter.search = searchTerm;
      filterPosts();
    } catch (error) {
      console.error("검색 입력 처리 중 오류 발생:", error);
    }
  }
  // END: 검색 입력 핸들러

  // BEGIN: 태그 클릭 핸들러
  function handleTagClick(tag) {
    try {
      const tagIndex = currentFilter.tags.indexOf(tag);
      if (tagIndex > -1) {
        currentFilter.tags.splice(tagIndex, 1);
      } else {
        currentFilter.tags.push(tag);
      }
      filterPosts();
      renderTagFilter();
    } catch (error) {
      console.error("태그 클릭 처리 중 오류 발생:", error);
    }
  }
  // END: 태그 클릭 핸들러

  // BEGIN: 게시글 필터링 함수
  function filterPosts() {
    try {
      const filteredPosts = allPosts.filter(function(post) {
        // - 검색어 필터
        const matchesSearch = currentFilter.search === "" ||
          post.title.toLowerCase().includes(currentFilter.search) ||
          post.excerpt.toLowerCase().includes(currentFilter.search) ||
          (post.tags && post.tags.some(function(tag) {
            return tag.toLowerCase().includes(currentFilter.search);
          }));

        // - 태그 필터
        const matchesTags = currentFilter.tags.length === 0 ||
          (post.tags && currentFilter.tags.every(function(filterTag) {
            return post.tags.includes(filterTag);
          }));

        return matchesSearch && matchesTags;
      });

      // - 필터링된 게시글 렌더링
      if (typeof renderPosts === "function") {
        renderPosts(filteredPosts);
      }
    } catch (error) {
      console.error("게시글 필터링 중 오류 발생:", error);
    }
  }
  // END: 게시글 필터링 함수

  // BEGIN: 태그 필터 렌더링 함수
  function renderTagFilter() {
    try {
      const tagFilterContainer = document.getElementById("tagFilter");
      if (!tagFilterContainer) {
        return;
      }

      tagFilterContainer.innerHTML = "";

      allTags.forEach(function(tag) {
        const tagElement = document.createElement("span");
        tagElement.className = "tag";
        if (currentFilter.tags.includes(tag)) {
          tagElement.classList.add("active");
        }
        tagElement.textContent = tag;
        tagElement.addEventListener("click", function() {
          handleTagClick(tag);
        });
        tagFilterContainer.appendChild(tagElement);
      });
    } catch (error) {
      console.error("태그 필터 렌더링 중 오류 발생:", error);
    }
  }
  // END: 태그 필터 렌더링 함수

  // BEGIN: 검색 초기화 함수
  function initSearch(posts) {
    try {
      allPosts = posts || [];

      // - 모든 태그 수집
      allTags = [];
      allPosts.forEach(function(post) {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(function(tag) {
            if (allTags.indexOf(tag) === -1) {
              allTags.push(tag);
            }
          });
        }
      });

      // - 태그 정렬
      allTags.sort();

      // - 태그 필터 렌더링
      renderTagFilter();

      // - 검색 입력 이벤트 리스너 등록
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.addEventListener("input", handleSearchInput);
      }
    } catch (error) {
      console.error("검색 초기화 중 오류 발생:", error);
    }
  }
  // END: 검색 초기화 함수

  // BEGIN: 전역 함수로 export
  window.initSearch = initSearch;
  window.filterPosts = filterPosts;
  // END: 전역 함수로 export
})();
// END: 검색 및 필터 초기화

