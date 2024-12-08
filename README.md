# DaVinci Resolve Font Toolkit

> 测试环境: Davinci Resolve Studio 19.0B Build 25, Windows 11 23H2

由于达芬奇的字体选择框无法直接预览字体样式, 字体太多了选择效率很低, 就做了一个可以收藏/预览/应用字体的小工具.

## 安装 & 使用

目前提供了两种安装方式, 分别对应内部调用(脚本)和外部调用(二进制).

### 前置条件

确保你使用的是 DaVinci Resolve Studio 版本, 并在偏好设置(Preference)/常规(General)开启了外部脚本使用(External scripting using).

### 二进制(推荐)

> [!NOTE]
> 目前仅有Windows环境的二进制, macOS 可以参考 [构建二进制](#构建二进制) 自己构建.

下载 [Release](https://github.com/TachibanaKimika/DaVinci-Resolve-Font-Toolkit/releases) 页面下的 *-bin.zip 文件并解压缩到任意路径, 打开 DaVinci Resolve 后打开解压后的 preview.exe 文件即可使用.(会在相同目录下生成一个 ./data 文件夹保存数据)

### 脚本

> [!CAUTION]
> 目前脚本调用会有一些文件读写权限问题, 需要管理员权限打开DaVinci Resolve, 不推荐使用.

1. 安装`pywebview`.

```shell
pip install pywebview
```

2. 下载 [Release](https://github.com/TachibanaKimika/DaVinci-Resolve-Font-Toolkit/releases) 页面下的 `*-script.zip` 文件, 解压到 `C:\ProgramData\Blackmagic Design\DaVinci Resolve\Fusion\Scripts\Edit` (macOS 路径是 `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Edit`) 目录下.

3. 打开 DaVinci Resolve, 打开`工作区(workspace) -> 脚本 -> Edit -> DaVinci Resolve Font Toolkit -> preview` 即可使用.

### 窗口介绍

如下图所示, 目前实现了字体收藏/搜索功能, 右上角的状态是与 DaVinci Resolve 链接的状态, 如果状态为红色或软件为生效, 需要点击下旁边的刷新按钮重新连接. 在连接成功后点击字体或下面的样式按钮即可将选择的字体应用到对应的Fusion片段中.

![img.png](/pics/ui.png)

#### 应用字体须知

目前本插件仅适用于 快编(Cut)/剪辑(Edit)/Fusion 面板.

- 处于 快编/剪辑 面板时, 点击字体会将字体应用到**当前时刻的Fusion合成**中(如果该合成包含[TextPlus](https://www.steakunderwater.com/VFXPedia/96.0.243.189/indexe4cd.html)属性).
- 处于 Fusion 面板时, 点击字体会将字体应用到**选择的Fusion节点**中.


## 构建二进制

需要 NodeJS 环境(>=18) 以及 Python 环境(>=3.10.1)

```shell
git clome $REPO && cd $REPO

npm i -g pnpm

# 安装依赖
pnpm install
pip install pywebview pyinstaller

# 构建 (非Windows系统需要根据实际情况修改build.js中pyinstaller的参数)
pnpm pack-bin
```
