# AI Exam System

一个现代化的在线考试管理系统，支持教师创建和管理考试，学生参加考试并查看成绩。

## 🌟 功能特性

### 👨‍🏫 教师功能

- **考试管理**
  - 创建新考试（设置标题、时长、总分）
  - 添加多选题（支持 A/B/C/D 四个选项）
  - 编辑和删除考试
  - 查看所有已创建的考试列表

- **成绩查看**
  - 查看学生的考试成绩
  - 查看考试详细信息和统计数据

### 👨‍🎓 学生功能

- **考试参加**
  - 浏览可用的考试列表
  - 开始考试并答题
  - 实时倒计时提醒
  - 提交答案后自动评分

- **成绩查看**
  - 查看考试历史记录
  - 查看详细的考试结果
  - 查看每道题的正确答案和自己的作答

### 🔐 用户认证与管理

- **账户功能**
  - 用户注册（支持学生和教师角色）
  - 邮箱验证登录
  - 自动记住上次登录的邮箱
  - 个人资料管理
    - 显示用户名和头像（基于首字母）
    - 修改显示名称
    - 修改密码（需验证旧密码）
    - 安全退出登录

### 🎨 用户体验

- 现代化的响应式设计
- 深色模式支持（可切换）
- 平滑的动画和过渡效果
- 直观的卡片式布局
- 友好的错误提示和成功反馈

## 🛠️ 技术栈

### 前端

- **框架**: React 18 + Vite
- **路由**: React Router v6
- **样式**: Vanilla CSS with CSS Variables
- **认证**: Supabase Auth
- **状态管理**: React Context API

### 后端

- **BaaS**: Supabase
  - PostgreSQL 数据库
  - Row Level Security (RLS)
  - 实时订阅
  - Edge Functions
  - 认证服务

### 部署

- **托管**: Netlify
- **域名**: https://ai-exam-liujun.netlify.app

## 📦 数据库结构

### `profiles` 表
- `id` (uuid, primary key) - 用户 ID
- `username` (text) - 用户名
- `role` (text) - 角色（student/teacher）
- `created_at` (timestamp) - 创建时间

### `exams` 表
- `id` (uuid, primary key) - 考试 ID
- `title` (text) - 考试标题
- `created_by` (uuid) - 创建者 ID
- `duration_minutes` (integer) - 考试时长（分钟）
- `total_score` (integer) - 总分
- `created_at` (timestamp) - 创建时间

### `questions` 表
- `id` (uuid, primary key) - 题目 ID
- `exam_id` (uuid) - 考试 ID
- `question_text` (text) - 题目内容
- `option_a` (text) - 选项 A
- `option_b` (text) - 选项 B
- `option_c` (text) - 选项 C
- `option_d` (text) - 选项 D
- `answer` (text) - 正确答案
- `score` (integer) - 分值

### `exam_results` 表
- `id` (uuid, primary key) - 结果 ID
- `exam_id` (uuid) - 考试 ID
- `student_id` (uuid) - 学生 ID
- `score` (integer) - 得分
- `answers` (jsonb) - 学生答案
- `submitted_at` (timestamp) - 提交时间

## 🚀 快速开始

### 前置要求

- Node.js 18 或更高版本
- Supabase 账户

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ai-exam
   ```

2. **安装依赖**
   ```bash
   cd frontend
   npm install
   ```

3. **配置环境变量**
   
   在 `frontend` 目录下创建 `.env` 文件：
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **设置数据库**
   
   在 Supabase SQL Editor 中执行数据库迁移脚本（参考 `implementation_plan.md`）

5. **配置服务端函数**
   
   在 Supabase SQL Editor 中创建 `grade_and_submit_exam` 函数（参考 `grade_exam_function.sql`）

6. **启动开发服务器**
   ```bash
   npm run dev
   ```

7. **访问应用**
   
   打开浏览器访问 `http://localhost:5173`

## 📝 使用说明

### 教师使用流程

1. 注册教师账户
2. 登录系统
3. 在仪表板点击 "Create New Exam"
4. 填写考试信息（标题、时长、总分）
5. 添加题目和选项
6. 点击 "Create Exam" 完成创建
7. 在 "My Exams" 中查看和管理考试

### 学生使用流程

1. 注册学生账户
2. 登录系统
3. 在 "Available Exams" 中查看可用考试
4. 点击 "Start Exam" 开始考试
5. 在规定时间内完成答题
6. 点击 "Submit Exam" 提交
7. 在 "Recent Results" 中查看成绩和详情

## 🔒 安全特性

- **服务端评分**: 考试答案和评分逻辑在服务端处理，防止作弊
- **密码验证**: 修改密码时需要验证旧密码
- **Row Level Security**: 数据库级别的访问控制
- **角色隔离**: 学生和教师功能完全隔离
- **邮箱验证**: 注册时发送验证邮件

## 🎯 项目亮点

1. **零后端代码**: 使用 Supabase BaaS，无需编写后端服务器代码
2. **实时更新**: 利用 Supabase 实时订阅功能
3. **安全性优先**: 客户端不暴露答案，服务端评分
4. **现代化 UI**: 简洁美观的用户界面
5. **响应式设计**: 完美适配各种设备尺寸
6. **用户体验优化**: 自动保存登录邮箱、平滑动画、友好提示

## 📄 许可证

MIT License

## 👨‍💻 作者

Liu Jun

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过 GitHub Issues 联系。
