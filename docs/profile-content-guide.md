# 个人介绍与 Education 改写建议

本稿依据仓库现有资料，以及你于 2026-09-21 补充的硕士去向整理。未补写 GPA、导师合作起始时间、企业职位或论文中的具体分工。本稿仅供采用，尚未替换首页。

## 信息主线

1. 现在：清华大学自动化系人工智能专业本科生，预计 2027 年 6 月毕业。
2. 下一阶段：已确定进入清华大学深圳国际研究生院，2027–2029 年攻读硕士，加入 Yansong Tang 老师课题组；大模型科学与工程项目，腾讯联合培养。
3. 已有研究：GameVerse，以及面向游戏的基础模型综述。论文状态沿用仓库记录；具体贡献需你补充。
4. 研究兴趣：将多模态模型、智能体学习和空间智能作为建议主线。前两项连接现有论文，空间智能保留原网站兴趣，但不将兴趣表述为已取得的成果。
5. 求职：明确目标方向、可开始日期、持续时间和每周可投入天数，不只写泛泛的 seeking opportunities。

导师主页确认英文姓名为 Yansong Tang，所在机构为 Tsinghua University, Shenzhen International Graduate School，课题组为 IVG@SZ： https://andytang15.github.io/ 。录取和腾讯联培信息来自你本人；“Large Model Science and Engineering”是本稿暂用译名，采用前应与项目官方英文名称核对。

## 建议简介（英文）

> I am an undergraduate student majoring in Artificial Intelligence in the Department of Automation at Tsinghua University, expecting to graduate in June 2027. I have secured admission to the master's program at Tsinghua Shenzhen International Graduate School for 2027–2029, where I will join Prof. Yansong Tang's group through the 大模型科学与工程 program, with joint training at Tencent.
>
> My recent work includes GameVerse, on learning from video-based reflection with vision-language models, and a survey of foundation models for game playing. My research interests include multimodal models, agent learning, and spatial intelligence.

英文项目名确认后，可将中文替换为 “Large Model Science and Engineering”。不要写成 Tencent Research Intern、Tencent employee 或当前硕士生；联培安排本身不意味着这些身份。也无需擅自把学位写成 M.Sc. 或 M.Eng.。

如果希望首屏更简洁，可删去第一段项目名称与腾讯联培细节，将其留在 Education。现有 “third-year” 建议改为稳定的 undergraduate + expected graduation。

## Education 建议（逆时间顺序）

**Tsinghua University, Shenzhen International Graduate School**  
Incoming master's student · 2027–2029 (expected)  
Program: 大模型科学与工程（正式英文名待确认）  
Prospective advisor: Prof. Yansong Tang · IVG@SZ  
Joint training with Tencent

**Tsinghua University**  
Undergraduate in Artificial Intelligence · 2023–2027 (expected)  
Department of Automation  
Expected graduation: June 2027

GPA / 排名只有在愿意公开且能准确写出计算口径时添加；精选课程控制在 3–4 门，优先留给 CV。导师、论文经历和教育所属关系要分开，不将本科两篇论文默认归入未来导师课题组。

## 如何落地到当前网站

- 编辑 `_data/profile.yml` 的 `introduction` 和 `interests`，替换简介及兴趣。多段 Markdown 可使用 YAML `|`，并在段落之间留空行。
- 在 `education` 列表最前面添加硕士条目，保留本科条目。现有字段为 `institution`、`department`、`program`、`period`、`graduation`，可以先将 incoming 状态放在 `program` 中。
- 若要独立展示导师和联培信息，为数据添加 `advisor`、`advisor_url`、`details` 等字段，并在 `_includes/research-hero.html` 中增加对应输出；仅添加数据字段不会自动显示。
- 两段简介需要在 `assets/css/research.css` 中增加 `.hero-bio p + p` 的段间距；两条教育记录可增加 `.education-entry + .education-entry` 的上边距。
- 同步 `_config.yml` 的 `description` 和 `_pages/about.md` 的 `excerpt`，避免搜索摘要与首页不一致。

## 面向实习和论文交流的补充

实习意向可以放在简介后，确认时间后采用：

> I am seeking research internship opportunities in [target area], starting in [month/year], for [duration]. Please feel free to contact me by email.

每篇论文建议补一条本人贡献，采用“负责的任务 → 方法或系统 → 可核实的结果”的结构，例如：

> My contribution: [implemented / designed / evaluated X], with a focus on [specific component or research question].

不要在未确认分工时直接写 led、proposed 或 achieved。共同一作符号应与论文一致，并在 Publications 中解释 “* Equal contribution”。可以为卡片增加 `summary` / `contribution` 数据字段，但需同步修改论文 include 才会显示。

CV 应提供可下载 PDF，Research / Publications 优先于早期竞赛项目。对外投稿时使用准确的作者单位和会议状态；匿名评审阶段按目标会议的具体要求处理公开材料。
