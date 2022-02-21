"use strict";

(() => {
    function log(...args) {
        console.log("TST.UC:", ...args);
    }

    function error(...args) {
        console.error("TST.UC:", ...args);
    }

    const SIDEBAR_ACTION = "treestyletab_piro_sakura_ne_jp-sidebar-action";

    try {
        const tabsToolbar = document.getElementById("TabsToolbar");
        const navBar = document.getElementById("nav-bar");

        const titlebarButtonboxContainer = tabsToolbar.getElementsByClassName("titlebar-buttonbox-container")[0];
        const privateBrowsingIndicator = tabsToolbar.getElementsByClassName("private-browsing-indicator")[0];
        const accessibilityIndicator = tabsToolbar.getElementsByClassName("accessibility-indicator")[0];

        const sidebarBox = document.getElementById("sidebar-box");

        function hideOriginalTabs() {
            navBar.appendChild(accessibilityIndicator);
            navBar.appendChild(privateBrowsingIndicator);
            navBar.appendChild(titlebarButtonboxContainer);
            tabsToolbar.style.display = "none";
        }

        function undo() {
            tabsToolbar.appendChild(accessibilityIndicator);
            tabsToolbar.appendChild(privateBrowsingIndicator);
            tabsToolbar.appendChild(titlebarButtonboxContainer);
            tabsToolbar.style.display = "";
        }

        function refresh() {
            const shouldHide = sidebarBox.attributes.sidebarcommand?.value === SIDEBAR_ACTION && sidebarBox.attributes.hidden?.value !== "true";
            if (shouldHide) {
                hideOriginalTabs();
            } else {
                undo();
            }
        }

        refresh();

        const observer = new MutationObserver((mutationsList, _observer) => {
            try {
                for (const mutation of mutationsList) {
                    if (["sidebarcommand", "hidden"].includes(mutation.attributeName)) {
                        refresh();
                    }
                }
            } catch (e) {
                error(e);
            }
        });

        observer.observe(sidebarBox, { attributes: true });
    } catch (e) {
        error(e);
    }
})();
