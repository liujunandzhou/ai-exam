# 部署指南 / Deployment Guide

## 部署到 Vercel（推荐）

### 前提条件
1. 注册 [Vercel 账号](https://vercel.com)
2. 安装 Vercel CLI（可选）: `npm i -g vercel`

### 方式一：通过 Vercel Dashboard（最简单）

1. **访问 Vercel**
   - 登录 https://vercel.com
   - 点击 "Add New Project"

2. **导入项目**
   - 如果项目在 GitHub，连接 GitHub 并选择仓库
   - 如果没有 Git 仓库，可以先创建一个

3. **配置项目**
   ```
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成，获取公网 URL

### 方式二：通过 Vercel CLI

1. **进入前端目录**
   ```bash
   cd /Users/bytedance/work/golearn/src/code.byted.org/ai-exam/frontend
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **部署**
   ```bash
   vercel --prod
   ```

4. **按提示操作**
   - 选择项目设置
   - 确认部署

## 部署到 Netlify

### 方式一：从 GitHub 自动部署（推荐）

1.  **准备工作**
    *   确保项目根目录已有 `netlify.toml` 文件（已为您创建）。
    *   确保代码已推送到 GitHub。

2.  **连接 GitHub**
    *   登录 [Netlify Dashboard](https://app.netlify.com)。
    *   点击 **"Add new site"** -> **"Import an existing project"**。
    *   选择 **GitHub**。

3.  **选择仓库**
    *   搜索并选择您的仓库 `ai-exam`。

4.  **配置构建设置**
    *   Netlify 会自动读取 `netlify.toml` 配置，您通常**不需要手动修改**。
    *   确认以下设置（如果未自动填充）：
        *   **Base directory**: `frontend`
        *   **Build command**: `npm run build`
        *   **Publish directory**: `dist`

5.  **部署**
    *   点击 **"Deploy site"**。
    *   Netlify 会自动构建并发布。以后每次 `git push` 都会自动更新。

### 方式二：通过 Netlify CLI（手动）

1.  **安装 Netlify CLI**
    ```bash
    npm install -g netlify-cli
    ```

2.  **进入前端目录并构建**
    ```bash
    cd frontend
    npm run build
    ```

3.  **部署**
    ```bash
    netlify deploy --prod
    ```
    *   当询问 Publish directory 时，输入 `dist`。

## 环境变量配置

无需额外配置，因为：
- Supabase URL 和 Key 已经在代码中（公开 anon key 是安全的）
- 所有敏感操作都通过 RLS 保护

## 测试部署

部署后访问您的公网 URL，测试：
1. 用户注册/登录
2. 教师端功能
3. 学生端功能

## 域名绑定（可选）

如果有自己的域名：
- **Vercel**: Settings → Domains → Add
- **Netlify**: Domain Settings → Add custom domain

## 注意事项

1.  **Supabase 项目**: 已经在云端运行，无需额外配置
2.  **构建时间**: 首次部署约需 1-2 分钟
3.  **自动部署**: 连接 Git 后，每次推送会自动部署
