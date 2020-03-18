# Gardenia Server

自定义 git 服务器实现。接口文档见 [Api.md](./Api.md)。

# 部署注意

在后端系统中需要执行以下命令才能保证非英文文件名输出正确

```bash
git config --global core.quotepath false
```

