/**
 * @class Ext.layout.DockLayout
 * @extends Ext.layout.ComponentLayout
 * This ComponentLayout handles docking for Panels. It takes care of panels that are
 * part of a ContainerLayout that sets this Panel's size and Panels that are part of
 * an AutoContainerLayout in which this panel get his height based of the CSS or
 * or its content.
 */
Ext.layout.DockLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'dock',

    renderHidden: false,

    /**
     * @property extraCls
     * @type String
     * This class is automatically added to each docked item within this layout.
     * We also use this as a prefix for the position class e.g. x-docked-bottom
     */
    extraCls: 'x-docked',

    /**
     * @private
     * This function gets called with either a width and height inside the args
     * parameter or a boolean true, in which case the owner Panel is inside
     * a AutoContainerLayout. It will render all the docked items of the Panel,
     * and then position them according to the width and height of the Panel,
     * or the size of the body (in the case it is inside an AutoContainerLayout)
     * @param {Ext.Component} owner The Panel that owns this DockLayout
     * @param {Ext.Element} target The target in which we are going to render the docked items
     * @param {Array} args The arguments passed to the ComponentLayout.layout method
     */
    onLayout: function(owner, target, args) {
        // The getLayoutItems method returns the docked items of this layouts owner (Panel)
        var items = this.getLayoutItems(),
            w = args[0],
            h = args[1];

        var info = this.info = {
            boxes: [],
            panelSize: {
                width: w,
                height: h
            }
        };

        // We always start of by rendering all the docked items to the panel's el
        this.renderItems(items, target);

        // If we get inside this else statement, it means that the Panel has been
        // given a size by its parents container layout. In this case we want to
        // actualy set the Panel's dimensions and dock all the items.
        this.setTargetSize(w, h);
        this.dockItems(items);

        // After we docked all the items we are going to call superclass.onLayout
        // which will run the Panel's container layout.
        Ext.layout.DockLayout.superclass.onLayout.call(this, owner, target);
    },

    /**
     * @private
     * Returns an array containing all the docked items inside this layout's owner panel
     * @return {Array} An array containing all the docked items of the Panel
     */
    getLayoutItems : function() {
        return this.owner.getDockedItems() || [];
    },

    /**
     * @private
     * We are overriding the Ext.layout.Layout configureItem method to also add a class that
     * indicates the position of the docked item. We use the extraCls (x-docked) as a prefix.
     * An example of a class added to a dock: right item is x-docked-right
     * @param {Ext.Component} item The item we are configuring
     */
    configureItem : function(item, pos) {
        Ext.layout.DockLayout.superclass.configureItem.call(this, item, pos);
        if (this.extraCls) {
            item.getPositionEl().addClass(this.extraCls + '-' + item.dock);
        }

        if (item.overlay) {
            item.getPositionEl().addClass(this.extraCls + '-overlay');
        }
    },

    /**
     * @private
     * Removes the extraCls (x-docked-position)
     */
    afterRemove : function(item) {
        Ext.layout.DockLayout.superclass.afterRemove.call(this, item);
        if (this.extraCls) {
            item.getPositionEl().removeClass(this.extraCls + '-' + item.dock);
        }
        if (item.overlay) {
            item.getPositionEl().removeClass(this.extraCls + '-overlay');
        }
    },

    /**
     * @private
     * This method will first update all the information about the docked items,
     * body dimensions and position, the panel's total size. It will then
     * set all these values on the docked items and panel body.
     * @param {Array} items Array containing all the docked items
     * @param {Boolean} autoBoxes Set this to true if the Panel is part of an
     * AutoContainerLayout
     */
    dockItems : function(items, autoBoxes) {
        this.calculateDockBoxes(items, autoBoxes);

        // Both calculateAutoBoxes and calculateSizedBoxes are changing the
        // information about the body, panel size, and boxes for docked items
        // inside a property called info.
        var info = this.info,
            boxes = info.boxes,
            ln = boxes.length,
            owner = this.owner,
            target = this.getTarget(),
            box, i;

        // If the bodyBox has been adjusted because of the docked items
        // we will update the dimensions and position of the panel's body.
        owner.body.setBox({
            width: info.targetBox.width || null,
            height: info.targetBox.height || null,
            top: (info.targetBox.top - owner.el.getPadding('t')),
            left: (info.targetBox.left - owner.el.getPadding('l'))
        });

        // We are going to loop over all the boxes that were calculated
        // and set the position and size of each item the box belongs to.
        for (i = 0; i < ln; i++) {
            box = boxes[i];
            box.item.setPosition(box.left, box.top);
        }
    },

    /**
     * @private
     * This method will set up some initial information about the panel size and bodybox
     * and then loop over all the items you pass it to take care of stretching, aligning,
     * dock position and all calculations involved with adjusting the body box.
     * @param {Array} items Array containing all the docked items we have to layout
     */
    calculateDockBoxes : function(items, autoBoxes) {
        // We want to use the Panel's el width, and the Panel's body height as the initial
        // size we are going to use in calculateDockBoxes. We also want to account for
        // the border of the panel.
        var target = this.getTarget(),
            owner = this.owner,
            bodyEl = owner.body,
            info = this.info,
            ln = items.length,
            item, i, box, w, h;

        // panelSize might already have size. Dont have to calculate again?
        info.panelSize = target.getSize();
        info.targetBox = this.getTargetBox();
        info.targetBox.left -= target.getBorderWidth('l');
        info.targetBox.top -= target.getBorderWidth('t');

        // Loop over all the docked items
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.hidden && !this.renderHidden) {
                continue;
            }

            // The initBox method will take care of stretching and alignment
            // In some cases it will also layout the dock items to be able to
            // get a width or height measurement
            box = this.initBox(item);

            // Size and layout the item if it hasn't done so by this time yet.
            item.setSize(box);

            // If we havent calculated the width or height of the docked item yet
            // do so, since we need this for our upcoming calculations
            if (box.width == undefined) {
                box.width = item.getWidth();
            }
            if (box.height == undefined) {
                box.height = item.getHeight();
            }

            box = this.adjustSizedBox(box, i);

            // Save our box. This allows us to loop over all docked items and do all
            // calculations first. Then in one loop we will actually size and position
            // all the docked items that have changed.
            info.boxes.push(box);
        }
    },

    /**
     * @private
     * This method will adjust the position of the docked item and adjust the body box
     * accordingly.
     * @param {Object} box The box containing information about the width and height
     * of this docked item
     * @param {Number} index The index position of this docked item
     * @return {Object} The adjusted box
     */
    adjustSizedBox : function(box, index) {
        var targetBox = this.info.targetBox,
            item = box.item;

        switch (box.type) {
            case 'top':
                box.top = targetBox.top;
                if (!item.overlay) {
                    targetBox.top += box.height;
                    targetBox.height -= box.height;
                }
                break;

            case 'left':
                box.left = targetBox.left;
                if (!item.overlay) {
                    targetBox.left += box.width;
                    targetBox.width -= box.width;
                }
                break;

            case 'bottom':
                box.top = (targetBox.top + targetBox.height) - box.height;
                if (!item.overlay) {
                    targetBox.height -= box.height;
                }
                break;

            case 'right':
                box.left = (targetBox.left + targetBox.width) - box.width;
                if (!item.overlay) {
                    targetBox.width -= box.width;
                }
                break;
        }
        return box;
    },

    /**
     * @private
     * This method will create a box object, with a reference to the item, the type of dock
     * (top, left, bottom, right). It will also take care of stretching and aligning of the
     * docked items.
     * @param {Ext.Component} item The docked item we want to initialize the box for
     * @return {Object} The initial box containing width and height and other useful information
     */
    initBox : function(item) {
        var targetBox = this.info.targetBox,
            horizontal = (item.dock == 'top' || item.dock == 'bottom'),
            box = {
                item: item,
                type: item.dock
            };

        // First we are going to take care of stretch and align properties for all four dock scenaries.
        if (item.stretch !== false) {
            if (horizontal) {
                box.left = targetBox.left;
                box.width = targetBox.width;
            }
            else {
                box.top = targetBox.top;
                box.height = targetBox.height;
            }
            box.stretched = true;
        }
        else {
            item.setSize(item.width || undefined, item.height || undefined);
            box.width = item.getWidth();
            box.height = item.getHeight();
            if (horizontal) {
                box.left = targetBox.left;
                if (item.align == 'right') {
                    box.left += (targetBox.width - box.width);
                }
                else if(item.align == 'center') {
                    box.left += ((targetBox.width - box.width) / 2);
                }
            }
            else {
                box.top = targetBox.top;
                if (item.align == 'bottom') {
                    box.top += (targetBox.height - box.height);
                }
                else if (item.align == 'center') {
                    box.top += ((targetBox.height - box.height) / 2);
                }
            }
        }

        return box;
    }
});

Ext.layout.TYPES['dock'] = Ext.layout.DockLayout;
