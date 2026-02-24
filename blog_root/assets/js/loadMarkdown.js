// markdownViewer.js

// 封装Markdown渲染函数
async function loadMarkdown(filePath, containerId) {
    try {
        // 处理文件路径，确保路径正确
        const response = await fetch(filePath);

        // 检查响应是否成功
        if (!response.ok) {
            throw new Error('文件加载失败');
        }

        const text = await response.text();

        // 使用Marked库将Markdown转换为HTML
        const html = marked.parse(text, {
            gfm: true,
            breaks: true,
            highlight: function(code, lang) {
                if (hljs && lang) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            }
        });

        // 修复图片路径 - 将相对路径转换为绝对路径
        let processedHtml = html;

        // 处理图片路径
        if (filePath.includes('/markdown-articles/documents/') || filePath.includes('./documents/')) {
            // 对于markdown-articles目录下的文件，修复图片路径
            processedHtml = html.replace(/src="images\//g, 'src="documents/images/');
        }

        // 处理其他可能的相对路径引用
        processedHtml = processedHtml.replace(/href="images\//g, 'href="documents/images/');

        // 处理Markdown内写成站点根路径的资源
        processedHtml = processedHtml.replace(/src="\/assets\//g, 'src="../assets/');
        processedHtml = processedHtml.replace(/href="\/assets\//g, 'href="../assets/');

        // 将转换后的HTML渲染到指定的容器
        document.getElementById(containerId).innerHTML = processedHtml;
    } catch (error) {
        console.error('加载Markdown文件失败:', error);
        document.getElementById(containerId).innerHTML = '<p>加载文件失败，请检查路径或文件是否存在。</p>';
    }
}
