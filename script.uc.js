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
        "_3c078156-979c-498b-8990-85f7987dd929_-sidebar-action",
        "treestyletab_piro_sakura_ne_jp-sidebar-action",
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
    `

    try {
        const documentElement = document.documentElement;
        const tabsToolbar = document.getElementById("TabsToolbar");
        const navBar = document.getElementById("nav-bar");

        const titlebarButtonboxContainer = tabsToolbar.getElementsByClassName("titlebar-buttonbox-container")[0];
        const privateBrowsingIndicator = tabsToolbar.getElementsByClassName("private-browsing-indicator")[0];
        const accessibilityIndicator = tabsToolbar.getElementsByClassName("accessibility-indicator")[0];

        const sidebarBox = document.getElementById("sidebar-box");

        let statusHide = -1;

        function hideOriginalTabs() {
            navBar.appendChild(accessibilityIndicator);
            navBar.appendChild(privateBrowsingIndicator);
            navBar.appendChild(titlebarButtonboxContainer);
            documentElement.setAttribute(TSTC_TABS_HIDE_FLAG, "true");
            statusHide = 1;
        }

        function undo() {
            tabsToolbar.appendChild(accessibilityIndicator);
            tabsToolbar.appendChild(privateBrowsingIndicator);
            tabsToolbar.appendChild(titlebarButtonboxContainer);
            documentElement.removeAttribute(TSTC_TABS_HIDE_FLAG);
            statusHide = 0;
        }

        function compensate() {
            if (statusHide === 1 && window.windowState === 1 && documentElement.getAttribute("tabsintitlebar") === "true") {
                const marginTopCompensate = -window.screenY;
                documentElement.style["margin-top"] = `${marginTopCompensate}px`;
                if (marginTopCompensate === 0) {
                    documentElement.style["height"] = "100%";
                } else {
                    documentElement.style["height"] = `calc(100% - ${marginTopCompensate}px)`;
                }
            } else {
                documentElement.style["height"] = "100%";
                documentElement.style["margin-top"] = "0";
            }
        }

        function refresh() {
            const shouldHide = SIDEBAR_ACTIONS.includes(sidebarBox.getAttribute("sidebarcommand")) && sidebarBox.getAttribute("hidden") !== "true";
            if (shouldHide) {
                hideOriginalTabs();
            } else {
                undo();
            }
            compensate();
        }

        window.addEventListener("resize", compensate);

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
