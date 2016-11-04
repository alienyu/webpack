require("./lunarCalendar.less");
var $ = require("zepto");
var Lunar = require("./lunar.js");
var _ = require("../../vendor/underscore.js");
var calendarDateTpl = require("./calendarTpl.html");
var calendarDateHtml = _.template(calendarDateTpl);

var LunarCalendar = function(ops) {
    this.ops = $.extend({
        dom: "calendar",
        width: '100%', //日历宽度
        mode: "solar", //渲染模式 solar公历;lunar农历,默认公历
        cyear: new Date().getFullYear(), //初始化年份
        cmonth: new Date().getMonth() + 1, //初始化月份
        cday: new Date().getDay(), // 初始化日
        cacheData: {}, //缓存已经过计算的年月数据
        currentData: {}, //包含当前月,以及前后两月的数据
        initOver: "", //渲染完成的回调
        dateClickCallback: "", //日期点击事件
        switchPrevMonthCallback: "", //选择前一个月回调
        switchNextMonthCallback: "" //选择后一个月回调
    }, ops);
    this.init();
}

LunarCalendar.prototype = {
    init: function() {
        this.initCalendar();
        this.bindEvent();
    },
    initCalendar: function() {
        var date = this.calculateRenderYM(); //计算需要渲染的年月份
        this.calculateYMData(date); //计算需要渲染的年月份的详细数据
        this.renderCalendar(); //渲染日历的html代码
        var date = this.returnInitDate(); //返回初始化渲染的日期
        this.ops.initOver && this.ops.initOver.call(this, date); //渲染完成后的回调
    },
    returnInitDate: function() {
        var year = new Date().getFullYear();
        var month = new Date().getMonth() + 1;
        var day = new Date().getDate();
        var date = Lunar.solar2lunar(year, month, day);
        return date;
    },
    calculateRenderYM: function() {
        var currentYM = [];
        currentYM.push({date: this.ops.cyear + "-" + this.ops.cmonth,type:"current"});
        var prevYM = parseInt(this.ops.cmonth, 10) - 1 > 0 ? this.ops.cyear + "-" + (parseInt(this.ops.cmonth, 10) - 1) : (parseInt(this.ops.cyear, 10) - 1) + "-12";
        currentYM.unshift({date: prevYM, type:"prev"});
        var nextYM = parseInt(this.ops.cmonth, 10) + 1 < 13 ? this.ops.cyear + "-" + (parseInt(this.ops.cmonth, 10) + 1) : (parseInt(this.ops.cyear, 10) + 1) + "-1";
        currentYM.push({date: nextYM, type: "next"});
        return currentYM;
    },
    calculateYMData: function(date) {
        var that = this;
        this.ops.currentData = {};
        $(date).each(function(i,e) {
            if(that.ops.cacheData[e.date]) {
                that.ops.currentData[e.date] = {};
                that.ops.currentData[e.date]['date'] = that.ops.cacheData[e.date];
                that.ops.currentData[e.date]['type'] = e.type;
                that.ops.currentData[e.date]['mode'] = that.ops.mode;
            } else {
                that.calculateDetailDate(e);
            }
        });
        console.log(this.ops.cacheData);
        console.log(this.ops.currentData);
    },
    //计算当月每一天的详细数据
    calculateDetailDate: function(date) {
        var year = parseInt(date.date.split("-")[0], 10);
        var month = parseInt(date.date.split("-")[1], 10);
        var dayNum = Lunar.solarMonth[month-1]; //获取当月多少天
        var dateArr = []; //指定月份的详细数据
        //闰月的二月加一天
        if(year % 4 == 0 && month == 2) {
            dayNum += 1;
        }
        for(var i=0;i<dayNum;i++) {
            var dayData = Lunar.solar2lunar(year, month, i+1);
            if((year != new Date().getFullYear() || month != (new Date().getMonth() + 1)) && i == 0) {
                dayData.isToday = true;
            }
            dateArr.push(dayData);
        }
        dateArr = this.getPrevEmptyDate(dateArr, year, month);
        dateArr = this.getNextEmptyDate(dateArr, year, month);
        this.ops.cacheData[date.date] = dateArr;
        this.ops.currentData[date.date] = {
            date: dateArr,
            type: date.type,
            mode: this.ops.mode
        }
    },
    getPrevEmptyDate: function(arr, year, month) {
        var emptyNum = arr[0].nWeek % 7;
        var prevMonth = (month -1 > 0) ? (month - 1) : 12;
        var prevYear = (month - 1 > 0) ? year : year - 1 ;
        var dayNum = Lunar.solarMonth[prevMonth -1];
        if(prevYear % 4 == 0 && prevMonth == 2) {
            dayNum += 1;
        }
        for(var i = dayNum;i > dayNum - emptyNum;i --) {
            arr.unshift($.extend(Lunar.solar2lunar(prevYear, prevMonth, i), {isCurrentMonth: false}));
        }
        return arr;
    },
    getNextEmptyDate: function(arr, year, month) {
        var emptyNum = 42 - arr.length;
        var nextMonth = (month + 1) > 12 ? 1 : (month + 1);
        var nextYear = (month + 1) > 12 ? (year + 1) : year;
        for(var i = 1;i < emptyNum + 1;i ++) {
            arr.push($.extend(Lunar.solar2lunar(nextYear, nextMonth, i), {isCurrentMonth: false}))
        }
        return arr;
    },
    renderCalendar: function() {
        this.renderCalendarFrame();
        this.renderCalendarDate("init");
    },
    renderCalendarFrame: function() {
        var calendarHtml = require("./lunarCalendar.html");
        $("#" + this.ops.dom).addClass("lunar_calendar").append(calendarHtml);
    },
    renderCalendarDate: function(type) {
        for(var key in this.ops.currentData) {
            if(type == "init") {
                $("#calendarDate").append(calendarDateHtml({data: this.ops.currentData[key]}));
            } else if(type == "next") {
                var nextHtml = calendarDateHtml({data: this.ops.currentData[key]})
                this.turnLeft(nextHtml);
            } else {
                var prevHtml = calendarDateHtml({data: this.ops.currentData[key]})
                this.turnRight(prevHtml);
            }
        }
    },
    renderPrevMonth: function(html) {
        $("table").eq(2).remove();
        $("#calendarDate table").eq(0).before(html);
    },
    renderNextMonth: function(html) {
        $("table").eq(0).remove();
        $("#calendarDate").append(html);
    },
    turnLeft: function(html) {
        var that = this;
        $("table").eq(1).addClass("current2prev").addClass("prev");
        $("table").eq(2).addClass("next2current").addClass("current");
        setTimeout(function() {
            $("table").eq(1).removeClass("current").removeClass("current2prev");
            $("table").eq(2).removeClass("next").removeClass("next2current");
            that.renderNextMonth(html);
            var date = that.getCurrentMonthShotDate();
            that.ops.switchNextMonthCallback && that.ops.switchNextMonthCallback(date);
        },600)
    },
    turnRight: function(html) {
        var that = this;
        $("table").eq(0).addClass("prev2current").addClass("current");
        $("table").eq(1).addClass("current2next").addClass("next");
        setTimeout(function() {
            $("table").eq(0).removeClass("prev").removeClass("prev2current");
            $("table").eq(1).removeClass("current").removeClass("current2next");
            that.renderPrevMonth(html);
            var date = that.getCurrentMonthShotDate();
            that.ops.switchPrevMonthCallback && that.ops.switchPrevMonthCallback(date);
        },600)
    },
    bindEvent: function() {
        this.bindCalendarSwipe();
        this.bindDateClick();
    },
    bindCalendarSwipe: function() {
        var that = this;
        $("#calendar").delegate("#calendarDate", "swipeLeft", function(e) {
            that.switchToNextMonth();
        });
        $("#calendar").delegate("#calendarDate", "swipeRight", function(e) {
            that.switchToPrevMonth();
            var date = that.getCurrentMonthShotDate();
            that.ops.switchPrevMonthCallback && that.ops.switchPrevMonthCallback(date);
        });
    },
    getCurrentMonthShotDate: function() {
        var dom = $('.current .today').parent().find(".hide_date");
        var key = dom.data('year') + "-" + dom.data('month');
        var index = parseInt(dom.data("index"), 10);
        var date = this.ops.cacheData[key][index];
        return date;
    },
    bindDateClick: function() {
        var that = this;
        $("#calendar").delegate("td", "tap", function(e) {
            if(!$(this).find("div").eq(0).hasClass("fill_date")) {
                var dom = $(this).find(".hide_date");
                var key = dom.data('year') + "-" + dom.data('month');
                var index = parseInt(dom.data("index"), 10);
                var data = that.ops.cacheData[key][index];
                $(".current .today").each(function(i,e) {
                    $(e).removeClass("today");
                });
                $(this).find("div").eq(0).addClass("today")
                $(this).find("div").eq(1).addClass("today");
                if(that.ops.dateClickCallback) {
                    that.ops.dateClickCallback.call(that, data);
                } else {
                    console.log(data);
                }
            }
        });
    },
    switchToPrevMonth: function() {
        var newMonth = (parseInt(this.ops.cmonth , 10) - 2) > 0 ? (parseInt(this.ops.cmonth, 10) - 2) : (parseInt(this.ops.cmonth, 10) + 10),
            newYear = (parseInt(this.ops.cmonth, 10) - 2) > 0 ? parseInt(this.ops.cyear, 10) : (parseInt(this.ops.cyear, 10) - 1);
        this.ops.cyear = (parseInt(this.ops.cmonth, 10) - 1) > 0 ? parseInt(this.ops.cyear, 10) : (parseInt(this.ops.cyear, 10) - 1);
        this.ops.cmonth = (parseInt(this.ops.cmonth , 10) - 1) > 0 ? (parseInt(this.ops.cmonth, 10) - 1) : 12,
            this.calculateYMData([{
                date: newYear + "-" + newMonth,
                type: "prev"
            }]);
        this.renderCalendarDate("prev");
    },
    switchToNextMonth: function() {
        var newMonth = (parseInt(this.ops.cmonth , 10) + 2) > 12 ? (parseInt(this.ops.cmonth, 10) - 10) : (parseInt(this.ops.cmonth, 10) + 2),
            newYear = (parseInt(this.ops.cmonth, 10) + 2) > 12 ? (parseInt(this.ops.cyear, 10) + 1) : parseInt(this.ops.cyear, 10);
        this.ops.cyear = (parseInt(this.ops.cmonth, 10) + 1) > 12 ? (parseInt(this.ops.cyear, 10) + 1) : parseInt(this.ops.cyear, 10);
        this.ops.cmonth = (parseInt(this.ops.cmonth , 10) + 1) > 12 ? 1 : (parseInt(this.ops.cmonth, 10) + 1),
        this.calculateYMData([{
            date: newYear + "-" + newMonth,
            type: "next"
        }]);
        this.renderCalendarDate("next");
    },
    switchMode: function(type) {
        if(type == "solar") {
            $("#calendarDate .solar").each(function(i,e) {
                $(e).removeClass("hide");
            });
            $("#calendarDate .lunar").each(function(i,e) {
                $(e).addClass("hide");
            });
            this.ops.mode = "solar";
        } else {
            $("#calendarDate .lunar").each(function(i,e) {
                $(e).removeClass("hide");
            });
            $("#calendarDate .solar").each(function(i,e) {
                $(e).addClass("hide");
            });
            this.ops.mode = "lunar";
        }
    },
    toToday: function() {
        $("#calendar").empty();
        this.ops.cyear = new Date().getFullYear();
        this.ops.cmonth = new Date().getMonth() + 1;
        this.initCalendar();
    },
    getTodayDate: function() {
        var year = new Date().getFullYear();
        var month = new Date().getMonth() + 1;
        var day = new Date().getDate();
        return Lunar.solar2lunar(year, month, day);
    }
}

module.exports = LunarCalendar;