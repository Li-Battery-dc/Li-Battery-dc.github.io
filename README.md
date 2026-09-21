# Dongchen Liu · 个人学术主页

这是 Dongchen Liu 的个人网站源码，使用 Jekyll 构建，面向研究展示、学术交流和实习申请。站点地址由 `_config.yml` 配置为 https://li-battery-dc.github.io 。当前首页采用独立的 `research` 布局，并非原 AcadHomepage 模板的默认页面。

## 内容维护入口

| 要修改的内容 | 文件 |
| --- | --- |
| 身份、简介、研究兴趣、Education | `_data/profile.yml` |
| 姓名、头像、邮箱、GitHub、Scholar、OpenReview | `_config.yml` 的 `author` |
| 论文标题、作者、会议、配图、资源链接 | `_data/publications.yml` |
| 新闻动态 | `_data/news.yml` |
| 奖项、项目、社会服务，以及首页 SEO 摘要 | `_pages/about.md` |
| 顶部导航 | `_data/navigation.yml` |
| 简介与教育经历的 HTML 结构 | `_includes/research-hero.html` |
| 论文卡片的 HTML 结构 | `_includes/research-publications.html` |
| 字体、间距、颜色、封面对齐、移动端样式 | `assets/css/research.css` |
| 页面外框、导航、页脚 | `_layouts/research.html` |

不要直接编辑 `_site/`；它是构建产物，下次构建会覆盖。修改研究定位时，同时更新 `_config.yml` 的 `description` 和 `_pages/about.md` 的 `excerpt`。

## 本地预览与检查

使用已安装 Ruby、Bundler 及编译依赖的 WSL / Linux 环境，在仓库根目录运行：

```bash
bundle install                    # 首次安装依赖
bash run_server.sh                # http://localhost:4000/
```

当前脚本使用 `--no-watch`，修改文件后需要停止并重新启动服务，再刷新浏览器；不是自动热更新。原因和维护细节见 [设计维护说明](docs/design-maintenance.md)。

提交前运行：

```bash
bundle exec jekyll build --safe
bundle exec ruby docs/verify-site.rb
```

验证脚本检查首页区块结构和本地资源依赖；封面高度、长标题及手机布局还需在浏览器检查。GitHub Pages 的实际发布来源以仓库 Settings → Pages 为准，本地构建不等于线上发布。

## 添加论文与保持封面对齐

在 `_data/publications.yml` 顶部复制一条记录，并更新 `title`、`venue`、`image`、`alt`、`authors` 和 `links`。图片放入 `images/papers/`，路径大小写必须一致。`authors` 支持 HTML；本人姓名使用 `author-self`，共同贡献符号按论文原文填写，会议状态保持准确。

桌面端每行两篇，760px 及以下单列。`.paper-cover` 统一控制封面宽高比，图片绝对定位并使用 `object-fit: contain` 完整居中展示，避免图片原始尺寸撑高容器。更改留白使用 `--cover-padding`；更改比例使用 `aspect-ratio`，不要逐篇设置不同高度。图片自身的空白仍会影响视觉大小，可准备留白一致的源图。

## Blog 暂时隐藏

`_data/navigation.yml` 中的 Blog 条目已注释，旧模板 `_includes/author-profile.html` 中两个 Blog 入口也已移除。文章源码保留在 `blog_root/`，原始地址仍可直接访问；这不是访问控制，也不是删除博客。

恢复主导航入口时，取消 `_data/navigation.yml` 中两行 Blog 配置的注释即可。旧模板侧栏如需恢复，请在上述 include 的注释位置添加链接。

## 个人介绍与研究展示

[个人介绍与 Education 改写建议](docs/profile-content-guide.md) 包含基于当前资料的英文草稿、硕士待入学状态表述和实习信息补充方法。该文档是编辑建议，不会自动替换首页。

首页内容建议按“身份与研究方向 → 代表成果 → 实习意向 → 教育经历”组织。论文详情保留在 Publications；项目应写清研究问题、个人贡献和可核实的结果。避免在简介中堆积课程、奖项或尚未确认的职位。

## 其他维护资料

- [布局、响应式与空间头图维护](docs/design-maintenance.md)
- [3D 模型源码](docs/model-source/README.md)
- [原模板中文参考](docs/README-zh.md)：仅供历史参考，当前内容入口和运行方式以本文为准。

首页使用本地 Three.js 及 GLB 模型。Google Scholar 入口保留；当前首页不显示自动论文引用数，仓库内的历史爬虫不代表该功能已接入首页。

## 来源与许可

本项目基于 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) 定制，保留 [MIT LICENSE](LICENSE)。原模板借鉴 Minimal Mistakes 和 Academic Pages；Font Awesome、Three.js 等第三方资源遵循各自随附许可。
