Ext.regModel("KeyValueModel", {
    fields: [{
        name: "key",
        type: "string"
    },{
        name: "value",
        type: "auto"
    }]
});

/**
 * @class Ext.Picker
 * @extends Ext.Component
 *
 * <p>A general picker class.  Slots are used to organize multiple scrollable slots into a single picker
 * See also: {@link Ext.DatePicker}</p>
 * @xtype picker
 */
Ext.Picker = Ext.extend(Ext.Panel, {
    cmpCls: 'x-picker',

    centered: true,

    /**
     * @cfg {String} displayField
     */
    displayField: 'key',

    /**
     * @cfg {String} valueField
     */
    valueField: 'value',

    /**
     * @cfg {Boolean} useTitles
     * Generate a title header for each individual slot and use
     * the title configuration of the slot.
     */
    useTitles: true,

    /**
     * @cfg {String} activeCls
     * CSS class to be applied to individual list items when they have
     * been chosen.
     */
    activeCls: 'x-picker-active-item',

    /**
     * @cfg {Number} rowHeight
     * The row height of individual items in the slots. This will automatically be calculated if not
     * specified.
     */
    rowHeight: false,

    /**
     * @cfg {String} align
     * Text alignment of the slots.
     */
    align: 'left',

    /**
     * @cfg {Array} slots
     * An array of slot configurations.
     * <ul>
     *  <li>name - {String} - Name of the slot</li>
     *  <li>align - {String} - Alignment of the slot. left, right, or center</li>
     *  <li>items - {Array} - An array of key/value pairs in the format {key: 'myKey', value: 'myValue'}</li>
     *  <li>title - {String} - Title of the slot. This is used in conjunction with useTitles: true.</li>
     * </ul>
     */

    pickerItemCls: 'li.x-picker-item',

    chosenCls: 'x-picker-chosen-item',
    model: 'KeyValueModel',

    initComponent : function() {
        var items = [],
            i,
            slot,
            slotItem,
            ln;

        this.layout = {
            type: 'hbox',
            align: 'stretch'
        };

        for (i = 0, ln = this.slots.length; i < ln; i++) {
            slot = this.slots[i];
            slotItem = {
                xtype: 'dataview',
                itemSelector: this.pickerItemCls,
                isSlot: true,
                flex: 1,
                listeners: {
                    itemtap: this.onItemTap,
                    scope: this
                },
                scroll: {
                    direction: 'vertical',
                    scrollbars: false,
                    snap: true,
                    friction: 0.5,
                    // store the index that this scroller
                    // is associated with
                    index: i,
                    listeners: {
                        scrollend: this.onScrollEnd,
                        scope: this
                    }
                },
                tpl: '<ul class="x-picker-{align}"><tpl for="."><li class="x-picker-item {cls} <tpl if="extra">x-picker-invalid</tpl>">{' + this.displayField + '}</li></tpl></ul>',
                store: new Ext.data.Store({
                    model: this.model,
                    data: slot.items
                })
            };


            if (this.useTitles) {
                slotItem.dockedItems = [{
                    xtype: 'toolbar',
                    dock: 'top',
                    title: slot.title || slot.text
                }];
            }

            items.push(slotItem);
        }

        this.items = items;
        this.activeEls = [];
        this.lastEls = [];

        Ext.Picker.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event pick
             * @param {Ext.Picker} this
             * @param {String} name The name of the slot that was just changed.
             * @param {Mixed} value The value that the slot was just changed to.
             * @param {Mixed} oldValue The previous value that the slot was at.
             * @param {Ext.data.Record} The backing record of the current value.
             */
            'pick'
        );
    },

    // @private
    getSelectedEls: function() {
        var el,
            xy,
            result,
            results = [],
            i = 0,
            ln = this.slots.length,
            closestValidItem = this.pickerItemCls+":not(.x-picker-invalid)";

        for (; i < ln; i++) {
            el = this.activeEls[i];
            xy = el.getXY();
            xy[0] += (el.getWidth() / 2);
            xy[1] += (el.getHeight() / 2);
            el.hide();

            result = document.elementFromPoint(xy[0], xy[1]);
            if (result.innerText === "") {
                var resultEl = Ext.fly(result).next(closestValidItem) || Ext.fly(result).prev(closestValidItem);
                if (resultEl) {
                    result = resultEl.dom;
                    this.scrollToNode(this.items.itemAt(i), result);
                }
            }

            results.push(result);
            el.show();
        }
        this.lastEls = results;
        return results;
    },

    /**
     * Gets the current value as an Object of name/value pairs using the slot names
     * @return {Object} vals
     */
    getValue: function() {
        var vals = {},
            els = this.getSelectedEls(),
            i,
            name,
            r,
            ln;

        for (i = 0, ln = els.length; i < ln; i++) {
            if (Ext.DomQuery.is(els[i], this.pickerItemCls)) {
                name = this.slots[i].name || Ext.id();
                r = this.items.itemAt(i).getRecord(els[i]);
                vals[name] = r.get(this.valueField);
            }
        }
        return vals;
    },

    // @private
    scrollToNode: function(dv, n, animate) {
        var xy = Ext.fly(n).getOffsetsTo(dv.body),
            itemIndex = this.items.indexOf(dv);

        if (animate !== false) {
            animate = true;
        }

        dv.scroller.scrollTo({
            x: 0,
            y: (-xy[1] + this.activeEls[itemIndex].getTop())
        }, animate ? 200 : false);
    },

    // @private
    onItemTap: function(dv, idx, n) {
        this.scrollToNode(dv, n);
    },

    // @private
    afterLayout: function() {
        Ext.Picker.superclass.afterLayout.apply(this, arguments);

        if (this.initialized) {
            return;
        }

        if (!this.rowHeight) {
            var aRow = this.el.down(this.pickerItemCls);
            var rowHeight = aRow.getHeight();
            this.rowHeight = rowHeight;
            this.items.each(function(item) {
                if (item.scroller) {
                    item.scroller.snap = rowHeight;
                }
            });
        }

        var innerHeight,
            maxRows,
            targetRowIdx,
            afterRows,
            lessThanHalf,
            skip,
            loopTo,
            i,
            j,
            slotsLn = this.slots.length,
            slot,
            slotItems,
            subChosenEl,
            bd = this.items.itemAt(0).body;

        innerHeight = bd.getHeight();
        maxRows = Math.ceil(innerHeight / this.rowHeight);
        targetRowIdx = Math.max((Math.floor(maxRows / 2)) - 1, 1);

        afterRows = (innerHeight / this.rowHeight) - targetRowIdx - 1;
        lessThanHalf = Math.floor(afterRows) + 0.5 > afterRows;
        skip = lessThanHalf ? 0 : -1;

        loopTo = Math.floor(innerHeight/ this.rowHeight);
        for (i = 0; i < slotsLn; i++) {
            slot = this.slots[i];
            var ds = this.items.itemAt(i).store;

            slotItems = slot.items;
            for (j = 0; j < loopTo; j++) {
                if (j < targetRowIdx) {
                    ds.insert(0, Ext.ModelMgr.create({key: '', value: '', extra: true}, this.model));
                }
                else if (j > (targetRowIdx + skip)) {
                    ds.add(Ext.ModelMgr.create({key: '', value: '', extra: true}, this.model));
                }
            }

            subChosenEl = Ext.DomHelper.append(this.items.itemAt(i).body, {
                cls: 'x-picker-chosen'
            }, true);

            subChosenEl.setTop((targetRowIdx) * this.rowHeight + bd.getTop());
            subChosenEl.setWidth(bd.getWidth());
            this.activeEls[i] = subChosenEl;
        }

        if (this.value !== undefined) {
            this.setValue(this.value, false);
        }
        else {
            this.onScrollEnd();
        }

        this.initialized = true;
    },

    setValue: function(obj, animate) {
        var i = 0,
            slotsLn = this.slots.length,
            dv,
            items = this.items,
            value;

        for (; i < slotsLn; i++) {
            value = this.value[this.slots[i].name];
            if (value) {
                dv = items.itemAt(i);
                var idx = dv.store.find(this.valueField, value),
                    r = dv.store.getAt(idx),
                    n = dv.getNode(r);

                this.scrollToNode(dv, n, animate);
            }
        }
    },

    // @private
    onScrollEnd: function(scroller) {
        // moving els declaration to the top will cause lastEls to be re-written.
        if (scroller) {
            // scroll has ended
            var index = scroller.index,
                dv = this.items.itemAt(index),
                lastEl = this.lastEls[index],
                oldRecord = lastEl ? dv.getRecord(lastEl) : undefined,
                oldValue = oldRecord ? oldRecord.get(this.valueField) : undefined,
                els = this.getSelectedEls(),
                r = dv.getRecord(els[index]);

            if (lastEl) {
                Ext.fly(lastEl).removeClass(this.chosenCls);
            }
            Ext.fly(els[index]).addClass(this.chosenCls);

            this.fireEvent('pick', this, this.slots[index].name, r.get(this.valueField), oldValue, r);
        }
        else {
            // initialize it
            var i = 0, els = this.getSelectedEls(), ln = els.length;
            for (; i < ln; i++) {
                Ext.fly(els[i]).addClass(this.chosenCls);
            }
        }
    }
});
Ext.reg('picker', Ext.Picker);

/**
 * @class Ext.DatePicker
 * @extends Ext.Picker
 *
 * <p>A date picker class</p>
 * @xtype datepicker
 */
Ext.DatePicker = Ext.extend(Ext.Picker, {

    /**
     * @cfg {Number} yearFrom
     * The start year for the date picker.  Defaults to 1980
     */
    yearFrom: 1980,

    /**
     * @cfg {Number} yearTo
     * The last year for the date picker.  Defaults to the current year.
     */
    yearTo: new Date().getFullYear(),
    
    /**
     * @cfg {String} monthText
     * The label to show for the month column. Defaults to 'Month'.
     */
    monthText: 'Month',
    
    /**
     * @cfg {String} dayText
     * The label to show for the day column. Defaults to 'Day'.
     */
    dayText: 'Day',
    
    /**
     * @cfg {String} yearText
     * The label to show for the year column. Defaults to 'Year'.
     */
    yearText: 'Year',

    initComponent: function() {
        var yearsFrom = this.yearFrom,
            yearsTo = this.yearTo,
            years = [],
            ln;

        // swap values if user mixes them up.
        if (yearsFrom > yearsTo) {
            var tmp = yearsFrom;
            yearsFrom = yearsTo;
            yearsTo = tmp;
        }

        for (var i = yearsFrom; i <= yearsTo; i++) {
            years.push({
                key: i,
                value: i
            });
        }

        var daysInMonth;
        if (this.value) {
            daysInMonth = this.getDaysInMonth(this.value.month, this.value.year);
        } else {
            daysInMonth = this.getDaysInMonth(0, new Date().getFullYear());
        }

        var days = [];
        for (i = 0; i < daysInMonth; i++) {
            days.push({
                key: i+1,
                value: i+1
            });
        }

        var months = [];
        for (i = 0, ln = Date.monthNames.length; i < ln; i++) {
            months.push({
                key: Date.monthNames[i],
                value: i
            });
        }

        this.slots = [{
            text: this.monthText,
            name: 'month',
            align: 'left',
            items: months
        },{
            text: this.dayText,
            name: 'day',
            align: 'center',
            items: days
        },{
            text: this.yearText,
            name: 'year',
            align: 'right',
            items: years
        }];

        Ext.DatePicker.superclass.initComponent.call(this);
        this.on('pick', this.onPick, this);
    },


    /**
     * Gets the current value as a Date object
     * @return {Date} value
     */
    getValue: function() {
        var v = Ext.DatePicker.superclass.getValue.call(this),
            day,
            daysInMonth = this.getDaysInMonth(v.month, v.year);

        if (v.day !== "") {
            day = Math.min(v.day, daysInMonth);
        } else {
            day = daysInMonth;
            var dv = this.items.itemAt(1),
                idx = dv.store.find(this.valueField, daysInMonth),
                r = dv.store.getAt(idx),
                n = dv.getNode(r);
            this.scrollToNode(dv, n);
        }
        return new Date(v.year, v.month, day);
    },

    // @private
    onPick: function(picker, name, value, r) {
        if (name === "month" || name === "year") {
            var dayView = this.items.itemAt(1);
            var store = dayView.store;
            var date = this.getValue();
            var daysInMonth = this.getDaysInMonth(date.getMonth(), date.getFullYear());
            store.filter([{
                fn: function(r) {
                    return r.get('extra') === true || r.get('value') <= daysInMonth;
                }
            }]);
            this.onScrollEnd(dayView.scroller);
        }
    },

    // @private
    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month == 1 && this.isLeapYear(year) ? 29 : daysInMonth[month];
    },

    // @private
    isLeapYear: function(year) {
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    }
});

Ext.reg('datepicker', Ext.DatePicker);
