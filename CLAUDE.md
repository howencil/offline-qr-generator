# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个完全离线的二维码生成器,使用纯前端技术栈(HTML/CSS/Vanilla JavaScript)构建。项目提供两种版本:
- **多文件版本** (`index.html` + `app.js` + `styles.css` + `qrcode.min.js`): 适合开发和维护
- **单文件版本** (`qr-generator-standalone.html`): 所有代码打包在一个HTML文件中,便于分发和使用

## 架构设计

### 核心架构模式
- **立即执行函数表达式(IIFE)**: `app.js` 使用 IIFE 封装以避免全局命名空间污染
- **状态管理**: 使用闭包管理应用状态 (`currentQRCode`, `currentURL`, `currentSize`)
- **DOM 缓存**: 启动时缓存所有 DOM 元素引用以优化性能 (参见 `cacheElements()`)
- **事件驱动**: 所有用户交互通过事件监听器处理

### 关键组件
1. **URL 验证系统** (`validateURL`, `processURL`):
   - 支持多种 URL 格式(HTTP/HTTPS/FTP、IP 地址、localhost)
   - 自动为缺少协议的 URL 添加 `https://`
   - 限制最大长度为 2000 字符(QR 码数据限制)

2. **QR 码生成** (`generateQRCode`):
   - 依赖外部库 `qrcode.min.js` (QRCode.js)
   - 支持动态尺寸调整(200px - 400px)
   - 使用纠错级别 M (CorrectLevel.M)

3. **下载功能** (`handleDownload`):
   - 从 canvas 导出 PNG 图片
   - 文件名格式: `qrcode-{domain}-{timestamp}.png`

### 键盘快捷键
- **Enter**: 生成二维码
- **Ctrl/Cmd + Enter**: 快速生成
- **Escape**: 清除输入或重新开始
- **Ctrl/Cmd + D**: 下载二维码(仅当 QR 码可见时)

## 开发说明

### 测试应用
直接在浏览器中打开 `index.html` 或 `qr-generator-standalone.html` 即可测试。无需构建工具或服务器。

### 调试模式
在 localhost 上运行时,会暴露 `window.QRApp` 对象用于调试,包含:
- `validateURL()`: 测试 URL 验证逻辑
- `processURL()`: 测试 URL 处理逻辑
- `generateFileName()`: 测试文件名生成逻辑

### 修改建议
- **修改样式**: 编辑 `styles.css`
- **修改功能**: 编辑 `app.js`
- **更新单文件版本**: 修改多文件版本后,需要手动更新 `qr-generator-standalone.html` 以保持同步

### 浏览器兼容性
最低要求: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+

## Communication Preferences
- Always reply in Chinese