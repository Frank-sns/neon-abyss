const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  convertInchesToTwip, LevelFormat
} = require("docx");

// ── helpers ──────────────────────────────────────────────────────────
const FONT = "Microsoft YaHei";
const MONO = "Consolas";
const PAGE_W = 11906; // A4 DXA

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text, font: FONT, bold: true, size: 36 })]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 160 },
  children: [new TextRun({ text, font: FONT, bold: true, size: 30 })]
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text, font: FONT, bold: true, size: 26 })]
});

const h4 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_4,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, font: FONT, bold: true, size: 24 })]
});

const h5 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_5,
  spacing: { before: 160, after: 80 },
  children: [new TextRun({ text, font: FONT, bold: true, size: 22 })]
});

// parse inline: **bold** and `code`
const parseRuns = (raw) => {
  const runs = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === "`") {
      const end = raw.indexOf("`", i + 1);
      if (end === -1) { runs.push(new TextRun({ text: raw.slice(i), font: FONT })); break; }
      runs.push(new TextRun({ text: raw.slice(i + 1, end), font: MONO, size: 20 }));
      i = end + 1;
    } else if (raw[i] === "*" && raw[i + 1] === "*") {
      const end = raw.indexOf("**", i + 2);
      if (end === -1) { runs.push(new TextRun({ text: raw.slice(i), font: FONT })); break; }
      runs.push(new TextRun({ text: raw.slice(i + 2, end), font: FONT, bold: true }));
      i = end + 2;
    } else {
      let j = i;
      while (j < raw.length && raw[j] !== "`" && !(raw[j] === "*" && raw[j + 1] === "*")) j++;
      runs.push(new TextRun({ text: raw.slice(i, j), font: FONT }));
      i = j;
    }
  }
  return runs;
};

const para = (raw) => new Paragraph({
  spacing: { after: 120 },
  children: raw ? parseRuns(raw) : []
});

const boldPara = (raw) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text: raw, font: FONT, bold: true })]
});

const quote = (raw) => new Paragraph({
  spacing: { after: 60 },
  indent: { left: convertInchesToTwip(0.4) },
  border: { left: { style: BorderStyle.SINGLE, color: "4a86e8", size: 6, space: 8 } },
  children: [new TextRun({ text: raw, font: FONT, italics: true, color: "555555", size: 20 })]
});

const codeBlock = (text) => new Paragraph({
  spacing: { after: 60 },
  indent: { left: convertInchesToTwip(0.3) },
  shading: { type: ShadingType.CLEAR, fill: "f5f5f5" },
  children: [new TextRun({ text, font: MONO, size: 18 })]
});

const hr = () => new Paragraph({
  spacing: { before: 120, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, color: "cccccc", size: 6, space: 1 } },
  children: []
});

const blank = () => new Paragraph({ spacing: { after: 60 }, children: [] });

// build a 4-column table from array of [c1,c2,c3,c4]
const makeTable4 = (headers, rows, colWidths) => {
  const cw = colWidths || [1600, 800, 4400, 5106];
  const hdrRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: cw[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: "4a86e8" },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, font: FONT, bold: true, color: "ffffff", size: 20 })]
      })]
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      width: { size: cw[i], type: WidthType.DXA },
      children: [new Paragraph({ children: parseRuns(cell) })]
    }))
  }));
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: cw,
    rows: [hdrRow, ...dataRows]
  });
};

// 3-column table
const makeTable3 = (headers, rows, colWidths) => {
  const cw = colWidths || [1600, 800, 9506];
  const hdrRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: cw[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: "4a86e8" },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, font: FONT, bold: true, color: "ffffff", size: 20 })]
      })]
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      width: { size: cw[i], type: WidthType.DXA },
      children: [new Paragraph({ children: parseRuns(cell) })]
    }))
  }));
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: cw,
    rows: [hdrRow, ...dataRows]
  });
};

// 2-column table (for overviews)
const makeTable2 = (headers, rows, colWidths) => {
  const cw = colWidths || [3000, 8906];
  const hdrRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: cw[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: "4a86e8" },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, font: FONT, bold: true, color: "ffffff", size: 20 })]
      })]
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      width: { size: cw[i], type: WidthType.DXA },
      children: [new Paragraph({ children: parseRuns(cell) })]
    }))
  }));
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: cw,
    rows: [hdrRow, ...dataRows]
  });
};

// checkbox list item
const checkbox = (text, checked) => new Paragraph({
  spacing: { after: 60 },
  children: [
    new TextRun({ text: checked ? "☑ " : "☐ ", font: FONT, size: 22 }),
    ...parseRuns(text)
  ]
});

// ── build document sections ──────────────────────────────────────────
const children = [];

// Title
children.push(h1("AI + 控制算法 学习实施计划表"));
children.push(quote("起点：2026年7月21日（周二）"));
children.push(quote("背景：自动化本科，数学/控制基础扎实，编程零基础，研0暑期"));
children.push(quote("目标：2027年1月前能独立跑通 DQN + CartPole，看懂课题组代码"));
children.push(hr());

// ── 一、阶段总览 ──
children.push(h2("一、阶段总览"));
children.push(codeBlock("2026.07.21 ──────── 环境搭建 (1天)\n2026.07.22 ~ 08.18  第一阶段：Python 基础 (4周)\n2026.08.19 ~ 11.01  第二阶段：核心工具链 (11周)\n2026.11.02 ~ 长期    第三阶段：方向深耕 + 课题组衔接"));
children.push(hr());

// ── 二、逐周日历计划 ──
children.push(h2("二、逐周日历计划"));

// 第〇步
children.push(h3("⚙️ 第〇步：环境搭建"));
children.push(makeTable4(["日期", "星期", "任务", "预计耗时"], [
  ["**7.21**", "二", "① 安装 Anaconda ② 安装 VS Code + Python 插件 ③ 安装 Git ④ 验证：跑通 `print(\"hello world\")` + 启动 Jupyter", "3~4h"]
]));
children.push(hr());

// ── 第一阶段 ──
children.push(h3("🐍 第一阶段：Python 核心基础"));
children.push(quote("资源：B站「黑马程序员 Python+AI 零基础入门」BV1sHU9BmEne"));
children.push(quote("方法：边看边敲，老师写一行你敲一行"));

// Week 1
children.push(h4("第 1 周：变量与数据类型"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**7.22**", "三", "变量、注释、print/input、数字类型（int/float）", "写一个温度单位转换器"],
  ["**7.23**", "四", "字符串：创建、拼接、格式化（f-string）、常用方法", "用字符串格式化打印一个二阶系统的传递函数表达式"],
  ["**7.24**", "五", "列表：创建、索引、切片、增删改查", "把一组实验数据存成列表，做基本操作"],
  ["**7.25**", "六", "复习本周内容，整理笔记", "把前三天的代码自己重写一遍（不看原代码）"],
  ["**7.26**", "日", "**休息**", "—"],
  ["**7.27**", "一", "字典：创建、增删改查、遍历", "用字典存一个 PID 控制器的三个参数"],
  ["**7.28**", "二", "元组、集合（了解即可）", "本周综合练习"]
]));

// Week 2
children.push(h4("第 2 周：流程控制"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**7.29**", "三", "if / elif / else 条件判断", "写一个判断系统阶数（一阶/二阶/高阶）的程序"],
  ["**7.30**", "四", "for 循环、range()", "用 for 循环计算 1+2+...+100"],
  ["**7.31**", "五", "while 循环、break/continue", "用 while 循环模拟一阶系统的阶跃响应（输出从 0 到稳定值）"],
  ["**8.1**", "六", "复习 + 笔记整理", "用 for 循环打印一个二阶系统不同 ζ 下的输出序列（先用简单公式算）"],
  ["**8.2**", "日", "**休息**", "—"],
  ["**8.3**", "一", "嵌套循环、列表推导式", "生成一个 3×3 的矩阵（用列表嵌套）"],
  ["**8.4**", "二", "本周综合练习", "**里程碑练习**：计算一阶惯性环节 `y[k+1] = 0.8*y[k] + 0.2*u[k]` 的阶跃响应序列（20个点）"]
]));

// Week 3
children.push(h4("第 3 周：函数"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**8.5**", "三", "函数定义、调用、参数", "写一个计算阶乘的函数"],
  ["**8.6**", "四", "默认参数、关键字参数", "写一个函数，输入 K/T 算一阶系统阶跃响应序列"],
  ["**8.7**", "五", "return 返回值、多返回值", "写一个函数，输入 (ωn, ζ) 返回超调量、峰值时间、调节时间"],
  ["**8.8**", "六", "复习 + 笔记整理", "把前两周练习里的散装代码封装成函数"],
  ["**8.9**", "日", "**休息**", "—"],
  ["**8.10**", "一", "变量作用域、lambda 匿名函数", "用 lambda 写简单数学表达式"],
  ["**8.11**", "二", "本周综合练习", "**里程碑练习**：写一个函数，输入二阶系统参数和一组时间点，返回阶跃响应数组 + 超调量 + 稳态误差"]
]));

// Week 4
children.push(h4("第 4 周：类与对象 + 模块"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**8.12**", "三", "类的定义、`__init__`、self", "写一个 `FirstOrderSystem` 类，包含 K/T 属性和阶跃响应方法"],
  ["**8.13**", "四", "方法、属性访问", "给类加方法：计算稳态值"],
  ["**8.14**", "五", "继承（了解即可）", "从 `FirstOrderSystem` 继承一个 `SecondOrderSystem`"],
  ["**8.15**", "六", "模块与包、import", "把你的系统类单独存成 `.py` 文件，import 使用"],
  ["**8.16**", "日", "**休息**", "—"],
  ["**8.17**", "一", "**第一阶段大练习**", "写一个程序：用户输入系统参数，程序输出阶跃响应曲线（用 print 输出数字表格形式）"],
  ["**8.18**", "二", "整理学习笔记，总结第一阶段的收获和卡点", "—"]
]));

children.push(hr());

// ── 第二阶段 ──
children.push(h3("🛠️ 第二阶段：核心工具链"));

// Week 5
children.push(h4("第 5 周：Git + Linux CLI + NumPy 起步"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**8.19**", "三", "**Git**：init / clone / add / commit / status / log", "把第一阶段所有练习代码用 Git 管理起来"],
  ["**8.20**", "四", "**Git**：push / pull / remote / GitHub 仓库创建", "在 GitHub 创建仓库，把代码 push 上去"],
  ["**8.21**", "五", "**Linux CLI**：ls/cd/cp/mv/rm/mkdir、ssh 连接、conda/pip", "在命令行下完成文件操作、创建 conda 环境"],
  ["**8.22**", "六", "**Jupyter**：创建 notebook、代码/文本单元格、快捷键", "把「二阶系统阶跃响应」的练习用 Jupyter 重写一遍"],
  ["**8.23**", "日", "**休息**", "—"],
  ["**8.24**", "一", "**NumPy**：array 创建、属性（shape/dtype/ndim）、索引切片", "用 NumPy array 重写你之前的矩阵练习题"],
  ["**8.25**", "二", "**NumPy**：reshape、拼接、广播机制", "创建随机矩阵，练熟各种索引操作"]
]));
children.push(quote("📚 NumPy 参考：菜鸟教程 runoob.com/numpy"));

// Week 6
children.push(h4("第 6 周：NumPy 深入"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**8.26**", "三", "矩阵乘法、转置、求逆、求秩", "用 NumPy 验证一个 3×3 系统的可控性矩阵秩"],
  ["**8.27**", "四", "统计函数：mean/var/std/min/max/sum", "生成带噪声的正弦数据，算统计量"],
  ["**8.28**", "五", "随机数生成、线性代数模块", "生成多维正态分布数据"],
  ["**8.29**", "六", "复习 NumPy + 笔记整理", "**里程碑练习**：用 NumPy 实现离散状态空间 `x[k+1]=Ax[k]+Bu[k]` 的迭代计算"],
  ["**8.30**", "日", "**休息**", "—"],
  ["**8.31**", "一", "**Matplotlib**：折线图、多线同图、颜色/线型", "画二阶系统不同 ζ 下的阶跃响应曲线"],
  ["**9.1**", "二", "坐标轴标签、标题、图例、网格", "给昨天的图加上完整标注（含中文标题、轴标签、图例）"]
]));

// Week 7
children.push(h4("第 7 周：Matplotlib + pandas"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**9.2**", "三", "子图（subplot）、多图布局", "一个 Figure 里放 3 个子图：时域响应、相轨迹、控制输入"],
  ["**9.3**", "四", "散点图、直方图", "画带噪声测量数据的散点图 + 分布直方图"],
  ["**9.4**", "五", "**pandas**：Series、DataFrame 创建", "创建实验数据表：时间 | 输入 | 输出"],
  ["**9.5**", "六", "CSV 读写、数据筛选、基本统计", "读一个 CSV，按条件过滤行，算分组统计"],
  ["**9.6**", "日", "**休息**", "—"],
  ["**9.7**", "一", "pandas 综合练习", "**里程碑练习**：生成二阶系统仿真数据 → 存 CSV → 用 pandas 读取并画图"],
  ["**9.8**", "二", "本周复习 + 整理", "把所有 NumPy/Matplotlib/pandas 练习上传到 GitHub"]
]));

// Week 8
children.push(h4("第 8 周：scikit-learn（上）— ML 基础概念"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**9.9**", "三", "train_test_split、数据划分的意义", "生成二阶系统数据，划分训练集和测试集"],
  ["**9.10**", "四", "线性回归模型：fit / predict / coef_ / intercept_", "用 sklearn 线性回归拟合二阶系统参数"],
  ["**9.11**", "五", "评估指标：MSE、MAE、R²", "分别用 1/3/5 阶多项式拟合，比较 R²"],
  ["**9.12**", "六", "**核心概念**：过拟合 vs 欠拟合（重点！）", "同一组数据，1阶 → 15阶多项式拟合，画图对比"],
  ["**9.13**", "日", "**休息**", "—"],
  ["**9.14**", "一", "交叉验证 cross_val_score", "用 5 折交叉验证评估刚才的模型"],
  ["**9.15**", "二", "StandardScaler 特征标准化", "原始数据 vs 标准化后数据，对比拟合效果"]
]));
children.push(quote("📚 sklearn 参考：官方中文文档 sklearn.apachecn.org"));

// Week 9
children.push(h4("第 9 周：scikit-learn（下）— 扩展 + 综合"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**9.16**", "三", "岭回归 Ridge（处理多重共线性）", "同组数据对比 LinearRegression 和 Ridge"],
  ["**9.17**", "四", "逻辑回归（分类入门）", "用二阶系统特征（ζ）判断系统是否过阻尼"],
  ["**9.18**", "五", "完整的 ML Pipeline（数据→预处理→模型→评估）", "从头到尾走一遍标准流程"],
  ["**9.19**", "六", "**第二阶段中期检验**", "用 sklearn 做系统辨识：生成未知二阶系统数据 → 标准化 → 多项式特征 → Ridge回归 → 交叉验证评估"],
  ["**9.20**", "日", "**休息**", "—"],
  ["**9.21**", "一", "sklearn 复习 + 笔记整理", "把中期检验的代码整理成 Jupyter notebook，上传 GitHub"],
  ["**9.22**", "二", "缓冲日（补之前落下的，或休息）", "—"]
]));

children.push(hr());

// Week 10
children.push(h4("🔥 第 10 周：PyTorch（上）— 张量与自动求导"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**9.23**", "三", "Tensor 创建、属性、数据类型", "用 torch.tensor 创建矩阵，和 NumPy array 互转"],
  ["**9.24**", "四", "Tensor 运算：加减乘除、矩阵乘法、广播", "把 NumPy 的矩阵运算用 PyTorch 写一遍"],
  ["**9.25**", "五", "索引切片、reshape、concat", "—"],
  ["**9.26**", "六", "**自动求导** autograd（核心！）", "计算 y=x²+3x 在 x=2 的梯度，对比手算结果"],
  ["**9.27**", "日", "**休息**", "—"],
  ["**9.28**", "一", "梯度下降原理", "用 autograd 手动实现梯度下降，拟合 y=wx+b"],
  ["**9.29**", "二", "本周复习 + 笔记", "—"]
]));
children.push(quote("📚 PyTorch 参考：李沐《动手学深度学习》zh.d2l.ai 第2章 | B站视频"));

// Week 11
children.push(h4("第 11 周：PyTorch（中）— 线性模型 + 多层感知机"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**9.30**", "三", "`nn.Linear`、损失函数 MSELoss、优化器 SGD", "用 PyTorch 高层 API 实现 y=wx+b 拟合"],
  ["**10.1**", "四", "国庆——灵活安排，可复习", "—"],
  ["**10.2**", "五", "Softmax 回归、交叉熵损失", "MNIST 手写数字分类（只用 sklearn 加载数据）"],
  ["**10.3**", "六", "国庆——灵活安排", "—"],
  ["**10.4**", "日", "**休息**", "—"],
  ["**10.5**", "一", "MLP 多层感知机、激活函数 ReLU/Sigmoid", "搭建一个 3 层 MLP"],
  ["**10.6**", "二", "过拟合与正则化（Dropout、权重衰减）", "对比有无 Dropout 的训练曲线"]
]));

// Week 12
children.push(h4("第 12 周：PyTorch（下）— 训练循环 + 综合项目"));
children.push(makeTable4(["日期", "星期", "学习内容", "练习"], [
  ["**10.7**", "三", "完整的训练循环模板：train/val loop、保存模型", "把训练代码模板化"],
  ["**10.8**", "四", "DataLoader、自定义 Dataset", "把自己的控制仿真数据封装成 Dataset"],
  ["**10.9**", "五", "GPU 训练（如果有 GPU）或 CPU 优化", "—"],
  ["**10.10**", "六", "**第二阶段综合项目启动**", "见下方 ⬇️"],
  ["**10.11**", "日", "**休息**", "—"],
  ["**10.12**", "一", "综合项目：编码 + 调试", "—"],
  ["**10.13**", "二", "综合项目：完成 + 整理成 Jupyter notebook", "**push 到 GitHub，第二阶段正式完成 🎉**"]
]));

children.push(hr());

// 综合项目
children.push(h3("🏆 第二阶段综合项目（必做！）"));
children.push(quote("**神经网络拟合非线性二阶系统**"));
children.push(boldPara("背景：一个带死区的二阶系统，输入 u(t)，输出 y(t)，有测量噪声。传统线性辨识做不到完全拟合，用神经网络来做。"));
children.push(para("步骤："));
children.push(para("1. 用 NumPy 生成仿真数据（输入随机信号 → 二阶系统 + 非线性死区 → 加噪声 → 输出）"));
children.push(para("2. 用 pandas 整理数据，划分训练/测试集"));
children.push(para("3. 用 PyTorch 搭建一个 3~4 层 MLP"));
children.push(para("4. 写训练循环，画 loss 下降曲线"));
children.push(para("5. 在测试集上对比预测 vs 真值，计算 R²"));
children.push(para("6. 用 Matplotlib 画完整对比图（时域曲线 + 散点对比图）"));
children.push(para("7. 整理成 Jupyter notebook，push 到 GitHub"));
children.push(quote("做完这个项目，你就正式跨入了\"会用 AI 工具做控制相关实验\"的门槛。"));

children.push(hr());

// ── 第三阶段 ──
children.push(h3("🚀 第三阶段：方向深耕（2026.10.14 起）"));
children.push(h4("主线：强化学习（RL）"));
children.push(makeTable4(["周次", "日期范围", "学习内容", "资源"], [
  ["第 13 周", "**10.14~10.20**", "RL 核心概念：状态/动作/奖励/MDP/Bellman 方程", "莫凡教程 1~3 章 + 对照你本科现代控制理论笔记"],
  ["第 14 周", "**10.21~10.27**", "Q-Learning → DQN 原理", "莫凡教程第 4 章（DQN 系列）"],
  ["第 15 周", "**10.28~11.3**", "CartPole 实战：PyTorch 官方 DQN 教程，逐行理解", "pytorch.org/tutorials"],
  ["第 16 周", "**11.4~11.10**", "DQN 改进：Double DQN / Dueling DQN", "莫凡教程 4.6~4.8"],
  ["第 17 周", "**11.11~11.17**", "倒立摆实物视角：对比 DQN 和传统 LQR 控制", "自己写一个倒立摆的 LQR → 和 DQN 做横向对比"],
  ["第 18 周", "**11.18~11.24**", "PPO 入门", "莫凡教程 Policy Gradient → PPO"],
  ["第 19 周", "**11.25~12.1**", "整理 RL 学习笔记 + 代码仓库", "—"]
]));

children.push(hr());

// 研一入学前冲刺
children.push(h3("🎯 研一入学前冲刺（2026.12 ~ 2027.1）"));
children.push(makeTable2(["时间段", "任务"], [
  ["**12 月上旬**", "① 读目标课题组近 3 年论文 2~3 篇，标记不懂的地方 ② 如果方向是系统辨识 → 看李沐书第 6~8 章（CNN/RNN/LSTM）"],
  ["**12 月中旬**", "根据课题组方向选一个小课题方向，尝试复现一篇论文的核心实验"],
  ["**12 月下旬**", "完成复现实验，写成 Jupyter notebook"],
  ["**1 月上旬**", "整理个人 GitHub 主页：README 介绍、项目目录、代码注释完善"],
  ["**1 月中旬起**", "随时可以对接导师课题"]
]));

children.push(hr());

// ── 三、每日作息 ──
children.push(h2("三、每日作息建议"));
children.push(codeBlock("上午 (如果你有暑期安排，可调整)：\n  晚上 19:30~21:00   看视频教程 + 跟着敲代码（核心学习时间）\n  21:00~21:30         自己改代码、做练习（自主练习，最重要！）\n周末：\n  选一个下午           完整做本周的里程碑练习 + 整理笔记\n  另一个半天           自由探索 / 休息"));
children.push(quote("💡 保持**每天都有产出**（哪怕只有 10 行代码），比周末突击 6 小时效果好得多。"));

children.push(hr());

// ── 四、进度自检清单 ──
children.push(h2("四、进度自检清单"));
children.push(para("每周末花 5 分钟勾一下，确保没跑偏："));

children.push(h4("第一阶段完成标准（8.18 前）"));
children.push(checkbox("能独立写出 50 行以上的 Python 脚本（不查资料）", false));
children.push(checkbox("至少完成 3 个与控制相关的练习（一阶/二阶系统计算）", false));
children.push(checkbox("代码已用 Git 管理，push 到了 GitHub", false));

children.push(h4("第二阶段完成标准（10.13 前）"));
children.push(checkbox("NumPy/Matplotlib/pandas 各完成了至少 2 个练习", false));
children.push(checkbox("用 sklearn 完整跑过一个 ML pipeline（数据→训练→评估）", false));
children.push(checkbox("综合项目（神经网络拟合非线性系统）完成并 push 到 GitHub", false));
children.push(checkbox("会使用 Jupyter notebook 做实验", false));
children.push(checkbox("会用 conda 创建/管理虚拟环境", false));

children.push(h4("第三阶段中期标准（11.24 前）"));
children.push(checkbox("DQN CartPole 跑通，杆子稳定直立超过 200 步", false));
children.push(checkbox("能用自己的话解释 DQN 的原理（经验回放、目标网络、ε-greedy）", false));
children.push(checkbox("至少阅读了 1 篇课题组相关论文", false));

children.push(hr());

// ── 五、求助顺序 ──
children.push(h2("五、遇到问题时的求助顺序"));
children.push(codeBlock("1. 看报错信息的最后一行 → 大概率直接告诉你哪里错了\n2. Google/Bing 搜报错信息 → 90% 的问题别人都遇到过\n3. 查官方文档 → 最准确的参数说明\n4. 问 ChatGPT / Claude → 解释概念 + 改代码\n5. 在相关问题下提问（Stack Overflow 等）"));
children.push(quote("🚫 不要让报错中断你超过 30 分钟，超过就先跳过，第二天再回来解决。"));

children.push(hr());

// ── 六、日历图 ──
children.push(h2("六、关键节点日历图"));
children.push(codeBlock("2026 年 7~12 月\n────────────────────────────────────────────────────────────\n Jul │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n     │ 7.21 环境   7.22~8.18 Python 基础\n     │\n Aug │ ▒▒░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n     │ 8.18前     8.19~8.25 NumPy+Git+Linux\n     │ Python完成 8.26~9.1 Matplotlib\n     │\n Sep │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n     │ 9.2~9.8 pandas  9.9~9.22 scikit-learn\n     │ 9.23~           PyTorch 起步\n     │\n Oct │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n     │ ~10.13 PyTorch完成 + 综合项目\n     │ 10.14~ RL入门   10.28~ CartPole DQN实战\n     │\n Nov │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n     │ 11.1~ DQN改进  11.17~ PPO入门\n     │\n Dec │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n     │ 课题组论文阅读 + 方向调研 + 论文复现\n     │\n────────────────────────────────────────────────────────────\n                    → 2027.1 研一入学，准备就绪"));

children.push(hr());

// Final reminder
children.push(quote("📌 核心提醒：这个计划的目的是让你有节奏地前进，不是给你制造焦虑。如果某周没完成，下周补上就行；如果提前完成，就提前进入下一阶段。重要的是每天都在前进，哪怕只前进一点点。"));

// ── assemble and write ──
const doc = new Document({
  creator: "Claude",
  title: "AI + 控制算法 学习实施计划表",
  description: "自动化研0 AI学习路线",
  sections: [{
    properties: {
      page: {
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("d:/test/python_1/AI学习实施计划表.docx", buf);
  console.log("✅ Done: AI学习实施计划表.docx (" + (buf.length / 1024).toFixed(1) + " KB)");
}).catch(err => { console.error(err); process.exit(1); });
