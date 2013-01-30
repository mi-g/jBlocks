#jBlocks (alpha)

A jQuery plugin to provide javascript-driven layouts in a responsive design way

### Features

* works on desktops and mobiles
* comes with a large of predefined block widget classes
* widget classes can easily be extended
* support either vertical or horizontal scrolling

### What is jBlocks

jBlocks is a javascript library that can be used as a jQuery plugin and/or a framework taking care of the layout in a HTML5 application. 
It allows designing applications that will run on desktops as well as on mobile devices without having to worry much about the details of screen resolution, pixel density and so on.

The basic idea is to rely on a javascript-run algorithm to perform the layout rather than regular CSS like float or table layouts. jBlocks arranges rectangular blocks into a viewport according to a set of loose preferences given by the developer. The library tries to minimize the spare areas without content in real time. This means the application may add, remove or modify blocks geometry and jBlocks will recalculate and adjust the layout accordingly.

The resulting layout method is not really deterministic so it may not be suitable to all applications: please do not use jBlocks to run a nuclear plant !

### Demos

Real application demo: [Jocly Hub gaming platform](http://www.jocly.com/jocly/hub)

Demos with source code avaiable:

[Basic blocks layout](http://mi-g.github.com/jBlocks/demo/demo1.html)

[Horizontal scrolling](http://mi-g.github.com/jBlocks/demo/demo2.html)

[Standard block widgets](http://mi-g.github.com/jBlocks/demo/demo3.html)

[Element-based jBlocks](http://mi-g.github.com/jBlocks/demo/demo4.html)

### Project status

jBlocks is in an early stage. It has been developed to support the [Jocly](http://www.jocly.com/jocly/hub) board gaming platform interface and it does the job well.

However, it lacks proper packaging to be used easily into other projects.

If you are a HTML5 developer and are willing to help on this project, you are more than welcome !!!

### Licensing

jBlocks is open source code and released under [Mozilla Public License 2.0](http://www.mozilla.org/MPL/2.0/)

### jBlocks API

The current API documentation [can be found here](http://mi-g.github.com/jBlocks/doc/index.html)

#### jBlocks context

A jBlocks context defines a rectangular viewport in which smaller sized blocks are layouted. Depending on the the setup, vertical or horizontal scrolling is managed. If no scrolling is defined, some blocks may not be shown if they can&#039;t fit into the space.

jBlocks can be used recursively by defining blocks that are themselves jBlocks contexts handling their own layout. This is convenient to define structured blocks containing several zones, like for instance a header, content area and footer.

A viewport has a virtual size, for instance 18x12. jBlocks adapts the real pixel size to the device physical geometry. This virtual size can be controlled by the application but jBlocks provides a default behavior to adjust to the actual device. For instance, on a full size big desktop screen, the size might be 30x24, causing many blocks to be seen, while when run on a mobile phone, it can become 12x15 and scrolling must be performed to see some blocks. jBlocks handles device rotation so the 12x15 size might become 15x12 causing the library to calculate a new layout dynamically.

#### Using jBlocks

The easiest way to use jBlocks is to use the default context at the highest level into the page:

    $.jBlocks(METHOD, METHOD ARGUMENTS...)

You can also define a jBlocks from an HTML element and call methods directly from this element:

    var myJBlocks=$(“#myelement”).jBlocks();
    myJBlocks.METHOD(METHOD ARGS...);

