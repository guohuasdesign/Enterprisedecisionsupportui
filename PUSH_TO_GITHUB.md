# 推送到 GitHub - 快速指南

## 当前情况
- 本地有 1 个新提交
- 远程有 4 个新提交
- 分支已分叉（diverged）

## 解决步骤

### 方法 1: Pull 然后 Push (推荐)

```bash
# 1. 先拉取远程更改并合并
git pull origin main

# 2. 如果有冲突，解决后：
git add .
git commit -m "Merge remote changes"

# 3. 推送
git push origin main
```

### 方法 2: Pull with Rebase (保持历史整洁)

```bash
# 1. 拉取并 rebase
git pull --rebase origin main

# 2. 如果有冲突，解决后：
git add .
git rebase --continue

# 3. 推送
git push origin main
```

## 完整命令（复制粘贴）

```bash
cd Enterprisedecisionsupportui
git pull origin main
git push origin main
```

## 如果有冲突

1. Git 会提示哪些文件有冲突
2. 打开冲突文件，找到 `<<<<<<<` 标记
3. 选择保留的代码（你的或远程的，或两者合并）
4. 删除冲突标记
5. 保存文件
6. 然后：
   ```bash
   git add <冲突的文件>
   git commit -m "Resolve merge conflicts"
   git push origin main
   ```

## 快速执行

在终端运行：

```bash
git pull origin main && git push origin main
```

这会自动拉取、合并（如果有冲突需要手动解决），然后推送。

---

**现在执行：** `git pull origin main`
