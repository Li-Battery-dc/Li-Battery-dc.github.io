# 首页设计与内容维护

首页使用独立的 `research` 布局，继续由 Jekyll / GitHub Pages 构建，不需要前端框架。原模板布局仍保留，其他页面可以继续使用。

## 设计规则

- 柔白底色、炭灰正文、大尺度衬线标题与少量深绿色强调；通过字体比例和分区留白建立层级。
- 首屏使用较小的彩色个人照、个人信息、二校门建筑模型三部分。姓名适度缩小，个人介绍和教育经历保持清晰；窄屏将建筑头图放到信息下方。
- 论文采用两列完整卡片，封面、会议信息、标题、作者和链接在同一卡片内。封面保持完整；手机端自动变成单列。
- 主要阅读顺序：个人信息与教育、动态、论文、奖项、项目、社会服务。
- 空间头图为简化的清华二校门 GLB，缓慢旋转。鼠标附近的局部实体渐变为点云，离开后恢复，不显示文字说明或按钮。设备不支持 WebGL 或禁用脚本时不显示头图，个人信息正常保留。

## 添加内容

| 内容 | 编辑位置 |
| --- | --- |
| 简介、身份、研究兴趣、教育经历 | `_data/profile.yml` |
| 姓名、头像、邮箱、学术主页链接 | `_config.yml` 的 `author` |
| 首屏布局 | `_includes/research-hero.html` |
| 论文 | `_data/publications.yml`，复制一条记录并放到最上方 |
| 动态 | `_data/news.yml`，日期使用 `YYYY.MM`，文字支持 Markdown |
| 奖项、项目、服务 | `_pages/about.md` 中相应分区，继续使用 Markdown |
| 顶部导航 | `_data/navigation.yml` |
| 字号、配色、间距、响应式规则 | `assets/css/research.css` |

论文记录使用 `title`、`venue`、`image`、`alt`、`authors` 和 `links`。图片存放在 `images/papers/`。作者字段支持 HTML，可以用 `<span class='author-self'>Dongchen Liu</span>` 强调本人，用 `<sup>†</sup>` 标注通讯作者。链接按原条目添加 `label` 和 `url` 即可。

原有引用数占位使用了重复论文 ID，因此首页暂时不展示论文引用数。Google Scholar 入口保留；核实每篇论文 ID 后再接入引用数据。

## 本地运行

在已配置 Ruby 与 Bundler 的 WSL 终端进入仓库，首次运行 `bundle install`，然后运行 `bash run_server.sh`，打开 `http://localhost:4000/`。脚本使用 `--no-watch`：当前 Jekyll 3.9 / pathutil 0.16 在 Ruby 3 下的 WSL 监听检测会发生关键字参数兼容错误，`--force_polling` 也无法绕过。每次修改内容或配置后，Ctrl+C 停止并重新运行脚本，再刷新浏览器；必要时 Ctrl+Shift+R 强制刷新。此限制仅影响本地监听，普通构建不经过该代码路径。

推送前使用真实 Jekyll 构建检查：

```bash
bundle exec jekyll build --safe
bundle exec ruby docs/verify-site.rb
```

此前 `4173` 的临时设计预览不是 Jekyll 构建结果，不能作为部署验证。不要直接双击 `_site/index.html`。`assets/js/vendor/three` 必须进入构建，图片路径大小写必须与 Git 中的文件一致。`_pages/about.md` 中 Markdown 容器的结束标签应顶格书写，避免被列表吞入并导致后续板块嵌套。

## 论文排列与字号

桌面端使用固定 `repeat(2, minmax(0, 1fr))`，按数据顺序每行两篇；奇数篇的最后一张保持半行宽。760px 及以下为单栏，保证手机阅读。无需手动创建行或补空卡片。作者较长时自动换行，同一行卡片等高，底部链接对齐。会议 / arXiv 字段用明确的深色标签展示。

主要分区标题统一由 `--section-title` 控制，研究兴趣和教育辅助信息由 `--detail-size` 控制。

## 空间头图维护

- 结构：`_includes/spatial-header.html`。
- 场景与交互：`assets/js/spatial-header.js`；表面点云采样：`assets/js/spatial-sampling.js`。
- GLB：`assets/models/tsinghua-gate.glb` 和 `assets/models/mobius-metal.glb`；可重建源码分别为 `docs/model-source/build-gate.mjs` 和 `docs/model-source/build-mobius.mjs`。
- 重建：在仓库根目录运行 `node docs/model-source/build-gate.mjs`，不依赖 Blender、临时工具或外网。
- 布局：`assets/css/research.css` 中 spatial 相关规则。
- Three.js 固定为 0.180.0，放在 `assets/js/vendor/three/`，保留 MIT LICENSE。仅将附加组件的 three 模块路径改为本地路径，无需 CDN 或新增 Jekyll 插件。
- 遵循系统减少动态效果偏好；页面后台或画面不可见时停止动画；默认限制为约 30fps，像素比例上限 1.75。
- 约 97 秒旋转一周。鼠标经过时使用屏幕局部圆形遮罩，同时驱动实体消隐与点云显现；离开后约半秒恢复。点云采用固定种子、三角形面积加权采样，共 26,000 点。
- 通过 `_data/profile.yml` 的 `spatial_model: gate`（二校门）或 `spatial_model: mobius`（莫比乌斯环）配置模型；页面不显示任何切换入口，只加载配置指定的 GLB；键盘聚焦后可用空格暂停、方向键移动局部点云区域、Esc 恢复实体。触摸操作允许页面纵向滚动。
- 论文封面是普通图片，论文名称和下方资源按钮保留链接。

模型题字为纯黑色，细黑轮廓线随 hover 一同消隐。圆形底座与模型一起旋转，空间网格保持静止。点云为中性深灰，鼠标作用半径上限为 56 CSS 像素（此前为 90），并根据展示宽度自适应。
