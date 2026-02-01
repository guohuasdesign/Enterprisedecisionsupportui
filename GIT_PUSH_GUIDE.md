# Git Push 指南 - 解决推送被拒绝的问题

## 问题
```
error: failed to push some refs
hint: Updates were rejected because the tip of your current branch is behind
```

**原因：** 远程仓库有新的提交，你的本地分支落后了。

## 解决方案

### 方法 1: Pull 然后 Push (推荐)

这是最安全的方法，会合并远程更改：

```bash
# 1. 先拉取远程更改
git pull origin main

# 2. 如果有冲突，解决冲突后：
git add .
git commit -m "Merge remote changes"

# 3. 然后推送
git push origin main
```

### 方法 2: Pull with Rebase (保持历史整洁)

如果你想保持提交历史更整洁：

```bash
# 1. 拉取并 rebase
git pull --rebase origin main

# 2. 如果有冲突，解决后：
git add .
git rebase --continue

# 3. 然后推送
git push origin main
```

### 方法 3: Force Push (谨慎使用)

⚠️ **警告：** 这会覆盖远程更改，只在确定远程更改不重要时使用！

```bash
git push --force origin main
```

或者更安全的强制推送（如果远程有本地没有的提交会被拒绝）：

```bash
git push --force-with-lease origin main
```

## 推荐步骤

### 步骤 1: 查看状态
```bash
git status
```

### 步骤 2: 查看远程更改
```bash
git fetch origin
git log HEAD..origin/main --oneline
```

这会显示远程有哪些新提交。

### 步骤 3: 拉取并合并
```bash
git pull origin main
```

### 步骤 4: 如果有冲突

1. 打开冲突文件
2. 解决冲突（保留需要的代码）
3. 标记为已解决：
   ```bash
   git add <冲突的文件>
   ```
4. 完成合并：
   ```bash
   git commit -m "Merge remote changes"
   ```

### 步骤 5: 推送
```bash
git push origin main
```

## 完整命令序列

```bash
# 进入项目目录
cd Enterprisedecisionsupportui

# 查看当前状态
git status

# 拉取远程更改
git pull origin main

# 如果有未提交的更改，先提交
git add .
git commit -m "Your commit message"

# 再次拉取（确保最新）
git pull origin main

# 推送
git push origin main
```

## 常见问题

### Q: 如果 pull 时有很多冲突怎么办？

A: 你可以：
1. 先查看冲突：`git status`
2. 逐个解决冲突文件
3. 或者使用 `git stash` 暂存你的更改，pull 后再应用：
   ```bash
   git stash
   git pull origin main
   git stash pop
   ```

### Q: 如果我不想要远程的更改怎么办？

A: 使用 force push（但要小心）：
```bash
git push --force-with-lease origin main
```

### Q: 如何查看远程和本地的差异？

A:
```bash
git fetch origin
git diff main origin/main
```

## 最佳实践

1. ✅ **总是先 pull 再 push**
2. ✅ **定期同步远程更改**
3. ✅ **提交前检查状态** (`git status`)
4. ❌ **避免 force push**（除非真的需要）
5. ✅ **使用有意义的 commit 消息**

---

**现在执行：** `git pull origin main` 然后 `git push origin main`
