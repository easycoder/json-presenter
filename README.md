# JSON::Presenter

A JavaScript engine for running JSON-formatted presentation scripts.

This project started with a desire to create presentations that could run from a static website. I devised a JSON format (subject to change at this point) to define the structure, content and progress of a presentation, and wrote a JavaScript engine that runs any such script to create the presentation.

This is not a PowerPoint emulation. Among my aims are to include animation features such as marquees or text that appears to be typed live, and embedded program code to allow interctivity during the presentation. This would allow the creation of storyboards that propose a given look and feel, without the need to build an actual product prototype. Such presentations would not require any programming (except for added program code), just the ability to manage JSON.

The JSON::Presenter project is in an early stage of development. Comments and enquiries are welcome.

For an overview of the project see [this article on dev.to](https://dev.to/gtanyware/json-presenter-a-scripting-language-for-web-based-presentations-1okf).

This README will be extended to become a reference manual for JSON::Presenter.

## How to build a presentation script

The simplest is to start with the demo script here and adapt it to your needs. A script starts with 4 global properties:

 - title
 - description
 - aspectW
 - aspectH

 and 5 groups of properties:

 - Container
 - Defaults
 - Blocks
 - Content
 - Steps

 ### Global properties

  - `title` is a string that may be used by the presentation engine in the title bar of the browser
  - `description` is not used by the engine; it's for human readability
  - `aspectW` and `aspectH` together determine the height of the container, computed as `width * aspectW / aspectH`

 ### Container

 These relate to the container. There are currently only 2 values:

  - `border` is the CSS style tht defines the border of the container
  - `background` defines the background style to apply to the container

If you prefer to use separate CSS classes to style your container, leave this section empty.

### Defaults

Every block used in the presentation has its own style properties.To minimize the amount of repetition, values that are used repeatedly can be kept in this section. When a block is created it will inherit styles from its container; these will be overridden if defined here. Finally, styles defined for the block itself are applied. So if your text is always blue, set a blue default value for `textColor`.

The default values currently recognized are

 - fontFamily
 - fontSize
 - fontWeight
 - fontStyle
 - fontColor
 - textAlign
 - textMarginLeft
 - textMarginTop
 - blockLeft
 - blockTop
 - blockWidth
 - blockBackground
 - blockBorder
 - blockBorderRadius

Some of these, e.g. `textAlign` and `fontWeight`, are just regular CSS values reperesnted with camel case. All the items that represent sizes, however, have values given in _mils_ - that is, thousandths of the width or height of the presentation container. This ensures they will display properly on any device.

For example, if a block is to be given a left position that's one-fifth (20%) of the container width, use

`"blockLeft": 200`

This applies to the height of text, too. Although for most of the rest, mils are the same as fractional percentages, if you were to use a percentage for text it would relate the height to the current font size, which would not be the same thing at all.

TODO: Allow the user to give values in px, pt or em. Mils will be assumed only if no suffix is given.

### Blocks

A presentation is composed of blocks of text or images, having positions and sizes that are usually repeated for many slides, with only the content changing. JSON::Presenter requires you to define these blocks at the start, then provides you with the means to manipulate them during the presentation.

A typical block looks like this:
```
"title": {
    "blockTop": 300,
    "blockHeight": 300,
    "textAlign": "center",
    "fontSize": 200,
    "fontWeight": "bold",
    "fontColor": "#800000"
},
```
The only properties that are needed are ones that differ from those in the `defaults` section.

The block definition is just a specification and does not cause a block to be created. For this to happen requires one of the steps like `show` or `fade up` to be executed. Some blocks are never created; they are used in transition effects to tell the system what the endpoint of the transition looks like.

The name of each block is used in the `steps` section to refer to that block.

### Content

This section contains all the text and image URLs that will be used by the presentation. Rather than have this information scattered among many slides it its all kept in one place, and as with blocks, each item is given a name so it can be accessed when needed.

Text comes in two forms; fistly as a simple string and secondly as an array of strings. Either can be used in any placce that takes a string. In an array, each of the items is a separate paragraph, which avoids the need to use escaped characters in the JSON definitions.

### Steps

This is the presentation proper.The engine runs through the list in linear order, applying the action specified for each step.

(more coming...)