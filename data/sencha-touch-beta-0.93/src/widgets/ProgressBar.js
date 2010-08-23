Ext.ProgressBar = Ext.extend(Ext.Component, {
    /**
     * @cfg {Number} value The default value for the progress bar. This should range
     * between 0 (minimum and 100 (maximum). Defaults to <tt>0</tt>.
     */
    value: 0,
    
    /**
     * @cfg {String} text Text to show in the progress bar. Defaults to <tt>''</tt>.
     */
    text: '',
    
    /**
     * @cfg {Boolean} animate True to animate animate transitions when the progress bar
     * value changes. Defaults to <tt>true</tt>.
     */
    animate: true,
    
    /**
     * @cfg {Object} animDefaults Default parameters for animation. Defaults to duration: <tt>500</tt>, easing: <tt>'linear'</tt>.
     */
    animDefaults: {
        duration: 500,
        easing: 'linear'
    },
    
    height: 22,
    
    baseCls: 'x-progress',
    
    //private
    minValue: 0,
    maxValue: 100,
    waitTimer: null,
    
    renderTpl: new Ext.XTemplate(
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>"<tpl if="style"> style="{style}"</tpl>>',
            '<span class="x-progress-text"></span>', 
            '<div class="x-progress-background"></div>', 
        '</div>', {
        compiled: true
    }),
    
    // inherit docs
    initComponent: function(){
        this.addEvents(
            /**
             * @event animateend
             * Fires when the progress bar finishes an animation.
             * @param {Ext.ProgressBar} this
             */
            'animateend',
            /**
             * @event animatestart
             * Fires when the progress bar begins an animation.
             * @param {Ext.ProgressBar} this
             */
            'animatestart',        
            /**
             * @event change
             * Fires when the value of the progress bar changes.
             * @param {Ext.ProgressBar} this
             * @param {Number} value The new value
             * @param {Number} old The old value
             */
            'change');
        Ext.ProgressBar.superclass.initComponent.call(this);
    },
    
    // inherit docs
    onRender: function(ct, position){
        Ext.applyIf(this.renderSelectors, {
            textEl: '.x-progress-text',
            backgroundEl: '.x-progress-background'
        });
        Ext.ProgressBar.superclass.onRender.call(this, ct, position);
    },
    
    // inherit docs
    afterRender: function(){
        Ext.ProgressBar.superclass.afterRender.call(this);
        this.setText(this.text);
        this.setValue(this.value, false, true);
    },
    
    /**
     * @private
     * Sync the size of the progress element with the current value.
     */
    syncValue: function(animate){
        if (animate === true || (this.animate && animate !== false)) {
            var me = this,
                from = this.forceFromEmpty ? 0 : me.backgroundEl.getWidth(),
                opts = Ext.apply({
                    autoClear: false,
                    scope: this,
                    before: function(el){
                        this.from = {
                            'width': from + 'px'
                        };
                        this.to = {
                            'width': me.el.getWidth() * (me.value / 100) + 'px'
                        };
                        me.fireEvent('animatestart', me);
                    },
                    after: function(){
                        me.syncValue(false); // Set the % value after we animate
                        me.fireEvent('animateend', me);
                    }
                }, this.animDefaults);
            new Ext.Anim(opts).run(this.backgroundEl);
            delete this.forceFromEmpty;
        } else {
            this.backgroundEl.dom.style.width = this.value + '%';
        }
    },
    
    /**
     * Initiates an auto-updating progress bar.  A duration can be specified, in which case the progress
     * bar will automatically reset after a fixed amount of time and optionally call a callback function
     * if specified.  If no duration is passed in, then the progress bar will run indefinitely and must
     * be manually cleared by calling {@link #reset}.  The wait method accepts a config object with
     * the following properties:
     * <pre>
Property   Type          Description
---------- ------------  ----------------------------------------------------------------------
duration   Number        The length of time in milliseconds that the progress bar should
                         run before resetting itself (defaults to undefined, in which case it
                         will run indefinitely until reset is called)
interval   Number        The length of time in milliseconds between each progress update
                         (defaults to 1000 ms)
animate    Boolean       Whether to animate the transition of the progress bar. If this value is
                         not specified, the default for the class is used.                                                   
increment  Number        The number of progress update segments to display within the progress
                         bar (defaults to 10).  If the bar reaches the end and is still
                         updating, it will automatically wrap back to the beginning.
</pre>
         *
         * Example usage:
         * <pre><code>
var p = new Ext.ProgressBar({
    width: 200
}).show();

//Wait for 5 seconds, then update the status el (progress bar will auto-reset)
p.wait({
   interval: 100, //bar will move fast!
   duration: 5000,
   increment: 15
});

//Or update indefinitely until some async action completes, then {@link #reset} manually
p.wait();
myAction.on('complete', function(){
    p.reset();
});
</code></pre>
     * @param {Object} config (optional) Configuration options
     * @return {Ext.ProgressBar} this
     */
    wait: function(params){
        this.clearTimer();
        params = params || {};
        var increment = params.increment || 10,
            animate = params.animate === true  || (params.animate !== false && this.animate),
            duration = params.duration,
            interval = params.interval || 1000,
            me = this,
            ticks = Math.ceil(duration / interval),
            tickCount = 0,
            val;
            
        me.waitTimer = setInterval(function(){
            if(duration && tickCount >= ticks){
                me.clearTimer();
                return;
            }
            if(me.value == 100){
                me.forceFromEmpty = true;
                me.value = 0;
            }
            me.setValue(me.value + increment, animate, true);
            ++tickCount;
        }, interval);
        return this;
    },
    
    /**
     * Sets the text for the progress bar.
     * @param {String} text The text to set.
     * @return {Ext.ProgressBar} this
     */
    setText: function(text){
        this.textEl.dom.innerHTML = text;
        return this;
    },
    
    /**
     * Resets the state of the progress bar, with an empty value and no text.
     * @return {Ext.ProgressBar} this
     */
    reset: function(){
        this.setText('');
        this.setValue(0, false, true);
        this.clearTimer();
        return this;
    },
    
    /**
     * Clear the timer for any wait() operation.
     * @private
     */
    clearTimer: function(){
        if(this.waitTimer != null){
            clearInterval(this.waitTimer);
        }
        this.waitTimer = null;
    },
    
    /**
     * Set the value of the progress bar
     * @param {Object} value The new value (between 0 and 100)
     * @param {Object} animate True explicitly force animation.
     * @return {Ext.ProgressBar} this
     */
    setValue: function(value, animate, /* private */ initial){
        var old = this.value;
        
        initial = initial === true;
        value = parseInt(value, 10) || 0;
        value = value.constrain(this.minValue, this.maxValue);
        if (initial || value != old) {
            this.value = value;
            this.syncValue(animate);
            if (!initial) {
                this.fireEvent('change', this, this.value, old);
            }
        }
        return this;
    },
    
    // inherit docs
    destroy: function(){
        this.clearTimer();
        Ext.ProgressBar.superclass.destroy.call(this);
    }
});
Ext.reg('progress', Ext.ProgressBar);
