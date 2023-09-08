"use strict";

/**
 * Description: A Firefox userChrome.js for hiding the native tab bar when a sidebar tab manager is active
 * Homepage: https://github.com/Xinkai/TreeStyleTabCompanion.uc.js
 * License: MIT
 */

(() => {
    function log(...args) {
        console.log("TST.UC:", ...args);
    }

    function error(...args) {
        console.error("TST.UC:", ...args);
    }

    const SIDEBAR_ACTIONS = [
        "_3c078156-979c-498b-8990-85f7987dd929_-sidebar-action", // Sidebery
        "treestyletab_piro_sakura_ne_jp-sidebar-action", // Tree Style Tab
        "tabcenter-reborn_ariasuni-sidebar-action", // Tab Center Reborn
        "treetabs_jagiello_it-sidebar-action", // Tree Tabs
    ];
    const TSTC_TABS_HIDE_FLAG = "tstc-tabs-hide";

    const STYLE = `
    :root[${TSTC_TABS_HIDE_FLAG}][tabsintitlebar] #titlebar {
        appearance: none;
    }

    :root[${TSTC_TABS_HIDE_FLAG}][tabsintitlebar] #toolbar-menubar[autohide="true"] {
        height: auto;
    }

    :root[${TSTC_TABS_HIDE_FLAG}][tabsintitlebar] #toolbar-menubar .titlebar-buttonbox-container {
        display: none;
    }

    :root[${TSTC_TABS_HIDE_FLAG}] #TabsToolbar {
        display: none;
    }

    :root[${TSTC_TABS_HIDE_FLAG}] #sidebar-header {
        -moz-window-dragging: drag;
    }
    `;

    try {
        const documentElement = document.documentElement;
        const tabsToolbar = document.getElementById("TabsToolbar");
        const navBar = document.getElementById("nav-bar");

        const titlebarButtonboxContainer = tabsToolbar.getElementsByClassName("titlebar-buttonbox-container")[0];
        const privateBrowsingIndicators = tabsToolbar.querySelectorAll("#private-browsing-indicator-with-label,.private-browsing-indicator");
        const accessibilityIndicator = tabsToolbar.getElementsByClassName("accessibility-indicator")[0];

        const sidebarBox = document.getElementById("sidebar-box");

        let statusHide = -1;

        function hideOriginalTabs() {
            if (accessibilityIndicator) {
                navBar.appendChild(accessibilityIndicator);
            }
            for (const privateBrowsingIndicator of privateBrowsingIndicators) {
                navBar.appendChild(privateBrowsingIndicator);
            }
            navBar.appendChild(titlebarButtonboxContainer);
            documentElement.setAttribute(TSTC_TABS_HIDE_FLAG, "true");
            statusHide = 1;
        }

        function undo() {
            if (accessibilityIndicator) {
                tabsToolbar.appendChild(accessibilityIndicator);
            }
            for (const privateBrowsingIndicator of privateBrowsingIndicators) {
                tabsToolbar.appendChild(privateBrowsingIndicator);
            }
            tabsToolbar.appendChild(titlebarButtonboxContainer);
            documentElement.removeAttribute(TSTC_TABS_HIDE_FLAG);
            statusHide = 0;
        }

        function refresh() {
            const shouldHide = SIDEBAR_ACTIONS.includes(sidebarBox.getAttribute("sidebarcommand")) && sidebarBox.getAttribute("hidden") !== "true";
            if (shouldHide) {
                hideOriginalTabs();
            } else {
                undo();
            }
        }

        {
            const styleSheet = document.createElement("style");
            styleSheet.innerText = STYLE;
            document.head.appendChild(styleSheet)
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
