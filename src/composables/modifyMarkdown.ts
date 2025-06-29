import { marked } from 'marked';

marked.setOptions({
    breaks: true,
    gfm: true,
});

export function getMarkdownPreview(content: string, maxLength: number = 200): string {
    if (!content) return '';

    try {
        // 마크다운을 HTML로 변환
        const htmlContent = marked(content) as string; // 타입 명시

        // HTML 태그와 엔티티 제거
        const textContent = htmlContent
            .replace(/<[^>]*>/g, '')           // HTML 태그 제거
            .replace(/&nbsp;/g, ' ')          // 공백 엔티티
            .replace(/&lt;/g, '<')           // < 엔티티
            .replace(/&gt;/g, '>')           // > 엔티티
            .replace(/&amp;/g, '&')          // & 엔티티
            .replace(/&quot;/g, '"')         // " 엔티티
            .replace(/&#39;/g, "'")          // ' 엔티티
            .replace(/\s+/g, ' ')            // 연속 공백을 하나로
            .trim();

        return textContent.length > maxLength
            ? textContent.substring(0, maxLength) + '...'
            : textContent;

    } catch (error) {
        console.error('마크다운 변환 중 오류:', error);
        // 에러 시 원본 텍스트 사용
        return content.length > maxLength
            ? content.substring(0, maxLength) + '...'
            : content;
    }
}