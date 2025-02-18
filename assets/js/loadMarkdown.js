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
                return hljs.highlightAuto(code).value;
            }
        });
        
        // 将转换后的HTML渲染到指定的容器
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error('加载Markdown文件失败:', error);
        document.getElementById(containerId).innerHTML = '<p>加载文件失败，请检查路径或文件是否存在。</p>';
    }
}
