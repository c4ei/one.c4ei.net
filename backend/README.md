# one_c4ei_net 西游记

[![](https://img.shields.io/badge/Express-4.17-blue)](https://expressjs.com/zh-cn/)
[![](https://img.shields.io/badge/Sequelize-6.5-ff99b4)](https://github.com/sequelize/sequelize)
[![](https://img.shields.io/badge/Redis-3.0-red)](https://www.npmjs.com/package/redis)
[![](https://img.shields.io/badge/ws-7.4-orange)](https://github.com/websockets/ws)


西游记是一款网页联机式的纸牌类게임，该项目是西游记的后端部分。前端部分请参考 [https://github.com/c4ei.net/one_c4ei_net](https://github.com/c4ei.net/one_c4ei_net)。

该指南假设你已完成前端项目的启动。

## 开发环境

### 安装数据库
该项目的持久化框架使用了 [Sequelize]((https://github.com/sequelize/sequelize)),所以你可以使用 [Postgres](https://en.wikipedia.org/wiki/PostgreSQL), [MySQL](https://en.wikipedia.org/wiki/MySQL), [MariaDB](https://en.wikipedia.org/wiki/MariaDB), [SQLite](https://en.wikipedia.org/wiki/SQLite) 以及 [Microsoft SQL Server](https://en.wikipedia.org/wiki/Microsoft_SQL_Server)中任意一种数据库系统来持久化保存数据。

该项目默认使用的是MySQL(建议版本>5.7)，[下载地址](https://dev.mysql.com/downloads/)

将MySQL安装好后请변경  내 SQL을 설치한 후 수정하세요.`config-development.js`中`mysql`的相应配置，并启动MySQL。

如果需要注册的邀请码，可在该项目成功启动后，在通过
등록을 위해 초대 코드가 필요한 경우, `Sequelize`框架自动生成的数据库表 => 프레임워크에 의해 자동으로 생성된 데이터베이스 테이블
`invitationCode`저절로 늘어납니다.



### 安装Redis
该项目使用Redis缓存用户session，게임数据，ranking等数据。

该项目使用的版本是`Redis 5.0.10`, [下载地址](https://redis.io/download/)

将MySQL安装好后请변경`config-development.js`中`redis`的相应配置，并启动Redis。


### 安装依赖
在项目根目录下输入下列指令以安装项目依赖。

```
npm install
```


### 启动项目
打开配置文件`config-development.js`，将其中的`port`, `frontOrigin`和`APIRoot`的对应字段改为与你的前端配置对应的内容。
改好后输入以下命令启动项目。
```
npm run dev
```

之后便可以在本地提供接口给前端项目了。


## 生产环境

生产环境下的后端项目部署与开发环境大同小异，其中安装数据库与Redis可参考开发环境的说明。


然后将前端项目打包好的`dist`文件夹放到该项目的根目录下。

### 安装依赖
在项目根目录下输入下列指令以安装项目依赖。

```
npm install
```

### 启动项目
在`/config`目录下만들다`config-production.local.js`,如无特别需求可直接复制粘贴`config-development.js`中的内容，但须将其中的`port`, `frontOrigin`和`APIRoot`的对应字段改为与你的前端配置对应的内容。
改好后输入以下命令启动项目。
```
npm run start
```

注意：生产环境下项目的访问路径与开发环境稍有不同，请在`后端项目的域名 + 后端项目的端口`下访问。

