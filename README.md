# doctranMenu
A progressively enhancing jquery menu. Originally developed for the Doctran project.

## Basic Usage

The project consists of a LESS stylesheet and a JavaScript. However, the minified JavaScript and the compiled LESS should be used. To do this simply place [doctranmenu.min.js](doctranmenu.min.js) and [doctranmenu.css](doctranmenu.css) into you folder where your HTML resides and include the following lines in your HTML document:

```html
<link rel="stylesheet" type="text/css" href="doctranmenu.css"/>
<script type="text/javascript" src="doctranmenu.js"></script>
```

As this project depends on jquery, you will also require a reference to it as shown below.

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
```

The menu marks up a standard HTML list, where the following correspondence is made when javascript is enabled:

 * `<li><a href="link">Item 1</a>...` -> Menu item labeled `Item 1` linking to `link`.
 * `<li><a href="link">Item 1</a><ul><li>...` -> Menu item labeled `Item 1` linking to link and can be expanded to show a list.
 * `<span class="title">Title 1</span>` -> A unlinked menu item acting as a title.
 * `<li class="sublist"><span>Sub List 1</span><ul><li>...` -> A sublist with heading `Sub List 1`.

When javascript is disabled styling elements will be maintained but the menu will appear fully expanded, and of course when Javascript and CSS is disable a list containing link will be display.

To get javascript to process the HTML list you have to run the `doctranMenu` function. For example, on a element having a `doctran-menu` class you would run
```javascript
$(".doctran-menu").doctranMenu(options);
```
where `options` can be
 * 

## Examples
For examples, see [exampleusage.html](exampleusage.html).

## License
Mozilla Public License 2.0
