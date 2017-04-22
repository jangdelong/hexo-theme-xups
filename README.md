# Xups 主题安装及 Hexo 使用教程
![预览](./xups.png)
## 主题的一些特性

1. [百度分析](http://tongji.baidu.com/web/welcome/login)
2. [网易云跟帖](https://gentie.163.com/)评论
3. 博客图片存储于[七牛云存储](http://www.qiniu.com/)

## 使用指引

1. 安装hexo

    ```
    npm i hexo-cli -g
    hexo init blog
  cd blog
  npm install
    ```

2. 将主题拉到本地，并解压

    ```
    cd themes
    git clone https://github.com/jangdelong/hexo-theme-xups.git
    ```

4. 配置 _config.yml 的 theme 配置

    ```
    theme: hexo-theme-xups
    ```

5. 运行 `hexo s --watch`
  
  ```
  cd ..
  hexo generate # 或者 hexo g
  hexo s --watch
  ```
  
    运行上述命令后，浏览器打开 [http://localhost:4000](http://localhost:4000) 即可本地访问我们的网站
    
## 创建文章

有两种方法创建文章，可任选其一：

> 注意：文件名不要出现中文!!!

1. 使用`hexo new` 命令
  
  ``` bash
  $ hexo new "My New Post"
  ```

2. 拷贝现有的文章进行修改
  
  hexo使用markdown来编辑文章，在source目录下，拷贝任意md文件进行创建新的文章。具体可参考下hexo的官方说明

## 文章规范

1. 使用markdown写博文 
2. 博文图片统一位置：[七牛云存储](http://www.qiniu.com/)
3. 标准配图
   - xups主题现默认有0-9共10张博客配图
   - 博客封面配图：200x140，命名：xxx_thumbnail
4. 指明文章的标题、作者信息、封面图片地址、博客摘要

    ```
    ---
    title: {{ title }}
    date: {{ date }}
    author:
    tags:
    categories:
        - Web技术
        - 生活琐事
    thumbnail:
    blogexcerpt:

    ---

    ```
5. 利用`<!-- more --> `或者`post.blogexcerpt`设置文章的摘要

    示例：
    
    ```
    
  ---
  title: 文章标题
  blogexcerpt: 这里是自定义文章摘要
  ...
  ---
  
  这里是文章正文内容
  ...
  
    ```
    
    这部分是文章摘要，这部分是文章摘要。在hexo模版里可通过 <%- post.blogexcerpt || post.excerpt || post.content %> 来引用。
    - post.blogexcerpt：自定义摘要
    - post.excerpt：通过`<!-- more  -->`分隔符来获取的文章摘要
    - post.content：如不设置摘要情况，则直接输出文章全部内容
    
## 其他

- [Jelon前端小站](http://jelon.top)