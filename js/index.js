var myJson = {
    "dalogContens": [{
        "aside": "咪咕创意公司会议室……",
        "bigImg": "",
        "mscUrl": "",
        "vedioUrl": "",
        "bgmName": "",
        "bgmId": "",
        "userLevel": "",
        "photoPic": "",
        "name": "",
        "dalogCont": ""
    }]
};

// 对话体小说滚动翻阅
(function() {
    var timeBack = function(o) {
        var that = this;
        this.config = o;
        this.control = false;
        this.sPos = {};
        this.mPos = {};
        this.config.bind.addEventListener('touchstart', function(e) { return that.start(e); }, false);
        this.config.bind.addEventListener('touchmove', function(e) { return that.move(e); }, false);
        this.config.bind.addEventListener('touchend', function(e) { return that.end(e); }, false);
    };
    timeBack.prototype.start = function(e) {
        var point = e.touches ? e.touches[0] : e;
        this.sPos.y = point.screenY;
    };
    timeBack.prototype.move = function(e) {
        var point = e.touches ? e.touches[0] : e;
        this.control = true;
        this.mPos.y = point.screenY;
    };
    timeBack.prototype.end = function(e) {
        if ((this.sPos.y - this.mPos.y > 20) && this.control) {

        } else if ((this.sPos.y - this.mPos.y < -20) && this.control) {
            $(".cmr-dalog-contrlBox").hide();
            $(".cmr-dalog-content").css("height", "100%");
        } else {

        }
        this.control = false;
    };

    window.timeBack = timeBack;
    document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);

}());
var a = new timeBack({
    bind: document.getElementById("cmr-dalog"),
    dire_h: false
})

//自定义弹窗
function salert(str, style) {
    var notify = $(".add-container .notify");
    notify.addClass(style).addClass("notify-show").text(str);
    setTimeout(function() { notify.removeClass("notify-show") }, 2000);
    setTimeout(function() { notify.removeClass(style) }, 2300);
}

// 自定义确认窗口
function sconfirm(str, fn, fn_cancel) {
    var sconfirm = $(".sconfirm").length > 0 ? $(".sconfirm") : $('<div class="sconfirm sconfirm-hide"><span class="sconfirm-content"></span><div class="sconfirm-confirm sconfirm-btn">确定</div><div class="sconfirm-cancel sconfirm-btn">取消</div></div>').appendTo("body");
    setTimeout(function() { sconfirm.removeClass("sconfirm-hide"); }, 100);
    var confirmDo = function(_fn) {
        return function() {
            try {
                _fn();
            } catch (e) {
                sconfirm.addClass("sconfirm-hide");
                return;
            }
            sconfirm.addClass("sconfirm-hide");
        }
    }
    sconfirm.find(".sconfirm-confirm")[0].onclick = null;
    sconfirm.find(".sconfirm-cancel")[0].onclick = null;
    sconfirm.find(".sconfirm-content").text(str);
    sconfirm.find(".sconfirm-confirm")[0].onclick = confirmDo(fn);
    sconfirm.find(".sconfirm-cancel")[0].onclick = confirmDo(fn_cancel);
}

// 对话体小说内容预览控制器
var Novel = {
    init: function(_myJson) {
        var _this = this;
        // 获取本地缓存数据
        var novelData = JSON.parse(localStorage.getItem("novelData") ? localStorage.getItem("novelData") : "{}");
        var DataIncludeFristCon = {
            "dalogContens": [{
                "aside": "旁白一（必填）",
                "bigImg": "",
                "mscUrl": "",
                "vedioUrl": "",
                "bgmName": "",
                "bgmId": "",
                "userLevel": "",
                "photoPic": "",
                "name": "",
                "dalogCont": ""
            }]
        };
        var source = novelData.source ? novelData.source : { character: [], music: [], image: [] };
        var bookId = novelData.bookId ? novelData.bookId : "";
        var hasLocalData = !(!novelData.dalogContens || novelData.dalogContens.length < 1);
        var hasValidJson = !(!_myJson.dalogContens || _myJson.dalogContens.length < 1);
        DataIncludeFristCon.source = source;
        DataIncludeFristCon.bookId = bookId;
        //初始状态值设定
        this.appendTimeout = undefined;
        this.appendOn = 1;
        this._slideIndex = 0;
        this.asideClass = "dalog-aside-min";
        this.allHeight = 0;
        this.musicOn = 0;
        this.myJson = hasValidJson ? _myJson : (hasLocalData ? novelData : DataIncludeFristCon);
        this.myJson.source = source;
        this.myJson.bookId = bookId;
        localStorage.setItem("novelData", JSON.stringify(this.myJson));
        this.contentSize = this.myJson.dalogContens.length;
        this.readpct = Math.round(((this._slideIndex + 1) / this.contentSize) * 100) + "%";
        this.rightRole = $(".role-btn.role-main").attr("id");
        console.log(this.rightRole);
        $(".swiper-wrapper").empty();
        $.fn.longPress = function(fn) {
            var timeout = undefined;
            var $this = this;
            for (var i = 0; i < $this.length; i++) {
                $this[i].addEventListener('touchstart mousedown', function(event) {
                    timeout = setTimeout(fn, 800);
                }, false);
                $this[i].addEventListener('touchend mouseup', function(event) {
                    clearTimeout(timeout);
                }, false);
            };
        };
        var fristCon = this.myJson.dalogContens[this._slideIndex].aside;
        if (fristCon.length > 17) {
            this.asideClass = "dalog-aside-long";
        }
        $("#contents .swiper-wrapper").append('<div class="swiper-slide"><p class="' + this.asideClass + '">' + fristCon + '</p></div>');
        $(".cmr-dalog-progress span").css("width", this.readpct);
        this.swiperDalog = new Swiper('.cmr-dalog-content .swiper-container', {
            slidesPerView: 'auto',
            freeMode: true,
            direction: 'vertical',
            onSlidePrevStart: function(swiper) {
                _this.allHeight = 1;
                $(".cmr-dalog-contrlBox").hide();
                $(".cmr-dalog-content").css("height", "100%");
            }
        });

        var _dalogContens = this.myJson.dalogContens;
        var preloadBox = $("<div style='display:none;' class='preload-box'></div>").appendTo($("body"));
        for (var i = 0; i < _dalogContens.length; i++) {
            var jsonItem = _dalogContens[i];
            if (jsonItem.mscUrl != "") {
                $('<audio preload="auto" class="audio" hidden="true"><source src="' + jsonItem.mscUrl + '" type="audio/mpeg"></audio>').appendTo(preloadBox);
            }
            if (jsonItem.bigImg != "") {
                var _image = new Image();
                _image.src = jsonItem.bigImg;
            }
            if (jsonItem.photoPic != "") {
                var _image = new Image();
                _image.src = jsonItem.photoPic;
            }
        }

        $(".cmr-dalog-warpbg").show();
        $("#cmr-dalog").show();
        console.log('readpct:' + this.readpct);
        console.log(this.myJson);
        console.log(this.contentSize);
    },
    // 事件监听
    addListener: function() {
        var _this = this;
        $(".role-btn").on("click", function(e){
            $(".role-btn").removeClass("role-main");
            $(this).addClass("role-main");
            _this.rightRole = $(this).attr("id");
        });
        // 小说播放
        $(".cmr-dalog-bookPlay").click(function() {
            $(".cmr-dalog-warpbg").hide();
            console.log("gohide")
        });
        // 长按开启自动播放
        $(".cmr-dalog-contrlBox").longPress(function() {
            $(".cmr-dalog-contrlTxt").hide();
            setTimeout(function() {
                $(".cmr-dalog-contrl").show();
            }, 2000);
            if (_this.appendOn) {
                _this.autoAppend();
                _this.appendOn = 0;
            }
        });
        var longClickTimeout;
        $(".cmr-dalog-contrlBox").bind("mousedown", function() {
            longClickTimeout = setTimeout(function() {
                if (_this.appendOn) {
                    _this.autoAppend();
                    _this.appendOn = 0;
                }
                setTimeout(function() { $(".cmr-dalog-contrl").show(); }, 2000);
            }, 1000);
        });
        $(".cmr-dalog-contrlBox").bind("mouseup", function() {
            clearTimeout(longClickTimeout);
        });
        // 小说播放控制区域
        $(".cmr-dalog-contrl").click(function(oEvent) {
            e = window.event || oEvent;
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            };
            clearTimeout(_this.appendTimeout);
            _this.appendOn = 1;
            $(".cmr-dalog-contrl").hide();
        });
        // 点击内容区域播放小说
        $("#contents,.cmr-dalog-contrlBox").click(function() {
            _this._slideIndex++;
            if (_this.allHeight) {
                $(".cmr-dalog-content").css("height", "70%");
                $(".cmr-dalog-contrlBox").show();
            } else {
                _this.allHeight = 0;
            }
            if (_this._slideIndex < _this.contentSize) {
                _this.myAppendSlide(_this._slideIndex);
            } else {
                $("#cmr-dalog").hide();
            }
        });
    },
    // 小说内容动态添加
    myAppendSlide: function() {
        var _this = this;
        var dlgClass = "";
        var dlgbgClass = "dalog-style";
        var _index = this._slideIndex;
        var aside = this.myJson.dalogContens[_index].aside;
        var bigImg = this.myJson.dalogContens[_index].bigImg;
        var mscUrl = this.myJson.dalogContens[_index].mscUrl;
        var bgmName = this.myJson.dalogContens[_index].bgmName;
        var bgmId = this.myJson.dalogContens[_index].bgmId;
        var vedioUrl = this.myJson.dalogContens[_index].vedioUrl;
        var photoPic = this.myJson.dalogContens[_index].photoPic;
        var userLevel = this.myJson.dalogContens[_index].userLevel;
        var name = this.myJson.dalogContens[_index].name;
        var dalogCont = this.myJson.dalogContens[_index].dalogCont;
        var sildeStr = "";
        this.readpct = Math.round(((_index + 1) / this.contentSize) * 100) + "%";
        $(".cmr-dalog-progress span").css("width", this.readpct);
        console.log('readpct:' + this.readpct);
        if (aside != "") {
            if (aside.length > 17) {
                this.asideClass = "dalog-aside-long";
            }
            sildeStr = '<div class="swiper-slide"><p class="' + this.asideClass + '">' + aside + '</p></div>'
        } else if (bigImg != "") {
            sildeStr = '<div class="swiper-slide"><img src="' + bigImg + '"></div>';
        } else if (mscUrl != "") {
            sildeStr = '<div class="swiper-slide"><div class="cmr-dalog-mscBox"  onclick="Novel.replayMsc(this);"  data-miscId ="' + bgmId + '"><p class="cmr-dalog-mscBg"><i class="cmr-dalog-mscOver cmr-dalog-mscOn">&nbsp;</i>' + bgmName + '</p><span id="' + bgmId + 'time"></span><audio preload="auto" autoplay="true"  id="' + bgmId + '" hidden="true" ><source src="' + mscUrl + '" type="audio/mpeg"></audio></div></div>';
        } else if (vedioUrl != "") {

        } else {
            if (userLevel == "g1") {
                // dlgClass = "dalog-item-right";
                dlgClass = _this.rightRole=="role_women"?"dalog-item-right":"";
                dlgbgClass = "dalog-style2";
            } else if (userLevel == "b1") {
                dlgClass = _this.rightRole!="role_women"?"dalog-item-right":"";
                dlgbgClass = "dalog-style2";
            } else if (userLevel == "b2" || userLevel == "g2") {
                dlgbgClass = "dalog-style";
                if (userLevel == "g2") {
                    dlgbgClass = "dalog-style g2";
                }
            } else {
                dlgClass = "";
                dlgbgClass = "dalog-styleNormal";
            }
            sildeStr = '<div class="swiper-slide"><div class="dalog-item ' + dlgClass + '"><div class="dalog-infro"><img class="cmr-dalog-peplpic" src="' + photoPic + '?time=102545621"><span class="dalog-item-name">' + name + '</span></div><div class="' + dlgbgClass + '">' + dalogCont + '</div></div></div>';
        }

        if (_index == 3) {
            $(".cmr-dalog-contrlTxt").show();
            setTimeout(function() {
                $(".cmr-dalog-contrlTxt").hide();
            }, 3000);
        }

        this.swiperDalog.appendSlide(sildeStr);
        if (mscUrl != "") {
            this.musicContrl(bgmId);
            this.musicOn = 0;
        };
        var index = this.swiperDalog.slides.length - 1;
        console.log(index);
        this.swiperDalog.slideTo(index, 100, false);
        $(".cmr-dalog-mscBox").click(function() {
            e = window.event || oEvent;
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        });
    },
    // 小说内容自动播放
    autoAppend: function() {
        var _this = this;
        _this.appendTimeout = setTimeout(function() {
            _this._slideIndex++;
            if (_this._slideIndex < _this.contentSize) {
                _this.myAppendSlide(_this._slideIndex);
                _this.autoAppend();
            } else {
                $("#cmr-dalog").hide();
            }
        }, 1500);
    },
    // 音效播放控制
    musicContrl: function(objId) {
        var thisObj = document.getElementById(objId);
        $("#" + objId + "").on("canplay", function() {
            var musicTime = thisObj.duration;
            musicTime = Math.ceil(musicTime);
            console.log(musicTime);
            $("#" + objId + "time").html(musicTime + "s");
        });
        $("#" + objId + "").on("ended", function() {
            console.log("音效播放结束");
            $(".cmr-dalog-mscOver").removeClass("cmr-dalog-mscOn");
            musicOn = 1;
        });
        $("#" + objId + "").on("pause", function() {
            console.log("音效播放暂停");
            thisObj.currentTime = 0;
            $(".cmr-dalog-mscOver").removeClass("cmr-dalog-mscOn");
            musicOn = 1;
        });
    },
    // 音效重播控制
    replayMsc: function(obj) {
        var _this = this;
        var _that = $(obj);
        console.log("musicOn:" + _this.musicOn);
        var mymscId = _that.attr("data-miscId");
        var thisObj = document.getElementById(mymscId);
        if (_this.musicOn) {
            thisObj.play();
            _that.children().children(".cmr-dalog-mscOver").addClass("cmr-dalog-mscOn");
            _this.musicOn = 0;
        } else {
            thisObj.pause();
            _that.children().children(".cmr-dalog-mscOver").removeClass("cmr-dalog-mscOn");
            _this.musicOn = 1;
        }
    },

}

// 对话体小说资源控制器
var sourceCtrl = {
    // 初始化读取本地对话体资源
    init: function() {
        var _this = this;
        var novelData = localStorage.getItem("novelData");
        if (novelData) {
            novelData = JSON.parse(novelData);
            if (novelData.source) {
                this.source = novelData.source;
            } else {
                this.source = { character: [], music: [], image: [] };
                novelData.source = this.source;
                localStorage.setItem("novelData", JSON.stringify(novelData));
            }

        } else {
            novelData = { "dalogContens": [], "source": { character: [], music: [], image: [] } };
            localStorage.setItem("novelData", JSON.stringify(novelData));
            this.source = { character: [], music: [], image: [] };
        }
        $.each(_this.source, function(key, val) {
            for (var i = 0; i < val.length; i++) {
                var sourceDom = _this.createSourceDom(val[i], key);
                sourceDom.removeClass("unmount");
                sourceDom.appendTo($(".source-" + key + "-box"));
            }
            _this.updateContentSource(key);
        });
    },
    // 事件监听
    addListener: function() {
        var _this = this;
        // 资源管理，添加资源按钮点击
        $(".source-add-box .source-item").on("click", ".add-btn", function(e) {
            var target = $(e.target);
            var source_item = target.parent().parent();
            var source_type = source_item.find("input[name='source_type']").val();
            switch (source_type) {
                case "character":
                    _this.addCharacter(source_item);
                    break;
                case "music":
                    _this.addMusic(source_item);
                    break;
                case "image":
                    _this.addImage(source_item);
                    break;
                case "musicGroup":
                    _this.addMusicGroup(source_item);
                    break;
                case "imageGroup":
                    _this.addImageGroup(source_item);
                    break;
                default:
                    ;
            }
        });
        // 资源管理，编辑资源按钮点击
        $(".source-manage-box .source-box").on("click", ".source-edit", function(e) {
            var $source_item = $(e.target).parent().parent();
            var sourceType = $source_item.data("sourceType");
            $(".source-edit-item").removeClass("edit-show");
            $("#edit_" + sourceType).addClass("edit-show");
            _this.sourceEdit($source_item);
        });
        // 资源管理，删除资源按钮点击
        $(".source-manage-box .source-box").on("click", ".source-delete", function(e) {
            var $source_item = $(e.target).parent().parent();
            var sourceType = $source_item.data("sourceType");
            var sourceData = $source_item.data("sourceData");
            _this.updateSource(sourceData, sourceType, "delete", sourceData.id);
            $source_item.css({ "margin-top": "-" + ($source_item.height() + 100) + "px", "opacity": 0 });
            $(".source-edit-item").removeClass("edit-show");
            setTimeout(function() {
                $source_item.remove();
                _this.updateContentSource(sourceType);
            }, 300);

        });
        // 音频资源预听点击
        $(".source-music-box").on("click", ".source-item .source-icon", function(e) {
            var audio = $(e.target).parent().find("audio");
            _this.musicPlay(audio);
        });
        // 图片出错处理
        $(".container").on("error", "img", function(e) {
            _this.imgOnError(e);
        });
    },
    // 添加角色资源
    addCharacter: function(source_item) {
        var hostUrl = "http://wap.cmread.com/rbc/p/";
        var name = source_item.find("#character_name").val();
        var level = source_item.find("#character_level").val();
        var photo = source_item.find("#character_photo").val();
        if (name && photo) {
            var characterData = {
                name: name,
                level: level,
                photo: /http/.test(photo) ? photo : hostUrl + photo.trim(),
                id: "charactor_" + this.getRandomId()
            }
            this.addSourceItem(characterData, "character");
            source_item.find("#character_name").val("");
            source_item.find("#character_level").val("");
            source_item.find("#character_photo").val("");
        } else {
            salert("需输入完整角色信息", "danger");
        }
    },
    // 添加音频资源
    addMusic: function(source_item) {
        var hostUrl = "http://wap.cmread.com/rbc/p/";
        var name = source_item.find("#music_name").val();
        var src = source_item.find("#music_src").val();
        if (name && src) {
            var musicData = {
                name: name,
                src: /http/.test(src) ? src : hostUrl + src.trim(),
                id: "music_" + this.getRandomId()
            }
            this.addSourceItem(musicData, "music");
            source_item.find("#music_name").val("");
            source_item.find("#music_src").val("");
        } else {
            salert("需输入完整音效信息", "danger");
        }
    },
    addMusicGroup: function(source_item){
        var hostUrl = "http://wap.cmread.com/rbc/p/";
        var srcs = source_item.find("#music_srcs").val().trim();
        if(srcs){
            var srcArray = srcs.split(";");
            for(var i = 0; i < srcArray.length; i++){
                var src = srcArray[i];
                if(src.trim()){
                    var name = src.substring(src.lastIndexOf("/")+1,src.lastIndexOf("."));
                    var musicData = {
                        name: name,
                        src: /http/.test(src) ? src : hostUrl + src.trim(),
                        id: "music_" + this.getRandomId()
                    }
                    this.addSourceItem(musicData, "music");
                }
            }
            source_item.find("#music_srcs").val("");
        }else{
            salert("音效集合输入不能为空", "danger");
        }
    },
    // 添加图片资源
    addImage: function(source_item) {
        var hostUrl = "http://wap.cmread.com/rbc/p/";
        var name = source_item.find("#image_name").val();
        var src = source_item.find("#image_src").val();
        if (name && src) {
            var imageData = {
                name: name,
                src: /http/.test(src) ? src : hostUrl + src.trim(),
                id: "image_" + this.getRandomId()
            }
            this.addSourceItem(imageData, "image");
            source_item.find("#image_name").val("");
            source_item.find("#image_src").val("");
        } else {
            salert("需输入完整图片信息", "danger");
        }
    },
    addImageGroup: function(source_item){
        var hostUrl = "http://wap.cmread.com/rbc/p/";
        var srcs = source_item.find("#image_srcs").val().trim();
        if(srcs){
            var srcArray = srcs.split(";");
            for(var i = 0; i < srcArray.length; i++){ 
                var src = srcArray[i];
                if(src.trim()){
                        var name = src.substring(src.lastIndexOf("/")+1,src.lastIndexOf("."));
                        var imageData = {
                            name: name,
                            src: /http/.test(src) ? src : hostUrl + src.trim(),
                            id: "image_" + this.getRandomId()
                        }
                        this.addSourceItem(imageData, "image");
                    }
                }
            source_item.find("#image_srcs").val("");
        }else{
            salert("图片集合输入不能为空", "danger");
        }
    },
    // 添加类型添加到相应资源条目
    addSourceItem: function(sourceData, sourceType) {
        var $source_item = this.createSourceDom(sourceData, sourceType);
        var $targetSourceBox = $(".source-" + sourceType + "-box");
        this.updateSource(sourceData, sourceType, "add");
        $(".menu-bar>a[href='#source_manage_box']").click();
        $source_item.appendTo($targetSourceBox);
        this.updateContentSource(sourceType);
        setTimeout(function() { $source_item.removeClass("unmount") }, 500);
    },
    // 根据类型创建相应资源信息
    createSourceDom: function(sourceData, sourceType) {
        var _this = this;
        var $source_item;
        var hostUrl = "http://wap.cmread.com/rbc/p/";
        switch (sourceType) {
            case "character":
                $source_item = $('<div class="source-character-item source-item unmount"><div class="source-name"></div><img class="source-icon" src="0" onerror="sourceCtrl.imgOnError(this)"/><div class="source-operation"><button class="source-edit">编辑</button><button class="source-delete">删除</button></div></div>');
                $source_item.find(".source-name").text(sourceData.name);
                $source_item.find(".source-icon").attr("src", /http/.test(sourceData.photo) ? sourceData.photo : hostUrl + sourceData.photo.trim());

                break;
            case "music":
                $source_item = $('<div class="source-music-item source-item unmount"><audio preload="auto" class="hidden"><source src="" type="audio/mpeg" onerror="sourceCtrl.musicOnError(this)"></audio><div class="source-name"></div><i class="source-icon fa fa-volume-off"></i><div class="source-operation"><button class="source-edit">编辑</button><button class="source-delete">删除</button></div></div>');
                $source_item.find(".source-name").text(sourceData.name);
                $source_item.find("audio").find("source").attr("src", /http/.test(sourceData.src) ? sourceData.src : hostUrl + sourceData.src.trim());
                break;
            case "image":
                $source_item = $('<div class="source-image-item source-item unmount"><div class="source-name"></div><img class="source-icon" src="" onerror="sourceCtrl.imgOnError(this)"/><div class="source-operation"><button class="source-edit">编辑</button><button class="source-delete">删除</button></div></div>');
                $source_item.find(".source-name").text(sourceData.name);
                $source_item.find(".source-icon").attr("src", /http/.test(sourceData.src) ? sourceData.src : (hostUrl + sourceData.src.trim()));
                break;
            default:
                ;
        }
        $source_item.data("sourceData", sourceData);
        $source_item.data("sourceType", sourceType);
        return $source_item;
    },
    // 资源二次编辑
    sourceEdit: function($source_item) {
        var _this = this;
        var sourceType = $source_item.data("sourceType");
        var sourceEditor = $("#edit_" + sourceType);
        var sourceData = $source_item.data("sourceData");
        var sourceId = sourceData.id;
        sourceEditor.data("editTarget", sourceId);
        switch (sourceType) {
            case "character":
                sourceEditor.find("#edit_character_name").val(sourceData.name);
                sourceEditor.find("#edit_character_level").val(sourceData.level);
                sourceEditor.find("#edit_character_photo").val(sourceData.photo);
                sourceEditor.find(".add-btn")[0].onclick = function() {
                    var name = sourceEditor.find("#edit_character_name").val().trim();
                    var src = sourceEditor.find("#edit_character_photo").val().trim();
                    if (name && src) {
                        sourceData.name = name;
                        sourceData.level = sourceEditor.find("#edit_character_level").val();
                        sourceData.photo = src;
                        $source_item.data("sourceData", sourceData);
                        $source_item.find(".source-name").text(name);
                        $source_item.find(".source-icon").attr("src", /http/.test(src) ? src : "http://wap.cmread.com/rbc/p/" + src.trim());
                        $(".source-edit-item").removeClass("edit-show");
                        _this.updateSource(sourceData, sourceType, "edit", sourceData.id);
                        $source_item.addClass("to-edit");
                        setTimeout(function() { $source_item.removeClass("to-edit"); }, 300);
                        _this.updateContentSource(sourceType);
                        salert("角色修改成功", "normal");
                    } else {
                        salert("请填写完整角色信息", "danger");
                    }
                };
                break;
            case "music":
                sourceEditor.find("#edit_music_name").val(sourceData.name);
                sourceEditor.find("#edit_music_src").val(sourceData.src);
                sourceEditor.find(".add-btn")[0].onclick = function() {
                    var name = sourceEditor.find("#edit_music_name").val().trim();
                    var src = sourceEditor.find("#edit_music_src").val().trim();
                    if (name && src) {
                        sourceData.name = name;
                        sourceData.src = src;
                        $source_item.data("sourceData", sourceData);
                        $source_item.find(".source-name").text(name);
                        $source_item.find(".source-icon").removeClass("music-error");
                        $source_item.find("audio").remove();
                        $source_item.append($('<audio preload="auto" class="hidden"><source src=' + (/http/.test(src) ? src : 'http://wap.cmread.com/rbc/p/') + ' type="audio/mpeg" onerror="sourceCtrl.musicOnError(this)"></audio>'));
                        $(".source-edit-item").removeClass("edit-show");
                        _this.updateSource(sourceData, sourceType, "edit", sourceData.id);
                        $source_item.addClass("to-edit");
                        setTimeout(function() { $source_item.removeClass("to-edit"); }, 300);
                        _this.updateContentSource(sourceType);
                        salert("音效修改成功", "normal");
                    } else {
                        salert("请填写完整音效信息", "danger");
                    }
                };
                break;
            case "image":
                sourceEditor.find("#edit_image_name").val(sourceData.name);
                sourceEditor.find("#edit_image_src").val(sourceData.src);
                sourceEditor.find(".add-btn")[0].onclick = function() {
                    var name = sourceEditor.find("#edit_image_name").val().trim();
                    var src = sourceEditor.find("#edit_image_src").val().trim();
                    if (name && src) {
                        sourceData.name = name;
                        sourceData.src = src;
                        $source_item.data("sourceData", sourceData);
                        $source_item.find(".source-name").text(name);
                        $source_item.find(".source-icon").attr("src", /http/.test(src) ? src : "http://wap.cmread.com/rbc/p/" + src.trim());
                        $(".source-edit-item").removeClass("edit-show");
                        _this.updateSource(sourceData, sourceType, "edit", sourceData.id);
                        $source_item.addClass("to-edit");
                        setTimeout(function() { $source_item.removeClass("to-edit"); }, 300);
                        _this.updateContentSource(sourceType);
                        salert("图片修改成功", "normal");
                    } else {
                        salert("请填写完整图片信息", "danger");
                    }
                };
                break;
            default:
                ;
        }
    },
    // 更新单个资源内容
    updateSource: function(sourceData, sourceType, operationType, id) {
        var novelData = JSON.parse(localStorage.getItem("novelData"));
        var _source = this.source[sourceType];
        switch (operationType) {
            case "add":
                _source.push(sourceData);
                break;
            case "delete":
                for (var i = 0; i < _source.length; i++) {
                    if (_source[i].id == id) {
                        _source.splice(i, 1);
                        break;
                    }
                };
                break;
            case "edit":
                for (var i = 0; i < _source.length; i++) {
                    if (_source[i].id == id) {
                        _source[i] = sourceData;
                        break;
                    }
                };
            default:
                ;
        }
        novelData.source = this.source;
        localStorage.setItem("novelData", JSON.stringify(novelData));
    },
    // 更新资源库显示
    updateContentSource: function(sourceType) {
        var $targetSourceBox = $(".source-" + sourceType + "-box");
        var $targetContentBox = $(".content-add-box .content-" + sourceType + "-box");
        var $source_item = $targetSourceBox.find(".source-item");
        $targetContentBox.empty();
        for (var i = 0; i < $source_item.length; i++) {
            $targetContentBox.append($($source_item[i]).clone().data("sourceData", $($source_item[i]).data("sourceData")));
        }
    },
    // 获取随机ID
    getRandomId: function() {
        return Number(Math.random().toString().substr(3) + Date.now()).toString(36);
    },
    // 音频资源预听控制
    musicPlay: function(audio) {
        if (!audio.data("isError")) {
            audio[0].play();
            var icon = audio.parent().find(".source-icon");
            var volume_down = setTimeout(function() {
                icon.removeClass("fa-volume-off");
                icon.addClass("fa-volume-down");
            }, 0);
            var volume_up = setTimeout(function() {
                icon.removeClass("fa-volume-down");
                icon.addClass("fa-volume-up");
            }, 330);
            var volume_off = setTimeout(function() {
                icon.removeClass("fa-volume-up");
                icon.addClass("fa-volume-off");
            }, 660);
            var mPlayInterval = setInterval(function() {
                volume_down = setTimeout(function() {
                    icon.removeClass("fa-volume-off");
                    icon.addClass("fa-volume-down");
                }, 0);
                volume_up = setTimeout(function() {
                    icon.removeClass("fa-volume-down");
                    icon.addClass("fa-volume-up");
                }, 330);
                volume_off = setTimeout(function() {
                    icon.removeClass("fa-volume-up");
                    icon.addClass("fa-volume-off");
                }, 660);
            }, 1000);
            audio.on("ended", function() {
                clearTimeout(volume_down);
                clearTimeout(volume_up);
                clearTimeout(volume_off);
                clearInterval(mPlayInterval);
                setTimeout(function() {
                    icon.removeClass("fa-volume-down");
                    icon.removeClass("fa-volume-up");
                    icon.addClass("fa-volume-off");
                }, 10);
            });
        }
    },
    // 图片资源出错，备用图片填充
    imgOnError: function(_this) {
        $(_this).attr('src', './img/imgError.jpg');
    },
    // 音频出错提示
    musicOnError: function(_this) {
        $(_this).parent().parent().find(".source-icon").addClass("music-error");
        $(_this).parent().data("isError", true);
    },
    // 获取所有资源数据
    getSource: function() {
        return this.source;
    }
}


// 对话体小说编辑预览控制器
var contentCtrl = {
    init: function(json) {
        var _this = this;
        var novelData = JSON.parse(localStorage.getItem("novelData"));
        if (json && (typeof json == "object")) {
            this.dalogContens = json.dalogContens ? json.dalogContens : [];
            novelData.dalogContens = this.dalogContens;
            localStorage.setItem("novelData", JSON.stringify(novelData));
        } else {
            this.dalogContens = novelData.dalogContens;
        }
        if (novelData.bookId) {
            $("#bookId").val(novelData.bookId);
        }
        this.insertIndex = 0;
        this.content_list = []; 
        $(".edit-box").empty();
        $(".edit-box").append($('<div class="insert-line"><div></div></div>'));
        for (var i = 0; i < this.dalogContens.length; i++) {
            var item = this.dalogContens[i];
            $(".edit-box").append(_this.createDialogDom(item, _this.getDialogType(item)).removeClass("unmount"));
            $(".edit-box").append($('<div class="insert-line"><div></div></div>'));
        }
    },
    // 事件监听
    addListener: function() {
        var _this = this;
        $(".menu-bar").on("click", ">a", function(e) {
            var target = $(e.target);
            var href = target.attr("href");
            $(".menu-bar>a").removeClass("active");
            target.addClass("active");
            $(".source-edit-item").removeClass("edit-show");
            $(".add-box").removeClass("source_add_box");
            $(".add-box").removeClass("content_add_box");
            $(".add-box").removeClass("source_manage_box");
            $(".add-box").addClass(href.replace("#", ""));
        });
        // 素材资源点击按钮弹出
        $(".content-add-box .source-btn").on("click", function(e) {
            $(".content-source-box").removeClass("content-source-show");
            $(".content-add-box .content-add").addClass("content-source-show");
            $($(e.target).attr("data-target")).addClass("content-source-show");
            console.log($($(e.target).attr("data-target")));
        });
        // 素材资源点击其他区域隐藏
        $(".content-add-box .content-add").on("click", function(e) {
            if (!$(e.target).hasClass("source-btn")) {
                $(".content-source-box").removeClass("content-source-show");
                $(".content-add-box .content-add").removeClass("content-source-show");
            }
        });
        // 角色素材资源数据注入编辑框
        $(".content-character-box").on("click", ".source-item", function(e) {
            var sourceData = $(this).data("sourceData");
            var dialogue_item = $(".dialogue-add-item");
            dialogue_item.find("#characterName").val(sourceData.name);
            dialogue_item.find("#characterLevel").val(sourceData.level);
            dialogue_item.find("#characterPhoto").val(sourceData.photo);
        });
        // 图片素材资源数据注入编辑框
        $(".content-image-box").on("click", ".source-item", function(e) {
            var sourceData = $(this).data("sourceData");
            var image_item = $(".image-add-item");
            image_item.find("#imageSrc").val(sourceData.src);
        });
        // 音频素材资源数据注入编辑框
        $(".content-music-box").on("click", ".source-item", function(e) {
            var sourceData = $(this).data("sourceData");
            var music_item = $(".music-add-item");
            music_item.find("#musicName").val(sourceData.name);
            music_item.find("#musicSrc").val(sourceData.src);
        });
        // 编辑的旁白数据添加
        $("#add_aside_btn").on("click", function(e) {
            var asideContent = $("#asideContent").val();
            var dialogJson = _this.creatDialogJson();
            if (asideContent) {
                dialogJson.aside = asideContent;
                $("#asideContent").val("");
                _this.addToContent(_this.createDialogDom(dialogJson, "aside"), _this.insertIndex);
            } else {
                salert("请填写完整旁白信息", "danger");
            }
        });
        // 编辑的对白数据添加
        $("#add_dialogue_btn").on("click", function(e) {
            var characterName = $("#characterName").val();
            var characterLevel = $("#characterLevel").val();
            var characterPhoto = $("#characterPhoto").val();
            var characterDialog = $("#characterDialog").val();
            var dialogJson = _this.creatDialogJson();
            if (characterName && characterPhoto && characterDialog) {
                dialogJson.name = characterName;
                dialogJson.userLevel = characterLevel;
                dialogJson.photoPic = characterPhoto;
                dialogJson.dalogCont = characterDialog;
                $("#characterName").val("");
                $("#characterLevel").val("");
                $("#characterPhoto").val("");
                $("#characterDialog").val("");
                _this.addToContent(_this.createDialogDom(dialogJson, "dialogue"), _this.insertIndex);
            } else {
                salert("请填写完整对话信息", "danger");
            }
        });
        // 编辑的图片数据添加
        $("#add_image_btn").on("click", function(e) {
            var imageSrc = $("#imageSrc").val();
            var dialogJson = _this.creatDialogJson();
            if (imageSrc) {
                dialogJson.bigImg = imageSrc;
                $("#imageSrc").val("");
                _this.addToContent(_this.createDialogDom(dialogJson, "image"), _this.insertIndex);
            } else {
                salert("请填写完整图片信息", "danger");
            }
        });
        // 编辑的音频数据添加
        $("#add_music_btn").on("click", function(e) {
            var musicSrc = $("#musicSrc").val();
            var musicName = $("#musicName").val();
            var dialogJson = _this.creatDialogJson();
            if (musicSrc && musicName) {
                dialogJson.mscUrl = musicSrc;
                dialogJson.bgmName = musicName;
                dialogJson.bgmId = "music_" + _this.getRandomId();
                $("#musicSrc").val("");
                $("#musicName").val("");
                _this.addToContent(_this.createDialogDom(dialogJson, "music"), _this.insertIndex);
            } else {
                salert("请填写完整音效信息", "danger");
            }
        });
        // 保存书本数据id
        $("#bookId_save_btn").on("click", function() {
            var bookId = $("#bookId").val();
            if (bookId) {
                var novelData = JSON.parse(localStorage.getItem("novelData"));
                novelData.bookId = bookId;
                localStorage.setItem("novelData", JSON.stringify(novelData));
                salert("书籍ID保存成功", "normal");
            } else {
                salert("书籍ID不能为空", "danger");
            }
        });
        // 书籍数据快速导入编辑器
        $("#book_import_btn").on("click", function() {
            try {
                var jsonData = JSON.parse($("#bookData").val());
                if (typeof jsonData != "object") {
                    salert("数据非json格式", "danger");
                    return;
                }
            } catch (e) {
                salert("数据非json格式", "danger");
                return;
            }
            _this.init(jsonData);
            Novel.init(jsonData);
            sconfirm("是否快速导入相应素材？", function() {
                _this.jsonToSource(jsonData);
            });
            salert("书籍数据导入成功", "normal");
            $("#bookData").val("");
        });
        // 清空已编辑内容
        $("#book_clear_btn").on("click", function() {
            _this.init({});
            salert("清空内容成功", "normal");
        });
        // 刷新小说预览
        $("#refresh_novel").on("click", function() {
            Novel.init({});
            salert("刷新预览成功", "normal");
        });
        // 编辑插入位置节点点击
        $(".edit-box").on("click", ".insert-line", function(e) {
            e.stopPropagation();
            $(".edit-box .insert-line").removeClass("active");
            $(this).addClass("active");
            _this.insertIndex = ($(this).index() + 2) / 2 - 1;
        });
        // 已编辑条目删除按钮点击
        $(".edit-box").on("click", ".item-delete-btn", function(e) {
            e.stopPropagation();
            var edit_item = $(this).parent();
            edit_item.addClass("unmount");
            $(".edit-box .insert-line").removeClass("active");
            setTimeout(function() {
                edit_item.next().remove();
                edit_item.remove();
                _this.insertIndex = $(".edit-box").find(".insert-line").length - 1;
                _this.updateLocalStorage();
            }, 300);
        });
        // 显示已编辑的数据（代码形式）
        $("#show_result").on("click", function() {
            var result_data = { dalogContens: [] };
            result_data.dalogContens = _this.getDalogContens();
            var resultStr = JSON.stringify(result_data);
            var splitArr = _this.autoSplit(resultStr, 9800);
            $("#result_data").val(resultStr);
            $(".result-box").addClass("result-show");
            $(".container>.box").addClass("blur");
            $(".result-box .result-notify").find(".result-length").text(resultStr.length);
            $(".result-box .result-notify").find(".split-num").text(splitArr.length);
            $("#merge_btn").hide();
            $("#split_btn").show();
            for (var i = 0; i < splitArr.length; i++) {
                $(".result-box .textarea-split-box").append($('<textarea class="textarea-split split-' + splitArr.length + '"></textarea>').val(splitArr[i]));
            }
        });
        $("#result_data").on("click", function(e) {
            e.stopPropagation();
        });
        $(".result-box").on("click", ".textarea-split", function(e) {
            e.stopPropagation();
        });
        // 对话体小说数据过长时的拆分
        $("#split_btn").on("click", function(e) {
            e.stopPropagation();
            var textareaNum = $(".result-box").find(".textarea-split").length;
            if (textareaNum < 7) {
                $(".result-box").find(".textarea-split").addClass("result-split-show");
                $("#result_data").addClass("hide");
                $("#split_btn").hide();
                $("#merge_btn").show();
            } else {
                alert("目前暂支持最多拆分为6段");
            }
        });
        // 数据合并
        $("#merge_btn").on("click", function(e) {
            e.stopPropagation();
            $(".result-box").find(".textarea-split").removeClass("result-split-show");
            $("#result_data").removeClass("hide");
            $("#split_btn").show();
            $("#merge_btn").hide();
        });
        // 隐藏最终数据显示
        $(".result-box").on("click", function() {
            $("#result_data").val("");
            $(".result-box").removeClass("result-show");
            $(".container>.box").removeClass("blur");
            $("#result_data").removeClass("hide");
            $(".result-box .textarea-split").remove();
        });
        $(".edit-box").click(function() {
            $(".edit-box .insert-line").removeClass("active");
            _this.insertIndex = $(".edit-box .insert-line").length - 1;
        });
        // 回车事件绑定
        $(".content-add input").bind("keyup", function(e) {
            if (event.keyCode == "13") {
                $(this).parent().parent().find(".content-add-btn").click();
            }
        });
        // 回车事件绑定
        $("#bookData").bind("keyup", function(e) {
            if (event.keyCode == "13") {
                $("#book_import_btn").click();
            }
        });
        // 编辑的数据变动时随时保存至本地
        $(".edit-box").on("input propertychange", "input", function() {
            var editItem = $(this).parent();
            if (!editItem.hasClass("edit-item")) {
                editItem = editItem.parent();
            }
            _this.editToUpdate(editItem, editItem.data("dialogType"));
        });
        $(".edit-box").on("input propertychange", "textarea", function() {
            var editItem = $(this).parent();
            if (!editItem.hasClass("edit-item")) {
                editItem = editItem.parent();
            }
            _this.editToUpdate(editItem, editItem.data("dialogType"));
        });
        $(".edit-box").on("change", "select", function() {
            var editItem = $(this).parent();
            if (!editItem.hasClass("edit-item")) {
                editItem = editItem.parent();
            }
            _this.editToUpdate(editItem, editItem.data("dialogType"));
        });
        // 添加触漫数据按钮点击
        $("#add_chuman_btn").on("click", function() {
            var chumanId = $("#chumanId").val();
            _this.getChuManData(chumanId, 1);
        });
    },
    getRandomId: function() {
        return Number(Math.random().toString().substr(3) + Date.now()).toString(36);
    },
    // 根据类型创建预览编辑条目
    createDialogDom: function(dialogJson, dialogType) {
        var dialogDom;
        switch (dialogType) {
            case "aside":
                dialogDom = $('<div class="aside-item edit-item unmount"><i class="fa fa-commenting"></i><button class="item-delete-btn">×</button><textarea rows="3" name="aside_text"></textarea></div>');
                dialogDom.find("textarea[name='aside_text']").val(dialogJson.aside);
                break;
            case "dialogue":
                dialogDom = $('<div class="dialog-item edit-item unmount"><i class="fa fa-comments"></i><button class="item-delete-btn">×</button><div class="item-detail"><div class="detail-title">名字</div><input type="text" class="detail-content" name="character_name"></div><div class="item-detail"><div class="detail-title">地位</div><select class="detail-content" name="character_level"><option value="b1">男一</option><option value="g1">女一</option><option value="b2">男二</option><option value="g2">女二</option>><option value="">路人</option></select></div><div class="item-detail"><div class="detail-title">头像</div><input type="text" class="detail-content" name="character_photo"></div><div class="item-detail"><div class="detail-title">对话</div><textarea rows="2" class="detail-content" name="character_dialog"></textarea></div></div>');
                dialogDom.find("input[name='character_name']").val(dialogJson.name);
                dialogDom.find("select[name='character_level']").val(dialogJson.userLevel);
                dialogDom.find("input[name='character_photo']").val(dialogJson.photoPic);
                dialogDom.find("textarea[name='character_dialog']").val(dialogJson.dalogCont);
                break;
            case "image":
                dialogDom = $('<div class="image-item edit-item unmount"><i class="fa fa-picture-o"></i><button class="item-delete-btn">×</button><div class="item-detail"><div class="detail-title">图片路径</div><input type="text" class="detail-content" name="image_src"></div></div>');
                dialogDom.find("input[name='image_src']").val(dialogJson.bigImg);
                break;
            case "music":
                dialogDom = $('<div class="music-item edit-item unmount"><i class="fa fa-volume-up"></i><button class="item-delete-btn">×</button><div class="item-detail"><div class="detail-title">音效名称</div><input type="text" class="detail-content" name="music_name"></div><div class="item-detail"><div class="detail-title">音效路径</div><input type="text" class="detail-content" name="music_src"></div></div>');
                dialogDom.find("input[name='music_name']").val(dialogJson.bgmName);
                dialogDom.find("input[name='music_src']").val(dialogJson.mscUrl);
                break;
            default:
                ;
        }
        return dialogDom.data("dialogJson", dialogJson).data("dialogType", dialogType);
    },
    // 根据插入节点位置添加编辑条目
    addToContent: function(dialogDom, insertIndex) {
        var lastIndex = $(".edit-box .insert-line").length - 1;
        insertIndex = (insertIndex != undefined && insertIndex >= 0) ? insertIndex : lastIndex;
        var insertLine_new = $('<div class="insert-line"><div></div></div>');
        var insertLine = $($(".edit-box .insert-line")[insertIndex]);

        if (!insertLine.hasClass("active")) {
            this.insertIndex = insertIndex = lastIndex;
            insertLine = $($(".edit-box .insert-line")[insertIndex]);
        }
        insertLine_new.insertAfter(insertLine);
        dialogDom.insertAfter(insertLine);
        this.updateLocalStorage();
        setTimeout(function() { dialogDom.removeClass("unmount"); }, 100);
    },
    // 解析数据获取其资源类型
    getDialogType: function(dialogJson) {
        if (dialogJson.aside) {
            return "aside";
        } else if (dialogJson.name) {
            return "dialogue";
        } else if (dialogJson.bigImg) {
            return "image";
        } else if (dialogJson.mscUrl) {
            return "music";
        } else {
            return "aside";
        }
    },
    // 小说单条目数据原型
    creatDialogJson: function() {
        return {
            "aside": "",
            "mscUrl": "",
            "vedioUrl": "",
            "bigImg": "",
            "photoPic": "",
            "name": "",
            "bgmName": "",
            "bgmId": "",
            "userLevel": "",
            "dalogCont": ""
        };
    },
    // 获取当前已编辑的小说数据
    getDalogContens: function() {
        var dalogContens = [];
        var edit_items = $(".edit-box").find(".edit-item");
        edit_items.each(function(i, item) {
            dalogContens.push($(item).data("dialogJson"));
        });
        return dalogContens;
    },
    // 更新本地缓存
    updateLocalStorage: function() {
        var novelData = JSON.parse(localStorage.getItem("novelData"));
        this.dalogContens = novelData.dalogContens = this.getDalogContens();
        localStorage.setItem("novelData", JSON.stringify(novelData));
    },
    // 每次编辑更新相应本地缓存
    editToUpdate: function(editItem, dialogType) {
        var dialogJson = editItem.data("dialogJson");
        switch (dialogType) {
            case "aside":
                dialogJson.aside = editItem.find("textarea[name='aside_text']").val();
                break;
            case "dialogue":
                dialogJson.name = editItem.find("input[name='character_name']").val();
                dialogJson.userLevel = editItem.find("select[name='character_level']").val();
                dialogJson.photoPic = editItem.find("input[name='character_photo']").val();
                dialogJson.dalogCont = editItem.find("textarea[name='character_dialog']").val();
                break;
            case "image":
                dialogJson.bigImg = editItem.find("input[name='image_src']").val();
                break;
            case "music":
                dialogJson.bgmName = editItem.find("input[name='music_name']").val();
                dialogJson.mscUrl = editItem.find("input[name='music_src']").val();
                break;
            default:
                ;
        }
        editItem.data("dialogJson", dialogJson);
        this.updateLocalStorage();
    },

    /**  根据id扒取触漫的对话体小说内容，解析为自己的数据格式 **/

    // 字符串按设定位数拆分
    autoSplit: function(str, maxLength) {
        var strArr = [];
        var length = str.length;
        var num = Math.ceil(length / maxLength);
        var avgLength = Math.round(length / num);
        for (var i = 0; i < num; i++) {
            if (i == num - 1) {
                strArr.push(str.substr(i * avgLength));
            } else {
                strArr.push(str.substr(i * avgLength, avgLength))
            }
        }
        return strArr;
    },
    // 解析数据中的资源条目导入本地
    jsonToSource: function(_json) {
        console.log(_json);
        var _this = this;
        var _dalogContens = _json.dalogContens;
        var imgIndex = 1;
        var characterArr = [];
        var isCharactorRepeat = function(_characterData) {
            for (var j = 0; j < characterArr.length; j++) {
                if (_characterData.name == characterArr[j].name && _characterData.photo == characterArr[j].photo) {
                    return true;
                }
            }
            return false;
        }
        for (var i = 0; i < _dalogContens.length; i++) {
            var _jsonItem = _dalogContens[i];
            switch (this.getDialogType(_jsonItem)) {
                case "dialogue":
                    var characterData = {
                        name: _jsonItem.name,
                        level: _jsonItem.userLevel,
                        photo: _jsonItem.photoPic,
                        id: "charactor_" + _this.getRandomId()
                    }
                    if (!isCharactorRepeat(characterData)) {
                        characterArr.push(characterData);
                        sourceCtrl.addSourceItem(characterData, "character");
                    }
                    break;
                case "music":
                    var musicData = {
                        name: _jsonItem.bgmName,
                        src: _jsonItem.mscUrl,
                        id: "music_" + _this.getRandomId()
                    }
                    sourceCtrl.addSourceItem(musicData, "music");
                    break;
                case "image":
                    var imageData = {
                        name: "图片_" + imgIndex,
                        src: _jsonItem.bigImg,
                        id: "image_" + _this.getRandomId()
                    }
                    imgIndex++;
                    sourceCtrl.addSourceItem(imageData, "image");
                    break;
                default:
                    ;
            }
        }
        salert("书籍素材导入成功", "normal");
    },
    // 根据id获取触漫相应的数据请求地址
    getChuManUrl: function(id, pageNum) {
        return "http://api.mallecomics.com/secure/index.php?m=Api&c=ChumanDrama&a=get_content_list&drama_id=" + id + "&page=" + pageNum + "&is_view=1"
    },
    // 获取触漫对话体小说数据
    getChuManData: function(id, pageNum) {
        var _this = this;
        $.ajax({
            url: _this.getChuManUrl(id, pageNum),
            method: "get",
            success: function(data) {
                _this.filterChuManData(data, id, pageNum);
            },
            error: function(err) {
                console.log(err);
            }
        })
    },
    // 拼接从触漫请求到的数据
    filterChuManData: function(data, id, pageNum) {
        var _content_list = data.data.content_list;
        if (_content_list.length == 0) {
            this.dealChuManData(this.content_list);
        } else {
            this.content_list = this.content_list.concat(_content_list);
            this.getChuManData(id, pageNum + 1);
        }
    },
    // 将触漫数据解析为自己的格式
    dealChuManData: function(_content_list) {
        var _this = this;
        var host = "http://qnc.chumanapp.com/";
        var dalogContens = [];
        var result = {};
        for (var i = 0; i < _content_list.length; i++) {
            var content_item = _content_list[i];
            var json_item = this.creatDialogJson();
            switch (content_item.type) {
                case 1:
                    json_item.name = content_item.role_info.name;
                    json_item.photoPic = host + content_item.role_info.avatar;
                    json_item.dalogCont = content_item.content;
                    break;
                case 2:
                    json_item.aside = content_item.content == "" ? " " : content_item.content;
                    break;
                case 3:
                    json_item.bigImg = host + content_item.content;
                    break;
                case 4:
                    json_item.mscUrl = "http://qnp.chumanapp.com/" + content_item.content;
                    json_item.bgmId = "music_" + this.getRandomId();
                    json_item.bgmName = content_item.title;
                    break;
                default:
                    ;
            }
            dalogContens.push(json_item);
        }
        if (dalogContens.length == 0) {
            salert("对应数据不存在", "danger");
        } else {
            result.dalogContens = dalogContens;
            this.init(result);
            Novel.init(result);
            salert("书籍数据导入成功", "normal");
            sconfirm("是否快速导入相应素材？", function() {
                _this.jsonToSource(result);
            });
        }

    }

}

// 控制器们各司其职初始化与监听

// 对话体小说内容预览控制器
Novel.init({});
Novel.addListener();

// 对话体小说资源控制器
sourceCtrl.init();
sourceCtrl.addListener();

// 对话体小说编辑预览控制器
contentCtrl.init();
contentCtrl.addListener();