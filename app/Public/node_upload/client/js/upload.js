;(function ($, window, document, undefined) {
    var uploads = function (ele, opt) {
        this.$element = ele,
            this.defaults = {
                'c_id': '',
                'input_id': '',
                'c_url': '',
                'extensions': '',
                'number': 0,
                'singleRepeat':false,
                'text':false,
                'text_name':'',
                'text_placeholder':''
            },
            this.options = $.extend({}, this.defaults, opt)
    }
    uploads.prototype = {
        getUploader: function () {
            var c_id = this.options.c_id;
            var input_id = this.options.input_id;
            var c_url = this.options.c_url;
            var extensions = this.options.extensions;
            var number = this.options.number;
            var singleRepeat = this.options.singleRepeat;
            var text = this.options.text;
            var text_name = this.options.text_name;
            var text_placeholder = this.options.text_placeholder;

            var _extensions = extensions || "jpg,jpeg,gif,png";
            var Uploader = new plupload.Uploader({
                runtimes: 'html5,flash,silverlight',
                browse_button: c_id,
                max_file_size: '6mb',
                url: c_url,
                flash_swf_url: 'resource/js/Moxie.swf',
                silverlight_xap_url: 'resource/js/Moxie.xap',
                filters: [
                    { title: "图片（" + _extensions + "）", extensions: _extensions },
                    { title : "视频", extensions : "flv,mp4,avi,ts" },
                    { title : "音频", extensions : "mp3" }
                ],
                init: {
                    FilesAdded: function (up, files) {
                        if (files.length > 1) {
                            JQbox.alert("只能上传一个文件哦");
                        } else {
                            up.start();
                        }

                    },
                    FileUploaded: function (up, file, info) {
                      /*
                      *   {
                      *   "jsonrpc":"2.0",
                      *   "error":{"code":102,"message":"\u4e0a\u4f20\u6587\u4ef6\u5927\u5c0f\u4e0d\u7b26\uff01"},
                      *   "id":"id"
                      *   }
                      *
                      * */

                        if (info.response) {
                          if (info.response.indexOf("error") != -1)
                          {
                            var j_data = JSON.parse(info.response);
                            JQbox.alert(j_data.error.message);
                            return false;
                          }
                          //单个文件可重复上传
                            if(singleRepeat){
                                $.each(up.files, function (i, file) {
                                    $('#'+c_id).parent('.upload-container').find('.img_up').remove();
                                    if (up.files.length <= 1) {
                                        return;
                                    }
                                    up.removeFile(file);
                                });
                            }



                            var max_len = number;
                            if (max_len > 0) {
                                var now_len = $('#'+c_id).parent('.upload-container').find('.img_up').length;
                                if ((now_len + 1) >= max_len) {
                                    $('#' + c_id).hide();
                                }
                                if (now_len >= max_len) {
                                    return false;
                                }
                            }

                          var _ins = info.response.split('.');
                          if(_ins[1] == 'mp3'){
                            //上传mp3音频文件
                            var input_name_m = input_id + (max_len != 1 && !singleRepeat ? '[]': '');
                            var _mp3str = '<span class="img_up">';
                            _mp3str = _mp3str + '<span class="js-audio-con upload-aud play">';
                            _mp3str = _mp3str + '<audio src="' + golddiy_image_path + info.response + '" id="audio">您的浏览器不支持 audio 标签。</audio></span>';
                            _mp3str = _mp3str + '<input type="hidden" name="' + input_name_m + '" value="' + info.response + '">';
                            if (singleRepeat != true) {
                              _mp3str = _mp3str + '<a class="del_img" href="javascript:;">删除</a>';
                            }
                            _mp3str = _mp3str + '</span>';
                            $('#' + c_id).siblings('.img_ul').append(_mp3str);
                          }
                          else {
                            //普通文件
                            var input_name = input_id + (max_len != 1 && !singleRepeat ? '[]': '');
                            var _str = '<span class="img_up">';
                            _str = _str + '<img src="' + golddiy_image_path + info.response + '">';
                            _str = _str + '<input type="hidden" name="' + input_name + '" value="' + info.response + '">';
                            if (singleRepeat != true) {
                              _str = _str + '<a class="del_img" href="javascript:;">删除</a>';
                            }
                            if(text){
                              _str += '<input type="text" name="' +
                                text_name +
                                '" class="wei-up-inp" placeholder="' +
                                text_placeholder +
                                '"/>';
                            }
                            _str = _str + '</span>';
                            $('#' + c_id).siblings('.img_ul').append(_str);
                            //$('.del_img').hide();
                          }


                            this.refresh();

                            up = new uploads();
                            up.binddel(c_id, number, this);

                        } else {
                            alert('上传失败，请重试');
                        }
                    },
                    UploadProgress: function (up, file) {
                        file.id;
                        file.percent;
                    },
                    Error: function (up, err) {
                        JQbox.alert(err.message);
                    }
                }
            });
            return Uploader;
        },
        start: function (obj) {
            obj.init();
            this.binddel(this.options.c_id, this.options.number);
        },
        binddel:function(c_id, number, _this) {
            /* 删除 */
            var _img_len = $('#c_id').parent('.upload-container').find('.img_up').length;
            $('.del_img').on('click', function () {
                var obj = $(this).parent().parent().siblings('.img_add');
                if ('none' == obj.css('display')) {
                    obj.show();
                }
                $(this).parent().remove();
              _this.refresh();
            });
              $(this).find('.del_img').show();
          /*$('.img_up').hover(function () {
            $(this).find('.del_img').show();
          },function(){
            $(this).find('.del_img').hide();
          });*/

            if (_img_len > 0) {
                if (_img_len >= number) {
                    $('#' + c_id).hide();
                }
            }
        }

    };
    $.fn.uploads = function (options) {
        var upload = new uploads(this, options);
        upload.getUploader().init();
        upload.binddel();
    };
})(jQuery, window, document);
