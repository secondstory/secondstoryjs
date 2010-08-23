Geo.views.DistrictInfo = Ext.extend(Ext.form.FormPanel, {    
    initComponent: function() {
        this.select = new Ext.form.Select({
            name: 'state',
            label: 'State',
            store: Geo.stores.States,
            displayField: 'state',
            valueField: 'abbr'
        });
        
        this.spinner = new Ext.form.SpinnerField({
            minValue: 1,
            maxValue: Geo.states[0].data.maxDistrict,
            value: 1,
            name : 'number',
            cycle: true,
            label: 'District',
            disableInput: true,
            maskField: true
        });
        
        this.lookup = new Ext.Button({
            text: 'Lookup',
            handler: this.lookupDistrict,
            ui: 'action',
            scope: this
        });
        
        this.fs = new Ext.form.FieldSet({
            items: [this.select, this.spinner]
        });
        
        this.items = [this.fs, this.lookup];
        
        Geo.views.DistrictInfo.superclass.initComponent.call(this);
        this.addEvents('lookupDistrict');
        
        if (this.district) {
            this.updateDistrict(this.district);
        }
        
        this.select.on('change', this.onStateSelect, this);
    },
    
    updateDistrict: function(district) {
        this.setValues(district);
        this.capSpinner(district.state);
    },
    
    capSpinner: function(state) {
        var currValue = this.spinner.getValue(),
            idx = Geo.stores.States.find('abbr', state),
            r = Geo.stores.States.getAt(idx),
            max = r.get('maxDistrict');
        
        if (max === 0) {
            this.spinner.disable();
        } 
        else {
            this.spinner.maxValue = max;
            this.spinner.enable();
        }
        
        if (currValue == 0 && max != 0) {
            this.spinner.setValue(1);
        } 
        else if (max < currValue) {
            this.spinner.setValue(max);
        }
    },
    
    onStateSelect: function(states, value) {
        this.capSpinner(value);
    },
    
    lookupDistrict: function() {
        var district = this.getValues();
        this.fireEvent('lookupDistrict', district);
        //Geo.CongressService.getLegislatorsByDistrict(district, this.callback, this.scope || window);
    }
});