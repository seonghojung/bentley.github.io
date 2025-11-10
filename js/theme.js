// @ 다크/라이트 모드 토글 기능
// BEGIN: 테마 초기화 및 토글 함수
(function() {
  "use strict";

  // @ 테마 설정 키
  const THEME_KEY = "blog-theme";
  const THEME_DARK = "dark";
  const THEME_LIGHT = "light";

  // BEGIN: 테마 적용 함수
  function applyTheme(theme) {
    try {
      const html = document.documentElement;
      if (theme === THEME_DARK) {
        html.setAttribute("data-theme", THEME_DARK);
      } else {
        html.setAttribute("data-theme", THEME_LIGHT);
      }
      localStorage.setItem(THEME_KEY, theme);
      updateThemeButton(theme);
    } catch (error) {
      console.error("테마 적용 중 오류 발생:", error);
    }
  }
  // END: 테마 적용 함수

  // BEGIN: 테마 버튼 업데이트 함수
  function updateThemeButton(theme) {
    try {
      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.textContent = theme === THEME_DARK ? "☀️" : "🌙";
      }
    } catch (error) {
      console.error("테마 버튼 업데이트 중 오류 발생:", error);
    }
  }
  // END: 테마 버튼 업데이트 함수

  // BEGIN: 테마 토글 함수
  function toggleTheme() {
    try {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
      applyTheme(newTheme);
    } catch (error) {
      console.error("테마 토글 중 오류 발생:", error);
    }
  }
  // END: 테마 토글 함수

  // BEGIN: 초기 테마 로드 함수
  function initTheme() {
    try {
      // - 저장된 테마가 있으면 사용, 없으면 시스템 설정 확인
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        applyTheme(savedTheme);
      } else {
        // - 시스템 다크 모드 설정 확인
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? THEME_DARK : THEME_LIGHT);
      }
    } catch (error) {
      console.error("테마 초기화 중 오류 발생:", error);
      // - 오류 발생 시 기본 라이트 모드 적용
      applyTheme(THEME_LIGHT);
    }
  }
  // END: 초기 테마 로드 함수

  // BEGIN: 이벤트 리스너 등록
  document.addEventListener("DOMContentLoaded", function() {
    try {
      initTheme();

      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
      }

      // - 시스템 테마 변경 감지
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(e) {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      });
    } catch (error) {
      console.error("테마 이벤트 리스너 등록 중 오류 발생:", error);
    }
  });
  // END: 이벤트 리스너 등록
})();
// END: 테마 초기화 및 토글 함수

