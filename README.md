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

启动项目（需要开两个终端）：

1. 终端 1（运行 Vue）：npm run dev
   确保终端 1 运行起来后，再进行下面操作；
2. 终端 2（运行 Electron）：npm start
