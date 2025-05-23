配置说明：
环境：
Node v20.8.1

步骤：

1. 先配置好 ssh，然后终端执行：
   git clone git@github.com:Dingzhen2025/Dingzhen-Front.git
2. cd 进入项目后
3. 由于原始路径下载极慢，需要执行下面指令来切换国内镜像：
   Windows 系统：$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
   Linux/macOS 系统：export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
4. 执行：npm install

启动项目：
场景一：单指令同时启动 Vue、Electron：
执行：npm run dev

场景二：单独启动 Vue 网页端：
执行：npm run dev:vue

场景三：单独启动 Electron 窗口：
执行：npm start
