require("./timeSelect.less");
var $ = require("zepto");
var timeSelectHtml = require("./timeSelect.html");

var TimeSelect = function (ops) {
    this.ops = $.extend({
        dom: "timeSelect",
        width: '100%',
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        changeTimeCallback: "" //改变时间的回调
    }, ops);
    this.init();
};

TimeSelect.prototype = {
    init: function () {
        this.initTimeSelect();
        this.changeHM();  //改变小时和分钟
        this.bindEvent();
    },
    initTimeSelect: function () {
        $("#" + this.ops.dom).append(timeSelectHtml);
    },
    changeHM: function (hour, min) {
        (hour || hour == 0) && (this.ops.hour = hour);
        (min || min == 0) && (this.ops.minute = min);
        var hourPos = 56 - (40 * this.ops.hour);
        $(".time_hh").css("transform", "translate3d(0px, " + hourPos + "px, 0px);");
        var minPos = 56 - (40 * this.ops.minute);
        $(".time_mm").css("transform", "translate3d(0px, " + minPos + "px, 0px);");
    },
    bindEvent: function () {
        var that = this;
        var hourStartPosY = 0,
            hourEndPosY = 0,
            minStartPosY = 0,
            minEndPosY = 0;
        $(".hh_select").bind("touchstart", function (e) {
            hourStartPosY = parseInt(e.targetTouches[0].clientY, 10);
        });
        $(".hh_select").bind("touchend", function (e) {
            hourEndPosY = parseInt(e.changedTouches[0].clientY, 10);
            var slider = hourEndPosY - hourStartPosY;
            var dis = that.calculateRealDis(slider);
            that.animate('.time_hh', dis, function() {
                that.ops.hour = that.getCurrentHour();
                that.ops.changeTimeCallback && that.ops.changeTimeCallback(that.ops.hour, that.ops.minute);
            });
        });

        $(".mm_select").bind("touchstart", function (e) {
            minStartPosY = parseInt(e.targetTouches[0].clientY, 10);
        });
        $(".mm_select").bind("touchend", function (e) {
            minEndPosY = parseInt(e.changedTouches[0].clientY, 10);
            var slider = minEndPosY - minStartPosY;
            var dis = that.calculateRealDis(slider);
            that.animate('.time_mm', dis, function() {
                that.ops.minute = that.getCurrentMin();
                that.ops.changeTimeCallback && that.ops.changeTimeCallback(that.ops.hour, that.ops.minute);
            });
        });
    },
    getCurrentHour: function() {
        var pos = parseInt($(".time_hh").css("transform").split(",")[1], 10);
        return (56 - pos) / 40;
    },
    getCurrentMin: function() {
        var pos = parseInt($(".time_mm").css("transform").split(",")[1], 10);
        return (56 - pos) / 40;
    },
    //计算最终滑动距离
    calculateRealDis: function(distance) {
        var dis = Math.abs(distance);
        var margin = 40 - (dis % 40); //计算距离下一个时间位置的差值
        return distance > 0 ? distance + margin : distance - margin;
    },
    animate: function(dom, dis, callback) {
        var step = Math.abs(dis) / 10 > 20 ? dis / 10 : (dis > 0 ? 20 : -20); //10步完成滑动
        var currentDis = 0; //初始位置
        var prevPos = parseInt($(dom).css("transform").split(",")[1], 10);
        var currentPos = 0;
        var that = this;
        this.animateHH = setInterval(function() {
            if(Math.abs(currentDis) < Math.abs(dis)) {
                currentDis = Math.abs(currentDis + step) > Math.abs(dis) ? dis : currentDis + step;
                currentPos = prevPos +currentDis;
                if(currentPos > 56) {
                    currentPos = 56;
                }
                if(dom.match("hh") && currentPos < -864) {
                    currentPos = -864;
                }
                if(dom.match("mm") && currentPos < -2304) {
                    currentPos = -2304;
                }
                $(dom).css("transform", "translate3d(0px, " + currentPos + "px, 0px);")
            } else {
                clearInterval(that.animateHH);
                callback && callback.call();
            }
        }, 20)
    }
}

module.exports = TimeSelect;