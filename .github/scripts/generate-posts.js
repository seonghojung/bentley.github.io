// @ posts.json 생성 스크립트
// BEGIN: 게시글 메타데이터 생성
const fs = require("fs");
const path = require("path");

// @ 설정
const postsDir = "pages";
const outputFile = "posts.json";

// BEGIN: pages 디렉토리 확인
if (!fs.existsSync(postsDir)) {
  console.log("pages 디렉토리가 없습니다. 빈 posts.json을 생성합니다.");
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
  process.exit(0);
}
// END: pages 디렉토리 확인

// BEGIN: 마크다운 파일 목록 가져오기
const files = fs
  .readdirSync(postsDir)
  .filter(function(file) {
    return file.endsWith(".md");
  })
  .sort(function(a, b) {
    return b.localeCompare(a);
  });
// END: 마크다운 파일 목록 가져오기

// BEGIN: 게시글 메타데이터 추출
const posts = files.map(function(filename) {
  try {
    const filePath = path.join(postsDir, filename);
    const content = fs.readFileSync(filePath, "utf8");

    // - Front Matter 파싱
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

    // - 발췌문 생성 (첫 200자)
    const excerpt = postContent
      .replace(/#.*$/gm, "") // 헤더 제거
      .replace(/```[\s\S]*?```/g, "") // 코드 블록 제거
      .replace(/\[[\s\S]*?\]/g, "") // 링크 제거
      .replace(/\*\*.*\*\*/g, "") // 볼드 제거
      .replace(/\*.*\*/g, "") // 이탤릭 제거
      .replace(/\n+/g, " ") // 줄바꿈을 공백으로
      .trim()
      .substring(0, 200)
      .trim();

    return {
      file: filename,
      title: metadata.title || filename.replace(".md", ""),
      date: metadata.date || new Date().toISOString().split("T")[0],
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      category: metadata.category || "",
      description: metadata.description || "",
      excerpt: excerpt + (excerpt.length === 200 ? "..." : "")
    };
  } catch (error) {
    console.error("파일 처리 중 오류 발생 (" + filename + "):", error);
    return null;
  }
}).filter(function(post) {
  return post !== null;
});
// END: 게시글 메타데이터 추출

// BEGIN: 날짜순 정렬 (최신순)
posts.sort(function(a, b) {
  return new Date(b.date) - new Date(a.date);
});
// END: 날짜순 정렬 (최신순)

// BEGIN: posts.json 파일 생성
try {
  fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
  console.log("Generated posts.json with " + posts.length + " posts");
} catch (error) {
  console.error("posts.json 생성 중 오류 발생:", error);
  process.exit(1);
}
// END: posts.json 파일 생성
// END: 게시글 메타데이터 생성

