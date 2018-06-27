var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-checkcss';

function gulpCheckCss(arrPath) {
    var scssArr= new Array(0);
    arrPath.forEach(function(el,ind){
        if(el.indexOf('!')===-1){
            scssArr.push(el);
        }
    });
    
    var scssPath=scssArr[0];
    // 创建一个让每个文件通过的 stream 通道
    var stream = through.obj(function (file, enc, cb) {
        //拼接scss文件路径
        var scssfile = path.join(path.dirname(path.join(process.cwd(), scssPath)), path.basename(file.path, '.css') + '.scss');

        var cssinfo = fs.statSync(file.path);
        var that = this;
        //判断scss目录下是否有同名的文件
        fs.exists(scssfile, function (exist) {
            if (exist) {
                var scssinfo = fs.statSync(scssfile);
                var cssdate = Date.parse(cssinfo.mtime) / 1000;
                var scssdate = Date.parse(scssinfo.mtime) / 1000;
                if (cssdate > scssdate) {
                    gutil.log(gutil.colors.red('请修改' + path.dirname(scssPath) + '目录中的样式文件'));
                    throw new PluginError(PLUGIN_NAME, '此次打包失败');
                }
            }
        });

        // 确保文件进去下一个插件
        this.push(file);
        // 告诉 stream 转换工作完成
        cb();
    });

    // 返回文件 stream
    return stream;
}

// 暴露（export）插件的主函数
module.exports = gulpCheckCss;