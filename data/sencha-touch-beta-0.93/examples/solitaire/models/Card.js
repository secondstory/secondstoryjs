//this isn't currently used, but is the way it ought to work when associations are in place
Ext.regModel('Card', {
    fields: [
        {name: 'game_id',  type: 'int'},
        {name: 'stack_id', type: 'int'},
        
        {name: 'position', type: 'int'},
        {name: 'revealed', type: 'bool', defaultValue: false},
        {name: 'suit',     type: 'string'},
        {name: 'value',    type: 'int'}
    ],
    
    associations: [
        {type: 'belongsTo', model: 'Game'},
        {type: 'belongsTo', model: 'Stack'}
    ]
});