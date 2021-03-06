(function ($) {
    "use strict";
    $.fn.extend({
        doctranMenu: function (user_options) {

            var defaults = {
                    // Specifies the time of the animation to open or close a menu item.
                    "toggleDuration": 0,
                    // Specifies whether close a menu item's list should close all nested menu item lists.
                    "recursiveClose": true,
                    // Specifies whether open another menu item list at the same depth should close an already open
                    // item list.
                    "uniqueBranching": true,
                    // The character to use for open expander.
                    "expanderOpen": "▼",
                    // The character to use for close expander.
                    "expanderClosed": "▶",
                    // Specifies whether the menu should open to the item marked with the class 'active'.
                    "openActive": true,
                    // Properties relating to the show/hide switch.
                    "showHide": {
                        // Specifies the time of the animation to open or close the menu.
                        "toggleDuration": 0,
                        // The element to use as a show/hide switch.
                        "appendTo": null,
                        // Action to perform when the show/hide switch is clicked to show the menu.
                        "onShow": null,
                        // Action to perform when the show/hide switch is clicked to hide the menu.
                        "onHide": null
                    },
                    // Properties relating to the search form.
                    "search": {
                        // The search form action.
                        "action": null,
                        // The filtering method.
                        "filter": function (a, searchString) {
                            // Used for search, a regex with special characters escaped.
                            var r = new RegExp(searchString.replace(/[\-\[\]\/\{}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'i');

                            // Remember a.text() is all that is returned by "resultInfo".
                            return a.text().match(r);
                        },
                        // Function to construct search results information.
                        "resultInfo": function (a) {
                            var containerA = a.parent().parent().parent().children("a, .title");
                            return containerA.length ? " (" + containerA.text() + ")" : "";
                        }
                    }
                },
            // Merge the users setting with the defaults.
                options = $.extend(true, defaults, user_options),
                SearchText = function () {
                    return "Filter" + (options.search.action === null ? "" : " (Press ENTER to Search)...");
                },
            // Methods
                createExpander = function () {
                    return $("<span>", {
                        "class": "expander"
                    }).mousedown(function (e) {
                        // Stop the expander's text being selected upon double clicking.
                        e.preventDefault();
                    }).hover(function () {
                        $(this).parent().toggleClass("hover");
                    }).append($("<a>", {
                        "text": options.expanderClosed
                    }));
                },
                createSearchInput = function (plugin, searchUl, menuUl) {
                    return $("<input>", {
                        "name": "q",
                        "value": SearchText()
                    })
                    // If the search string is being displayed, then remove it when the user clicks the search box.
                        .focusin(function () {
                            var input = $(this);
                            input.toggleClass("active");
                            if (input.prop("value") === SearchText()) {
                                input.prop("value", "");
                            }
                        })
                        // If the user leaves the search box blanks when the go out of the search box, then display
                        // the search string.
                        .focusout(function () {
                            var input = $(this);
                            input.toggleClass("active");
                            if (input.prop("value") === "") {
                                input.prop("value", SearchText);
                            }
                            searchUl.children(".focused").removeClass("focused");
                        })
                        // Check for arrow key up or down to move the focus up or down.
                        .keydown(function (e) {
                            var keyCode = e.keyCode || e.which,
                                focused,
                                move;

                            if (keyCode === 38 || keyCode === 40) {
                                focused = searchUl.children(".focused");
                                if (focused.length) {
                                    move = keyCode === 38 ? focused.prevAll("li:visible").first() : focused.nextAll("li:visible").first();
                                    focused.removeClass("focused");
                                    move.addClass("focused");
                                } else {
                                    move = keyCode === 38 ? searchUl.children("li:visible:last") : searchUl.children("li:visible:first");
                                    move.addClass("focused");
                                }
                                this.scrollTo(plugin, move);
                                e.preventDefault();
                                return false;
                            }
                        })
                        // If:
                        // * Escape is pressed - then set the input's text to empty and show the normal menu.
                        // * Enter is pressed on a focused item - then go to the url of the focused item.
                        // * Any other key - Filter or re-filter the search results.
                        .keyup(function (e) {
                            var input = $(this),
                                keyCode = e.keyCode || e.which,
                                searchString = keyCode === 27 ? "" : input.prop("value"),
                                focused;

                            if (keyCode === 13 && (focused = searchUl.children(".focused")).length) {
                                window.location.replace(focused.children("a").prop("href"));
                                return;
                            }

                            input.prop("value", searchString);
                            if (searchString === "") {
                                menuUl.show();
                                searchUl.hide();
                            } else {
                                searchUl
                                    .children("li")
                                    .hide()
                                    .filter(function () {
                                        return options.search.filter($(this).children("a"), searchString);
                                    }).show();

                                menuUl.hide();
                                searchUl.show();
                            }
                        });
                },
                createSearchResults = function (plugin, menuUl) {
                    var searchUl = $("<ul>", {
                            "class": "searchResults"
                        }),
                        listItems = {};

                    // Flatten the menu list and add it to the plugin.
                    menuUl.find("li>a").each(function () {
                        var a = $(this),
                            info = options.search.resultInfo(a),
                            newLink;

                        newLink = a.clone().append($("<span>", {
                            "class": "resultInfo"
                        }).append(info));

                        listItems[a.prop("href")] = ($("<li>").hover(function () {
                            searchUl.children(".focused").removeClass("focused");
                        }).append(newLink));

                    });

                    searchUl.append($.map(listItems, function (li) {
                        return li;
                    }));

                    return searchUl.hide();
                },
                processShowHideSwitch = function (showHideSwitch, plugin, menuUl) {
                    return $(showHideSwitch)
                        .addClass("doctran-menu-show-hide-img")
                        .addClass("hide")
                        .click(function () {
                            var showHideImg = $(this);

                            // Change display to stop resize on hide and change the switch's image.
                            if (plugin.is(":hidden")) {
                                if (options.showHide.onHide != null) {
                                    options.showHide.onHide();
                                }

                                showHideImg.attr("src", "img/hide.png");
                                menuUl.css({"width": "auto"});
                            }
                            else {
                                if (options.showHide.onShow != null) {
                                    options.showHide.onShow();
                                }

                                menuUl.css({"width": plugin.width()});
                                showHideImg.attr("src", "img/show.png");
                            }

                            showHideImg.toggleClass("show");
                            showHideImg.toggleClass("hide");
                            // Animate the show/hide process.
                            plugin.animate({width: 'toggle'}, options.showHide.toggleDuration);
                        });
                },
                addExpanders = function (parent_ul) {

                    // Go though each list item which itself contains a list.
                    parent_ul.children("li.sublist").each(function () {
                        addExpanders($(this).children("ul"));
                    });

                    parent_ul.children("li:not(.sublist):has(ul)").each(function () {
                        // Store the current node.
                        var li_i = $(this),
                            expanderNode,
                            child_ul;

                        // Stop the user selecting text within the menu.
                        li_i.mousedown(function (e) {
                            e.preventDefault();
                        });

                        // Expanders are added when needed. So if needed, add one.
                        if (li_i.has(".expander").length === 0) {

                            // Get the child list and add expanders to its list items.
                            child_ul = li_i.children("ul");
                            addExpanders(child_ul);

                            // Creates an expander node and prepends it to the list element.
                            expanderNode = createExpander()
                                .click(function () {
                                    var expander = $(this),
                                        li = expander.parent();

                                    // Close others at same level.
                                    if (options.uniqueBranching) {
                                        li.siblings().children(".open.expander").click();
                                    }

                                    // When a parent is closed, close all its sub-items.
                                    if (options.recursiveClose && expander.is(".open")) {
                                        li.find("ul").find(".open.expander").click();
                                    }

                                    // Toggle class to add css effects.
                                    expander.toggleClass("open");
                                    li.toggleClass("targeted");
                                    li.parent().closest("li:not(.sublist)").toggleClass("targeted");

                                    // Do the opposite of what is expected as the is called before the
                                    // toggle. Must be called beforehand because of possible animation.
                                    expander.children("a").text(!child_ul.is(":visible") ? options.expanderOpen : options.expanderClosed);
                                    child_ul.slideToggle(options.toggleDuration);
                                });
                            li_i.prepend(expanderNode);
                        }
                        // Hide the next level's list ready for viewing.
                        li_i.children("ul").toggle();
                    });
                },
                addSearchInput = function (plugin, menuUl) {
                    var searchUl = createSearchResults(plugin, menuUl),
                        searchResults = createSearchInput(plugin, searchUl, menuUl),
                        searchForm = $("<form>", {
                            "action": options.search.action,
                            "type": "text",
                            "autocomplete": "off",
                            "value": SearchText
                        }).submit(function (e) { // Prevent form submission is an item is in focus.
                            if (searchUl.children(".focused").length || options.search.action === null) {
                                e.preventDefault();
                                return false;
                            }
                        }).append(searchResults);

                    plugin.prepend(searchForm);
                    plugin.append(searchUl);
                },
                addShowHide = function (plugin, menuUl) {
                    if (options.showHide.appendTo != null) {
                        processShowHideSwitch(options.showHide.appendTo, plugin, menuUl);
                    }
                },
                scrollTo = function (plugin, item) {
                    plugin.scrollTop(item.offset().top - plugin.offset().top + plugin.scrollTop() - (plugin.height() / 2));
                },
                openActive = function (plugin, activeLi) {
                    var toggleDuration = options.toggleDuration;

                    // If an active element is not specified then do nothing.
                    if (!activeLi.length) {
                        return;
                    }

                    // We don't want the animation to be run when the menu is first loaded.
                    options.toggleDuration = 0;

                    // Click the active list item's expander, as well as its parents.
                    activeLi.parents("li").andSelf().children(".expander").click();

                    // Set the animation to its previous value.
                    options.toggleDuration = toggleDuration;

                    // Scroll so that the active list item appears in the center of the menu.
                    scrollTo(plugin, activeLi);
                };

            return this.each(function (i, e) {

                var plugin = $(e),
                    menuUl = plugin.children("ul"),
                    activeLi = plugin.find(".active").first();

                // Tell the CSS to apply the javascript styling.
                plugin.addClass("jsEnabled");

                menuUl.addClass("menu");

                // Begin main plugin body
                addExpanders(menuUl);
                addShowHide(plugin, menuUl);

                // If requested, open active and scroll to it.
                if (options.openActive) {
                    openActive(plugin, activeLi);
                }

                // If requested, make the menu searchable.
                if (options.search) {
                    addSearchInput(plugin, menuUl);
                }
            });
        }
    });
}(jQuery));
