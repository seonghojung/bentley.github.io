// @ 게시글 목록 자동 생성 스크립트
// BEGIN: pages 폴더의 마크다운 파일을 스캔하여 posts.json 생성
const fs = require("fs");
const path = require("path");

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

// BEGIN: 본문에서 excerpt 생성 함수
function generateExcerpt(content, maxLength = 300) {
  try {
    // - 마크다운 태그 제거
    let text = content
      .replace(/^#+\s+/gm, "") // 제목 태그 제거
      .replace(/\*\*([^*]+)\*\*/g, "$1") // 볼드 제거
      .replace(/\*([^*]+)\*/g, "$1") // 이탤릭 제거
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // 링크 제거
      .replace(/`([^`]+)`/g, "$1") // 인라인 코드 제거
      .replace(/```[\s\S]*?```/g, "") // 코드 블록 제거
      .replace(/>\s+/g, "") // 인용문 제거
      .replace(/\n+/g, " ") // 줄바꿈을 공백으로
      .trim();

    // - 최대 길이 제한
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "...";
    }

    return text;
  } catch (error) {
    console.error("Excerpt 생성 중 오류 발생:", error);
    return "";
  }
}
// END: 본문에서 excerpt 생성 함수

// BEGIN: 게시글 목록 생성 함수
function generatePostsList() {
  try {
    const pagesDir = path.join(__dirname, "pages");
    const postsJsonPath = path.join(__dirname, "posts.json");

    // - pages 폴더의 모든 .md 파일 읽기
    const files = fs.readdirSync(pagesDir).filter(function(file) {
      return file.endsWith(".md");
    });

    const posts = [];

    files.forEach(function(file) {
      try {
        const filePath = path.join(pagesDir, file);
        const content = fs.readFileSync(filePath, "utf8");

        // - Front Matter 파싱
        const parsed = parseFrontMatter(content);

        // - 게시글 정보 생성
        const post = {
          file: file,
          title: parsed.metadata.title || "제목 없음",
          date: parsed.metadata.date || new Date().toISOString().split("T")[0],
          tags: Array.isArray(parsed.metadata.tags) ? parsed.metadata.tags : [],
          category: parsed.metadata.category || "",
          description: parsed.metadata.description || "",
          excerpt: generateExcerpt(parsed.content)
        };

        posts.push(post);
      } catch (error) {
        console.error("파일 처리 중 오류 발생 (" + file + "):", error);
      }
    });

    // - 날짜순으로 정렬 (최신순)
    posts.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    // - posts.json 파일로 저장
    fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), "utf8");

    console.log("게시글 목록이 성공적으로 생성되었습니다.");
    console.log("총 " + posts.length + "개의 게시글이 발견되었습니다.");
  } catch (error) {
    console.error("게시글 목록 생성 중 오류 발생:", error);
    process.exit(1);
  }
}
// END: 게시글 목록 생성 함수

// BEGIN: 스크립트 실행
generatePostsList();
// END: 스크립트 실행

