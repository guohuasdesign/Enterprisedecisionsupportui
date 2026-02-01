# 启动前后端服务指南

## 检查服务状态

在终端运行以下命令检查服务是否在运行：

```bash
# 检查前端 (端口 5173)
lsof -i :5173

# 检查后端 (端口 3000)
lsof -i :3000
```

## 启动前端服务

```bash
# 在项目根目录
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui"

# 启动 Vite 开发服务器
npm run dev
```

前端服务会在 `http://localhost:5173` 启动

## 启动后端服务

```bash
# 进入后端目录
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui/backend"

# 确保已安装依赖
npm install

# 启动后端服务
npm run dev
```

后端服务会在 `http://localhost:3000` 启动

## 同时启动两个服务

打开两个终端窗口：

**终端 1 - 前端:**
```bash
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui"
npm run dev
```

**终端 2 - 后端:**
```bash
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui/backend"
npm run dev
```

## 验证服务运行

### 前端
打开浏览器访问: `http://localhost:5173`

### 后端
```bash
# 健康检查
curl http://localhost:3000/health

# 测试分析端点
curl -X POST http://localhost:3000/run-analysis -H "Content-Type: application/json" -d '{}'
```

## 当前状态

根据检查：
- ✅ **前端**: 端口 5173 有进程在运行
- ❌ **后端**: 端口 3000 没有服务运行

**需要启动后端服务！**
