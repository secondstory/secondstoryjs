sink.Structure = [{
    text: 'User Interface',
    cls: 'launchscreen',
    items: [{
        text: 'Buttons',
        card: demos.Buttons,
        source: 'src/demos/buttons.js'
    },
    {
        text: 'Forms',
        card: demos.Forms,
        source: 'src/demos/forms.js'
    },
    {
        text: 'List',
        card: demos.List,
        source: 'src/demos/list.js'
    },
    {
        text: 'Icons',
        card: demos.Icons,
        source: 'src/demos/icons.js'
    },
    {
        text: 'Toolbars',
        card: demos.Toolbars,
        source: 'src/demos/toolbars.js'
    },
    {
        text: 'Carousel',
        card: demos.Carousel,
        source: 'src/demos/carousel.js'
    },
    {
        text: 'Tabs',
        card: demos.Tabs,
        source: 'src/demos/tabs.js'
    },
    {
        text: 'Bottom Tabs',
        card: demos.BottomTabs,
        source: 'src/demos/bottomtabs.js'
    },
    /*{
        text: 'Picker',
        card: demos.Picker,
        source: 'src/demos/picker.js'
    },*/
    {
        text: 'Map',
        card: demos.Map,
        source: 'src/demos/map.js'
    },
    {
        text: 'Overlay',
        card: demos.Overlay,
        source: 'src/demos/overlay.js'
    },
    // {
    //     text: 'Audio',
    //     card: demos.Audio,
    //     source: 'src/demos/audio.js'
    // },
    {
        text: 'Video',
        card: demos.Video,
        source: 'src/demos/video.js'
    }]
},
{
    text: 'Animations',
    source: 'src/demos/animations.js',
    card: Ext.platform.isPhone ? false : demos.Animations,
    items: [{
        text: 'Slide',
        card: demos.Animations.slide,
        preventHide: true,
        animation: 'slide'
    },
    {
        text: 'Slide (cover)',
        card: demos.Animations.slidecover,
        preventHide: true,
        animation: {
            type: 'slide',
            cover: true
        }
    },
    {
        text: 'Slide (reveal)',
        card: demos.Animations.slidereveal,
        preventHide: true,
        animation: {
            type: 'slide',
            reveal: true
        }
    },
    {
        text: 'Pop',
        card: demos.Animations.pop,
        preventHide: true,
        animation: {
            type: 'pop',
            scaleOnExit: true
        }
    },
    {
        text: 'Fade',
        card: demos.Animations.fade,
        preventHide: true,
        animation: {
            type: 'fade',
            duration: 600
        }
    },
    {
        text: 'Flip',
        card: demos.Animations.flip,
        preventHide: true,
        animation: {
            type: 'flip',
            duration: 400
        }
    },
    {
        text: 'Cube',
        card: demos.Animations.cube,
        preventHide: true,
        animation: {
            type: 'cube',
            duration: 400
        }
    }]
},
{
    text: 'Events',
    card: demos.Touch,
    source: 'src/demos/touch.js'
},
{
    text: 'Data',
    card: demos.Data,
    source: 'src/demos/data.js'
}];