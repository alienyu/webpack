require("../../css/page/lunarCalendar.less");
var LunarCalendar = require("../widgets/lunarCalendar/lunarCalendar.js");
var timeSelect = require("../widgets/timeSelect/timeSelect.js");
var $ = require("zepto");
var fuc = {
    config: {},
    init: function() {
        var that = this;
        $(".calendar .time").text(new Date().getHours() + ":" + new Date().getMinutes());
        this.lunar = new LunarCalendar({
            initOver: function(date) {
                that.config.currentDate = date;
                var solarText = date.cYear + "年" + date.cMonth + "月" + date.cDay + "日";
                var lunarText = date.cYear + "年" + date.IMonthCn + date.IDayCn;
                if($('.lunar input').get(0).checked) {
                    $(".calendar .date").text(lunarText);
                } else {
                    $(".calendar .date").text(solarText);
                }
                that.addCalendarTextHiddenDate(date.cYear, date.cMonth, date.cDay);
            },
            dateClickCallback: function(date) {
                that.switchCalendarText(date);
            },
            switchNextMonthCallback: function(date) {
                that.switchCalendarText(date);
            },
            switchPrevMonthCallback: function(date) {
                that.switchCalendarText(date);
            }
        });
        this.timeSelect = new timeSelect({
            dom: "timeSelect",
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
            changeTimeCallback: function(hour, min) {
                hour = (hour.toString().length == 1) ? ("0" + hour.toString()) : hour;
                min = (min.toString().length == 1) ? ("0" + min.toString()) : min;
                $(".calendar .time").text(hour + ":" + min);
            }
        });
        this.bindEvent();
    },
    switchCalendarText: function(date) {
        this.config.currentDate = date;
        var calendarText = "";
        if($('.lunar input').get(0).checked) {
            this.lunar.switchMode("lunar");
            calendarText = date.cYear + "年" + date.IMonthCn + date.IDayCn;
        } else {
            this.lunar.switchMode("solar");
            calendarText = date.cYear + "年" + date.cMonth + "月" + date.cDay + "日";
        }
        $(".calendar .date").text(calendarText);
        this.addCalendarTextHiddenDate(date.cYear, date.cMonth, date.cDay);;
    },
    addCalendarTextHiddenDate: function(year, month ,day) {
        $(".calendar .date").attr("data-year", year).attr("data-month", month).attr("data-day", day);
    },
    bindEvent: function() {
        var that = this;
        $('.lunar input').change(function(e) {
            var calendarText = "";
            $(".date").addClass("active");
            $(".time").removeClass("active");
            $("#calendar").removeClass("hide");
            $("#timeSelect").addClass("hide");
            if(e.target.checked) {
                that.lunar.switchMode("lunar");
                calendarText = that.config.currentDate.cYear + "年" + that.config.currentDate.IMonthCn + that.config.currentDate.IDayCn;
            } else {
                that.lunar.switchMode("solar");
                calendarText = that.config.currentDate.cYear + "年" + that.config.currentDate.cMonth + "月" + that.config.currentDate.cDay + "日";
            }
            $(".calendar .date").text(calendarText);
            that.addCalendarTextHiddenDate(that.config.currentDate.cYear, that.config.currentDate.cMonth, that.config.currentDate.cDay);
        });
        $("#toToday").click(function(e) {
            that.lunar.toToday();
        });

        $(".full_day input").change(function(e) {
           if(e.target.checked) {
               that.timeSelect.changeHM(0,0);
               $(".calendar .time").text("00:00");
           }
        });

        $('.calendar').delegate("div","tap", function(e) {
            if($(e.target).hasClass('date')) {
                $(".date").addClass("active");
                $(".time").removeClass("active");
                $("#calendar").removeClass("hide");
                $("#timeSelect").addClass("hide");
            } else {
                $(".date").removeClass("active");
                $(".time").addClass("active");
                $("#calendar").addClass("hide");
                $("#timeSelect").removeClass("hide");
                that.timeSelect.changeHM(parseInt($(".calendar .time").text().split(":")[0], 10), parseInt($(".calendar .time").text().split(":")[1], 10))
            }
        });

        $(".confirm").bind("tap", function(e) {
            alert($(".calendar .date").data("year") + "-" + $(".calendar .date").data("month") + "-" + $(".calendar .date").data("day") + " " + $(".calendar .time").text());
        });
    }
}

fuc.init();

