# 🎮 Neon Abyss — 霓虹深渊

> 赛博朋克 Boss Rush 射击游戏 | 纯 HTML/JS | 零依赖 | 开源免费

## 🚀 快速部署到 GitHub Pages（免费）

### 第 1 步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)（没有账号的话免费注册一个）
2. 点击右上角 **+** → **New repository**
3. 仓库名填写：`neon-abyss`（或任意名字）
4. 选择 **Public**（公开）
5. 点击 **Create repository**

### 第 2 步：上传文件

**方法 A — 网页上传（最简单）：**
1. 在仓库页面点击 **uploading an existing file**
2. 把这两个文件拖进去：
   - `index.html`（首页/宣传页）
   - `rhythm_jumper.html`（游戏本体）
3. 点击 **Commit changes**

**方法 B — 命令行（推荐）：**
```bash
git init
git add index.html rhythm_jumper.html README.md
git commit -m "Initial release: Neon Abyss"
git branch -M main
git remote add origin https://github.com/你的用户名/neon-abyss.git
git push -u origin main
```

### 第 3 步：开启 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，文件夹选 `/ (root)`
4. 点击 **Save**
5. 等待 30-60 秒，页面会显示你的网址：
   ```
   https://你的用户名.github.io/neon-abyss/
   ```

### 第 4 步：分享赚钱！

把链接发给朋友、发到社交媒体、游戏论坛！

## 💰 如何变现

### 1. 赞赏码（已在首页预留位置）
- 替换 `index.html` 中 `qr-placeholder` 的微信/支付宝赞赏码图片
- 将二维码图片放到仓库中，然后修改 HTML 中的 `<img>` 标签

### 2. Buy Me a Coffee
- 访问 [buymeacoffee.com](https://www.buymeacoffee.com/) 注册
- 将首页中的链接替换为你的个人链接

### 3. Google AdSense（进阶）
- 在 `rhythm_jumper.html` 的 `<head>` 中添加 AdSense 代码
- 广告收入按展示和点击计算
- 需要网站有一定流量后才能申请

### 4. 自定义域名
- 购买域名（如 `neon-abyss.com`）
- 在 GitHub Pages Settings 中配置 Custom Domain
- 在域名提供商处添加 CNAME 记录指向 `你的用户名.github.io`

## 🎯 游戏玩法

| 按键 | 操作 |
|------|------|
| Space / ↑ | 跳跃 / 二段跳 |
| M | 发射弹幕（消耗能量） |

- 击败 5 种 Boss，获取永久 Buff
- 打爆能量方块获取能量
- 拾取能量球升级武器
- 3 条命，捡血包回血

## 📁 文件说明

```
index.html            ← 酷炫宣传首页
rhythm_jumper.html    ← 游戏本体（单文件，浏览器直接打开）
README.md             ← 本文件
```

## 🛠️ 技术栈

- 纯 HTML + CSS + JavaScript
- Canvas 2D API 渲染
- Web Audio API 音效
- 零外部依赖，浏览器即开即玩
- 兼容所有现代浏览器（Chrome/Firefox/Edge/Safari）

## 📝 License

MIT — 随意使用、修改、商用。如果能保留作者署名就更好了 ❤️
