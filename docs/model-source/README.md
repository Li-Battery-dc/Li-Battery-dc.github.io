# 二校门 architectural study

本模型根据建筑照片与结构文字独立程序化创建，比例为视觉估计，非精确测绘复刻。

保留：中央大拱、两侧低拱、正面四根圆柱、背面四根方壁柱、曲线翼墙与简化卷涡、层叠檐口、阶梯状顶部及浅底座。
灰砖墙使用程序化错缝砖纹与法线贴图；白色拱券、柱子与上部曲线翼墙保持素面。正面牌匾为黑色繁体「清華園」，按传统横排从右至左阅读。字形采用楷体近似，不宣称复刻原书法。省略细雕、铁门、旗杆和植物。

## 参考

- [清华校友总会：二校门建筑形式来源及其影响研究](https://www.tsinghua.org.cn/info/4114/43190.htm)：正文的构造说明及张复合摄正、背立面照片，用于判断前圆柱／背方柱及曲线肩墙。
- [清华大学：二校门](https://www.tsinghua.edu.cn/info/1360/1397.htm)：三拱牌坊整体结构。
- [Wikimedia Commons：二校门照片](https://commons.wikimedia.org/wiki/File:The_second_gate_of_Tsinghua_University_rebuilt_in_1991.jpg)：照片来源页面作为辅助参考；网页模型没有打包、贴图或转载照片。

没有使用第三方下载模型或扫描网格。

## 重建与结构

运行 `node docs/model-source/build-gate.mjs`，输出 `assets/models/tsinghua-gate.glb`。

- Three.js 规则几何体、轮廓挤出和左右对称构造；拱洞采用开口轮廓，没有布尔残面。
- glTF 2.0 binary；Y 向上，正立面朝 +Z；不含外部纹理、压缩解码器和扩展。
- 81 个具名网格，6,214 个三角形，861,988 字节。
- 4 种共享 PBR 材质、3 张内嵌 PNG 纹理；全部构件可在 Blender 中导入后独立编辑。
- 交互材质注入在运行时完成，GLB 本身是普通实体模型，方便后续增添 wireframe 等效果。

通过 Khronos glTF Validator 检查，零错误、零警告；测试三处门洞的射线贯通、四根正面柱子、点云采样范围及重复构建的稳定性。

## 材质与文字重建

纹理源位于 `textures/`，普通模型重建直接读取这些 PNG，不需要安装字体或绘图工具。修改砖纹和字样时，运行 `build-textures.cjs`，需要 `@napi-rs/canvas` 和支持繁体字的楷体字体；可用 `CANVAS_MODULE_PATH` 指定已安装的 Canvas 模块，`GATE_FONT_PATH` 指定字体。只将渲染后的文字 PNG 嵌入 GLB，不分发系统字体。

## 莫比乌斯环

运行 `node docs/model-source/build-mobius.mjs`，输出 `assets/models/mobius-metal.glb`。独立生成半扭转、带微小厚度的闭合带状模型，16,320 个三角形、416,764 字节。材质为深灰金属，metallic=0.94、roughness=0.23；几何接缝经过焊接位置校验，无开口边。

两模型独立保留；通过 `_data/profile.yml` 的 `spatial_model: gate` 或 `spatial_model: mobius` 配置，默认二校门。页面不显示切换按钮，只加载选中的模型。共用圆形底座、稀疏三维网格、自动旋转与局部深灰点云。二校门细黑轮廓线使用运行时 EdgesGeometry，阈值 26°，避免显示三角化对角线；线条和实体使用同一 hover 消隐遮罩。

为适应首页的小尺寸展示，牌匾提高至 0.76 模型单位，字形放大并加强笔画。题字贴片与面板留出 0.03 单位间隔以免深度冲突；GLB 内使用 `KHR_materials_unlit`，使黑色笔画不被环境反光冲淡。纹理仍嵌入 GLB，保留传统从右至左的「清華園」。
